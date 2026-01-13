import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const token = String(body?.token || "").trim();

  if (!token) return NextResponse.json({ error: "TOKEN_REQUIRED" }, { status: 400 });

  const user = await prisma.user.findFirst({
    where: { emailVerificationToken: token },
    select: { id: true, emailVerificationExpiresAt: true },
  });

  if (!user) return NextResponse.json({ error: "TOKEN_INVALID" }, { status: 400 });

  if (user.emailVerificationExpiresAt && user.emailVerificationExpiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "TOKEN_EXPIRED" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
    },
  });

  return NextResponse.json({ ok: true });
}
