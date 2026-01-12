import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // In Next.js 15+, params is a Promise
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body; // APPROVED | REJECTED | SUSPENDED | PENDING

  if (!status) {
    return NextResponse.json({ error: "Status required" }, { status: 400 });
  }

  try {
    const data: any = { status };

    if (status === "APPROVED") {
      data.approvedAt = new Date();
      data.approvedBy = token.email || "ADMIN";
    }

    const updated = await prisma.venue.update({
      where: { id },
      data,
    });

    return NextResponse.json({ venue: updated });
  } catch (error) {
    console.error("Update venue error:", error);
    return NextResponse.json({ error: "Failed to update venue" }, { status: 500 });
  }
}
