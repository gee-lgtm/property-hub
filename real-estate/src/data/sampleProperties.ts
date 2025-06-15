import { Property } from '@/types/property';

export const sampleProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Downtown Loft',
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    price: 850000,
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1200,
    propertyType: 'apartment',
    listingType: 'sale',
    images: [
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800',
      'https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?w=800',
      'https://images.unsplash.com/photo-1560448076-9c90fdb29399?w=800'
    ],
    description: 'Beautiful modern loft in the heart of downtown. Features exposed brick walls, high ceilings, and floor-to-ceiling windows with city views.',
    features: ['Exposed brick', 'High ceilings', 'City views', 'Modern kitchen', 'In-unit laundry'],
    yearBuilt: 2018,
    parkingSpaces: 1,
    coordinates: { lat: 37.7749, lng: -122.4194 },
    listedDate: '2024-06-01',
    agent: {
      name: 'Sarah Johnson',
      phone: '(555) 123-4567',
      email: 'sarah@propertyhub.com'
    }
  },
  {
    id: '2',
    title: 'Cozy Suburban Family Home',
    address: '456 Oak Avenue',
    city: 'Palo Alto',
    state: 'CA',
    zipCode: '94301',
    price: 1200000,
    bedrooms: 4,
    bathrooms: 3,
    squareFootage: 2400,
    propertyType: 'house',
    listingType: 'sale',
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800'
    ],
    description: 'Charming family home in quiet neighborhood. Features spacious backyard, updated kitchen, and great school district.',
    features: ['Large backyard', 'Updated kitchen', 'Great schools', 'Garage', 'Fireplace'],
    yearBuilt: 1995,
    lotSize: 8000,
    parkingSpaces: 2,
    coordinates: { lat: 37.4419, lng: -122.1430 },
    listedDate: '2024-05-28',
    agent: {
      name: 'Mike Chen',
      phone: '(555) 987-6543',
      email: 'mike@propertyhub.com'
    }
  },
  {
    id: '3',
    title: 'Luxury Penthouse',
    address: '789 Hills Drive',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94114',
    price: 2500000,
    bedrooms: 3,
    bathrooms: 3,
    squareFootage: 2000,
    propertyType: 'condo',
    listingType: 'sale',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800'
    ],
    description: 'Stunning penthouse with panoramic city views. Premium finishes throughout, rooftop terrace, and concierge service.',
    features: ['Panoramic views', 'Rooftop terrace', 'Concierge', 'Premium finishes', 'Smart home'],
    yearBuilt: 2020,
    parkingSpaces: 2,
    coordinates: { lat: 37.7599, lng: -122.4148 },
    listedDate: '2024-06-10',
    agent: {
      name: 'Emma Davis',
      phone: '(555) 456-7890',
      email: 'emma@propertyhub.com'
    }
  },
  {
    id: '4',
    title: 'Affordable Starter Home',
    address: '321 Pine Street',
    city: 'San Jose',
    state: 'CA',
    zipCode: '95112',
    price: 650000,
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1400,
    propertyType: 'house',
    listingType: 'sale',
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800'
    ],
    description: 'Perfect starter home in up-and-coming neighborhood. Recently renovated with new flooring and fresh paint.',
    features: ['Recently renovated', 'New flooring', 'Fresh paint', 'Quiet street', 'Near transit'],
    yearBuilt: 1980,
    lotSize: 5500,
    parkingSpaces: 2,
    coordinates: { lat: 37.3382, lng: -121.8863 },
    listedDate: '2024-06-05',
    agent: {
      name: 'Alex Rodriguez',
      phone: '(555) 234-5678',
      email: 'alex@propertyhub.com'
    }
  },
  {
    id: '5',
    title: 'Luxury Rental Apartment',
    address: '567 Market Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    price: 4500,
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1100,
    propertyType: 'apartment',
    listingType: 'rent',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'
    ],
    description: 'Luxury apartment in prime location. Building amenities include gym, rooftop deck, and 24/7 doorman.',
    features: ['Building gym', 'Rooftop deck', '24/7 doorman', 'In-unit washer/dryer', 'Pet friendly'],
    yearBuilt: 2019,
    parkingSpaces: 1,
    coordinates: { lat: 37.7849, lng: -122.4094 },
    listedDate: '2024-06-12',
    agent: {
      name: 'Lisa Thompson',
      phone: '(555) 345-6789',
      email: 'lisa@propertyhub.com'
    }
  }
];