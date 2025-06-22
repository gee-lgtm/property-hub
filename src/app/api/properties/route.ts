import { NextRequest, NextResponse } from 'next/server';
import { PropertyService } from '@/lib/database';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const listingType = searchParams.get('listingType') as 'sale' | 'rent' || 'sale';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const bedrooms = searchParams.get('bedrooms');
    const bathrooms = searchParams.get('bathrooms');
    const propertyTypes = searchParams.get('propertyTypes');
    const location = searchParams.get('location');
    const search = searchParams.get('search');

    // Build filters object
    const filters = {
      listingType,
      priceRange: {
        min: minPrice ? parseInt(minPrice) : 0,
        max: maxPrice ? parseInt(maxPrice) : 10000000,
      },
      bedrooms: bedrooms ? bedrooms.split(',').map(Number) : [],
      bathrooms: bathrooms ? bathrooms.split(',').map(Number) : [],
      propertyTypes: propertyTypes ? propertyTypes.split(',').filter((type): type is 'house' | 'apartment' | 'condo' | 'townhouse' => 
        ['house', 'apartment', 'condo', 'townhouse'].includes(type)
      ) : [],
      location: location || '',
    };

    // Get properties based on search or filters
    let properties;
    if (search) {
      properties = await PropertyService.searchProperties(search);
    } else {
      properties = await PropertyService.getProperties(filters);
    }

    return NextResponse.json({
      success: true,
      data: properties,
      count: properties.length,
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch properties',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        agent: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const data = await request.json();

    // Validate required fields
    const {
      title,
      description,
      price,
      bedrooms,
      bathrooms,
      squareFootage,
      propertyType,
      listingType,
      address,
      city,
      state,
      zipCode,
      yearBuilt,
      lotSize,
      parkingSpaces,
      features,
      images,
    } = data;

    if (!title || !description || !price || !bedrooms || !bathrooms || !squareFootage || 
        !propertyType || !listingType || !address || !city || !state || !zipCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a URL-friendly slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();

    // Create property
    const property = await prisma.property.create({
      data: {
        title,
        description,
        slug,
        price: parseInt(price),
        bedrooms: parseInt(bedrooms),
        bathrooms: parseFloat(bathrooms),
        squareFootage: parseInt(squareFootage),
        propertyType: propertyType.toUpperCase(),
        listingType: listingType.toUpperCase(),
        address,
        city,
        state,
        zipCode,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
        lotSize: lotSize ? parseInt(lotSize) : null,
        parkingSpaces: parkingSpaces ? parseInt(parkingSpaces) : null,
        features: features && features.length > 0 ? JSON.stringify(features) : null,
        ownerId: userId,
        agentId: user.agent?.id || null,
        status: 'ACTIVE',
      },
      include: {
        images: true,
        agent: {
          include: {
            user: true,
          },
        },
      },
    });

    // Create property images if provided
    if (images && images.length > 0) {
      await Promise.all(
        images.map((imageUrl: string, index: number) =>
          prisma.propertyImage.create({
            data: {
              url: imageUrl,
              order: index,
              propertyId: property.id,
            },
          })
        )
      );
    }

    // Fetch the complete property with images
    const completeProperty = await PropertyService.getPropertyById(property.id);

    return NextResponse.json({
      success: true,
      property: completeProperty,
    });

  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create property',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}