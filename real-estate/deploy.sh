#!/bin/bash

# PropertyHub Production Deployment Script
# Run this script to deploy to Vercel

echo "🚀 Starting PropertyHub deployment..."

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel first:"
    echo "vercel login"
    exit 1
fi

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set up your PostgreSQL database"
echo "2. Configure environment variables in Vercel dashboard"
echo "3. Run database migration: npx prisma migrate deploy"
echo "4. Optionally seed database: npm run db:seed"