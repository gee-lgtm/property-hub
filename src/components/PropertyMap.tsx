'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Next.js
const createIcon = (color: string = 'blue') => new Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  images: string[];
  listingType: 'sale' | 'rent';
}

interface PropertyMapProps {
  properties: Property[];
  selectedPropertyId?: string;
  onPropertySelect?: (propertyId: string) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
}

// Component to fit map bounds to show all properties
function FitBounds({ properties }: { properties: Property[] }) {
  const map = useMap();

  useEffect(() => {
    if (properties.length === 0) return;

    const validProperties = properties.filter(p => p.coordinates);
    if (validProperties.length === 0) return;

    if (validProperties.length === 1) {
      // Single property - center on it
      const prop = validProperties[0];
      map.setView([prop.coordinates!.lat, prop.coordinates!.lng], 15);
    } else {
      // Multiple properties - fit bounds
      const bounds = new LatLngBounds(
        validProperties.map(p => [p.coordinates!.lat, p.coordinates!.lng])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, properties]);

  return null;
}

export default function PropertyMap({
  properties,
  selectedPropertyId,
  onPropertySelect,
  center = [47.8864, 106.9057], // Ulaanbaatar, Mongolia
  zoom = 12,
  height = '400px',
  className = ''
}: PropertyMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Filter properties that have coordinates
  const mappableProperties = properties.filter(p => p.coordinates);

  const formatPrice = (price: number, listingType: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
    
    return listingType === 'RENT' ? `${formatted}/mo` : formatted;
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds properties={mappableProperties} />
        
        {mappableProperties.map((property) => (
          <Marker
            key={property.id}
            position={[property.coordinates!.lat, property.coordinates!.lng]}
            icon={createIcon(selectedPropertyId === property.id ? 'red' : 'blue')}
            eventHandlers={{
              click: () => onPropertySelect?.(property.id),
            }}
          >
            <Popup className="property-popup">
              <div className="w-64 p-2">
                {property.images && property.images.length > 0 && (
                  <div className="relative w-full h-32 mb-2">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                  {property.title}
                </h3>
                <p className="text-lg font-bold text-green-600 mb-1">
                  {formatPrice(property.price, property.listingType)}
                </p>
                <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                  {property.address}
                </p>
                <div className="flex items-center text-xs text-gray-500 space-x-3">
                  <span>{property.bedrooms} bed</span>
                  <span>{property.bathrooms} bath</span>
                  <span>{property.squareFootage.toLocaleString()} sqft</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {mappableProperties.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center text-gray-500">
            <p className="text-sm">No properties with location data</p>
          </div>
        </div>
      )}
    </div>
  );
}