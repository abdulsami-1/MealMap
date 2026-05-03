import { prisma } from "@/lib/prisma";
import { pantryItemSchema } from "@/lib/validations";
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
} from "@/lib/api-response";
import { getSessionHousehold } from "@/lib/auth-helpers";

async function getOwnedItem(id: string, householdId: string) {
  const item = await prisma.pantryItem.findUnique({ where: { id } });
  if (!item) return null;
  if (item.householdId !== householdId) return "forbidden";
  return item;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { id } = await params;
    const existing = await getOwnedItem(id, ctx.householdId);
    if (!existing) return notFound();
    if (existing === "forbidden") return forbidden();

    const body = await request.json();
    const parsed = pantryItemSchema.partial().safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const updated = await prisma.pantryItem.update({
      where: { id },
      data: {
        ...parsed.data,
        expiryDate:
          parsed.data.expiryDate !== undefined
            ? parsed.data.expiryDate
              ? new Date(parsed.data.expiryDate)
              : null
            : undefined,
      },
    });

    return ok(updated);
  } catch {
    return serverError();
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { id } = await params;
    const existing = await getOwnedItem(id, ctx.householdId);
    if (!existing) return notFound();
    if (existing === "forbidden") return forbidden();

    await prisma.pantryItem.delete({ where: { id } });
    return ok({ id });
  } catch {
    return serverError();
  }
}
