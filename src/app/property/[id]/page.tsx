'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Property, PropertyService } from '@/lib/api';

// Dynamically import PropertyMap to avoid SSR issues with Leaflet
const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center text-gray-500">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm">Loading map...</p>
      </div>
    </div>
  ),
});
import { 
  ArrowLeft, 
  Heart, 
  Share, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Car,
  Calendar,
  Home,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    async function loadProperty() {
      try {
        setLoading(true);
        const propertyId = params.id as string;
        const foundProperty = await PropertyService.getPropertyById(propertyId);
        setProperty(foundProperty);
      } catch (error) {
        console.error('Failed to load property:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Property not found</h2>
          <p className="text-gray-600 mb-4">The property you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to listings
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number, listingType: string) => {
    if (listingType === 'rent') {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && property) {
      nextImage();
    }
    if (isRightSwipe && property) {
      prevImage();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this ${property.propertyType} in ${property.city}`,
          url: window.location.href,
        });
      } catch {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Share className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Heart 
                className={`w-6 h-6 ${
                  isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-700'
                }`} 
              />
            </button>
          </div>
        </div>
      </header>

      {/* Image Gallery */}
      <div 
        className="relative h-64 sm:h-80 lg:h-96 bg-gray-200"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={property.images[currentImageIndex]}
          alt={property.title}
          fill
          className="object-cover"
          priority
        />
        
        {/* Image counter */}
        <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
          {currentImageIndex + 1} / {property.images.length}
        </div>

        {/* Navigation buttons */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Image dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {property.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Price and basic info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold text-gray-900">
              {formatPrice(property.price, property.listingType)}
            </div>
            <div className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              For {property.listingType === 'sale' ? 'Sale' : 'Rent'}
            </div>
          </div>
          
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {property.title}
          </h1>
          
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{property.address}, {property.city}, {property.state} {property.zipCode}</span>
          </div>

          {/* Property details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Bed className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-lg font-semibold text-gray-900">{property.bedrooms}</div>
              <div className="text-sm text-gray-600">Bedrooms</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Bath className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-lg font-semibold text-gray-900">{property.bathrooms}</div>
              <div className="text-sm text-gray-600">Bathrooms</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Square className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-lg font-semibold text-gray-900">{property.squareFootage.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Sq Ft</div>
            </div>
            {property.parkingSpaces && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Car className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-lg font-semibold text-gray-900">{property.parkingSpaces}</div>
                <div className="text-sm text-gray-600">Parking</div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
          <div className="text-gray-700 leading-relaxed">
            {showFullDescription ? (
              <p>{property.description}</p>
            ) : (
              <p>{property.description.length > 150 ? property.description.substring(0, 150) + '...' : property.description}</p>
            )}
            {property.description.length > 150 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-blue-600 hover:text-blue-700 font-medium mt-2"
              >
                {showFullDescription ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {property.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Property Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Property Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Property Type</span>
              <span className="font-medium text-gray-900 capitalize">{property.propertyType}</span>
            </div>
            {property.yearBuilt && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Year Built</span>
                <span className="font-medium text-gray-900">{property.yearBuilt}</span>
              </div>
            )}
            {property.lotSize && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Lot Size</span>
                <span className="font-medium text-gray-900">{property.lotSize.toLocaleString()} sq ft</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Listed Date</span>
              <span className="font-medium text-gray-900">
                {new Date(property.listedDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Location Map */}
        {property.coordinates && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Location</h2>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <PropertyMap
                properties={[property]}
                center={[property.coordinates.lat, property.coordinates.lng]}
                zoom={15}
                height="300px"
                className="w-full"
              />
            </div>
            <div className="mt-3 flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{property.address}, {property.city}, {property.state} {property.zipCode}</span>
            </div>
          </div>
        )}

        {/* Agent Information */}
        {property.agent && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Listed by</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {property.agent.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{property.agent.name}</h3>
                  <p className="text-gray-600 text-sm">Real Estate Agent</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={`tel:${property.agent.phone}`}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call</span>
                </a>
                <a
                  href={`mailto:${property.agent.email}`}
                  className="flex items-center justify-center space-x-2 border border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center space-x-2 border border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors">
            <Calendar className="w-4 h-4" />
            <span>Schedule Tour</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            <Mail className="w-4 h-4" />
            <span>Contact Agent</span>
          </button>
        </div>
      </div>
    </div>
  );
}