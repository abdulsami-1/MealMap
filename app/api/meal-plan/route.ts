import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { ok, badRequest, unauthorized, serverError } from "@/lib/api-response";
import { getSessionHousehold } from "@/lib/auth-helpers";
import { getWeekStart, toISODate } from "@/lib/week-helpers";

const weekSchema = z.object({
  week: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((d) => !isNaN(Date.parse(d)), "Invalid date").optional(),
});

export async function GET(request: Request) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { searchParams } = new URL(request.url);
    const parsed = weekSchema.safeParse({ week: searchParams.get("week") ?? undefined });
    if (!parsed.success) return badRequest("Invalid week format (use YYYY-MM-DD)");

    const weekStart = parsed.data.week
      ? new Date(parsed.data.week)
      : getWeekStart();

    const plan = await prisma.mealPlan.findUnique({
      where: { householdId_weekStart: { householdId: ctx.householdId, weekStart } },
      include: {
        entries: {
          include: { meal: true },
          orderBy: [{ dayOfWeek: "asc" }, { mealType: "asc" }],
        },
      },
    });

    return ok(plan);
  } catch {
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const body = await request.json();
    const parsed = weekSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid week format (use YYYY-MM-DD)");

    const weekStart = parsed.data.week
      ? new Date(parsed.data.week)
      : getWeekStart();

    const plan = await prisma.mealPlan.upsert({
      where: { householdId_weekStart: { householdId: ctx.householdId, weekStart } },
      create: { householdId: ctx.householdId, weekStart },
      update: {},
      include: {
        entries: {
          include: { meal: true },
          orderBy: [{ dayOfWeek: "asc" }, { mealType: "asc" }],
        },
      },
    });

    return ok(plan);
  } catch {
    return serverError();
  }
}
