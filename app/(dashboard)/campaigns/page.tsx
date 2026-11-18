import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone } from "lucide-react";
import Link from "next/link";

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions);
  
  const instagramAccount = await prisma.instagramAccount.findFirst({
    where: { userId: session?.user?.id },
  });

  const campaigns = instagramAccount 
    ? await prisma.campaign.findMany({
        where: { instagramAccountId: instagramAccount.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Campaigns</h1>
          <p className="text-slate-400 mt-1">Manage your auto-DM campaigns</p>
        </div>
        <Link href="/campaigns/new">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      {!instagramAccount ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Connect Instagram First</h3>
            <p className="text-slate-400 text-center mb-4">
              You need to connect your Instagram account before creating campaigns
            </p>
            <Link href="/settings">
              <Button>Connect Instagram</Button>
            </Link>
          </CardContent>
        </Card>
      ) : campaigns.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No campaigns yet</h3>
            <p className="text-slate-400 text-center mb-4">
              Create your first campaign to start automating DMs
            </p>
            <Link href="/campaigns/new">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
              <Card className="bg-slate-900/50 border-slate-800 hover:border-purple-600 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      {campaign.mediaUrl && (
                        <img 
                          src={campaign.mediaUrl} 
                          alt="Post thumbnail" 
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <CardTitle className="text-white">
                          {campaign.keywords.join(", ")}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {campaign.mediaCaption?.slice(0, 50) || "No caption"}...
                        </CardDescription>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      campaign.isActive 
                        ? "bg-green-900/50 text-green-400" 
                        : "bg-slate-700 text-slate-400"
                    }`}>
                      {campaign.isActive ? "Active" : "Paused"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-slate-400">Comments: </span>
                      <span className="text-white font-medium">{campaign.commentsDetected}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">DMs Sent: </span>
                      <span className="text-white font-medium">{campaign.dmsSent}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Follow Gate: </span>
                      <span className="text-white font-medium">
                        {campaign.requireFollow ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
