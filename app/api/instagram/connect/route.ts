import { NextRequest, NextResponse } from "next/server";

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!;

// Using Instagram Business Login scopes
// These require Instagram Login flow via graph.instagram.com
const SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_messages",
  "instagram_business_manage_comments",
].join(",");

export async function GET(request: NextRequest) {
  // Get the base URL from the request
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const redirectUri = `${baseUrl}/api/instagram/callback`;

  // Use Instagram's OAuth endpoint for Business Login
  const authUrl = new URL("https://www.instagram.com/oauth/authorize");
  authUrl.searchParams.set("client_id", FACEBOOK_APP_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("enable_fb_login", "0");
  authUrl.searchParams.set("force_authentication", "1");

  return NextResponse.redirect(authUrl.toString());
}
