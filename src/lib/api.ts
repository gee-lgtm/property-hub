// Client-side API service for PropertyHub

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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  count?: number;
}

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export class PropertyApiService {
  private static baseUrl = '/api';

  private static async fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
      }

      const data: ApiResponse<T> = await response.json();

      if (!data.success) {
        throw new ApiError(data.error || 'API request failed');
      }

      return data.data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error or invalid response');
    }
  }

  // Get properties with optional filters
  static async getProperties(filters?: Partial<PropertyFilters>, search?: string): Promise<Property[]> {
    const params = new URLSearchParams();

    if (search) {
      params.append('search', search);
    }

    if (filters) {
      if (filters.listingType) {
        params.append('listingType', filters.listingType);
      }

      if (filters.priceRange) {
        params.append('minPrice', filters.priceRange.min.toString());
        params.append('maxPrice', filters.priceRange.max.toString());
      }

      if (filters.bedrooms && filters.bedrooms.length > 0) {
        params.append('bedrooms', filters.bedrooms.join(','));
      }

      if (filters.bathrooms && filters.bathrooms.length > 0) {
        params.append('bathrooms', filters.bathrooms.join(','));
      }

      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        params.append('propertyTypes', filters.propertyTypes.join(','));
      }

      if (filters.location) {
        params.append('location', filters.location);
      }
    }

    const url = `${this.baseUrl}/properties${params.toString() ? `?${params.toString()}` : ''}`;
    return this.fetchApi<Property[]>(url);
  }

  // Get a single property by ID
  static async getPropertyById(id: string): Promise<Property | null> {
    try {
      const url = `${this.baseUrl}/properties/${id}`;
      return await this.fetchApi<Property>(url);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Search properties
  static async searchProperties(query: string): Promise<Property[]> {
    return this.getProperties(undefined, query);
  }

  // Get featured properties
  static async getFeaturedProperties(limit: number = 6): Promise<Property[]> {
    // For now, just get the first N properties
    // In the future, we can create a dedicated endpoint for featured properties
    const properties = await this.getProperties();
    return properties.slice(0, limit);
  }
}

// Export for backward compatibility
export { PropertyApiService as PropertyService };