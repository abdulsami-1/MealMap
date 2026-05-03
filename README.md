# MealMap

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-black?style=flat-square&logo=vercel)

Weekly meal planner with AI recipe suggestions, pantry tracking, and auto-generated grocery lists — built for households that want to stop answering "what's for dinner" every night.

---

## Why we built this

Sunday meal planning usually means opening 4 tabs, arguing about what you have in the fridge, and writing a grocery list by hand. We wanted one app that does the whole flow: pick your meals, see what you're missing, and get the shopping list done — without thinking too hard about it.

The AI part came from a specific annoyance: we'd have random stuff in the fridge on a Wednesday and no idea what to cook with it. Now you just list the ingredients and it gives you three things you can actually make tonight.

---

## Who uses it

**Households and couples** — shared meal plan, shared grocery list. No more "did you get milk?" texts.

**Busy weekday cooks** — plan Sunday, shop once, cook the rest of the week without decisions.

**Fridge cleaners** — dump your leftover ingredients into the AI tab and get three practical recipes back.

---

## Features

- **Drag-and-drop weekly planner** — breakfast, lunch, dinner, snacks across 7 days
- **Pantry tracker** — log what you have, with quantities, units, and expiry dates
- **Grocery lists** — auto-generated from your meal plan, checked off at the store
- **AI recipe generator** — Gemini suggests 3 real recipes from whatever's in your fridge
- **Recipe library** — save, filter by cuisine/difficulty/time, mark favorites
- **Household sharing** — invite family or roommates, everyone sees the same plan

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
| UI components | Radix UI + shadcn/ui |
| Client state | Zustand |
| Animations | Framer Motion |
| Drag and drop | dnd-kit |
| AI | Google Gemini API (REST, no SDK) |

---

## Architecture

```
Browser
  │
  ├── Next.js App Router (SSR + client components)
  │     ├── (auth)/       login, register
  │     ├── (dashboard)/  planner, pantry, recipes, grocery
  │     └── api/          REST endpoints (all server-side)
  │
  ├── Auth.js v5 (JWT, middleware-protected routes)
  │
  ├── Prisma ORM → PostgreSQL (Neon)
  │     └── Users, Households, Meals, MealPlans,
  │         Recipes, Pantry, GroceryLists
  │
  └── Gemini REST API (server-side only, rate-limited per user)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database ([Neon](https://neon.tech) free tier works great)
- [Gemini API key](https://aistudio.google.com/app/apikey)

### 1. Clone and install

```bash
git clone https://github.com/abdulsami-1/MealMap.git
cd MealMap
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@host:5432/mealmap"
AUTH_SECRET="your-secret"        # openssl rand -base64 32
AUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-gemini-key"
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
├── (auth)/          # Login, register
├── (dashboard)/     # Protected pages (planner, pantry, recipes, grocery, settings)
└── api/             # All API routes

components/
├── landing/         # Home page sections
├── layout/          # Sidebar, header, mobile nav
├── ui/              # Shared primitives (shadcn)
└── [feature]/       # Per-feature components

lib/
├── auth.ts          # Auth.js config
├── prisma.ts        # Prisma client singleton
├── gemini.ts        # Gemini wrapper + response parsing + fallback model
├── api-response.ts  # Typed response helpers { success, data?, error? }
└── validations.ts   # Zod schemas for all inputs
```

---

## API

All endpoints return `{ success, data? }` or `{ success, error }`.

| Route | Methods | Description |
|---|---|---|
| `/api/auth/register` | `POST` | Create account + household |
| `/api/recipes` | `GET POST` | List / create recipes |
| `/api/meal-plan` | `GET POST` | Weekly plan |
| `/api/pantry` | `GET POST` | Pantry items |
| `/api/grocery-list` | `GET POST` | Grocery lists |
| `/api/grocery-list/generate` | `POST` | Auto-generate from meal plan |
| `/api/ai/recipes` | `POST` | AI suggestions (rate-limited: 10/hr) |

---

## Deploying to Vercel

1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add env vars in the Vercel dashboard
4. Deploy — build command in `vercel.json` handles Prisma automatically

Use a cloud Postgres database. Neon has a free tier and works well with Vercel.

---

## Scripts

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint
npx prisma studio    # Database GUI
npx prisma db push   # Sync schema changes
```

