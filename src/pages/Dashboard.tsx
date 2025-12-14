import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  QrCode, 
  Heart, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Award,
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  Gift,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  kindnessPoints: number;
  totalTips: number;
  totalTipsAmount: number;
  volunteerHours: number;
  rank: number;
  nextBadge: string | null;
  progressToNext: number;
  pointsToNext: number;
}

interface EarnedBadge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  earned_at: string;
}

interface RecentActivity {
  id: string;
  description: string;
  points: number;
  created_at: string;
  activity_type: string;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    kindnessPoints: 0,
    totalTips: 0,
    totalTipsAmount: 0,
    volunteerHours: 0,
    rank: 0,
    nextBadge: null,
    progressToNext: 0,
    pointsToNext: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch total points from activity log
      const { data: activityData, error: activityError } = await supabase
        .from('activity_log')
        .select('points_earned')
        .eq('user_id', user.id);

      if (activityError) throw activityError;

      const totalPoints = activityData?.reduce((sum, activity) => sum + (activity.points_earned || 0), 0) || 0;

      // Fetch tips given
      const { data: tipsData, error: tipsError } = await supabase
        .from('tips')
        .select('amount')
        .eq('giver_id', user.id);

      if (tipsError) throw tipsError;

      const totalTips = tipsData?.length || 0;
      const totalTipsAmount = tipsData?.reduce((sum, tip) => sum + parseFloat(tip.amount.toString()), 0) || 0;

      // Fetch volunteer hours
      const { data: checkinsData, error: checkinsError } = await supabase
        .from('volunteer_checkins')
        .select('hours')
        .eq('user_id', user.id);

      if (checkinsError) throw checkinsError;

      const volunteerHours = checkinsData?.reduce((sum, checkin) => sum + parseFloat(checkin.hours.toString()), 0) || 0;

      // Fetch next badge
      const { data: badgesData, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .order('points_required', { ascending: true });

      if (badgesError) throw badgesError;

      // Get user's earned badges with badge details
      const { data: userBadgesData, error: userBadgesError } = await supabase
        .from('user_badges')
        .select(`
          badge_id,
          earned_at,
          badges (
            id,
            name,
            description,
            icon
          )
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (userBadgesError) throw userBadgesError;

      const earnedBadgeIds = new Set(userBadgesData?.map(ub => ub.badge_id) || []);
      
      // Format earned badges
      const formattedBadges: EarnedBadge[] = (userBadgesData || [])
        .map(ub => {
          const badge = (ub as any).badges;
          if (badge) {
            return {
              id: badge.id,
              name: badge.name,
              description: badge.description,
              icon: badge.icon,
              earned_at: ub.earned_at
            };
          }
          return null;
        })
        .filter((b): b is EarnedBadge => b !== null);

      setEarnedBadges(formattedBadges);
      
      // Find next unearned badge
      const nextBadge = badgesData?.find(b => !earnedBadgeIds.has(b.id)) || null;
      const pointsToNext = nextBadge ? Math.max(0, nextBadge.points_required - totalPoints) : 0;
      const progressToNext = nextBadge && nextBadge.points_required > 0 
        ? Math.min(100, Math.round((totalPoints / nextBadge.points_required) * 100))
        : 0;

      // Calculate rank (simplified - would need a proper ranking query in production)
      // For now, we'll skip the rank calculation as it requires a complex query
      const rank = 0; // Placeholder - would need a proper ranking query

      // Fetch recent activity
      const { data: recentActivityData, error: recentActivityError } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentActivityError) throw recentActivityError;

      const formattedActivity: RecentActivity[] = (recentActivityData || []).map(activity => ({
        id: activity.id,
        description: activity.description || activity.activity_type,
        points: activity.points_earned,
        created_at: activity.created_at,
        activity_type: activity.activity_type
      }));

      setStats({
        kindnessPoints: totalPoints,
        totalTips,
        totalTipsAmount,
        volunteerHours: Math.round(volunteerHours * 10) / 10, // Round to 1 decimal
        rank,
        nextBadge: nextBadge?.name || null,
        progressToNext,
        pointsToNext
      });

      setRecentActivity(formattedActivity);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      
      // Check if tables don't exist (404 or relation doesn't exist)
      const errorMessage = error.message || '';
      const isTableMissing = error.code === 'PGRST116' || 
                            errorMessage.includes('relation') || 
                            errorMessage.includes('does not exist') ||
                            errorMessage.includes('404') ||
                            error.code === '42P01';
      
      if (isTableMissing) {
        toast({
          title: "Database Migration Required",
          description: "Please run the database migration in Supabase. Go to SQL Editor and run: supabase/migrations/20250113000000_core_features.sql",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error loading dashboard",
          description: error.message || "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground">Your kindness is making a difference</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40 transition-all cursor-pointer group" onClick={() => navigate("/scan")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Scan & Tip</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Scan a QR code or enter TipID to give instantly</p>
                </div>
                <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent hover:border-secondary/40 transition-all cursor-pointer group" onClick={() => navigate("/volunteer")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-secondary" />
                    <h3 className="font-semibold text-lg">Volunteer</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Check in at events and earn Karma Points</p>
                </div>
                <ArrowRight className="h-5 w-5 text-secondary group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Kindness Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <div className="text-3xl font-bold">{stats.kindnessPoints.toLocaleString()}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Total points earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-secondary" />
                <div className="text-3xl font-bold">{stats.totalTips}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">${stats.totalTipsAmount.toFixed(2)} given</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Volunteer Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                <div className="text-3xl font-bold">{stats.volunteerHours}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Total hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Global Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div className="text-3xl font-bold">{stats.rank > 0 ? `#${stats.rank}` : '—'}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Keep it up!</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress & Achievements */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Next Badge
              </CardTitle>
              <CardDescription>You're making great progress!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.nextBadge ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Award className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{stats.nextBadge}</h3>
                        <p className="text-sm text-muted-foreground">
                          {stats.pointsToNext > 0 ? `${stats.pointsToNext} points to go` : "Almost there!"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{stats.progressToNext}%</span>
                    </div>
                    <Progress value={stats.progressToNext} className="h-2" />
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">All badges earned! 🎉</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-secondary" />
                Earned Badges
              </CardTitle>
              <CardDescription>Your achievements and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              {earnedBadges.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {earnedBadges.slice(0, 6).map((badge) => (
                      <div
                        key={badge.id}
                        className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border"
                        title={badge.description || badge.name}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-xs font-medium text-center max-w-[80px] truncate">
                          {badge.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  {earnedBadges.length > 6 && (
                    <p className="text-xs text-center text-muted-foreground">
                      +{earnedBadges.length - 6} more badges
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-sm text-muted-foreground">No badges earned yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Start earning points to unlock badges!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-secondary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest acts of kindness</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {recentActivity.map((activity) => {
                      const getIcon = () => {
                        if (activity.activity_type.includes('tip')) return Gift;
                        if (activity.activity_type.includes('volunteer')) return Heart;
                        if (activity.activity_type.includes('badge')) return Award;
                        return Sparkles;
                      };
                      const getIconColor = () => {
                        if (activity.activity_type.includes('tip')) return 'text-primary';
                        if (activity.activity_type.includes('volunteer')) return 'text-secondary';
                        if (activity.activity_type.includes('badge')) return 'text-accent';
                        return 'text-accent';
                      };
                      const getBgColor = () => {
                        if (activity.activity_type.includes('tip')) return 'bg-primary/10';
                        if (activity.activity_type.includes('volunteer')) return 'bg-secondary/10';
                        if (activity.activity_type.includes('badge')) return 'bg-accent/10';
                        return 'bg-accent/10';
                      };
                      const Icon = getIcon();
                      const timeAgo = new Date(activity.created_at);
                      const now = new Date();
                      const diffMs = now.getTime() - timeAgo.getTime();
                      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                      const diffDays = Math.floor(diffHours / 24);
                      const timeText = diffHours < 1 ? 'Just now' : 
                                      diffHours < 24 ? `${diffHours}h ago` : 
                                      diffDays === 1 ? 'Yesterday' : 
                                      `${diffDays}d ago`;

                      return (
                        <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div className={`w-10 h-10 rounded-full ${getBgColor()} flex items-center justify-center`}>
                            <Icon className={`h-5 w-5 ${getIconColor()}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{timeText}</p>
                          </div>
                          {activity.points > 0 && (
                            <Badge variant="secondary">+{activity.points} pts</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No activity yet. Start tipping or volunteering!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2 hover:bg-primary/5"
            onClick={() => navigate("/leaderboard")}
          >
            <TrendingUp className="h-6 w-6" />
            <span>Leaderboard</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2 hover:bg-secondary/5"
            onClick={() => navigate("/impact")}
          >
            <Target className="h-6 w-6" />
            <span>Impact Dashboard</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2 hover:bg-accent/5"
            onClick={() => navigate("/kids")}
          >
            <Sparkles className="h-6 w-6" />
            <span>TapKind Jr.</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

