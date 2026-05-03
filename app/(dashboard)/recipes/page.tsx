import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RecipesPage } from "@/components/recipes/recipes-page";

export const metadata: Metadata = { title: "Recipes" };

export default async function RecipesPageRoute() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const recipes = await prisma.recipe.findMany({
    where: {
      OR: [{ isPublic: true }, { createdById: session.user.id }],
    },
    include: {
      ingredients: { orderBy: { id: "asc" } },
      favorites: { where: { userId: session.user.id }, select: { id: true } },
      _count: { select: { favorites: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const serialized = recipes.map((r) => ({
    ...r,
    isFavorited: r.favorites.length > 0,
    favoriteCount: r._count.favorites,
    favorites: undefined,
    _count: undefined,
  }));

  return <RecipesPage initialRecipes={serialized} />;
}
