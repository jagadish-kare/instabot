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
    // Exchange code for access token using Instagram's token endpoint
    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error_type || tokenData.error) {
      console.error("Token exchange error:", tokenData);
      return NextResponse.redirect(new URL("/settings?error=token_exchange", request.url));
    }

    const shortLivedToken = tokenData.access_token;
    const instagramUserId = tokenData.user_id;

    // Exchange for long-lived token
    const longLivedTokenUrl = new URL("https://graph.instagram.com/access_token");
    longLivedTokenUrl.searchParams.set("grant_type", "ig_exchange_token");
    longLivedTokenUrl.searchParams.set("client_secret", FACEBOOK_APP_SECRET);
    longLivedTokenUrl.searchParams.set("access_token", shortLivedToken);

    const longLivedResponse = await fetch(longLivedTokenUrl.toString());
    const longLivedData = await longLivedResponse.json();

    const accessToken = longLivedData.access_token || shortLivedToken;

    // Get Instagram profile using Instagram Graph API
    const profileUrl = new URL(`https://graph.instagram.com/v21.0/me`);
    profileUrl.searchParams.set("fields", "user_id,username,name,profile_picture_url,followers_count,account_type");
    profileUrl.searchParams.set("access_token", accessToken);

    const profileResponse = await fetch(profileUrl.toString());
    const profile = await profileResponse.json();

    if (profile.error) {
      console.error("Profile fetch error:", profile.error);
      return NextResponse.redirect(new URL("/settings?error=profile_fetch", request.url));
    }

    const instagramId = profile.user_id || instagramUserId;
    
    // Encrypt the access token
    const encryptedToken = encrypt(accessToken);

    // Save or update Instagram account
    await prisma.instagramAccount.upsert({
      where: { instagramId: String(instagramId) },
      update: {
        userId: session.user.id,
        username: profile.username,
        name: profile.name || profile.username,
        profilePicture: profile.profile_picture_url,
        followersCount: profile.followers_count || 0,
        pageId: String(instagramId), // For Instagram Login, we use Instagram ID
        accessToken: encryptedToken,
        webhookSubscribed: false,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        instagramId: String(instagramId),
        username: profile.username,
        name: profile.name || profile.username,
        profilePicture: profile.profile_picture_url,
        followersCount: profile.followers_count || 0,
        pageId: String(instagramId),
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
