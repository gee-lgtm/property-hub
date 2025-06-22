# Cloudinary Setup Guide

## 🚀 Setting Up Cloudinary for PropertyHub

PropertyHub now uses Cloudinary for production-ready image uploads with automatic optimization and transformation.

### 📋 Prerequisites
1. A Cloudinary account (free tier available)
2. Cloudinary credentials

### 🔧 Setup Steps

#### 1. Create Cloudinary Account
- Go to [cloudinary.com](https://cloudinary.com)
- Sign up for a free account
- Navigate to your Dashboard

#### 2. Get Your Credentials
From your Cloudinary Dashboard, copy:
- **Cloud Name**: Found at the top of your dashboard
- **API Key**: Found in the "Account Details" section
- **API Secret**: Found in the "Account Details" section (click "Reveal")

#### 3. Configure Environment Variables

**For Local Development:**
Add to your `.env.local` file:
```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**For Production (Vercel):**
Add to your Vercel project environment variables:
1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### ✨ What's Included

#### 🖼️ **Automatic Image Optimization**
- **Auto Quality**: Cloudinary automatically optimizes image quality
- **Auto Format**: Serves WebP/AVIF to supported browsers
- **Size Limits**: Max 1200x800px for web display
- **Compression**: Smart compression to reduce file sizes

#### 📁 **Organization**
- Images are stored in `/property-listings/` folder
- Automatic file naming and organization
- Secure HTTPS URLs for all images

#### 🔒 **Security**
- Authentication required for uploads
- File type validation (images only)
- Size limits (10MB per image, max 10 images)
- Server-side validation

#### 🚀 **Performance**
- Global CDN delivery
- Automatic caching
- Fast upload processing
- Optimized for real estate images

### 📊 Usage Limits & Pricing

#### **Free Tier Includes:**
- 25 GB storage
- 25 GB monthly bandwidth
- 1,000 transformations/month
- Perfect for development and small deployments

#### **Paid Tiers:**
- Start at $89/month for more storage and bandwidth
- Pay-as-you-go options available
- Advanced features like AI-powered tagging

### 🛠️ How It Works

1. **User uploads images** via drag-and-drop or file browser
2. **Frontend validates** file types and sizes
3. **Images sent to `/api/upload`** endpoint
4. **Server uploads to Cloudinary** with automatic optimization
5. **Cloudinary returns secure URLs** 
6. **URLs stored in database** and displayed to users

### 🔧 Customization Options

You can modify the image transformations in `/src/app/api/upload/route.ts`:

```typescript
transformation: [
  { quality: 'auto', fetch_format: 'auto' },
  { width: 1200, height: 800, crop: 'limit' },
  // Add more transformations here
],
```

### 📝 Testing

**Local Testing:**
- Images will be uploaded to your Cloudinary account even in development
- Use a separate "development" folder by modifying the folder name in the upload route

**Production Testing:**
- Deploy to Vercel with environment variables set
- Test image uploads through the add-listing form
- Verify images appear in your Cloudinary dashboard

### 🚨 Important Notes

1. **Environment Variables**: Make sure all three Cloudinary variables are set in production
2. **HTTPS Only**: Cloudinary URLs are HTTPS by default (secure)
3. **Backup Strategy**: Cloudinary is reliable, but consider backing up important images
4. **Monitoring**: Monitor your Cloudinary usage through their dashboard

### 🔄 Fallback Behavior

If Cloudinary is not configured or upload fails:
- The app will still work
- Sample images will be used instead
- Error messages will be shown to users
- No data loss occurs

This ensures your app remains functional even if there are temporary Cloudinary issues.