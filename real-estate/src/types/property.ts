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