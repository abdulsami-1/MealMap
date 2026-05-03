import { NextRequest } from "next/server";
import { getSessionHousehold } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/api-response";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const sh = await getSessionHousehold();
  if (!sh) return unauthorized();
  if (sh.role !== "OWNER") return forbidden("Only the owner can remove members");

  const { userId } = await params;
  if (userId === sh.userId) return badRequest("Cannot remove yourself");

  try {
    const member = await prisma.householdMember.findFirst({
      where: { householdId: sh.householdId, userId },
    });
    if (!member) return notFound("Member not found");

    await prisma.householdMember.delete({ where: { id: member.id } });
    return ok({ removed: userId });
  } catch {
    return serverError();
  }
}
