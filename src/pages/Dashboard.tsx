import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
  Gift
} from "lucide-react";

interface DashboardStats {
  kindnessPoints: number;
  totalTips: number;
  volunteerHours: number;
  rank: number;
  nextBadge: string;
  progressToNext: number;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    kindnessPoints: 1240,
    totalTips: 47,
    volunteerHours: 12.5,
    rank: 234,
    nextBadge: "Kindness Champion",
    progressToNext: 65
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
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
              <p className="text-xs text-muted-foreground mt-2">+120 this week</p>
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
              <p className="text-xs text-muted-foreground mt-2">$1,240 given</p>
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
              <p className="text-xs text-muted-foreground mt-2">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Global Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div className="text-3xl font-bold">#{stats.rank}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Top 5% contributor</p>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{stats.nextBadge}</h3>
                    <p className="text-sm text-muted-foreground">350 points to go</p>
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
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tipped $25</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                  <Badge variant="secondary">+50 pts</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Volunteered at cleanup</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                  <Badge variant="secondary">+100 pts</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Completed mission</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                  <Badge variant="secondary">+30 pts</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate("/activity")}>
                View All Activity
              </Button>
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

