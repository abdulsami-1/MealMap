import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const household = await prisma.householdMember.findFirst({
    where: { userId: session.user.id },
    include: { household: true },
  });

  if (!household) return null;

  const [pantryAlerts, activePlan, activeGroceryList] = await Promise.all([
    prisma.pantryItem.findMany({
      where: {
        householdId: household.householdId,
        expiryDate: { not: null },
      },
      orderBy: { expiryDate: "asc" },
      take: 10,
    }),
    prisma.mealPlan.findFirst({
      where: { householdId: household.householdId },
      orderBy: { weekStart: "desc" },
      include: { entries: { include: { meal: true } } },
    }),
    prisma.groceryList.findFirst({
      where: {
        householdId: household.householdId,
        status: "ACTIVE",
      },
      include: { _count: { select: { items: true } } },
    }),
  ]);

  return (
    <DashboardContent
      user={session.user}
      household={household.household}
      pantryAlerts={pantryAlerts}
      activePlan={activePlan}
      activeGroceryList={activeGroceryList}
    />
  );
}
