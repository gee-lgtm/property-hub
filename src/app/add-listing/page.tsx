'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, DollarSign, Home, MapPin, Maximize, Upload, X, Image as ImageIcon } from 'lucide-react';
import mn from '@/lib/translations';

interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  propertyType: 'HOUSE' | 'APARTMENT' | 'CONDO' | 'TOWNHOUSE';
  listingType: 'SALE' | 'RENT';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  yearBuilt?: number;
  lotSize?: number;
  parkingSpaces?: number;
  features: string[];
  images: string[];
}

const PROPERTY_TYPES = [
  { value: 'HOUSE', label: mn.propertyTypes.house },
  { value: 'APARTMENT', label: mn.propertyTypes.apartment },
  { value: 'CONDO', label: mn.propertyTypes.condo },
  { value: 'TOWNHOUSE', label: mn.propertyTypes.townhouse },
] as const;

const FEATURES_OPTIONS = [
  'Усан сан', 'Гараж', 'Цэцэрлэг', 'Тагт', 'Галын зуух', 
  'Төв агаарын системд', 'Модон шал', 'Шинэчилсэн гал тогоо', 'Хувцасны өрөө',
  'Угаалгын өрөө', 'Подвал', 'Дэк/Хашаа', 'Хамгаалалтын систем', 'Биеийн тамир'
];

export default function AddListingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    price: 0,
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 0,
    propertyType: 'HOUSE',
    listingType: 'SALE',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    features: [],
    images: [],
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleInputChange = (field: keyof PropertyFormData, value: string | number | string[] | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleFileSelect = (files: FileList) => {
    const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (newFiles.length === 0) {
      alert(mn.form.imageSelectionAlert);
      return;
    }

    if (uploadedFiles.length + newFiles.length > 10) {
      alert(mn.form.maxPhotosAlert);
      return;
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Create preview URLs
    newFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, url]);
    });
  };

  const handleFileRemove = (index: number) => {
    // Revoke the preview URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload images to Cloudinary or use sample images if none uploaded
      let imageUrls: string[] = [];
      
      if (uploadedFiles.length > 0) {
        // Upload files to Cloudinary
        setIsUploading(true);
        try {
          const uploadFormData = new FormData();
          uploadedFiles.forEach((file) => {
            uploadFormData.append('files', file);
          });

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error || 'Failed to upload images');
          }

          const uploadResult = await uploadResponse.json();
          imageUrls = uploadResult.urls;
        } finally {
          setIsUploading(false);
        }
      } else {
        // Fallback to sample images if no photos uploaded
        imageUrls = [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
          'https://images.unsplash.com/photo-1505843513577-22bb7d21e455',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858',
        ];
      }

      const submissionData = {
        ...formData,
        images: imageUrls,
      };

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const { property } = await response.json();
        router.push(`/property/${property.id}`);
      } else {
        const error = await response.json();
        alert(`${mn.form.error}: ${error.error || mn.form.error}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert(mn.form.networkErrorAlert);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{mn.form.loading}</p>
        </div>
      </div>
    );
  }

  // Don't render form if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">{mn.form.addNewListing}</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2" />
              {mn.form.basicInformation}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mn.form.propertyTitle} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={mn.form.propertyTitlePlaceholder}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mn.form.propertyType} *
                </label>
                <select
                  required
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PROPERTY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mn.form.listingType} *
                </label>
                <select
                  required
                  value={formData.listingType}
                  onChange={(e) => handleInputChange('listingType', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="SALE">{mn.form.forSale}</option>
                  <option value="RENT">{mn.form.forRent}</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mn.form.description} *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={mn.form.descriptionPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              {mn.form.pricing}
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mn.form.price} ({formData.listingType === 'RENT' ? mn.form.perMonth : mn.form.total}) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                placeholder={formData.listingType === 'RENT' ? '3000' : '750000'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Maximize className="w-5 h-5 mr-2" />
              {mn.form.propertyDetails}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mn.form.bedrooms} *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mn.form.bathrooms} *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.5"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange('bathrooms', parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mn.form.squareFootage} *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.squareFootage || ''}
                  onChange={(e) => handleInputChange('squareFootage', parseInt(e.target.value) || 0)}
                  placeholder="1500"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mn.form.yearBuiltOriginal}
                </label>
                <input
                  type="number"
                  min="1800"
                  max="2030"
                  value={formData.yearBuilt || ''}
                  onChange={(e) => handleInputChange('yearBuilt', parseInt(e.target.value) || undefined)}
                  placeholder="2010"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mn.form.lotSizeOriginal}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.lotSize || ''}
                  onChange={(e) => handleInputChange('lotSize', parseInt(e.target.value) || undefined)}
                  placeholder="5000"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mn.form.parkingSpacesOriginal}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.parkingSpaces || ''}
                  onChange={(e) => handleInputChange('parkingSpaces', parseInt(e.target.value) || undefined)}
                  placeholder="2"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              {mn.form.location}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mn.form.streetAddress} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={mn.form.streetAddressPlaceholder}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mn.form.city} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder={mn.form.cityPlaceholder}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mn.form.state} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder={mn.form.statePlaceholderOriginal}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {mn.form.zipCodeOriginal} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder={mn.form.zipCodePlaceholderOriginal}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {mn.form.featuresAmenities}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {FEATURES_OPTIONS.map(feature => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => handleFeatureToggle(feature)}
                  className={`p-3 text-sm rounded-lg border text-left transition-colors ${
                    formData.features.includes(feature)
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>

          {/* Photos Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {mn.form.photosSection}
            </h2>
            
            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {mn.form.dragDropPhotos}
                  </p>
                  <p className="text-gray-500">
                    or{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700 font-medium underline"
                    >
                      {mn.form.browseFiles}
                    </button>
                  </p>
                </div>
                <p className="text-sm text-gray-400">
                  {mn.form.photoInstructions}
                </p>
              </div>
            </div>

            {/* Photo Previews */}
            {previewUrls.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">
                  {mn.form.uploadedPhotos} ({previewUrls.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFileRemove(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          {mn.form.mainPhoto}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {mn.form.firstPhotoTip}
                </p>
              </div>
            )}

            {/* No Photos State */}
            {previewUrls.length === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <ImageIcon className="w-5 h-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    <strong>Зөвлөгөө:</strong> {mn.form.photoTip}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {mn.form.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? mn.form.uploadingPhotos : isSubmitting ? mn.form.creatingListing : mn.form.createListing}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}