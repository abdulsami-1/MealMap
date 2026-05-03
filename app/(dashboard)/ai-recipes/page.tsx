import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AiRecipesPage } from "@/components/ai-recipes/ai-recipes-page";

export const metadata: Metadata = { title: "AI Recipes" };

export default async function AiRecipesPageRoute() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const member = await prisma.householdMember.findFirst({
    where: { userId: session.user.id },
    select: { householdId: true },
  });

  // Pre-load pantry ingredient names for quick-add suggestions
  const pantryItems = member
    ? await prisma.pantryItem.findMany({
        where: { householdId: member.householdId },
        select: { name: true },
        orderBy: { name: "asc" },
      })
    : [];

  const pantryIngredients = pantryItems.map((i) => i.name.toLowerCase());

  return <AiRecipesPage pantryIngredients={pantryIngredients} />;
}
