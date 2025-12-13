import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Users
} from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  tips: number;
  hours: number;
  badge?: string;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<"all" | "month" | "week">("all");

  // Mock leaderboard data
  const leaderboardData: LeaderboardEntry[] = [
    { rank: 1, name: "Alex Rivera", points: 15420, tips: 89, hours: 45, badge: "Champion" },
    { rank: 2, name: "Maya Patel", points: 12890, tips: 76, hours: 38, badge: "Hero" },
    { rank: 3, name: "Jordan Kim", points: 11250, tips: 65, hours: 32, badge: "Star" },
    { rank: 4, name: "Sam Taylor", points: 9870, tips: 58, hours: 28 },
    { rank: 5, name: "Casey Brown", points: 8650, tips: 52, hours: 25 },
    { rank: 6, name: "Riley Davis", points: 7420, tips: 47, hours: 22 },
    { rank: 7, name: "Morgan Lee", points: 6890, tips: 43, hours: 20 },
    { rank: 8, name: "Taylor Chen", points: 6250, tips: 39, hours: 18 },
    { rank: 9, name: "Jamie Wong", points: 5810, tips: 36, hours: 17 },
    { rank: 10, name: "Alex Morgan", points: 5420, tips: 34, hours: 16 },
  ];

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
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[2, 1, 3].map((rank) => {
            const entry = leaderboardData.find(e => e.rank === rank);
            if (!entry) return null;
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
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white mx-auto ${isFirst ? 'w-24 h-24' : ''}`}>
                    {entry.name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{entry.name}</h3>
                    {entry.badge && (
                      <Badge variant="secondary" className="mt-1">{entry.badge}</Badge>
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

        {/* Rest of Leaderboard */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {leaderboardData.slice(3).map((entry) => (
                <div 
                  key={entry.rank}
                  className="p-4 hover:bg-muted/50 transition-colors flex items-center gap-4"
                >
                  <div className="w-12 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-lg font-semibold flex-shrink-0">
                    {entry.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{entry.name}</h3>
                      {entry.badge && (
                        <Badge variant="outline" className="text-xs">{entry.badge}</Badge>
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

        {/* Your Rank */}
        <Card className="mt-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold text-white">
                  Y
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Your Rank</h3>
                  <p className="text-sm text-muted-foreground">Keep spreading kindness!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">#234</div>
                <div className="text-sm text-muted-foreground">1,240 points</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress to next rank</span>
                <span className="font-medium">350 points to #200</span>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: "65%" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;

