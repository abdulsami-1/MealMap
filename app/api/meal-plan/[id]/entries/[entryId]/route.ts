import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { ok, badRequest, unauthorized, forbidden, notFound, conflict, serverError } from "@/lib/api-response";
import { getSessionHousehold } from "@/lib/auth-helpers";

const moveSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
});

async function getOwnedEntry(entryId: string, planId: string, householdId: string) {
  const entry = await prisma.mealPlanEntry.findUnique({
    where: { id: entryId },
    include: { mealPlan: { select: { householdId: true } } },
  });
  if (!entry || entry.mealPlanId !== planId) return null;
  if (entry.mealPlan.householdId !== householdId) return "forbidden";
  return entry;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { id, entryId } = await params;
    const existing = await getOwnedEntry(entryId, id, ctx.householdId);
    if (!existing) return notFound();
    if (existing === "forbidden") return forbidden();

    const body = await request.json();
    const parsed = moveSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    // Check if target slot is occupied by a different entry
    const conflict_ = await prisma.mealPlanEntry.findUnique({
      where: {
        mealPlanId_dayOfWeek_mealType: {
          mealPlanId: id,
          dayOfWeek: parsed.data.dayOfWeek,
          mealType: parsed.data.mealType,
        },
      },
    });

    if (conflict_ && conflict_.id !== entryId) {
      // Swap the two entries atomically
      await prisma.$transaction([
        prisma.mealPlanEntry.update({
          where: { id: entryId },
          data: { dayOfWeek: -1, mealType: "SNACK" }, // temp to avoid unique conflict
        }),
        prisma.mealPlanEntry.update({
          where: { id: conflict_.id },
          data: { dayOfWeek: existing.dayOfWeek, mealType: existing.mealType },
        }),
        prisma.mealPlanEntry.update({
          where: { id: entryId },
          data: parsed.data,
        }),
      ]);

      const [updatedEntry, swappedEntry] = await Promise.all([
        prisma.mealPlanEntry.findUnique({ where: { id: entryId }, include: { meal: true } }),
        prisma.mealPlanEntry.findUnique({ where: { id: conflict_.id }, include: { meal: true } }),
      ]);
      return ok({ entry: updatedEntry, swapped: swappedEntry });
    }

    const updated = await prisma.mealPlanEntry.update({
      where: { id: entryId },
      data: parsed.data,
      include: { meal: true },
    });

    return ok({ entry: updated, swapped: null });
  } catch {
    return serverError();
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { id, entryId } = await params;
    const existing = await getOwnedEntry(entryId, id, ctx.householdId);
    if (!existing) return notFound();
    if (existing === "forbidden") return forbidden();

    await prisma.mealPlanEntry.delete({ where: { id: entryId } });
    return ok({ id: entryId });
  } catch {
    return serverError();
  }
}
