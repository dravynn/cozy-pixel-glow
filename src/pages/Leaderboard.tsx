import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Trophy, 
  Medal,
  Award,
  TrendingUp,
  Sparkles,
  Heart,
  Users,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  points: number;
  tips: number;
  hours: number;
  avatar_url: string | null;
  badges: string[];
}

const Leaderboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState<"all" | "month" | "week">("all");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      // Get all users with their activity logs to calculate points
      const { data: activityData, error: activityError } = await supabase
        .from("activity_log")
        .select("user_id, points_earned, created_at");

      if (activityError) throw activityError;

      // Filter by timeframe if needed
      let filteredActivity = activityData || [];
      if (timeframe === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredActivity = filteredActivity.filter(a => new Date(a.created_at) >= monthAgo);
      } else if (timeframe === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredActivity = filteredActivity.filter(a => new Date(a.created_at) >= weekAgo);
      }

      // Calculate points per user
      const userPoints: Record<string, number> = {};
      filteredActivity.forEach(activity => {
        userPoints[activity.user_id] = (userPoints[activity.user_id] || 0) + (activity.points_earned || 0);
      });

      // Get unique user IDs
      const userIds = Object.keys(userPoints);

      if (userIds.length === 0) {
        setLeaderboardData([]);
        setIsLoading(false);
        return;
      }

      // Get user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Get tips count per user
      const { data: tipsData, error: tipsError } = await supabase
        .from("tips")
        .select("giver_id");

      if (tipsError) throw tipsError;

      const userTips: Record<string, number> = {};
      tipsData?.forEach(tip => {
        userTips[tip.giver_id] = (userTips[tip.giver_id] || 0) + 1;
      });

      // Get volunteer hours per user
      const { data: checkinsData, error: checkinsError } = await supabase
        .from("volunteer_checkins")
        .select("user_id, hours");

      if (checkinsError) throw checkinsError;

      const userHours: Record<string, number> = {};
      checkinsData?.forEach(checkin => {
        userHours[checkin.user_id] = (userHours[checkin.user_id] || 0) + parseFloat(checkin.hours.toString());
      });

      // Get user badges - need to join with badges table
      const { data: badgesData, error: badgesError } = await supabase
        .from("user_badges")
        .select(`
          user_id,
          badge_id,
          badges (
            name
          )
        `);

      if (badgesError) throw badgesError;

      const userBadges: Record<string, string[]> = {};
      badgesData?.forEach(ub => {
        if (!userBadges[ub.user_id]) {
          userBadges[ub.user_id] = [];
        }
        // Handle the nested structure from Supabase
        const badge = (ub as any).badges;
        if (badge && badge.name) {
          userBadges[ub.user_id].push(badge.name);
        }
      });

      // Combine data and create leaderboard entries
      const entries: LeaderboardEntry[] = userIds
        .map(userId => {
          const profile = profiles?.find(p => p.user_id === userId);
          return {
            user_id: userId,
            name: profile?.display_name || "Anonymous",
            points: userPoints[userId] || 0,
            tips: userTips[userId] || 0,
            hours: Math.round((userHours[userId] || 0) * 10) / 10,
            avatar_url: profile?.avatar_url || null,
            badges: userBadges[userId] || [],
            rank: 0 // Will be set after sorting
          };
        })
        .filter(entry => entry.points > 0) // Only show users with points
        .sort((a, b) => b.points - a.points) // Sort by points descending
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));

      setLeaderboardData(entries);

      // Find current user's rank
      if (user) {
        const currentUserEntry = entries.find(e => e.user_id === user.id);
        setUserRank(currentUserEntry || null);
      }
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error);
      
      const errorMessage = error.message || '';
      const isTableMissing = error.code === 'PGRST116' || 
                            errorMessage.includes('relation') || 
                            errorMessage.includes('does not exist') ||
                            errorMessage.includes('404') ||
                            error.code === '42P01';
      
      if (isTableMissing) {
        toast({
          title: "Database Migration Required",
          description: "Please run the database migration first. Check supabase/migrations/",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error loading leaderboard",
          description: error.message || "Failed to load leaderboard data",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
    if (rank === 2) return "from-gray-400/20 to-gray-500/20 border-gray-400/30";
    if (rank === 3) return "from-amber-600/20 to-amber-700/20 border-amber-600/30";
    return "from-muted/50 to-muted/30 border-border";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Global Leaderboard
            </h1>
          </div>
          <p className="text-muted-foreground">Top contributors making the world kinder</p>
        </div>

        {/* Timeframe Tabs */}
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Top 3 Podium */}
        {leaderboardData.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[2, 1, 3].map((rank) => {
              const entry = leaderboardData.find(e => e.rank === rank);
              if (!entry) return <div key={rank} />;
              const isFirst = rank === 1;
              return (
                <Card 
                  key={rank}
                  className={`bg-gradient-to-b ${getRankColor(rank)} border-2 ${isFirst ? 'scale-105' : ''} transition-transform`}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="flex justify-center">
                      {getRankIcon(rank)}
                    </div>
                    {entry.avatar_url ? (
                      <img
                        src={entry.avatar_url}
                        alt={entry.name}
                        className={`rounded-full mx-auto object-cover ${isFirst ? 'w-24 h-24' : 'w-20 h-20'}`}
                      />
                    ) : (
                      <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white mx-auto ${isFirst ? 'w-24 h-24' : ''}`}>
                        {entry.name[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{entry.name}</h3>
                      {entry.badges.length > 0 && (
                        <Badge variant="secondary" className="mt-1">{entry.badges[0]}</Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1 text-primary">
                        <Sparkles className="h-4 w-4" />
                        <span className="font-bold">{entry.points.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.tips} tips • {entry.hours}h
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Rest of Leaderboard */}
        {leaderboardData.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {leaderboardData.slice(3).map((entry) => (
                  <div 
                    key={entry.rank}
                    className={`p-4 hover:bg-muted/50 transition-colors flex items-center gap-4 ${
                      user && entry.user_id === user.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="w-12 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    {entry.avatar_url ? (
                      <img
                        src={entry.avatar_url}
                        alt={entry.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-lg font-semibold flex-shrink-0">
                        {entry.name[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{entry.name}</h3>
                        {entry.badges.length > 0 && (
                          <Badge variant="outline" className="text-xs">{entry.badges[0]}</Badge>
                        )}
                        {user && entry.user_id === user.id && (
                          <Badge variant="default" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {entry.points.toLocaleString()} pts
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {entry.tips} tips
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {entry.hours}h
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary">#{entry.rank}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No leaderboard data yet</h3>
              <p className="text-sm text-muted-foreground">
                Start tipping and volunteering to appear on the leaderboard!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Your Rank */}
        {user && (
          <Card className="mt-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6">
              {userRank ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {userRank.avatar_url ? (
                        <img
                          src={userRank.avatar_url}
                          alt={userRank.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold text-white">
                          {userRank.name[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">Your Rank</h3>
                        <p className="text-sm text-muted-foreground">Keep spreading kindness!</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">#{userRank.rank}</div>
                      <div className="text-sm text-muted-foreground">{userRank.points.toLocaleString()} points</div>
                    </div>
                  </div>
                  {userRank.rank > 1 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress to next rank</span>
                        <span className="font-medium">
                          {(() => {
                            const nextEntry = leaderboardData.find(e => e.rank === userRank.rank - 1);
                            if (nextEntry) {
                              const pointsNeeded = nextEntry.points - userRank.points;
                              return `${pointsNeeded.toLocaleString()} points to #${nextEntry.rank}`;
                            }
                            return "Keep going!";
                          })()}
                        </span>
                      </div>
                      {(() => {
                        const nextEntry = leaderboardData.find(e => e.rank === userRank.rank - 1);
                        if (nextEntry) {
                          const pointsNeeded = nextEntry.points - userRank.points;
                          const totalRange = nextEntry.points - (leaderboardData.find(e => e.rank === userRank.rank + 1)?.points || 0);
                          const progress = totalRange > 0 ? ((totalRange - pointsNeeded) / totalRange) * 100 : 0;
                          return (
                            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" 
                                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} 
                              />
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2">You're not on the leaderboard yet</p>
                  <p className="text-sm text-muted-foreground">Start tipping and volunteering to earn points!</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;

