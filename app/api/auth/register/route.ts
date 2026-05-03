import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { badRequest, conflict, created, serverError } from "@/lib/api-response";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.errors[0].message);
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return conflict("An account with this email already exists");
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const household = await prisma.household.create({
      data: {
        name: `${name}'s Household`,
        members: {
          create: { userId: user.id, role: "OWNER" },
        },
      },
    });

    return created({ user, householdId: household.id });
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[register]", err);
      return serverError(err instanceof Error ? err.message : "Unknown error");
    }
    return serverError();
  }
}
