'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Property } from '@/lib/api';
import { Heart, MapPin, Home, Bed, Bath, Square } from 'lucide-react';
import { useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import PhoneAuthModal from './PhoneAuthModal';
import mn from '@/lib/translations';

interface PropertyCardProps {
  property: Property;
  onFavorite?: (propertyId: string) => void;
  isFavorited?: boolean;
}

export default function PropertyCard({ property, onFavorite, isFavorited = false }: PropertyCardProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const { requireAuth, authModalProps } = useAuthGuard({
    title: mn.auth.signInToSave,
    subtitle: mn.auth.createAccount,
    onSuccess: () => {
      onFavorite?.(property.id);
    }
  });

  const formatPrice = (price: number, listingType: string) => {
    if (listingType === 'rent') {
      return `${mn.currency.tugrik}${price.toLocaleString()}${mn.currency.perMonth}`;
    }
    return `${mn.currency.tugrik}${price.toLocaleString()}`;
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth();
  };

  const handleCardClick = () => {
    router.push(`/property/${property.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative h-32 sm:h-40 overflow-hidden">
        <Image
          src={property.images[currentImageIndex]}
          alt={property.title}
          fill
          className="object-cover"
          onLoad={() => setIsImageLoading(false)}
          priority={currentImageIndex === 0}
        />
        
        {/* Loading skeleton */}
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* Image navigation dots */}
        {property.images.length > 1 && (
          <>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {property.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
            
            {/* Navigation buttons for larger screens */}
            <div className="hidden sm:block">
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>

        {/* Property type badge */}
        <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
          {property.listingType === 'rent' ? mn.property.forRent : mn.property.forSale}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3">
        {/* Price */}
        <div className="text-xl font-bold text-gray-900 mb-1">
          {formatPrice(property.price, property.listingType)}
        </div>

        {/* Property details */}
        <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
          <div className="flex items-center space-x-1">
            <Bed className="w-3 h-3" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="w-3 h-3" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Square className="w-3 h-3" />
            <span>{property.squareFootage.toLocaleString()}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
          {property.title}
        </h3>

        {/* Address */}
        <div className="flex items-center space-x-1 text-gray-600 mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="text-xs line-clamp-1">
            {property.address}, {property.city}
          </span>
        </div>

        {/* Property type */}
        <div className="flex items-center space-x-1 text-gray-500">
          <Home className="w-3 h-3" />
          <span className="text-xs capitalize">{property.propertyType}</span>
        </div>
      </div>

      {/* Phone Authentication Modal */}
      <PhoneAuthModal {...authModalProps} />
    </div>
  );
}