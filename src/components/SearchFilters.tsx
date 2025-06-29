'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, X, MapPin, Plus } from 'lucide-react';
import { PropertyFilters } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import PhoneAuthModal from './PhoneAuthModal';
import mn from '@/lib/translations';

interface SearchFiltersProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onSearch: (query: string) => void;
}

export default function SearchFilters({ filters, onFiltersChange, onSearch }: SearchFiltersProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { requireAuth, authModalProps } = useAuthGuard({
    title: mn.auth.signInToAddListing,
    subtitle: mn.auth.createAccountToList,
    onSuccess: () => {
      router.push('/add-listing');
    }
  });

  const handleAddListingClick = () => {
    if (isAuthenticated) {
      router.push('/add-listing');
    } else {
      requireAuth(() => router.push('/add-listing'));
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilterChange = (key: keyof PropertyFilters, value: PropertyFilters[keyof PropertyFilters]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      priceRange: { min: 0, max: 10000000 },
      bedrooms: [],
      bathrooms: [],
      propertyTypes: [],
      listingType: 'sale',
      location: '',
    });
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="px-2 py-4">
        {/* Search Bar and Add Listing - Desktop: Single Row, Mobile: Search first row */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* First Row: Search Bar (Mobile) / Search + Filters (Desktop) */}
          <div className="flex items-center gap-4 flex-1">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={mn.search.searchPlaceholder}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Desktop Only: Listing Type Toggle and Filter Button */}
            <div className="hidden md:flex items-center gap-4">
              {/* Listing Type Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 shrink-0">
                <button
                  onClick={() => handleFilterChange('listingType', 'sale')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filters.listingType === 'sale'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mn.search.buy}
                </button>
                <button
                  onClick={() => handleFilterChange('listingType', 'rent')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filters.listingType === 'rent'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mn.search.rent}
                </button>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 shrink-0"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">{mn.search.filters}</span>
              </button>
            </div>

            {/* Mobile Only: Add Listing Button */}
            <button 
              onClick={handleAddListingClick}
              className="flex md:hidden items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add</span>
            </button>
          </div>

          {/* Desktop Only: Add Listing Button (Rightmost) */}
          <button 
            onClick={handleAddListingClick}
            className="hidden md:flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">{mn.search.addListing}</span>
          </button>

          {/* Mobile Only: Second Row - Listing Type Toggle and Filter Button */}
          <div className="flex md:hidden items-center gap-4">
            {/* Listing Type Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 shrink-0">
              <button
                onClick={() => handleFilterChange('listingType', 'sale')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filters.listingType === 'sale'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mn.search.buy}
              </button>
              <button
                onClick={() => handleFilterChange('listingType', 'rent')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filters.listingType === 'rent'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mn.search.rent}
              </button>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 shrink-0"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">{mn.search.filters}</span>
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{mn.search.filters}</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder={mn.search.minPrice}
                  value={filters.priceRange.min || ''}
                  onChange={(e) =>
                    handleFilterChange('priceRange', {
                      ...filters.priceRange,
                      min: parseInt(e.target.value) || 0,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder={mn.search.maxPrice}
                  value={filters.priceRange.max === 10000000 ? '' : filters.priceRange.max}
                  onChange={(e) =>
                    handleFilterChange('priceRange', {
                      ...filters.priceRange,
                      max: parseInt(e.target.value) || 10000000,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      const newBedrooms = filters.bedrooms.includes(num)
                        ? filters.bedrooms.filter((b) => b !== num)
                        : [...filters.bedrooms, num];
                      handleFilterChange('bedrooms', newBedrooms);
                    }}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      filters.bedrooms.includes(num)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {num}+ bed{num > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bathrooms
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      const newBathrooms = filters.bathrooms.includes(num)
                        ? filters.bathrooms.filter((b) => b !== num)
                        : [...filters.bathrooms, num];
                      handleFilterChange('bathrooms', newBathrooms);
                    }}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      filters.bathrooms.includes(num)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {num}+ bath{num > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <div className="flex flex-wrap gap-2">
                {(['house', 'apartment', 'condo', 'townhouse'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      const newTypes = filters.propertyTypes.includes(type)
                        ? filters.propertyTypes.filter((t) => t !== type)
                        : [...filters.propertyTypes, type];
                      handleFilterChange('propertyTypes', newTypes);
                    }}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                      filters.propertyTypes.includes(type)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {mn.search.clearFilters}
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Phone Authentication Modal */}
      <PhoneAuthModal {...authModalProps} />
    </div>
  );
}