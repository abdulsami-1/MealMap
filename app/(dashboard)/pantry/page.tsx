import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PantryPage } from "@/components/pantry/pantry-page";

export const metadata: Metadata = { title: "Pantry" };

export default async function PantryPageRoute() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const member = await prisma.householdMember.findFirst({
    where: { userId: session.user.id },
    select: { householdId: true },
  });

  if (!member) redirect("/dashboard");

  const items = await prisma.pantryItem.findMany({
    where: { householdId: member.householdId },
    orderBy: [{ expiryDate: "asc" }, { name: "asc" }],
  });

  return <PantryPage initialItems={items} />;
}
