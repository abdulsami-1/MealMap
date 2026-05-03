import { prisma } from "@/lib/prisma";
import { ok, unauthorized, notFound, serverError } from "@/lib/api-response";
import { getSessionHousehold } from "@/lib/auth-helpers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { id } = await params;
    const recipe = await prisma.recipe.findFirst({
      where: { id, OR: [{ isPublic: true }, { createdById: ctx.userId }] },
    });
    if (!recipe) return notFound();

    const existing = await prisma.favorite.findUnique({
      where: { userId_recipeId: { userId: ctx.userId, recipeId: id } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return ok({ isFavorited: false });
    }

    await prisma.favorite.create({
      data: { userId: ctx.userId, recipeId: id },
    });
    return ok({ isFavorited: true });
  } catch {
    return serverError();
  }
}
