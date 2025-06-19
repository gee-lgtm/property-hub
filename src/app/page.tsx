'use client';

import { useState, useEffect } from 'react';
import { Property, PropertyFilters, PropertyService } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import SearchFilters from '@/components/SearchFilters';
import { useDebounce } from '@/hooks/useDebounce';
import { Home, Heart, User, Search as SearchIcon } from 'lucide-react';

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Debounce search query to reduce API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Load properties from database
  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        const result = await PropertyService.getProperties(filters, debouncedSearchQuery);
        
        setProperties(result);
      } catch (error) {
        console.error('Failed to load properties:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, [debouncedSearchQuery, filters]);

  // Since filtering is now done in the database, we can use properties directly
  const filteredProperties = properties;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Desktop Only */}
      <header className="hidden md:block bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Home className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">PropertyHub</h1>
            </div>
            
            {/* Navigation - Desktop */}
            <nav className="flex items-center space-x-6">
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
    </div>
  );
}