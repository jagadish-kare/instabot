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
  const errorDescription = request.nextUrl.searchParams.get("error_description");

  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(new URL(`/settings?error=oauth_denied&msg=${encodeURIComponent(errorDescription || error)}`, request.url));
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
      return NextResponse.redirect(new URL(`/settings?error=token_exchange&msg=${encodeURIComponent(tokenData.error.message || 'Token exchange failed')}`, request.url));
    }

    const userAccessToken = tokenData.access_token;

    // Get Facebook Pages the user manages
    const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userAccessToken}`;
    const pagesResponse = await fetch(pagesUrl);
    const pagesData = await pagesResponse.json();

    console.log("Pages data:", JSON.stringify(pagesData, null, 2));

    if (pagesData.error) {
      console.error("Pages fetch error:", pagesData.error);
      return NextResponse.redirect(new URL(`/settings?error=pages_fetch&msg=${encodeURIComponent(pagesData.error.message)}`, request.url));
    }

    if (!pagesData.data || pagesData.data.length === 0) {
      console.error("No pages found for this user");
      return NextResponse.redirect(new URL("/settings?error=no_pages&msg=No+Facebook+Pages+found.+Make+sure+you+manage+a+Facebook+Page.", request.url));
    }

    // Find a page with Instagram Business Account
    let instagramId: string | null = null;
    let pageAccessToken: string | null = null;
    let instagramUsername: string | null = null;
    let instagramName: string | null = null;
    let instagramPicture: string | null = null;
    let instagramFollowers: number = 0;

    // Check pages that already have instagram_business_account in the response
    for (const page of pagesData.data) {
      console.log(`Checking page: ${page.name} (${page.id}), instagram_business_account:`, page.instagram_business_account);
      
      if (page.instagram_business_account?.id) {
        instagramId = page.instagram_business_account.id;
        pageAccessToken = page.access_token;
        
        // Get Instagram profile details
        const profileUrl = `https://graph.facebook.com/v21.0/${instagramId}?fields=id,username,name,profile_picture_url,followers_count&access_token=${pageAccessToken}`;
        const profileResponse = await fetch(profileUrl);
        const profile = await profileResponse.json();
        
        console.log("Instagram profile:", JSON.stringify(profile, null, 2));
        
        if (profile.error) {
          console.error("Profile fetch error:", profile.error);
          continue;
        }
        
        instagramUsername = profile.username;
        instagramName = profile.name || profile.username;
        instagramPicture = profile.profile_picture_url;
        instagramFollowers = profile.followers_count || 0;
        break;
      }
    }

    if (!instagramId || !pageAccessToken) {
      // List the pages we found for debugging
      const pageNames = pagesData.data.map((p: { name: string }) => p.name).join(", ");
      console.error("No Instagram Business Account found. Pages found:", pageNames);
      return NextResponse.redirect(new URL(`/settings?error=no_instagram&msg=Found+${pagesData.data.length}+Facebook+Page(s)+but+none+have+an+Instagram+Business+account+connected.+Pages:+${encodeURIComponent(pageNames)}`, request.url));
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
    return NextResponse.redirect(new URL(`/settings?error=connection_failed&msg=${encodeURIComponent(String(error))}`, request.url));
  }
}
