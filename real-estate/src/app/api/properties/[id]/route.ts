import { NextRequest, NextResponse } from 'next/server';
import { PropertyService } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Property ID is required',
        },
        { status: 400 }
      );
    }

    const property = await PropertyService.getPropertyById(id);

    if (!property) {
      return NextResponse.json(
        {
          success: false,
          error: 'Property not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch property',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}