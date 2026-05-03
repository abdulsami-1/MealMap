import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GroceryListPage } from "@/components/grocery/grocery-list-page";

export const metadata: Metadata = { title: "Grocery List" };

export default async function GroceryListPageRoute() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const member = await prisma.householdMember.findFirst({
    where: { userId: session.user.id },
    select: { householdId: true },
  });

  if (!member) redirect("/dashboard");

  const lists = await prisma.groceryList.findMany({
    where: { householdId: member.householdId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { items: true } },
      items: {
        where: { isChecked: false },
        select: { id: true },
      },
    },
  });

  const serialized = lists.map((l) => ({
    id: l.id,
    name: l.name,
    status: l.status,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
    totalItems: l._count.items,
    uncheckedItems: l.items.length,
  }));

  return <GroceryListPage initialLists={serialized} />;
}
