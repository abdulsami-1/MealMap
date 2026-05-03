# MealMap

Meal planning app with AI recipe suggestions. Plan your week, track your pantry, and generate grocery lists automatically.

## Stack

- Next.js 15 (App Router)
- PostgreSQL + Prisma
- Auth.js v5 (credentials, JWT)
- Tailwind CSS v4
- Gemini API (recipe generation)

## Setup

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Environment variables

```env
DATABASE_URL="postgresql://user:password@host:5432/mealmap"
AUTH_SECRET="run: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-key-from-aistudio.google.com"
```

## Usage

Register an account, create a household, and start planning meals for the week. The pantry tracker lets you log what you have, and the AI tab generates recipes from your ingredients.

Grocery lists are built automatically from your meal plan.
