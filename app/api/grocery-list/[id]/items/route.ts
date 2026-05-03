import { prisma } from "@/lib/prisma";
import { groceryItemSchema } from "@/lib/validations";
import { created, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/api-response";
import { getSessionHousehold } from "@/lib/auth-helpers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { id } = await params;
    const list = await prisma.groceryList.findUnique({ where: { id } });
    if (!list) return notFound();
    if (list.householdId !== ctx.householdId) return forbidden();

    const body = await request.json();
    const parsed = groceryItemSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const item = await prisma.groceryItem.create({
      data: { ...parsed.data, groceryListId: id },
    });

    return created(item);
  } catch {
    return serverError();
  }
}
