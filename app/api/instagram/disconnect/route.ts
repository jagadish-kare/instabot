import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete the Instagram account (cascades to campaigns and logs)
    await prisma.instagramAccount.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.redirect(new URL("/settings?success=disconnected", process.env.NEXTAUTH_URL!));
  } catch (error) {
    console.error("Disconnect error:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
