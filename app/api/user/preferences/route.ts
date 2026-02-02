import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: {
            preferredCities: true,
            preferredCategories: true,
            preferredAmbiances: true,
            password: true,
        },
    });

    return NextResponse.json({
        ...user,
        hasPassword: !!user?.password,
        password: undefined // Don't send the hash
    });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { preferredCities, preferredCategories, preferredAmbiances } = await req.json();

        const updatedUser = await prisma.user.update({
            where: { id: (session.user as any).id },
            data: {
                preferredCities: preferredCities || [],
                preferredCategories: preferredCategories || [],
                preferredAmbiances: preferredAmbiances || [],
            },
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Failed to update preferences:", error);
        return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
    }
}
