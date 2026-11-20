import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { MetaAPIClient } from "@/lib/meta/client";

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET!;

export async function GET(request: NextRequest) {
  // Get the base URL from the request
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const redirectUri = `${baseUrl}/api/instagram/callback`;

  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(new URL("/settings?error=oauth_denied", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/settings?error=no_code", request.url));
  }

  try {
    // Exchange code for access token
    const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", FACEBOOK_APP_ID);
    tokenUrl.searchParams.set("client_secret", FACEBOOK_APP_SECRET);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Token exchange error:", tokenData.error);
      return NextResponse.redirect(new URL("/settings?error=token_exchange", request.url));
    }

    const userAccessToken = tokenData.access_token;

    // Get Facebook Pages
    const client = new MetaAPIClient(userAccessToken);
    const pages = await client.getPages();

    if (pages.length === 0) {
      return NextResponse.redirect(new URL("/settings?error=no_pages", request.url));
    }

    // Find a page with Instagram Business Account
    let instagramId: string | null = null;
    let pageId: string | null = null;
    let pageAccessToken: string | null = null;

    for (const page of pages) {
      const pageData = await client.getInstagramAccount(page.id);
      
      if (pageData.instagram_business_account?.id) {
        instagramId = pageData.instagram_business_account.id;
        pageId = page.id;
        pageAccessToken = page.access_token;
        break;
      }
    }

    if (!instagramId || !pageId || !pageAccessToken) {
      return NextResponse.redirect(new URL("/settings?error=no_instagram", request.url));
    }

    // Get Instagram profile
    const pageClient = new MetaAPIClient(pageAccessToken);
    const profile = await pageClient.getInstagramProfile(instagramId);

    // Subscribe to webhooks
    try {
      await pageClient.subscribeToWebhooks(instagramId);
    } catch (e) {
      console.error("Webhook subscription failed:", e);
      // Continue even if webhook subscription fails
    }

    // Encrypt the access token
    const encryptedToken = encrypt(pageAccessToken);

    // Save or update Instagram account
    await prisma.instagramAccount.upsert({
      where: { instagramId },
      update: {
        userId: session.user.id,
        username: profile.username,
        name: profile.name,
        profilePicture: profile.profile_picture_url,
        followersCount: profile.followers_count,
        pageId,
        accessToken: encryptedToken,
        webhookSubscribed: true,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        instagramId,
        username: profile.username,
        name: profile.name,
        profilePicture: profile.profile_picture_url,
        followersCount: profile.followers_count,
        pageId,
        accessToken: encryptedToken,
        webhookSubscribed: true,
      },
    });

    return NextResponse.redirect(new URL("/settings?success=connected", request.url));
  } catch (error) {
    console.error("Instagram connection error:", error);
    return NextResponse.redirect(new URL("/settings?error=connection_failed", request.url));
  }
}
