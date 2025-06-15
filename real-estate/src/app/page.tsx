'use client';

import { useState, useMemo } from 'react';
import { Property, PropertyFilters } from '@/types/property';
import { sampleProperties } from '@/data/sampleProperties';
import PropertyCard from '@/components/PropertyCard';
import SearchFilters from '@/components/SearchFilters';
import { Home, Heart, User, Search as SearchIcon } from 'lucide-react';

export default function HomePage() {
  const [properties] = useState<Property[]>(sampleProperties);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PropertyFilters>({
    priceRange: { min: 0, max: 10000000 },
    bedrooms: [],
    bathrooms: [],
    propertyTypes: [],
    listingType: 'sale',
    location: '',
  });

  // Filter properties based on search and filters
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          property.title.toLowerCase().includes(searchLower) ||
          property.address.toLowerCase().includes(searchLower) ||
          property.city.toLowerCase().includes(searchLower) ||
          property.state.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Listing type filter
      if (property.listingType !== filters.listingType) return false;

      // Price filter
      if (property.price < filters.priceRange.min || property.price > filters.priceRange.max) {
        return false;
      }

      // Bedroom filter
      if (filters.bedrooms.length > 0) {
        const hasMatchingBedrooms = filters.bedrooms.some(beds => property.bedrooms >= beds);
        if (!hasMatchingBedrooms) return false;
      }

      // Bathroom filter
      if (filters.bathrooms.length > 0) {
        const hasMatchingBathrooms = filters.bathrooms.some(baths => property.bathrooms >= baths);
        if (!hasMatchingBathrooms) return false;
      }

      // Property type filter
      if (filters.propertyTypes.length > 0) {
        if (!filters.propertyTypes.includes(property.propertyType)) return false;
      }

      return true;
    });
  }, [properties, searchQuery, filters]);

  const handleFavorite = (propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Home className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">PropertyHub</h1>
            </div>
            
            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Buy</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Rent</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Sell</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Agents</a>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-blue-600">
                <Heart className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600">
                <User className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <SearchFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Results Summary */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {filters.listingType === 'sale' ? 'Homes for Sale' : 'Homes for Rent'}
          </h2>
          <p className="text-gray-600">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Property Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onFavorite={handleFavorite}
                isFavorited={favorites.includes(property.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters to find more properties.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({
                  priceRange: { min: 0, max: 10000000 },
                  bedrooms: [],
                  bathrooms: [],
                  propertyTypes: [],
                  listingType: filters.listingType,
                  location: '',
                });
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center space-y-1 py-2 px-4 text-blue-600">
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center space-y-1 py-2 px-4 text-gray-600">
            <SearchIcon className="w-5 h-5" />
            <span className="text-xs">Search</span>
          </button>
          <button className="flex flex-col items-center space-y-1 py-2 px-4 text-gray-600">
            <Heart className="w-5 h-5" />
            <span className="text-xs">Favorites</span>
          </button>
          <button className="flex flex-col items-center space-y-1 py-2 px-4 text-gray-600">
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>

      {/* Add bottom padding for mobile navigation */}
      <div className="h-16 md:hidden"></div>
    </div>
  );
}