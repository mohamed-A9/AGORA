import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "").trim();
    const name = String(body?.name || "").trim() || null;
    const phone = String(body?.phone || "").trim() || null;

    const roleRaw = String(body?.role || "USER").trim().toUpperCase();
    const role = roleRaw === "BUSINESS" ? "BUSINESS" : "USER";

    if (!email || !password) {
      return NextResponse.json({ error: "EMAIL_PASSWORD_REQUIRED" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "PASSWORD_TOO_SHORT" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (exists) return NextResponse.json({ error: "EMAIL_ALREADY_USED" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);

    const emailVerificationToken = crypto.randomBytes(24).toString("hex");
    const emailVerificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        phone,
        role,
        emailVerified: null,
        emailVerificationToken,
        emailVerificationExpiresAt,
      },
      select: { id: true },
    });

    // ✅ Envoi email
    try {
      await sendVerificationEmail(email, emailVerificationToken);
      return NextResponse.json({ ok: true });
    } catch (mailErr: any) {
      // compte créé mais email non envoyé
      return NextResponse.json(
        {
          ok: true,
          warning: "EMAIL_SEND_FAILED",
          message: mailErr?.message || "Email send failed",
        },
        { status: 200 }
      );
    }
  } catch (e: any) {
    return NextResponse.json({ error: "SERVER_ERROR", message: e?.message || "unknown" }, { status: 500 });
  }
}
