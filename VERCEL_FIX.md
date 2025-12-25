# Fixing Vercel Build Error

## The Problem
The build fails because either:
1. `DATABASE_URL` is not set in Vercel environment variables
2. You're using SQLite (file-based), which doesn't work on Vercel

## Solution: Use PostgreSQL (Neon) on Vercel

### Step 1: Update Prisma Schema for PostgreSQL

Change `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 2: Set Up Neon Database

1. Go to https://neon.tech → Sign up (free)
2. Create a new project → Name: "swiftconnect"
3. Copy the connection string (shown after creation)

### Step 3: Add Environment Variables in Vercel

**CRITICAL**: Add these in Vercel BEFORE deploying:

1. Go to your Vercel project → Settings → Environment Variables
2. Add these variables:

```
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb
SWIFTCONNECT_WEBHOOK_SECRET=c220bb8a17d7fb65428adaf123cc835b9d20b22a6748affa6e51a91797b66617
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... (optional)
```

### Step 4: Initialize Database

After setting DATABASE_URL, run locally:

```bash
# Use your Neon connection string
export DATABASE_URL="your-neon-connection-string"

# Generate and push schema
npx prisma generate
npx prisma db push
```

### Step 5: Redeploy on Vercel

After adding environment variables, trigger a new deployment:
- Push a new commit, OR
- Go to Vercel dashboard → Deployments → Click "Redeploy"

## Why This Fixes It

- ✅ `DATABASE_URL` is available during build (Prisma can generate client)
- ✅ PostgreSQL works on Vercel (unlike SQLite files)
- ✅ No code changes needed except schema provider

