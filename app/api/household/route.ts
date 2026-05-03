import { NextRequest } from "next/server";
import { getSessionHousehold } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ok, badRequest, unauthorized, forbidden, serverError } from "@/lib/api-response";
import { z } from "zod";

const renameSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function GET() {
  const sh = await getSessionHousehold();
  if (!sh) return unauthorized();

  try {
    const household = await prisma.household.findUnique({
      where: { id: sh.householdId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { joinedAt: "asc" },
        },
      },
    });
    return ok(household);
  } catch {
    return serverError();
  }
}

export async function PATCH(req: NextRequest) {
  const sh = await getSessionHousehold();
  if (!sh) return unauthorized();
  if (sh.role !== "OWNER") return forbidden("Only the owner can rename the household");

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }

  const parsed = renameSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  try {
    const household = await prisma.household.update({
      where: { id: sh.householdId },
      data: { name: parsed.data.name },
    });
    return ok(household);
  } catch {
    return serverError();
  }
}
