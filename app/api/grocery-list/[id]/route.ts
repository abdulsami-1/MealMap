import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/api-response";
import { getSessionHousehold } from "@/lib/auth-helpers";

async function getOwnedList(id: string, householdId: string) {
  const list = await prisma.groceryList.findUnique({ where: { id } });
  if (!list) return null;
  if (list.householdId !== householdId) return "forbidden";
  return list;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { id } = await params;
    const list = await getOwnedList(id, ctx.householdId);
    if (!list) return notFound();
    if (list === "forbidden") return forbidden();

    const full = await prisma.groceryList.findUnique({
      where: { id },
      include: {
        items: { orderBy: [{ category: "asc" }, { name: "asc" }] },
      },
    });

    return ok(full);
  } catch {
    return serverError();
  }
}

const updateListSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { id } = await params;
    const existing = await getOwnedList(id, ctx.householdId);
    if (!existing) return notFound();
    if (existing === "forbidden") return forbidden();

    const body = await request.json();
    const parsed = updateListSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const updated = await prisma.groceryList.update({
      where: { id },
      data: parsed.data,
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
    const existing = await getOwnedList(id, ctx.householdId);
    if (!existing) return notFound();
    if (existing === "forbidden") return forbidden();

    await prisma.groceryList.delete({ where: { id } });
    return ok({ id });
  } catch {
    return serverError();
  }
}
