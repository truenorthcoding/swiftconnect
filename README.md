# SwiftConnect

A creator dashboard that helps recover revenue from failed payments. SwiftConnect detects failed payments, notifies creators via Discord, and provides pre-written recovery messages to help recover revenue.

## Features

- 📊 **Dashboard**: View all failed payments with status tracking (FAILED → CONTACTED → RECOVERED)
- 🔔 **Discord Notifications**: Get instant alerts when a payment fails
- 📋 **Recovery Messages**: Pre-written message templates with customer/product details ready to copy
- 🔒 **Secure Webhooks**: Protected webhook endpoint for receiving payment events
- 🎨 **Modern UI**: Clean, mobile-first design with dark mode support

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Postgres (Neon/Vercel Postgres) with Prisma ORM

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Required: Database URL (Postgres for local + production)
DATABASE_URL=postgresql://...

# Required: Webhook secret for securing the /api/webhook/failed-payment endpoint
SWIFTCONNECT_WEBHOOK_SECRET=your-secret-key-here

# Optional: Discord webhook URL for notifications
# Get this from your Discord server: Server Settings → Integrations → Webhooks
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url

# Whop App authentication (required)
# Whop signs the embedded app session as a JWT.
WHOP_APP_SECRET=...
```

**Note**: Generate a secure random string for `SWIFTCONNECT_WEBHOOK_SECRET`. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Set Up Database

Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

For production (Vercel), run:

```bash
npx prisma migrate deploy
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Dashboard

Navigate to `/login` to sign in with Whop, then access `/dashboard`. You can:

- **View** all failed payments with customer details, product info, and status
- **Mark Contacted**: Update status when you've reached out to the customer
- **Mark Recovered**: Update status when payment is successfully recovered
- **Copy Message**: Copy a pre-formatted recovery message to send to customers
- **Create Sample Payment**: Generate a sample failed payment for testing

### Webhook Endpoint

Send failed payment events to:

```
POST /api/webhook/failed-payment
```

**Headers:**
```
Content-Type: application/json
x-swiftconnect-secret: your-secret-key-here
```

**Request Body:**
```json
{
  "company_id": "company_...",
  "customerName": "John Doe",
  "customerEmail": "john.doe@example.com",
  "productName": "Premium Membership",
  "amount": 49.99,
  "currency": "USD",
  "reason": "Insufficient funds"
}
```

**Example with cURL:**
```bash
curl -X POST http://localhost:3000/api/webhook/failed-payment \
  -H "Content-Type: application/json" \
  -H "x-swiftconnect-secret: your-secret-key-here" \
  -d '{
    "customerName": "Jane Smith",
    "customerEmail": "jane@example.com",
    "productName": "Pro Plan",
    "amount": 99.99,
    "currency": "USD",
    "reason": "Card expired"
  }'
```

### Discord Notifications

When a failed payment is created (via webhook or seed), if `DISCORD_WEBHOOK_URL` is set, a notification will be sent to your Discord channel with:

- Customer name and email
- Product name
- Amount and currency
- Failure reason (if provided)
- Timestamp

## Data Model

```typescript
{
  id: string              // Unique identifier (CUID)
  createdAt: DateTime     // Timestamp
  customerName: string    // Customer's name
  customerEmail: string   // Customer's email
  productName: string     // Product/service name
  amount: number          // Payment amount
  currency: string        // Currency code (default: USD)
  reason: string | null   // Failure reason (optional)
  status: 'FAILED' | 'CONTACTED' | 'RECOVERED'
}
```

## API Routes

- `GET /api/payments` - Get failed payments for the logged-in company (tenant)
- `PATCH /api/payments/[id]` - Update payment status (company-scoped)
- `POST /api/webhook/failed-payment` - Create a new failed payment (webhook)
- `POST /api/seed` - Create a sample failed payment (company-scoped, dev)
- Dashboard authentication is handled by Whop App JWT via `middleware.ts` (no email/password).

## Recovery Message Template

The recovery message includes:
- Personalized greeting with customer name
- Payment details (amount, product)
- Failure reason (if available)
- Retry link (placeholder - customize in code)
- Support contact information

You can customize the message template in `app/dashboard/page.tsx` in the `generateRecoveryMessage` function.

## Development

### Database Management

View your database with Prisma Studio:

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` to view and edit your data.

### Building for Production

```bash
npm run build
npm start
```

## Security Notes (MVP)

- 🔐 **Whop login**: Users authenticate via Whop OAuth; sessions are stored server-side via HttpOnly cookies
- 🔒 **Webhook protection**: Webhook endpoint is protected by shared secret header
- 🔐 **Environment variables**: Never commit `.env` file to version control

For production use, consider adding:
- Rate limiting on webhook endpoint
- HTTPS enforcement
- Input validation and sanitization
- CSRF protection

## Deployment Options

### Option 1: Postgres (Recommended) 🐘

Railway is perfect for this app since it supports SQLite with persistent file storage.

#### Quick Deploy to Railway

1. **Sign up** at [railway.app](https://railway.app)
2. **Create a new project** → "Deploy from GitHub repo"
3. **Select your repository**
4. **Add Environment Variables** in Railway dashboard:
   - `DATABASE_URL=file:./data/dev.db` (Railway will create the directory)
   - `SWIFTCONNECT_WEBHOOK_SECRET` - Your webhook secret
   - `DISCORD_WEBHOOK_URL` - (Optional) Discord webhook URL
5. **Deploy** - Railway auto-detects Next.js and will build/deploy automatically

The database will be automatically initialized on first deploy via the `start` script.

#### Railway Benefits
- ✅ Native SQLite support with persistent storage
- ✅ Simple deployment process
- ✅ Free tier available ($5 credit/month)
- ✅ Automatic HTTPS
- ✅ Custom domains

---

### Option 2: Vercel Deployment

### 1. Database Setup

**Important**: SQLite with file-based storage won't work on Vercel (ephemeral filesystem). You need a cloud database:

**Option A: SQLite-compatible (Turso)**
- Use [Turso](https://turso.tech/) for SQLite on the edge
- Keep `provider = "sqlite"` in `prisma/schema.prisma`
- Get connection string from Turso dashboard

**Option B: PostgreSQL (Recommended)**
- **Vercel Postgres** (easiest integration with Vercel)
- **Neon** (free tier available, serverless Postgres)
- **Supabase** (free tier available)

If using PostgreSQL, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

Then run:
```bash
npx prisma generate
npx prisma db push  # Or use migrations for production
```

### 2. Environment Variables

Add these in your Vercel project settings:
- `DATABASE_URL` - Your database connection string
- `SWIFTCONNECT_WEBHOOK_SECRET` - Your webhook secret
- `DISCORD_WEBHOOK_URL` - (Optional) Your Discord webhook URL

### 3. Deploy

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will automatically detect Next.js and use the build command
4. After deployment, run migrations: `npx prisma db push` (or use Prisma Migrate)

**Note**: The `postinstall` script in `package.json` will automatically generate the Prisma client during build.

## Troubleshooting

**Discord notifications not working?**
- Check that `DISCORD_WEBHOOK_URL` is set in `.env` (or Vercel environment variables)
- Verify the webhook URL is valid (create a new one in Discord if needed)
- Check server console for error messages

**Database errors on Vercel?**
- Ensure `DATABASE_URL` is set in Vercel environment variables
- Make sure the database provider in `schema.prisma` matches your database type
- Run `npx prisma generate` locally to verify schema is valid
- Check Vercel build logs for Prisma client generation errors

**Local database errors?**
- Run `npx prisma generate` and `npx prisma db push` again
- For SQLite: Delete `prisma/dev.db` and recreate if needed
- Ensure `DATABASE_URL=file:./dev.db` is in your `.env` file

**Webhook returns 401?**
- Verify `x-swiftconnect-secret` header matches `SWIFTCONNECT_WEBHOOK_SECRET` in `.env` or Vercel environment variables

**Build fails on Vercel?**
- Ensure `postinstall` script runs `prisma generate`
- Check that `DATABASE_URL` is set (required even during build)
- Verify Prisma schema is valid: `npx prisma validate`

## License

MIT

