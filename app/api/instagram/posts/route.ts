import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { MetaAPIClient } from "@/lib/meta/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const instagramAccount = await prisma.instagramAccount.findFirst({
      where: { userId: session.user.id },
    });

    if (!instagramAccount) {
      return NextResponse.json({ error: "No Instagram account connected" }, { status: 400 });
    }

    const accessToken = decrypt(instagramAccount.accessToken);
    const client = new MetaAPIClient(accessToken);
    const posts = await client.getInstagramPosts(instagramAccount.instagramId);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
