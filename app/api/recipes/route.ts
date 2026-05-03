import { prisma } from "@/lib/prisma";
import { recipeSchema } from "@/lib/validations";
import { ok, created, badRequest, unauthorized, serverError } from "@/lib/api-response";
import { getSessionHousehold } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const cuisine = searchParams.get("cuisine");
    const difficulty = searchParams.get("difficulty");
    const maxTime = searchParams.get("maxTime");
    const favoritesOnly = searchParams.get("favorites") === "true";

    const VALID_DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
    type Difficulty = typeof VALID_DIFFICULTIES[number];
    const validDifficulty = difficulty && VALID_DIFFICULTIES.includes(difficulty as Difficulty)
      ? (difficulty as Difficulty)
      : null;

    const recipes = await prisma.recipe.findMany({
      where: {
        OR: [{ isPublic: true }, { createdById: ctx.userId }],
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
        ...(cuisine ? { cuisine } : {}),
        ...(validDifficulty ? { difficulty: validDifficulty } : {}),
        ...(maxTime ? { cookingTime: { lte: parseInt(maxTime) } } : {}),
        ...(favoritesOnly ? { favorites: { some: { userId: ctx.userId } } } : {}),
      },
      include: {
        ingredients: { orderBy: { id: "asc" } },
        favorites: { where: { userId: ctx.userId }, select: { id: true } },
        _count: { select: { favorites: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return ok(
      recipes.map((r) => ({
        ...r,
        isFavorited: r.favorites.length > 0,
        favoriteCount: r._count.favorites,
        favorites: undefined,
        _count: undefined,
      }))
    );
  } catch {
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const body = await request.json();
    const parsed = recipeSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const { ingredients, ...recipeData } = parsed.data;

    const recipe = await prisma.recipe.create({
      data: {
        ...recipeData,
        createdById: ctx.userId,
        ingredients: { create: ingredients },
      },
      include: {
        ingredients: true,
        favorites: { where: { userId: ctx.userId }, select: { id: true } },
      },
    });

    return created({ ...recipe, isFavorited: false, favoriteCount: 0, favorites: undefined });
  } catch {
    return serverError();
  }
}
