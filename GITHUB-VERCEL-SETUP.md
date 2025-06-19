# GitHub → Vercel Automatic Deployment Setup

## 🚀 Quick Setup Guide

Follow these steps to enable automatic deployments from GitHub to Vercel:

### 1. Connect GitHub Repository to Vercel

#### Option A: Vercel Dashboard (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your `real-estate` project
3. Go to **Settings** → **Git**
4. Click **Connect Git Repository**
5. Select **GitHub** and authorize Vercel
6. Choose repository: `gee-lgtm/property-hub`
7. Select production branch: `main`

#### Option B: Import New Project
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import from GitHub: `gee-lgtm/property-hub`
3. Configure project settings (auto-detected for Next.js)
4. Deploy

### 2. Configure Deployment Settings

#### Build Settings (Auto-detected)
```
Framework: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

#### Environment Variables
Ensure these are set in Vercel dashboard:
```
DATABASE_URL=prisma+postgres://...
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
```

### 3. Branch Configuration

#### Production Branch
- **Branch**: `main`
- **Auto-deploy**: ✅ Enabled
- **Domain**: Your custom domain or vercel.app

#### Preview Branches
- **Feature branches**: Auto-deploy to preview URLs
- **Pull Requests**: Auto-deploy for testing

### 4. Deployment Triggers

Once connected, automatic deployments will trigger on:
- ✅ **Push to main** → Production deployment
- ✅ **Pull Request** → Preview deployment
- ✅ **Merge PR** → Production deployment

## 🔧 Advanced Configuration

### Custom Build Settings
If needed, you can override in `vercel.json`:
```json
{
  "version": 2,
  "build": {
    "env": {
      "ENABLE_PRISMA_CLIENT_CACHE": "1"
    }
  },
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ]
}
```

### Database Migration on Deploy
Add to `package.json` for automatic migrations:
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

### Environment-Specific Configs
- **Development**: `.env` (local only)
- **Preview**: Vercel environment variables
- **Production**: Vercel environment variables

## 📋 Deployment Checklist

- [ ] GitHub repository connected to Vercel
- [ ] Production branch set to `main`
- [ ] Environment variables configured
- [ ] Build settings verified
- [ ] Database connection tested
- [ ] Custom domain configured (optional)

## 🚨 Important Notes

### Database Considerations
- **Migrations**: Run automatically on deploy via `prisma migrate deploy`
- **Seeding**: Only run manually to avoid data conflicts
- **Connections**: Prisma Accelerate handles connection pooling

### Branch Protection
Consider setting up GitHub branch protection rules:
- Require PR reviews before merging to `main`
- Require status checks (build, tests)
- Restrict direct pushes to `main`

## 🎯 Expected Workflow

1. **Development**: Work on feature branch
2. **Create PR**: Vercel creates preview deployment
3. **Review**: Test preview deployment
4. **Merge**: Automatic production deployment
5. **Live**: Changes live on production URL

## 🔍 Monitoring

After setup, monitor deployments:
- **Vercel Dashboard**: Real-time build logs
- **GitHub Actions**: If you add CI/CD
- **Vercel Analytics**: Performance monitoring

## 🆘 Troubleshooting

### Common Issues
1. **Build Fails**: Check environment variables
2. **Database Errors**: Verify DATABASE_URL
3. **Prisma Issues**: Ensure `prisma generate` runs
4. **Deploy Timeout**: Check build command efficiency

### Debug Commands
```bash
# Test build locally
npm run build

# Check Vercel logs
vercel logs

# Redeploy manually
vercel --prod
```

## ✅ Verification Steps

After setup, verify:
1. Push to `main` triggers deployment
2. PR creates preview deployment
3. Environment variables work
4. Database connection established
5. Application loads correctly

Your PropertyHub app will now automatically deploy on every push to main! 🚀