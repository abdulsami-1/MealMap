import { prisma } from "@/lib/prisma";
import { groceryListSchema } from "@/lib/validations";
import { ok, created, badRequest, unauthorized, serverError } from "@/lib/api-response";
import { getSessionHousehold } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const lists = await prisma.groceryList.findMany({
      where: { householdId: ctx.householdId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { items: true } },
        items: {
          where: { isChecked: false },
          select: { id: true },
        },
      },
    });

    return ok(
      lists.map((l) => ({
        id: l.id,
        name: l.name,
        status: l.status,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
        totalItems: l._count.items,
        uncheckedItems: l.items.length,
      }))
    );
  } catch {
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const body = await request.json();
    const parsed = groceryListSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const list = await prisma.groceryList.create({
      data: { name: parsed.data.name, householdId: ctx.householdId },
    });

    return created(list);
  } catch {
    return serverError();
  }
}
