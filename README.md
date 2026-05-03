# MealMap

> AI-powered meal planning for households — plan your week, track your pantry, auto-generate grocery lists, and get recipe ideas from what you already have.

---

## Features

- **Weekly meal planner** — drag-and-drop meals across breakfast, lunch, dinner, and snacks
- **Pantry tracker** — log ingredients with quantities, units, and expiry dates
- **Smart grocery lists** — auto-generated from your meal plan, shared in real time with your household
- **AI recipe generator** — tell it what's in your fridge, get 3 practical recipes back (powered by Gemini)
- **Recipe library** — save, browse, filter, and favorite recipes
- **Household accounts** — invite family or roommates, share one meal plan

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Neon recommended) |
| ORM | Prisma 6 |
| Auth | Auth.js v5 — credentials + JWT |
| Styling | Tailwind CSS v4 |
| UI | Radix UI + shadcn/ui |
| State | Zustand |
| Animations | Framer Motion |
| AI | Google Gemini API (REST) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or [Neon](https://neon.tech) free tier)
- [Gemini API key](https://aistudio.google.com/app/apikey)

### 1. Clone and install

```bash
git clone https://github.com/abdulsami-1/MealMap.git
cd MealMap
npm install
```

### 2. Configure environment

Copy the example and fill in your values:

```bash
cp .env.example .env
```

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/mealmap"

# Auth.js — generate with: openssl rand -base64 32
AUTH_SECRET="your-secret"
AUTH_URL="http://localhost:3000"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
├── (auth)/          # Login, register pages
├── (dashboard)/     # Protected app pages
└── api/             # API routes

components/
├── landing/         # Marketing / home page sections
├── layout/          # Sidebar, header, mobile nav
├── ui/              # Shared UI primitives (shadcn)
└── [feature]/       # Feature-specific components

lib/
├── auth.ts          # Auth.js config
├── prisma.ts        # Prisma client singleton
├── gemini.ts        # Gemini API wrapper + response parsing
├── api-response.ts  # Typed API response helpers
└── validations.ts   # Zod schemas

prisma/
└── schema.prisma    # Full database schema
```

---

## API Overview

All endpoints return:

```json
{ "success": true, "data": {} }
{ "success": false, "error": "message" }
```

| Route | Methods | Description |
|---|---|---|
| `/api/auth/register` | `POST` | Create account + household |
| `/api/recipes` | `GET POST` | List / create recipes |
| `/api/meal-plan` | `GET POST` | Get / create weekly plan |
| `/api/pantry` | `GET POST` | Pantry items |
| `/api/grocery-list` | `GET POST` | Grocery lists |
| `/api/grocery-list/generate` | `POST` | Auto-generate from meal plan |
| `/api/ai/recipes` | `POST` | AI recipe suggestions |

---

## Deploying to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables in the Vercel dashboard
4. Vercel auto-detects Next.js — build command in `vercel.json` handles Prisma

> **Note:** Use a cloud Postgres database (Neon, Supabase, or Railway). Local databases won't work on Vercel.

---

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma db push   # Sync schema to database
```

---

## License

MIT
