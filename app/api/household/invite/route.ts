import { NextRequest } from "next/server";
import { getSessionHousehold } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ok, badRequest, unauthorized, forbidden, notFound, conflict, serverError } from "@/lib/api-response";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const sh = await getSessionHousehold();
  if (!sh) return unauthorized();
  if (sh.role !== "OWNER") return forbidden("Only the owner can invite members");

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const { email } = parsed.data;

  try {
    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) return notFound("No user with that email");

    const existing = await prisma.householdMember.findFirst({
      where: { householdId: sh.householdId, userId: targetUser.id },
    });
    if (existing) return conflict("User is already a member");

    const member = await prisma.householdMember.create({
      data: { householdId: sh.householdId, userId: targetUser.id, role: "MEMBER" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return ok(member);
  } catch {
    return serverError();
  }
}
