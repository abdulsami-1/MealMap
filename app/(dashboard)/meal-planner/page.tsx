import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWeekStart } from "@/lib/week-helpers";
import { MealPlannerPage } from "@/components/meal-planner/meal-planner-page";

export const metadata: Metadata = { title: "Meal Planner" };

export default async function MealPlannerPageRoute() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const member = await prisma.householdMember.findFirst({
    where: { userId: session.user.id },
    select: { householdId: true },
  });

  if (!member) redirect("/dashboard");

  const weekStart = getWeekStart();

  const [plan, meals] = await Promise.all([
    prisma.mealPlan.findUnique({
      where: {
        householdId_weekStart: {
          householdId: member.householdId,
          weekStart,
        },
      },
      include: {
        entries: {
          include: { meal: true },
          orderBy: [{ dayOfWeek: "asc" }, { mealType: "asc" }],
        },
      },
    }),
    prisma.meal.findMany({
      where: { createdById: session.user.id },
      orderBy: { name: "asc" },
      take: 100,
    }),
  ]);

  return (
    <MealPlannerPage
      initialPlan={plan}
      initialMeals={meals}
      initialWeekStart={weekStart}
    />
  );
}
