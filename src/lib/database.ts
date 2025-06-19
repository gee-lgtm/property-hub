import { prisma } from './prisma';
import { Property as PrismaProperty, PropertyImage, Agent, User } from '@/generated/prisma';

// Types that match our existing Property interface
export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  propertyType: 'house' | 'apartment' | 'condo' | 'townhouse';
  listingType: 'sale' | 'rent';
  images: string[];
  description: string;
  features: string[];
  yearBuilt?: number;
  lotSize?: number;
  parkingSpaces?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  listedDate: string;
  agent?: {
    name: string;
    phone: string;
    email: string;
    photo?: string;
  };
}

export interface PropertyFilters {
  priceRange: {
    min: number;
    max: number;
  };
  bedrooms: number[];
  bathrooms: number[];
  propertyTypes: Property['propertyType'][];
  listingType: Property['listingType'];
  location: string;
}

// Helper function to convert Prisma property to our Property type
function convertPrismaProperty(
  prismaProperty: PrismaProperty & {
    images: PropertyImage[];
    agent?: (Agent & { user: User }) | null;
  }
): Property {
  return {
    id: prismaProperty.id,
    title: prismaProperty.title,
    address: prismaProperty.address,
    city: prismaProperty.city,
    state: prismaProperty.state,
    zipCode: prismaProperty.zipCode,
    price: prismaProperty.price,
    bedrooms: prismaProperty.bedrooms,
    bathrooms: prismaProperty.bathrooms,
    squareFootage: prismaProperty.squareFootage,
    propertyType: prismaProperty.propertyType.toLowerCase() as Property['propertyType'],
    listingType: prismaProperty.listingType.toLowerCase() as Property['listingType'],
    images: prismaProperty.images
      .sort((a, b) => a.order - b.order)
      .map(img => img.url),
    description: prismaProperty.description,
    features: prismaProperty.features ? JSON.parse(prismaProperty.features) : [],
    yearBuilt: prismaProperty.yearBuilt || undefined,
    lotSize: prismaProperty.lotSize || undefined,
    parkingSpaces: prismaProperty.parkingSpaces || undefined,
    coordinates: prismaProperty.latitude && prismaProperty.longitude 
      ? {
          lat: prismaProperty.latitude,
          lng: prismaProperty.longitude,
        }
      : undefined,
    listedDate: prismaProperty.listedDate.toISOString().split('T')[0],
    agent: prismaProperty.agent 
      ? {
          name: prismaProperty.agent.user.name || 'Unknown Agent',
          phone: prismaProperty.agent.phone,
          email: prismaProperty.agent.email,
        }
      : undefined,
  };
}

// Database service functions
export class PropertyService {
  // Get all properties with optional filters
  static async getProperties(filters?: Partial<PropertyFilters>): Promise<Property[]> {
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
    };

    if (filters) {
      // Listing type filter
      if (filters.listingType) {
        where.listingType = filters.listingType.toUpperCase();
      }

      // Price range filter
      if (filters.priceRange) {
        where.price = {
          gte: filters.priceRange.min,
          lte: filters.priceRange.max,
        };
      }

      // Bedroom filter
      if (filters.bedrooms && filters.bedrooms.length > 0) {
        where.bedrooms = {
          in: filters.bedrooms,
        };
      }

      // Bathroom filter
      if (filters.bathrooms && filters.bathrooms.length > 0) {
        where.bathrooms = {
          in: filters.bathrooms,
        };
      }

      // Property type filter
      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        where.propertyType = {
          in: filters.propertyTypes.map(type => type.toUpperCase()),
        };
      }

      // Location search
      if (filters.location) {
        const location = filters.location.toLowerCase();
        where.OR = [
          { city: { contains: location } },
          { address: { contains: location } },
          { state: { contains: location } },
          { zipCode: { contains: filters.location } },
        ];
      }
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        agent: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        listedDate: 'desc',
      },
    });

    return properties.map(convertPrismaProperty);
  }

  // Get a single property by ID
  static async getPropertyById(id: string): Promise<Property | null> {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        agent: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!property) return null;

    return convertPrismaProperty(property);
  }

  // Search properties by query
  static async searchProperties(query: string): Promise<Property[]> {
    const properties = await prisma.property.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { city: { contains: query } },
          { address: { contains: query } },
          { state: { contains: query } },
          { zipCode: { contains: query } },
        ],
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        agent: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        listedDate: 'desc',
      },
    });

    return properties.map(convertPrismaProperty);
  }

  // Get properties by agent
  static async getPropertiesByAgent(agentId: string): Promise<Property[]> {
    const properties = await prisma.property.findMany({
      where: {
        agentId,
        status: 'ACTIVE',
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        agent: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        listedDate: 'desc',
      },
    });

    return properties.map(convertPrismaProperty);
  }

  // Get featured properties (can be based on price, recent, etc.)
  static async getFeaturedProperties(limit: number = 6): Promise<Property[]> {
    const properties = await prisma.property.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        agent: {
          include: {
            user: true,
          },
        },
      },
      orderBy: [
        { price: 'desc' }, // High-value properties first
        { listedDate: 'desc' },
      ],
      take: limit,
    });

    return properties.map(convertPrismaProperty);
  }
}

// Agent service functions
export class AgentService {
  static async getAllAgents() {
    return await prisma.agent.findMany({
      include: {
        user: true,
        properties: {
          where: {
            status: 'ACTIVE',
          },
        },
      },
      orderBy: {
        avgRating: 'desc',
      },
    });
  }

  static async getAgentById(id: string) {
    return await prisma.agent.findUnique({
      where: { id },
      include: {
        user: true,
        properties: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            images: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
  }
}