# Reway Marketplace MVP

This converts the Reway marketing landing page into an MVP marketplace for buying/selling e-waste.

## MVP included

- Public Reway landing page
- Seller and recycler signup/login
- Role-based dashboards
- Seller e-waste listing creation
- Recycler marketplace/search
- Recycler quotations
- Seller quote comparison/acceptance
- Order creation
- Order status timeline
- Recycler status updates
- Basic company profile
- Supabase PostgreSQL + Auth + RLS schema

## 1. Install

```bash
npm install
```

## 2. Create Supabase project

Create a project in Supabase, then open **SQL Editor** and run:

`supabase/schema.sql`

## 3. Environment

Copy `.env.example` to `.env.local` and add your Supabase project URL and anon/publishable key:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Do not put a Supabase service-role key in Vite environment variables.

## 4. Run

```bash
npm run dev
```

## 5. Deploy

Push to GitHub and import the repository into Vercel. Add the same two `VITE_` environment variables in Vercel Project Settings → Environment Variables.

## Important MVP notes

- The application intentionally does not implement payments/escrow, GPS logistics, AI pricing, recovered-material marketplace or regulatory automation yet.
- Quote acceptance creates an order. For an operational deployment, review the transaction/compliance workflow with legal and operations stakeholders before processing real e-waste transactions.
- The current quote/order flow is designed for controlled MVP pilots.
