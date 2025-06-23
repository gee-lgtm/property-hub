'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Property, PropertyFilters, PropertyService } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import SearchFilters from '@/components/SearchFilters';
import { useDebounce } from '@/hooks/useDebounce';
import { Home, Heart, User, Search as SearchIcon, Grid3X3, Map as MapIcon } from 'lucide-react';
import mn from '@/lib/translations';

// Dynamically import PropertyMap to avoid SSR issues with Leaflet
const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm">{mn.page.loadingMap}</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>();
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
          <p className="text-gray-600">{mn.page.loadingProperties}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen bg-gray-50 flex flex-col">
      {/* Header - Desktop Only */}
      <header className="hidden md:block bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-2 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Home className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">{mn.appName}</h1>
            </div>
            
            {/* Navigation - Desktop */}
            <nav className="flex items-center space-x-6">
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">{mn.nav.buy}</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">{mn.nav.rent}</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">{mn.nav.sell}</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">{mn.nav.agents}</a>
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
      <div className="flex-shrink-0">
        <SearchFilters 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {/* Mobile View Toggle */}
        <div className="lg:hidden px-2 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {filters.listingType === 'sale' ? mn.page.homesForSale : mn.page.homesForRent}
              </h2>
              <p className="text-gray-600">
                {filteredProperties.length} {filteredProperties.length === 1 ? mn.page.property : mn.page.properties} {mn.page.propertiesFound}
                {searchQuery && ` "${searchQuery}"${mn.page.foundFor}`}
              </p>
            </div>
            
            {/* Mobile Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="text-sm font-medium">{mn.view.list}</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{mn.view.map}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Split Layout */}
        <div className="hidden lg:flex gap-3 flex-1 px-2">
          {/* Left Half - Sticky Map */}
          <div className="w-1/2">
            <PropertyMap
              properties={filteredProperties}
              selectedPropertyId={selectedPropertyId}
              onPropertySelect={setSelectedPropertyId}
              height="100%"
              className="h-full"
            />
          </div>
          
          {/* Right Half - Scrollable Property List */}
          <div className="w-1/2 overflow-y-auto">
            <div className="p-4">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {filters.listingType === 'sale' ? mn.page.homesForSale : mn.page.homesForRent}
                </h2>
                <p className="text-gray-600">
                  {filteredProperties.length} {filteredProperties.length === 1 ? mn.page.property : mn.page.properties} {mn.page.propertiesFound}
                  {searchQuery && ` "${searchQuery}"${mn.page.foundFor}`}
                </p>
              </div>
              
              {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {filteredProperties.map((property) => (
                    <div
                      key={property.id}
                      className={`transition-all duration-200 ${
                        selectedPropertyId === property.id ? 'ring-2 ring-blue-500 rounded-lg' : ''
                      }`}
                      onMouseEnter={() => setSelectedPropertyId(property.id)}
                      onMouseLeave={() => setSelectedPropertyId(undefined)}
                    >
                      <PropertyCard
                        property={property}
                        onFavorite={handleFavorite}
                        isFavorited={favorites.includes(property.id)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{mn.page.noPropertiesFound}</h3>
                  <p className="text-gray-600 mb-4">
                    {mn.page.tryAdjusting}
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
                    {mn.page.clearAllFilters}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden">
          {viewMode === 'map' ? (
            <div className="h-[70vh] min-h-[500px]">
              <PropertyMap
                properties={filteredProperties}
                selectedPropertyId={selectedPropertyId}
                onPropertySelect={setSelectedPropertyId}
                height="100%"
                className="h-full"
              />
            </div>
          ) : (
            <div className="px-2 py-4">
              {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{mn.page.noPropertiesFound}</h3>
                  <p className="text-gray-600 mb-4">
                    {mn.page.tryAdjusting}
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
                    {mn.page.clearAllFilters}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}