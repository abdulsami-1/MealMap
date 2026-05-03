import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, badRequest, unauthorized, conflict, serverError } from "@/lib/api-response";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return ok(user);
  } catch {
    return serverError();
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest("Invalid JSON"); }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);

  const { name, email } = parsed.data;

  try {
    if (email && email !== session.user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return conflict("Email already in use");
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { ...(name && { name }), ...(email && { email }) },
      select: { id: true, name: true, email: true },
    });
    return ok(user);
  } catch {
    return serverError();
  }
}
