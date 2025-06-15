import { prisma } from './prisma';
import { PropertyType, ListingType, PropertyStatus, UserRole } from '@/generated/prisma';

export async function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'sarah.johnson@propertyhub.com',
        name: 'Sarah Johnson',
        phone: '(555) 123-4567',
        role: UserRole.AGENT,
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.chen@propertyhub.com',
        name: 'Mike Chen',
        phone: '(555) 987-6543',
        role: UserRole.AGENT,
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma.davis@propertyhub.com',
        name: 'Emma Davis',
        phone: '(555) 456-7890',
        role: UserRole.AGENT,
      },
    }),
    prisma.user.create({
      data: {
        email: 'alex.rodriguez@propertyhub.com',
        name: 'Alex Rodriguez',
        phone: '(555) 234-5678',
        role: UserRole.AGENT,
      },
    }),
    prisma.user.create({
      data: {
        email: 'lisa.thompson@propertyhub.com',
        name: 'Lisa Thompson',
        phone: '(555) 345-6789',
        role: UserRole.AGENT,
      },
    }),
  ]);

  // Create agents
  const agents = await Promise.all([
    prisma.agent.create({
      data: {
        userId: users[0].id,
        email: users[0].email,
        phone: users[0].phone!,
        licenseNo: 'CA-RE-001234',
        company: 'PropertyHub Realty',
        bio: 'Experienced real estate agent specializing in luxury properties and downtown lofts.',
        specialties: JSON.stringify(['Luxury Properties', 'Downtown Lofts', 'First-time Buyers']),
        totalSales: 45,
        avgRating: 4.8,
      },
    }),
    prisma.agent.create({
      data: {
        userId: users[1].id,
        email: users[1].email,
        phone: users[1].phone!,
        licenseNo: 'CA-RE-005678',
        company: 'PropertyHub Realty',
        bio: 'Family home specialist with expertise in suburban properties and school districts.',
        specialties: JSON.stringify(['Family Homes', 'Suburban Properties', 'School Districts']),
        totalSales: 62,
        avgRating: 4.9,
      },
    }),
    prisma.agent.create({
      data: {
        userId: users[2].id,
        email: users[2].email,
        phone: users[2].phone!,
        licenseNo: 'CA-RE-009012',
        company: 'PropertyHub Realty',
        bio: 'Luxury property expert with a focus on high-end condos and penthouses.',
        specialties: JSON.stringify(['Luxury Condos', 'Penthouses', 'Investment Properties']),
        totalSales: 38,
        avgRating: 4.7,
      },
    }),
    prisma.agent.create({
      data: {
        userId: users[3].id,
        email: users[3].email,
        phone: users[3].phone!,
        licenseNo: 'CA-RE-003456',
        company: 'PropertyHub Realty',
        bio: 'Affordable housing specialist helping first-time buyers find their dream homes.',
        specialties: JSON.stringify(['First-time Buyers', 'Affordable Housing', 'Renovation Projects']),
        totalSales: 55,
        avgRating: 4.6,
      },
    }),
    prisma.agent.create({
      data: {
        userId: users[4].id,
        email: users[4].email,
        phone: users[4].phone!,
        licenseNo: 'CA-RE-007890',
        company: 'PropertyHub Realty',
        bio: 'Rental specialist with extensive knowledge of the San Francisco rental market.',
        specialties: JSON.stringify(['Rental Properties', 'Investment Analysis', 'Property Management']),
        totalSales: 72,
        avgRating: 4.8,
      },
    }),
  ]);

  // Create properties with images
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        title: 'Modern Downtown Loft',
        description: 'Beautiful modern loft in the heart of downtown. Features exposed brick walls, high ceilings, and floor-to-ceiling windows with city views.',
        slug: 'modern-downtown-loft-sf-1',
        price: 850000,
        bedrooms: 2,
        bathrooms: 2,
        squareFootage: 1200,
        propertyType: PropertyType.APARTMENT,
        listingType: ListingType.SALE,
        status: PropertyStatus.ACTIVE,
        features: JSON.stringify(['Exposed brick', 'High ceilings', 'City views', 'Modern kitchen', 'In-unit laundry']),
        address: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        latitude: 37.7749,
        longitude: -122.4194,
        yearBuilt: 2018,
        parkingSpaces: 1,
        agentId: agents[0].id,
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800',
              altText: 'Modern loft living room',
              order: 0,
              isPrimary: true,
            },
            {
              url: 'https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?w=800',
              altText: 'Modern loft kitchen',
              order: 1,
            },
            {
              url: 'https://images.unsplash.com/photo-1560448076-9c90fdb29399?w=800',
              altText: 'Modern loft bedroom',
              order: 2,
            },
          ],
        },
      },
    }),
    prisma.property.create({
      data: {
        title: 'Cozy Suburban Family Home',
        description: 'Charming family home in quiet neighborhood. Features spacious backyard, updated kitchen, and great school district.',
        slug: 'cozy-suburban-family-home-palo-alto-2',
        price: 1200000,
        bedrooms: 4,
        bathrooms: 3,
        squareFootage: 2400,
        propertyType: PropertyType.HOUSE,
        listingType: ListingType.SALE,
        status: PropertyStatus.ACTIVE,
        features: JSON.stringify(['Large backyard', 'Updated kitchen', 'Great schools', 'Garage', 'Fireplace']),
        address: '456 Oak Avenue',
        city: 'Palo Alto',
        state: 'CA',
        zipCode: '94301',
        latitude: 37.4419,
        longitude: -122.1430,
        yearBuilt: 1995,
        lotSize: 8000,
        parkingSpaces: 2,
        agentId: agents[1].id,
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
              altText: 'Suburban family home exterior',
              order: 0,
              isPrimary: true,
            },
            {
              url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
              altText: 'Family home living room',
              order: 1,
            },
            {
              url: 'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800',
              altText: 'Family home kitchen',
              order: 2,
            },
          ],
        },
      },
    }),
    prisma.property.create({
      data: {
        title: 'Luxury Penthouse',
        description: 'Stunning penthouse with panoramic city views. Premium finishes throughout, rooftop terrace, and concierge service.',
        slug: 'luxury-penthouse-sf-hills-3',
        price: 2500000,
        bedrooms: 3,
        bathrooms: 3,
        squareFootage: 2000,
        propertyType: PropertyType.CONDO,
        listingType: ListingType.SALE,
        status: PropertyStatus.ACTIVE,
        features: JSON.stringify(['Panoramic views', 'Rooftop terrace', 'Concierge', 'Premium finishes', 'Smart home']),
        address: '789 Hills Drive',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94114',
        latitude: 37.7599,
        longitude: -122.4148,
        yearBuilt: 2020,
        parkingSpaces: 2,
        agentId: agents[2].id,
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
              altText: 'Luxury penthouse living room',
              order: 0,
              isPrimary: true,
            },
            {
              url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
              altText: 'Penthouse city view',
              order: 1,
            },
            {
              url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800',
              altText: 'Penthouse rooftop terrace',
              order: 2,
            },
          ],
        },
      },
    }),
    prisma.property.create({
      data: {
        title: 'Affordable Starter Home',
        description: 'Perfect starter home in up-and-coming neighborhood. Recently renovated with new flooring and fresh paint.',
        slug: 'affordable-starter-home-san-jose-4',
        price: 650000,
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 1400,
        propertyType: PropertyType.HOUSE,
        listingType: ListingType.SALE,
        status: PropertyStatus.ACTIVE,
        features: JSON.stringify(['Recently renovated', 'New flooring', 'Fresh paint', 'Quiet street', 'Near transit']),
        address: '321 Pine Street',
        city: 'San Jose',
        state: 'CA',
        zipCode: '95112',
        latitude: 37.3382,
        longitude: -121.8863,
        yearBuilt: 1980,
        lotSize: 5500,
        parkingSpaces: 2,
        agentId: agents[3].id,
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
              altText: 'Starter home exterior',
              order: 0,
              isPrimary: true,
            },
            {
              url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
              altText: 'Starter home interior',
              order: 1,
            },
          ],
        },
      },
    }),
    prisma.property.create({
      data: {
        title: 'Luxury Rental Apartment',
        description: 'Luxury apartment in prime location. Building amenities include gym, rooftop deck, and 24/7 doorman.',
        slug: 'luxury-rental-apartment-sf-market-5',
        price: 4500,
        bedrooms: 2,
        bathrooms: 2,
        squareFootage: 1100,
        propertyType: PropertyType.APARTMENT,
        listingType: ListingType.RENT,
        status: PropertyStatus.ACTIVE,
        features: JSON.stringify(['Building gym', 'Rooftop deck', '24/7 doorman', 'In-unit washer/dryer', 'Pet friendly']),
        address: '567 Market Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        latitude: 37.7849,
        longitude: -122.4094,
        yearBuilt: 2019,
        parkingSpaces: 1,
        agentId: agents[4].id,
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
              altText: 'Luxury rental apartment',
              order: 0,
              isPrimary: true,
            },
            {
              url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
              altText: 'Luxury apartment kitchen',
              order: 1,
            },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Seeded ${users.length} users`);
  console.log(`✅ Seeded ${agents.length} agents`);
  console.log(`✅ Seeded ${properties.length} properties`);
  console.log('🌱 Database seeding completed!');

  return { users, agents, properties };
}