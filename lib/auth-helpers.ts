import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getSessionHousehold() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const member = await prisma.householdMember.findFirst({
    where: { userId: session.user.id },
    select: { householdId: true, role: true, userId: true },
  });

  return member ?? null;
}
