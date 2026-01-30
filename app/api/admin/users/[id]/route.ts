
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if ((session as any)?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();

    if (!body.role) {
        return NextResponse.json({ error: "Role required" }, { status: 400 });
    }

    await prisma.user.update({
        where: { id },
        data: { role: body.role }
    });

    return NextResponse.json({ success: true });
}
