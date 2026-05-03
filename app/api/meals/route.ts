import { prisma } from "@/lib/prisma";
import { mealSchema } from "@/lib/validations";
import { ok, created, badRequest, unauthorized, serverError } from "@/lib/api-response";
import { getSessionHousehold } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const meals = await prisma.meal.findMany({
      where: {
        createdById: ctx.userId,
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      },
      orderBy: { name: "asc" },
      take: 50,
    });

    return ok(meals);
  } catch {
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const body = await request.json();
    const parsed = mealSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const meal = await prisma.meal.create({
      data: { ...parsed.data, createdById: ctx.userId },
    });

    return created(meal);
  } catch {
    return serverError();
  }
}
