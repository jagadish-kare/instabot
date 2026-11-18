import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText, CheckCircle, XCircle, Clock } from "lucide-react";

export default async function LogsPage() {
  const session = await getServerSession(authOptions);
  
  const instagramAccount = await prisma.instagramAccount.findFirst({
    where: { userId: session?.user?.id },
  });

  const logs = instagramAccount 
    ? await prisma.dmLog.findMany({
        where: {
          campaign: {
            instagramAccountId: instagramAccount.id,
          },
        },
        include: {
          campaign: true,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
    : [];

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      COMMENT_DETECTED: "Comment Detected",
      OPENING_DM_SENT: "Opening DM Sent",
      BUTTON_TAPPED: "Button Tapped",
      FOLLOW_CHECKED_YES: "Follow Verified",
      FOLLOW_CHECKED_NO: "Not Following",
      REVEAL_SENT: "Content Revealed",
      RETRY_SENT: "Retry Sent",
    };
    return labels[action] || action;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Activity Logs</h1>
        <p className="text-slate-400 mt-1">Track all DM automation activity</p>
      </div>

      {logs.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ScrollText className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No activity yet</h3>
            <p className="text-slate-400 text-center">
              Activity will appear here once your campaigns start working
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-slate-400">
              Showing last 100 events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg"
                >
                  {getStatusIcon(log.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        {getActionLabel(log.action)}
                      </span>
                      {log.username && (
                        <span className="text-slate-400">@{log.username}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                      Campaign: {log.campaign.keywords.join(", ")}
                    </p>
                    {log.error && (
                      <p className="text-sm text-red-400">{log.error}</p>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
