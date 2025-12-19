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
- **Database**: SQLite with Prisma ORM

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Required for webhook security
SWIFTCONNECT_WEBHOOK_SECRET=your-secret-key-here

# Optional: Discord webhook URL for notifications
# Get this from your Discord server: Server Settings → Integrations → Webhooks
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
```

**Note**: Generate a secure random string for `SWIFTCONNECT_WEBHOOK_SECRET`. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Set Up Database

Generate Prisma client and push the schema:

```bash
npx prisma generate
npx prisma db push
```

This will create a SQLite database at `prisma/dev.db`.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Dashboard

Navigate to `/dashboard` to view all failed payments. You can:

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

- `GET /api/payments` - Get all failed payments
- `PATCH /api/payments/[id]` - Update payment status
- `POST /api/webhook/failed-payment` - Create a new failed payment (webhook)
- `POST /api/seed` - Create a sample failed payment (dev)

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

- ⚠️ **No authentication**: This MVP skips user authentication for simplicity
- 🔒 **Webhook protection**: Webhook endpoint is protected by shared secret header
- 🔐 **Environment variables**: Never commit `.env` file to version control

For production use, consider adding:
- User authentication/authorization
- Rate limiting on webhook endpoint
- HTTPS enforcement
- Input validation and sanitization
- CSRF protection

## Troubleshooting

**Discord notifications not working?**
- Check that `DISCORD_WEBHOOK_URL` is set in `.env`
- Verify the webhook URL is valid (create a new one in Discord if needed)
- Check server console for error messages

**Database errors?**
- Run `npx prisma generate` and `npx prisma db push` again
- Delete `prisma/dev.db` and recreate if needed

**Webhook returns 401?**
- Verify `x-swiftconnect-secret` header matches `SWIFTCONNECT_WEBHOOK_SECRET` in `.env`

## License

MIT

