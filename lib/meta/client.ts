const GRAPH_API_URL = "https://graph.facebook.com/v21.0";

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
  };
}

interface InstagramProfile {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
}

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  timestamp: string;
  permalink: string;
}

export class MetaAPIClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${GRAPH_API_URL}${endpoint}`;
    const separator = endpoint.includes("?") ? "&" : "?";
    const fullUrl = `${url}${separator}access_token=${this.accessToken}`;

    const response = await fetch(fullUrl, options);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "Meta API error");
    }

    return data;
  }

  async getPages(): Promise<FacebookPage[]> {
    const data = await this.fetch<{ data: FacebookPage[] }>("/me/accounts");
    return data.data;
  }

  async getInstagramAccount(pageId: string): Promise<{ instagram_business_account?: { id: string } }> {
    return this.fetch(`/${pageId}?fields=instagram_business_account`);
  }

  async getInstagramProfile(instagramId: string): Promise<InstagramProfile> {
    return this.fetch(
      `/${instagramId}?fields=id,username,name,profile_picture_url,followers_count`
    );
  }

  async getInstagramPosts(instagramId: string, limit = 20): Promise<InstagramPost[]> {
    const data = await this.fetch<{ data: InstagramPost[] }>(
      `/${instagramId}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink&limit=${limit}`
    );
    return data.data;
  }

  async sendTextDM(instagramId: string, commentId: string, text: string): Promise<void> {
    await this.fetch(`/${instagramId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { comment_id: commentId },
        message: { text },
      }),
    });
  }

  async sendButtonDM(
    instagramId: string,
    commentId: string,
    text: string,
    buttonTitle: string,
    buttonPayload: string
  ): Promise<void> {
    await this.fetch(`/${instagramId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { comment_id: commentId },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "button",
              text,
              buttons: [
                {
                  type: "postback",
                  title: buttonTitle,
                  payload: buttonPayload,
                },
              ],
            },
          },
        },
      }),
    });
  }

  async sendLinkDM(
    instagramId: string,
    recipientId: string,
    text: string,
    buttonTitle: string,
    buttonUrl: string
  ): Promise<void> {
    await this.fetch(`/${instagramId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "button",
              text,
              buttons: [
                {
                  type: "web_url",
                  title: buttonTitle,
                  url: buttonUrl,
                },
              ],
            },
          },
        },
      }),
    });
  }

  async sendPlainDM(instagramId: string, recipientId: string, text: string): Promise<void> {
    await this.fetch(`/${instagramId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text },
      }),
    });
  }

  async checkFollowStatus(userIgsid: string): Promise<boolean> {
    const data = await this.fetch<{ is_user_follow_business?: boolean }>(
      `/${userIgsid}?fields=is_user_follow_business`
    );
    return data.is_user_follow_business ?? false;
  }

  async subscribeToWebhooks(instagramId: string): Promise<void> {
    await this.fetch(`/${instagramId}/subscribed_apps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscribed_fields: ["comments", "messages", "messaging_postbacks"],
      }),
    });
  }
}
