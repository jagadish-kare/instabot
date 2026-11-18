"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Trash2, ExternalLink, BarChart3 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Campaign {
  id: string;
  mediaId: string;
  mediaUrl?: string;
  mediaCaption?: string;
  mediaPermalink?: string;
  keywords: string[];
  requireFollow: boolean;
  openingMessage?: string;
  buttonText?: string;
  notFollowingMessage?: string;
  revealMessage: string;
  revealButtonText?: string;
  revealButtonUrl?: string;
  isActive: boolean;
  commentsDetected: number;
  dmsSent: number;
  createdAt: string;
}

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [keywords, setKeywords] = useState("");
  const [requireFollow, setRequireFollow] = useState(false);
  const [openingMessage, setOpeningMessage] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [notFollowingMessage, setNotFollowingMessage] = useState("");
  const [revealMessage, setRevealMessage] = useState("");
  const [revealButtonText, setRevealButtonText] = useState("");
  const [revealButtonUrl, setRevealButtonUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchCampaign();
  }, [params.id]);

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/campaigns/${params.id}`);
      const data = await response.json();
      
      if (data.error) {
        toast.error(data.error);
        router.push("/campaigns");
        return;
      }

      const c = data.campaign;
      setCampaign(c);
      setKeywords(c.keywords.join(", "));
      setRequireFollow(c.requireFollow);
      setOpeningMessage(c.openingMessage || "");
      setButtonText(c.buttonText || "");
      setNotFollowingMessage(c.notFollowingMessage || "");
      setRevealMessage(c.revealMessage);
      setRevealButtonText(c.revealButtonText || "");
      setRevealButtonUrl(c.revealButtonUrl || "");
      setIsActive(c.isActive);
    } catch {
      toast.error("Failed to load campaign");
      router.push("/campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!keywords.trim() || !revealMessage.trim()) {
      toast.error("Keywords and reveal message are required");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/campaigns/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: keywords.split(",").map(k => k.trim()).filter(Boolean),
          requireFollow,
          openingMessage: requireFollow ? openingMessage : null,
          buttonText: requireFollow ? buttonText : null,
          notFollowingMessage: requireFollow ? notFollowingMessage : null,
          revealMessage,
          revealButtonText: revealButtonText || null,
          revealButtonUrl: revealButtonUrl || null,
          isActive,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || "Failed to save");
      } else {
        toast.success("Campaign updated successfully");
        setCampaign(data.campaign);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/campaigns/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Campaign deleted");
        router.push("/campaigns");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async () => {
    const newStatus = !isActive;
    setIsActive(newStatus);
    
    try {
      const response = await fetch(`/api/campaigns/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (response.ok) {
        toast.success(newStatus ? "Campaign activated" : "Campaign paused");
      } else {
        setIsActive(!newStatus);
        toast.error("Failed to update status");
      }
    } catch {
      setIsActive(!newStatus);
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!campaign) return null;

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/campaigns" className="text-slate-400 hover:text-white flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">Campaign Details</h1>
            <p className="text-slate-400 mt-1">
              Created {new Date(campaign.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-red-800 text-red-400 hover:bg-red-900/20"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span className="ml-2">Delete</span>
            </Button>
            <Button
              onClick={toggleActive}
              className={isActive 
                ? "bg-orange-600 hover:bg-orange-700" 
                : "bg-green-600 hover:bg-green-700"
              }
            >
              {isActive ? "Pause Campaign" : "Activate Campaign"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{campaign.commentsDetected}</p>
                <p className="text-sm text-slate-400">Comments Detected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{campaign.dmsSent}</p>
                <p className="text-sm text-slate-400">DMs Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {campaign.commentsDetected > 0 
                    ? Math.round((campaign.dmsSent / campaign.commentsDetected) * 100) 
                    : 0}%
                </p>
                <p className="text-sm text-slate-400">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Post Preview */}
      <Card className="bg-slate-900/50 border-slate-800 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Selected Post</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {campaign.mediaUrl && (
              <img
                src={campaign.mediaUrl}
                alt="Post"
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <p className="text-slate-300 line-clamp-2">
                {campaign.mediaCaption || "No caption"}
              </p>
              {campaign.mediaPermalink && (
                <a
                  href={campaign.mediaPermalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 mt-2"
                >
                  View on Instagram <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                isActive 
                  ? "bg-green-900/50 text-green-400" 
                  : "bg-slate-700 text-slate-400"
              }`}>
                {isActive ? "Active" : "Paused"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <div className="space-y-6">
        {/* Keywords */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Trigger Keywords</CardTitle>
            <CardDescription className="text-slate-400">
              Words that will trigger the auto-DM when commented
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="LINK, INFO, SEND"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
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
                <Label className="text-slate-200">Opening Message</Label>
                <Input
                  value={openingMessage}
                  onChange={(e) => setOpeningMessage(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Button Text (max 20 chars)</Label>
                <Input
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  maxLength={20}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Not Following Message</Label>
                <Input
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
              <Label className="text-slate-200">Message *</Label>
              <textarea
                value={revealMessage}
                onChange={(e) => setRevealMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Link Button Text</Label>
                <Input
                  value={revealButtonText}
                  onChange={(e) => setRevealButtonText(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Link URL</Label>
                <Input
                  value={revealButtonUrl}
                  onChange={(e) => setRevealButtonUrl(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
