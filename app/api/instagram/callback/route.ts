import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";

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
    // Exchange code for access token using Facebook's endpoint
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

    // Get Facebook Pages the user manages
    const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts?access_token=${userAccessToken}`;
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      console.error("No pages found");
      return NextResponse.redirect(new URL("/settings?error=no_pages", request.url));
    }

    // Find a page with Instagram Business Account
    let instagramId: string | null = null;
    let pageAccessToken: string | null = null;
    let instagramUsername: string | null = null;
    let instagramName: string | null = null;
    let instagramPicture: string | null = null;
    let instagramFollowers: number = 0;

    for (const page of pagesData.data) {
      // Check if this page has an Instagram Business Account
      const igUrl = `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`;
      const igResponse = await fetch(igUrl);
      const igData = await igResponse.json();
      
      if (igData.instagram_business_account?.id) {
        instagramId = igData.instagram_business_account.id;
        pageAccessToken = page.access_token;
        
        // Get Instagram profile details
        const profileUrl = `https://graph.facebook.com/v21.0/${instagramId}?fields=id,username,name,profile_picture_url,followers_count&access_token=${pageAccessToken}`;
        const profileResponse = await fetch(profileUrl);
        const profile = await profileResponse.json();
        
        instagramUsername = profile.username;
        instagramName = profile.name || profile.username;
        instagramPicture = profile.profile_picture_url;
        instagramFollowers = profile.followers_count || 0;
        break;
      }
    }

    if (!instagramId || !pageAccessToken) {
      console.error("No Instagram Business Account found");
      return NextResponse.redirect(new URL("/settings?error=no_instagram", request.url));
    }

    // Encrypt the access token
    const encryptedToken = encrypt(pageAccessToken);

    // Save or update Instagram account
    await prisma.instagramAccount.upsert({
      where: { instagramId },
      update: {
        userId: session.user.id,
        username: instagramUsername || "unknown",
        name: instagramName,
        profilePicture: instagramPicture,
        followersCount: instagramFollowers,
        pageId: instagramId,
        accessToken: encryptedToken,
        webhookSubscribed: false,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        instagramId,
        username: instagramUsername || "unknown",
        name: instagramName,
        profilePicture: instagramPicture,
        followersCount: instagramFollowers,
        pageId: instagramId,
        accessToken: encryptedToken,
        webhookSubscribed: false,
      },
    });

    return NextResponse.redirect(new URL("/settings?success=connected", request.url));
  } catch (error) {
    console.error("Instagram connection error:", error);
    return NextResponse.redirect(new URL("/settings?error=connection_failed", request.url));
  }
}
