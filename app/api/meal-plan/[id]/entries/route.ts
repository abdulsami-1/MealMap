import { prisma } from "@/lib/prisma";
import { mealPlanEntrySchema } from "@/lib/validations";
import { created, badRequest, unauthorized, forbidden, notFound, conflict, serverError } from "@/lib/api-response";
import { getSessionHousehold } from "@/lib/auth-helpers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { id } = await params;
    const plan = await prisma.mealPlan.findUnique({ where: { id } });
    if (!plan) return notFound("Meal plan not found");
    if (plan.householdId !== ctx.householdId) return forbidden();

    const body = await request.json();
    const parsed = mealPlanEntrySchema.omit({ mealPlanId: true }).safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const meal = await prisma.meal.findUnique({ where: { id: parsed.data.mealId } });
    if (!meal) return notFound("Meal not found");

    const existing = await prisma.mealPlanEntry.findUnique({
      where: {
        mealPlanId_dayOfWeek_mealType: {
          mealPlanId: id,
          dayOfWeek: parsed.data.dayOfWeek,
          mealType: parsed.data.mealType,
        },
      },
    });
    if (existing) return conflict("This slot already has a meal. Remove it first.");

    const entry = await prisma.mealPlanEntry.create({
      data: {
        mealPlanId: id,
        mealId: parsed.data.mealId,
        dayOfWeek: parsed.data.dayOfWeek,
        mealType: parsed.data.mealType,
      },
      include: { meal: true },
    });

    return created(entry);
  } catch {
    return serverError();
  }
}
