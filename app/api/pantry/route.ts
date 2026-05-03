import { prisma } from "@/lib/prisma";
import { pantryItemSchema } from "@/lib/validations";
import {
  ok,
  created,
  badRequest,
  unauthorized,
  serverError,
} from "@/lib/api-response";
import { getSessionHousehold } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const items = await prisma.pantryItem.findMany({
      where: {
        householdId: ctx.householdId,
        ...(category ? { category } : {}),
        ...(search
          ? { name: { contains: search, mode: "insensitive" } }
          : {}),
      },
      orderBy: [{ expiryDate: "asc" }, { name: "asc" }],
    });

    return ok(items);
  } catch {
    return serverError();
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await getSessionHousehold();
    if (!ctx) return unauthorized();

    const body = await request.json();
    const parsed = pantryItemSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const item = await prisma.pantryItem.create({
      data: {
        ...parsed.data,
        expiryDate: parsed.data.expiryDate
          ? new Date(parsed.data.expiryDate)
          : null,
        householdId: ctx.householdId,
      },
    });

    return created(item);
  } catch {
    return serverError();
  }
}
