import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET all campaigns
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
      return NextResponse.json({ campaigns: [] });
    }

    const campaigns = await prisma.campaign.findMany({
      where: { instagramAccountId: instagramAccount.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

// POST create new campaign
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const instagramAccount = await prisma.instagramAccount.findFirst({
      where: { userId: session.user.id },
    });

    if (!instagramAccount) {
      return NextResponse.json({ error: "No Instagram account connected" }, { status: 400 });
    }

    // Validate required fields
    if (!body.mediaId || !body.keywords || body.keywords.length === 0 || !body.revealMessage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate button text length
    if (body.buttonText && body.buttonText.length > 20) {
      return NextResponse.json({ error: "Button text must be 20 characters or less" }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        instagramAccountId: instagramAccount.id,
        mediaId: body.mediaId,
        mediaUrl: body.mediaUrl,
        mediaCaption: body.mediaCaption,
        mediaPermalink: body.mediaPermalink,
        keywords: body.keywords,
        requireFollow: body.requireFollow || false,
        openingMessage: body.openingMessage,
        buttonText: body.buttonText,
        notFollowingMessage: body.notFollowingMessage,
        revealMessage: body.revealMessage,
        revealButtonText: body.revealButtonText,
        revealButtonUrl: body.revealButtonUrl,
        isActive: true,
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
