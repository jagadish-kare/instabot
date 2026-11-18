import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, ExternalLink, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  const instagramAccount = await prisma.instagramAccount.findFirst({
    where: { userId: session?.user?.id },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and Instagram connection</p>
      </div>

      <div className="space-y-6">
        {/* Instagram Connection */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Instagram Connection
            </CardTitle>
            <CardDescription className="text-slate-400">
              Connect your Instagram Business or Creator account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {instagramAccount ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg">
                  {instagramAccount.profilePicture && (
                    <img 
                      src={instagramAccount.profilePicture} 
                      alt={instagramAccount.username}
                      className="w-14 h-14 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">@{instagramAccount.username}</p>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-sm text-slate-400">{instagramAccount.name}</p>
                    <p className="text-sm text-slate-400">
                      {instagramAccount.followersCount?.toLocaleString()} followers
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <form action="/api/instagram/disconnect" method="POST">
                    <Button variant="outline" type="submit" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                      Disconnect Account
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Requirements:</h4>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Instagram Business or Creator account</li>
                    <li>• Connected to a Facebook Page</li>
                    <li>• Admin access to the Facebook Page</li>
                  </ul>
                </div>
                <Link href="/api/instagram/connect">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Camera className="w-4 h-4 mr-2" />
                    Connect Instagram
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Account</CardTitle>
            <CardDescription className="text-slate-400">
              Your account information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-400">Email</label>
                <p className="text-white">{session?.user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Name</label>
                <p className="text-white">{session?.user?.name || "Not set"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
