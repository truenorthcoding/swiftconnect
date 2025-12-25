# Critical: Fix Vercel Build Error

## The Problem
Next.js is trying to analyze `/api/payments` during build, which causes Prisma to initialize and fail if DATABASE_URL isn't available.

## Solution Steps

### 1. ✅ Make sure DATABASE_URL is set in Vercel
Go to Vercel → Your Project → Settings → Environment Variables

**CRITICAL**: Set this for ALL environments (Production, Preview, Development):
- Key: `DATABASE_URL`
- Value: `postgresql://neondb_owner:npg_HAbeIPRh71fN@ep-icy-base-a41doaly-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

### 2. Verify Environment Variables
Make sure you have:
- ✅ `DATABASE_URL` (full PostgreSQL connection string)
- ✅ `SWIFTCONNECT_WEBHOOK_SECRET` (your secret)
- ✅ `DISCORD_WEBHOOK_URL` (optional)

### 3. Redeploy
After updating environment variables, trigger a new deployment:
- Push a new commit, OR
- Go to Deployments → Click "Redeploy" → Select "Use existing Build Cache" = OFF

## If Still Failing

The error happens because Next.js tries to statically analyze routes. Try:

1. **Check Build Logs** - Look for specific error about DATABASE_URL
2. **Verify Connection String** - Make sure it's the full string, not truncated
3. **Test Locally** - Run `npm run build` locally with DATABASE_URL set

