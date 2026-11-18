"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";

interface Post {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  timestamp: string;
  permalink: string;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [keywords, setKeywords] = useState("");
  const [requireFollow, setRequireFollow] = useState(false);
  const [openingMessage, setOpeningMessage] = useState("Thanks for your interest! Tap below to get your content 👇");
  const [buttonText, setButtonText] = useState("Get Content");
  const [notFollowingMessage, setNotFollowingMessage] = useState("Please follow me first, then tap the button again!");
  const [revealMessage, setRevealMessage] = useState("");
  const [revealButtonText, setRevealButtonText] = useState("");
  const [revealButtonUrl, setRevealButtonUrl] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/instagram/posts");
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setPosts(data.posts || []);
      }
    } catch {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedPost) {
      setError("Please select a post");
      return;
    }

    if (!keywords.trim()) {
      setError("Please enter at least one keyword");
      return;
    }

    if (!revealMessage.trim()) {
      setError("Please enter the reveal message");
      return;
    }

    if (buttonText.length > 20) {
      setError("Button text must be 20 characters or less");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId: selectedPost.id,
          mediaUrl: selectedPost.thumbnail_url || selectedPost.media_url,
          mediaCaption: selectedPost.caption,
          mediaPermalink: selectedPost.permalink,
          keywords: keywords.split(",").map(k => k.trim()).filter(Boolean),
          requireFollow,
          openingMessage: requireFollow ? openingMessage : null,
          buttonText: requireFollow ? buttonText : null,
          notFollowingMessage: requireFollow ? notFollowingMessage : null,
          revealMessage,
          revealButtonText: revealButtonText || null,
          revealButtonUrl: revealButtonUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create campaign");
      } else {
        router.push("/campaigns");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/campaigns" className="text-slate-400 hover:text-white flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Link>
        <h1 className="text-3xl font-bold text-white">Create Campaign</h1>
        <p className="text-slate-400 mt-1">Set up a new auto-DM campaign for a post</p>
      </div>

      {error && (
        <div className="mb-6 p-3 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Post Selection */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Select Post</CardTitle>
            <CardDescription className="text-slate-400">
              Choose which post will trigger the auto-DM
            </CardDescription>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <p className="text-slate-400">No posts found. Make sure your Instagram account is connected.</p>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {posts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setSelectedPost(post)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedPost?.id === post.id 
                        ? "border-purple-500 ring-2 ring-purple-500/50" 
                        : "border-transparent hover:border-slate-600"
                    }`}
                  >
                    <img
                      src={post.thumbnail_url || post.media_url || "/placeholder.png"}
                      alt={post.caption || "Post"}
                      className="w-full h-full object-cover"
                    />
                    {selectedPost?.id === post.id && (
                      <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Keywords */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Trigger Keywords</CardTitle>
            <CardDescription className="text-slate-400">
              Words that will trigger the auto-DM when commented
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="keywords" className="text-slate-200">Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                placeholder="LINK, INFO, SEND"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <p className="text-xs text-slate-500">
                Example: If someone comments &quot;LINK please!&quot;, the DM will be sent
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Follow Gating */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Follow Gating</CardTitle>
                <CardDescription className="text-slate-400">
                  Require users to follow before receiving content
                </CardDescription>
              </div>
              <button
                type="button"
                onClick={() => setRequireFollow(!requireFollow)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  requireFollow ? "bg-purple-600" : "bg-slate-700"
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  requireFollow ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
          </CardHeader>
          {requireFollow && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openingMessage" className="text-slate-200">Opening Message</Label>
                <Input
                  id="openingMessage"
                  placeholder="Thanks! Tap below to get your content 👇"
                  value={openingMessage}
                  onChange={(e) => setOpeningMessage(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buttonText" className="text-slate-200">Button Text (max 20 chars)</Label>
                <Input
                  id="buttonText"
                  placeholder="Get Content"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  maxLength={20}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <p className="text-xs text-slate-500">{buttonText.length}/20 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notFollowingMessage" className="text-slate-200">Not Following Message</Label>
                <Input
                  id="notFollowingMessage"
                  placeholder="Please follow me first, then tap again!"
                  value={notFollowingMessage}
                  onChange={(e) => setNotFollowingMessage(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Reveal Content */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Reveal Content</CardTitle>
            <CardDescription className="text-slate-400">
              The actual content to send to users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="revealMessage" className="text-slate-200">Message *</Label>
              <textarea
                id="revealMessage"
                placeholder="Here's your exclusive link! Click below to access..."
                value={revealMessage}
                onChange={(e) => setRevealMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revealButtonText" className="text-slate-200">Link Button Text (optional)</Label>
                <Input
                  id="revealButtonText"
                  placeholder="Open Link"
                  value={revealButtonText}
                  onChange={(e) => setRevealButtonText(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revealButtonUrl" className="text-slate-200">Link URL (optional)</Label>
                <Input
                  id="revealButtonUrl"
                  placeholder="https://example.com/your-link"
                  value={revealButtonUrl}
                  onChange={(e) => setRevealButtonUrl(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Link href="/campaigns">
            <Button type="button" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancel
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Campaign"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
