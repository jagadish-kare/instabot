import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, MessageCircle, Users, TrendingUp, Plus, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Fetch user's Instagram account
  const instagramAccount = await prisma.instagramAccount.findFirst({
    where: { userId: session?.user?.id },
    include: {
      campaigns: {
        where: { isActive: true },
      },
    },
  });

  // Get stats
  const totalCampaigns = instagramAccount?.campaigns.length || 0;
  const totalDmsSent = instagramAccount?.campaigns.reduce((acc, c) => acc + c.dmsSent, 0) || 0;
  const totalComments = instagramAccount?.campaigns.reduce((acc, c) => acc + c.commentsDetected, 0) || 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here&apos;s your automation overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Campaigns</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Megaphone className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalCampaigns}</div>
            <p className="text-xs text-gray-500 mt-1">Running automations</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">DMs Sent</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalDmsSent}</div>
            <p className="text-xs text-gray-500 mt-1">Total messages delivered</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Comments Detected</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalComments}</div>
            <p className="text-xs text-gray-500 mt-1">Trigger keywords found</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Followers</CardTitle>
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-pink-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {instagramAccount?.followersCount?.toLocaleString() || "—"}
            </div>
            <p className="text-xs text-gray-500 mt-1">Instagram followers</p>
          </CardContent>
        </Card>
      </div>

      {/* Instagram Connection Card */}
      <Card className="bg-white border border-gray-100 shadow-sm mb-8">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            Instagram Account
          </CardTitle>
          <CardDescription className="text-gray-500">
            Connect your Instagram Business account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          {instagramAccount ? (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              {instagramAccount.profilePicture && (
                <img 
                  src={instagramAccount.profilePicture} 
                  alt={instagramAccount.username}
                  className="w-14 h-14 rounded-full ring-2 ring-purple-100"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">@{instagramAccount.username}</p>
                <p className="text-sm text-gray-500">{instagramAccount.name}</p>
              </div>
              <span className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                Connected
              </span>
            </div>
          ) : (
            <div className="text-center py-8 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Instagram</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Link your Instagram Business or Creator account to start automating DMs
              </p>
              <Link href="/settings">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-full px-6">
                  Connect Instagram
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/campaigns/new">
          <Card className="bg-white border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus className="h-7 w-7 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Create Campaign</h3>
                <p className="text-sm text-gray-500">Set up a new auto-DM campaign</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/logs">
          <Card className="bg-white border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageCircle className="h-7 w-7 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">View Activity</h3>
                <p className="text-sm text-gray-500">Check recent DM activity logs</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
