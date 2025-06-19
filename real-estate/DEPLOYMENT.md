# PropertyHub Production Deployment Guide

## Prerequisites
- [Vercel CLI](https://vercel.com/cli) installed: `npm i -g vercel`
- Git repository connected to GitHub
- Vercel account

## Deployment Steps

### 1. Database Setup

#### Option A: Vercel Postgres (Recommended)
```bash
# Install Vercel Postgres
vercel postgres create
```

#### Option B: External PostgreSQL
Use any PostgreSQL provider (Railway, Supabase, AWS RDS, etc.)

### 2. Environment Variables

Set these environment variables in Vercel dashboard or via CLI:

```bash
# If using Vercel Postgres (automatically set)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."

# Or if using external PostgreSQL
DATABASE_URL="postgresql://username:password@hostname:5432/database_name"

# Optional (for future auth features)
NEXTAUTH_SECRET="your-secure-random-string"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

### 3. Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy (first time)
vercel --prod

# Or deploy from GitHub (recommended)
# Connect your GitHub repo in Vercel dashboard
```

### 4. Database Migration

After deployment, run the database migration:

```bash
# Using Vercel CLI
vercel env pull .env.production
DATABASE_URL="your-production-db-url" npx prisma migrate deploy

# Or use the Vercel dashboard to run:
npx prisma migrate deploy
```

### 5. Seed Production Database (Optional)

```bash
# Seed with sample data
DATABASE_URL="your-production-db-url" npm run db:seed
```

## Automatic Deployment

Once connected to GitHub:
1. Push to main branch
2. Vercel automatically builds and deploys
3. Database migrations run via `postinstall` script

## Environment Variables Required

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_SECRET` | Random string for auth | ⚠️ Future use |
| `NEXTAUTH_URL` | Production URL | ⚠️ Future use |

## Troubleshooting

### Build Errors
- Ensure all dependencies are in `package.json`
- Check TypeScript errors with `npm run lint`
- Verify Prisma schema is valid

### Database Issues
- Confirm DATABASE_URL is correct
- Ensure database is accessible from Vercel
- Check migration status: `npx prisma migrate status`

### Performance
- Images optimized via Next.js Image component
- Database queries are optimized with Prisma
- Static generation where possible

## Post-Deployment Checklist

- [ ] App loads successfully
- [ ] Property listings display correctly
- [ ] Search and filtering work
- [ ] Property details pages load
- [ ] Images display properly
- [ ] API endpoints respond correctly
- [ ] Mobile responsiveness works
- [ ] Performance is acceptable

## Monitoring

- Use Vercel Analytics for performance monitoring
- Monitor database performance
- Set up error tracking (Sentry, etc.)

## Scaling Considerations

- Database connection pooling (handled by Prisma)
- CDN for images (Vercel automatically handles this)
- Database optimization for large datasets
- Caching strategies for API responses