import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Sparkles,
  Star,
  Gift,
  Heart,
  Camera,
  BookOpen,
  Palette,
  Trophy,
  Target,
  Zap
} from "lucide-react";

interface Mission {
  id: string;
  title: string;
  description: string;
  type: "volunteer" | "creative" | "kindness";
  coins: number;
  completed: boolean;
  progress?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const Kids = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("missions");

  const missions: Mission[] = [
    {
      id: "1",
      title: "Help Clean Up",
      description: "Join a cleanup event with your family",
      type: "volunteer",
      coins: 50,
      completed: false,
      progress: 0
    },
    {
      id: "2",
      title: "Draw a Kindness Card",
      description: "Create a card for someone special",
      type: "creative",
      coins: 30,
      completed: false,
      progress: 0
    },
    {
      id: "3",
      title: "Say Thank You",
      description: "Thank 3 people today",
      type: "kindness",
      coins: 20,
      completed: true
    },
    {
      id: "4",
      title: "Write a Story",
      description: "Write a story about kindness",
      type: "creative",
      coins: 40,
      completed: false,
      progress: 50
    },
  ];

  const achievements: Achievement[] = [
    { id: "1", title: "First Kindness", description: "Complete your first mission", icon: "🌟", unlocked: true },
    { id: "2", title: "Kindness Champion", description: "Complete 10 missions", icon: "🏆", unlocked: true },
    { id: "3", title: "Creative Star", description: "Complete 5 creative missions", icon: "⭐", unlocked: false },
    { id: "4", title: "Helper Hero", description: "Volunteer 5 times", icon: "💪", unlocked: false },
  ];

  const stats = {
    totalCoins: 240,
    missionsCompleted: 8,
    currentStreak: 5,
    rank: 12
  };

  const getMissionIcon = (type: string) => {
    switch (type) {
      case "volunteer": return <Heart className="h-5 w-5 text-secondary" />;
      case "creative": return <Palette className="h-5 w-5 text-accent" />;
      case "kindness": return <Sparkles className="h-5 w-5 text-primary" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              TapKind Jr.
            </h1>
            <Badge className="bg-accent/20 text-accent border-accent/30">Kids Mode</Badge>
          </div>
          <p className="text-muted-foreground">Learn kindness through fun missions and games!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalCoins}</div>
                  <div className="text-xs text-muted-foreground">Kindness Coins</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Target className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.missionsCompleted}</div>
                  <div className="text-xs text-muted-foreground">Missions Done</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.currentStreak}</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">#{stats.rank}</div>
                  <div className="text-xs text-muted-foreground">Your Rank</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="missions">Missions</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="missions" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {missions.map((mission) => (
                <Card 
                  key={mission.id}
                  className={`hover:shadow-lg transition-all ${
                    mission.completed ? "opacity-75 border-primary/30" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          {getMissionIcon(mission.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{mission.title}</CardTitle>
                          <CardDescription>{mission.description}</CardDescription>
                        </div>
                      </div>
                      {mission.completed && (
                        <Badge className="bg-primary text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Done!
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mission.progress !== undefined && !mission.completed && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{mission.progress}%</span>
                        </div>
                        <Progress value={mission.progress} className="h-2" />
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-accent" />
                        <span className="font-semibold">{mission.coins} Coins</span>
                      </div>
                      <Button
                        size="sm"
                        variant={mission.completed ? "outline" : "default"}
                        disabled={mission.completed}
                        className={mission.completed ? "" : "bg-gradient-to-r from-primary to-secondary"}
                      >
                        {mission.completed ? "Completed" : "Start Mission"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id}
                  className={`${
                    achievement.unlocked 
                      ? "border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent" 
                      : "opacity-60"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`text-4xl ${achievement.unlocked ? "" : "grayscale"}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        {achievement.unlocked && (
                          <Badge className="mt-2 bg-primary text-white">
                            <Star className="h-3 w-3 mr-1" />
                            Unlocked!
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Kids Leaderboard</CardTitle>
                <CardDescription>Top kindness champions this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: "Emma", coins: 450, icon: "👑" },
                    { rank: 2, name: "Lucas", coins: 420, icon: "⭐" },
                    { rank: 3, name: "Sophia", coins: 390, icon: "🌟" },
                    { rank: 4, name: "Mason", coins: 360 },
                    { rank: 5, name: "Olivia", coins: 340 },
                  ].map((entry) => (
                    <div 
                      key={entry.rank}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                    >
                      <div className="w-10 flex justify-center">
                        {entry.icon ? (
                          <span className="text-2xl">{entry.icon}</span>
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground">#{entry.rank}</span>
                        )}
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-lg font-bold flex-shrink-0">
                        {entry.name[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{entry.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-accent" />
                        <span className="font-bold">{entry.coins} coins</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Kids;

