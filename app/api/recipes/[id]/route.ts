import { prisma } from "@/lib/prisma";
import { recipeSchema } from "@/lib/validations";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/api-response";
import { getSessionHousehold } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { id } = await params;
    const recipe = await prisma.recipe.findFirst({
      where: { id, OR: [{ isPublic: true }, { createdById: ctx.userId }] },
      include: {
        ingredients: { orderBy: { id: "asc" } },
        favorites: { where: { userId: ctx.userId }, select: { id: true } },
        _count: { select: { favorites: true } },
      },
    });

    if (!recipe) return notFound();

    return ok({
      ...recipe,
      isFavorited: recipe.favorites.length > 0,
      favoriteCount: recipe._count.favorites,
      favorites: undefined,
      _count: undefined,
    });
  } catch {
    return serverError();
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { id } = await params;
    const recipe = await prisma.recipe.findUnique({ where: { id } });
    if (!recipe) return notFound();
    if (recipe.createdById !== ctx.userId) return forbidden();

    const body = await request.json();
    const parsed = recipeSchema.partial().safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const { ingredients, ...recipeData } = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      if (ingredients !== undefined) {
        await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
        await tx.recipeIngredient.createMany({
          data: ingredients.map((i) => ({ ...i, recipeId: id })),
        });
      }
      return tx.recipe.update({
        where: { id },
        data: recipeData,
        include: { ingredients: true },
      });
    });

    return ok(updated);
  } catch {
    return serverError();
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { id } = await params;
    const recipe = await prisma.recipe.findUnique({ where: { id } });
    if (!recipe) return notFound();
    if (recipe.createdById !== ctx.userId) return forbidden();

    await prisma.recipe.delete({ where: { id } });
    return ok({ id });
  } catch {
    return serverError();
  }
}
