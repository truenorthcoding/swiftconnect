# Vercel Build Fix Checklist

## ✅ Prerequisites Before Deploying

1. **DATABASE_URL is set in Vercel**
   - Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify `DATABASE_URL` exists with your full Neon connection string:
     ```
     postgresql://neondb_owner:npg_HAbeIPRh71fN@ep-icy-base-a41doaly-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
     ```
   - ✅ Set for: Production, Preview, AND Development

2. **Other Environment Variables**
   - ✅ `SWIFTCONNECT_WEBHOOK_SECRET` is set
   - ✅ `DISCORD_WEBHOOK_URL` (optional)

## 🧪 Test Build Locally First

Before deploying, test the build locally:

```bash
# Set your DATABASE_URL locally
export DATABASE_URL="postgresql://neondb_owner:npg_HAbeIPRh71fN@ep-icy-base-a41doaly-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Run the build
npm run build
```

If this fails locally, fix the issue before deploying to Vercel.

## 🚀 Deploy Steps

1. **Commit and push your changes**
   ```bash
   git add .
   git commit -m "Fix Prisma lazy initialization for Vercel build"
   git push
   ```

2. **In Vercel Dashboard**
   - Go to Deployments
   - If auto-deploy is enabled, it will deploy automatically
   - OR click "Redeploy" on the latest deployment
   - **Important**: Uncheck "Use existing Build Cache" if available

3. **Watch the build logs**
   - Look for: `prisma generate` completing successfully
   - Look for: `next build` completing successfully
   - If errors, check which step failed

## 🔍 Troubleshooting

**If build still fails:**

1. Check the exact error in build logs
2. Verify DATABASE_URL is correct (copy/paste it again)
3. Make sure DATABASE_URL is set for ALL environments
4. Try redeploying with build cache disabled
5. Check if `prisma generate` step completes (should see "✔ Generated Prisma Client")

**Common Issues:**
- ❌ DATABASE_URL missing → Add it
- ❌ DATABASE_URL truncated → Copy full string
- ❌ Wrong environment → Set for Production, Preview, Development
- ❌ Build cache → Redeploy with cache disabled

