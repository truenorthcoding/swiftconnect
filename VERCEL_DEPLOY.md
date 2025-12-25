# Quick Vercel Deployment Guide

## Option 1: Vercel + Neon/PostgreSQL (Easiest) ⭐

This is the simplest approach and recommended for Vercel.

### Step 1: Update Prisma Schema

Change `prisma/schema.prisma` to use PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 2: Create Neon Database (Free)

1. Go to https://neon.tech and sign up (free tier)
2. Click "Create Project" → Name it "swiftconnect"
3. Copy the connection string (looks like `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb`)

### Step 3: Initialize Database

Run locally once:

```bash
# Set your Neon connection string
export DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb"

# Push schema
npx prisma generate
npx prisma db push
```

### Step 4: Deploy to Vercel

1. **Push code to GitHub**
2. **Go to vercel.com** → "Add New" → "Project"  
3. **Import your GitHub repo**
4. **Add Environment Variables**:

   ```
   DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb
   SWIFTCONNECT_WEBHOOK_SECRET=your-random-secret-here
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... (optional)
   ```

5. **Click "Deploy"**

Done! Your app will be live.

---

## Option 2: Vercel + Turso (Keeps SQLite)

Keeps your current SQLite schema, but requires a bit more setup.

### Step 1: Install Turso CLI

```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Windows (PowerShell)
irm https://get.tur.so/install.ps1 | iex
```

### Step 2: Create Turso Database

```bash
# Login
turso auth login

# Create database
turso db create swiftconnect

# Get connection string (with auth token)
turso db show swiftconnect --url
```

### Step 3: Install libsql package

```bash
npm install @libsql/client
```

### Step 4: Update Prisma for Turso

You'll need to use a custom Prisma adapter. For simplicity, **we recommend Option 1 (PostgreSQL)** instead.

---

## Generate Webhook Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Troubleshooting

**Build fails?**
- Make sure `DATABASE_URL` is set in Vercel
- Check that Prisma client generates (runs in `postinstall`)
- Verify schema syntax is correct

**Database connection errors?**
- Test connection string locally first
- Make sure you ran `prisma db push` to create tables
- Check database dashboard to verify it exists

**Still having issues?**
- Check Vercel build logs for specific errors
- Verify all environment variables are set correctly
- Try `npx prisma generate` locally to test

