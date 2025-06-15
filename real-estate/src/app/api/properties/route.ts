import { NextRequest, NextResponse } from 'next/server';
import { PropertyService } from '@/lib/database';

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