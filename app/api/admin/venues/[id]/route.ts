import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // In Next.js 15+, params is a Promise
) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, rejectionReason } = body; // APPROVED | REJECTED | SUSPENDED | PENDING_APPROVAL

  if (!status) {
    return NextResponse.json({ error: "Status required" }, { status: 400 });
  }

  try {
    const data: any = { status };

    if (status === "APPROVED") {
      data.approvedAt = new Date();
      data.approvedBy = token.email || "ADMIN";
      data.rejectionReason = null;
      data.isVerified = true;
      data.isActive = true; // Make visible in Explore immediately
    } else if (status === "REJECTED") {
      data.rejectionReason = rejectionReason;
      data.isVerified = false;
      data.isActive = false; // Hide from Explore
      data.approvedAt = null;
      data.approvedBy = null;
    } else if (status === "SUSPENDED") {
      data.isActive = false; // Hide from Explore
    } else if (status === "PENDING_APPROVAL" || status === "PENDING") {
      data.status = "PENDING_APPROVAL"; // Normalize to PENDING_APPROVAL
      data.rejectionReason = null;
      data.isActive = false; // Not yet visible
    }

    const updated = await prisma.venue.update({
      where: { id },
      data,
      include: { owner: true } // Need owner for notification
    });

    // Create Notification
    try {
      const ownerId = updated.ownerId;
      let title = "";
      let message = "";
      let type = "INFO";
      let link = `/business/venue/${updated.id}`; // Or wizard?

      if (status === "APPROVED") {
        title = "Venue Approved!";
        message = `Great news! "${updated.name}" has been approved. You can now launch it to go live.`;
        type = "SUCCESS";
      } else if (status === "REJECTED") {
        title = "Submission Rejected";
        message = `Your venue "${updated.name}" was rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`;
        type = "ERROR";
      }

      if (ownerId && title && (prisma as any).notification) {
        await (prisma as any).notification.create({
          data: {
            userId: ownerId,
            title,
            message,
            type,
            link
          }
        });
      }
    } catch (notifAlloc) {
      console.warn("Notification failed (schema mismatch?):", notifAlloc);
    }

    return NextResponse.json({ venue: updated });
  } catch (error) {
    console.error("Update venue error:", error);
    return NextResponse.json({ error: "Failed to update venue" }, { status: 500 });
  }
}
