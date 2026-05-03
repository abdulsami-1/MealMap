import { prisma } from "@/lib/prisma";
import { mealSchema } from "@/lib/validations";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/api-response";
import { getSessionHousehold } from "@/lib/auth-helpers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { id } = await params;
    const meal = await prisma.meal.findUnique({ where: { id } });
    if (!meal) return notFound();
    if (meal.createdById !== ctx.userId) return forbidden();

    const body = await request.json();
    const parsed = mealSchema.partial().safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const updated = await prisma.meal.update({ where: { id }, data: parsed.data });
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
    const meal = await prisma.meal.findUnique({ where: { id } });
    if (!meal) return notFound();
    if (meal.createdById !== ctx.userId) return forbidden();

    await prisma.meal.delete({ where: { id } });
    return ok({ id });
  } catch {
    return serverError();
  }
}
