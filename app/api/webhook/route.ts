import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { MetaAPIClient } from "@/lib/meta/client";

const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN!;

// Webhook verification (GET request from Meta)
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    console.log("Webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// Handle incoming webhook events (POST request from Meta)
export async function POST(request: NextRequest) {
  // Must respond quickly - process in background
  const body = await request.json();
  
  // Process asynchronously
  processWebhook(body).catch(console.error);
  
  return new NextResponse("EVENT_RECEIVED", { status: 200 });
}

async function processWebhook(body: WebhookPayload) {
  if (body.object !== "instagram") return;

  for (const entry of body.entry) {
    // Handle comment events
    if (entry.changes) {
      for (const change of entry.changes) {
        if (change.field === "comments") {
          await handleComment(change.value);
        }
      }
    }

    // Handle messaging events (postbacks)
    if (entry.messaging) {
      for (const message of entry.messaging) {
        if (message.postback) {
          await handlePostback(message);
        }
      }
    }
  }
}

interface WebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    changes?: Array<{
      field: string;
      value: CommentValue;
    }>;
    messaging?: Array<MessagingEvent>;
  }>;
}

interface CommentValue {
  id: string;
  text: string;
  from: {
    id: string;
    username: string;
  };
  media: {
    id: string;
  };
}

interface MessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  postback?: {
    payload: string;
    title: string;
  };
}

async function handleComment(comment: CommentValue) {
  try {
    // Find campaign matching this media
    const campaign = await prisma.campaign.findFirst({
      where: {
        mediaId: comment.media.id,
        isActive: true,
      },
      include: {
        instagramAccount: true,
      },
    });

    if (!campaign) return;

    // Check if comment contains any trigger keyword
    const commentText = comment.text.toLowerCase();
    const hasKeyword = campaign.keywords.some(
      keyword => commentText.includes(keyword.toLowerCase())
    );

    if (!hasKeyword) return;

    // Log the comment detection
    await prisma.dmLog.create({
      data: {
        campaignId: campaign.id,
        commentId: comment.id,
        recipientId: comment.from.id,
        username: comment.from.username,
        action: "COMMENT_DETECTED",
        status: "SUCCESS",
      },
    });

    // Update campaign stats
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { commentsDetected: { increment: 1 } },
    });

    // Get access token and create client
    const accessToken = decrypt(campaign.instagramAccount.accessToken);
    const client = new MetaAPIClient(accessToken);

    // Send appropriate DM based on follow gating
    if (campaign.requireFollow) {
      // Send opening message with button
      await client.sendButtonDM(
        campaign.instagramAccount.instagramId,
        comment.id,
        campaign.openingMessage || "Thanks! Tap below to get your content 👇",
        campaign.buttonText || "Get Content",
        `campaign_${campaign.id}_user_${comment.from.id}`
      );

      await prisma.dmLog.create({
        data: {
          campaignId: campaign.id,
          commentId: comment.id,
          recipientId: comment.from.id,
          username: comment.from.username,
          action: "OPENING_DM_SENT",
          status: "SUCCESS",
        },
      });
    } else {
      // Send reveal content directly
      if (campaign.revealButtonUrl && campaign.revealButtonText) {
        await client.sendLinkDM(
          campaign.instagramAccount.instagramId,
          comment.from.id,
          campaign.revealMessage,
          campaign.revealButtonText,
          campaign.revealButtonUrl
        );
      } else {
        await client.sendTextDM(
          campaign.instagramAccount.instagramId,
          comment.id,
          campaign.revealMessage
        );
      }

      await prisma.dmLog.create({
        data: {
          campaignId: campaign.id,
          commentId: comment.id,
          recipientId: comment.from.id,
          username: comment.from.username,
          action: "REVEAL_SENT",
          status: "SUCCESS",
        },
      });
    }

    // Update DMs sent count
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { dmsSent: { increment: 1 } },
    });

  } catch (error) {
    console.error("Error handling comment:", error);
  }
}

async function handlePostback(message: MessagingEvent) {
  try {
    const payload = message.postback?.payload;
    if (!payload) return;

    // Parse payload: campaign_<id>_user_<userId>
    const match = payload.match(/^campaign_(\w+)_user_(\w+)$/);
    if (!match) return;

    const [, campaignId, userId] = match;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { instagramAccount: true },
    });

    if (!campaign || !campaign.isActive) return;

    // Log button tap
    await prisma.dmLog.create({
      data: {
        campaignId: campaign.id,
        recipientId: message.sender.id,
        action: "BUTTON_TAPPED",
        status: "SUCCESS",
      },
    });

    const accessToken = decrypt(campaign.instagramAccount.accessToken);
    const client = new MetaAPIClient(accessToken);

    // Check follow status
    const isFollowing = await client.checkFollowStatus(message.sender.id);

    await prisma.dmLog.create({
      data: {
        campaignId: campaign.id,
        recipientId: message.sender.id,
        action: isFollowing ? "FOLLOW_CHECKED_YES" : "FOLLOW_CHECKED_NO",
        status: "SUCCESS",
      },
    });

    if (isFollowing) {
      // Send reveal content
      if (campaign.revealButtonUrl && campaign.revealButtonText) {
        await client.sendLinkDM(
          campaign.instagramAccount.instagramId,
          message.sender.id,
          campaign.revealMessage,
          campaign.revealButtonText,
          campaign.revealButtonUrl
        );
      } else {
        await client.sendPlainDM(
          campaign.instagramAccount.instagramId,
          message.sender.id,
          campaign.revealMessage
        );
      }

      await prisma.dmLog.create({
        data: {
          campaignId: campaign.id,
          recipientId: message.sender.id,
          action: "REVEAL_SENT",
          status: "SUCCESS",
        },
      });

      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { dmsSent: { increment: 1 } },
      });
    } else {
      // Send not following message with retry button
      await client.sendButtonDM(
        campaign.instagramAccount.instagramId,
        "", // No comment ID for postback response
        campaign.notFollowingMessage || "Please follow me first, then tap again!",
        campaign.buttonText || "Try Again",
        payload // Same payload for retry
      );

      await prisma.dmLog.create({
        data: {
          campaignId: campaign.id,
          recipientId: message.sender.id,
          action: "RETRY_SENT",
          status: "SUCCESS",
        },
      });
    }

  } catch (error) {
    console.error("Error handling postback:", error);
  }
}
