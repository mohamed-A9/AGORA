
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if ((session as any)?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const role = searchParams.get("role") || "ALL";

    const where: any = {};
    if (role !== "ALL") {
        where.role = role;
    }
    if (q) {
        where.OR = [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
        ];
    }

    const users = await prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    return NextResponse.json({ users });
}
