import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/api-response";
import { getSessionHousehold } from "@/lib/auth-helpers";

async function getOwnedItem(itemId: string, householdId: string) {
  const item = await prisma.groceryItem.findUnique({
    where: { id: itemId },
    include: { groceryList: { select: { householdId: true } } },
  });
  if (!item) return null;
  if (item.groceryList.householdId !== householdId) return "forbidden";
  return item;
}

const updateItemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  quantity: z.number().positive().optional().nullable(),
  unit: z.string().max(20).optional(),
  category: z.string().max(50).optional(),
  isChecked: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { itemId } = await params;
    const existing = await getOwnedItem(itemId, ctx.householdId);
    if (!existing) return notFound();
    if (existing === "forbidden") return forbidden();

    const body = await request.json();
    const parsed = updateItemSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const updated = await prisma.groceryItem.update({
      where: { id: itemId },
      data: parsed.data,
    });

    return ok(updated);
  } catch {
    return serverError();
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { itemId } = await params;
    const existing = await getOwnedItem(itemId, ctx.householdId);
    if (!existing) return notFound();
    if (existing === "forbidden") return forbidden();

    await prisma.groceryItem.delete({ where: { id: itemId } });
    return ok({ id: itemId });
  } catch {
    return serverError();
  }
}
