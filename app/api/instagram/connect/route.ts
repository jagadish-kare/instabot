import { NextRequest, NextResponse } from "next/server";

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!;

// Using Facebook Login scopes (not Instagram Login scopes)
// For Facebook OAuth, use: instagram_basic, instagram_manage_comments, instagram_manage_messages
// NOT: instagram_business_basic, instagram_business_manage_comments, etc.
const SCOPES = [
  "instagram_basic",
  "instagram_manage_comments", 
  "instagram_manage_messages",
  "pages_show_list",
  "pages_read_engagement",
].join(",");

export async function GET(request: NextRequest) {
  // Get the base URL from the request
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const redirectUri = `${baseUrl}/api/instagram/callback`;

  const authUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  authUrl.searchParams.set("client_id", FACEBOOK_APP_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("response_type", "code");

  return NextResponse.redirect(authUrl.toString());
}
