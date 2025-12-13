import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  TrendingUp,
  DollarSign,
  Users,
  Heart,
  Globe,
  Sparkles,
  Target,
  BarChart3,
  MapPin,
  Calendar
} from "lucide-react";

const Impact = () => {
  const navigate = useNavigate();

  const globalStats = {
    totalTips: 1240000,
    totalTippers: 12500,
    totalRecipients: 850,
    volunteerHours: 45000,
    cities: 120,
    countries: 15
  };

  const recentImpact = [
    { location: "NYC Central Park", amount: 12500, tips: 340, date: "This week" },
    { location: "Brooklyn Bridge", amount: 8900, tips: 245, date: "This week" },
    { location: "Times Square", amount: 15200, tips: 420, date: "Last week" },
    { location: "Prospect Park", amount: 6800, tips: 189, date: "Last week" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Impact Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground">See how kindness is transforming communities worldwide</p>
        </div>

        {/* Global Karma Index */}
        <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Global Karma Index
            </CardTitle>
            <CardDescription>Combined impact of volunteering and digital giving</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                8.4M
              </div>
              <p className="text-muted-foreground">Total Impact Score</p>
              <div className="flex items-center justify-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{globalStats.volunteerHours.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Volunteer Hours</div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">${(globalStats.totalTips / 1000).toFixed(0)}K</div>
                  <div className="text-sm text-muted-foreground">Digital Tips</div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{globalStats.cities}</div>
                  <div className="text-sm text-muted-foreground">Cities Active</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Tips Given
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">${(globalStats.totalTips / 1000).toFixed(1)}K</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>+12% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{globalStats.totalTippers.toLocaleString()}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-secondary" />
                <span>+1,200 new members</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Recipients Supported
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{globalStats.totalRecipients}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span>+45 this month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impact by Location */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Recent Impact by Location
            </CardTitle>
            <CardDescription>Top locations where kindness is making a difference</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentImpact.map((impact, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{impact.location}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${impact.amount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {impact.tips} tips
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {impact.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Impact Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Impact Growth
            </CardTitle>
            <CardDescription>Monthly growth of kindness in our community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {[45, 52, 48, 61, 58, 67, 72, 65, 78, 84, 89, 95].map((height, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary to-secondary transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][index]}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">+24%</div>
                  <div className="text-xs text-muted-foreground">This Month</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">+156%</div>
                  <div className="text-xs text-muted-foreground">This Year</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">15</div>
                  <div className="text-xs text-muted-foreground">Countries</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">120</div>
                  <div className="text-xs text-muted-foreground">Cities</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Impact;

