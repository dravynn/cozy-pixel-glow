import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Heart,
  MapPin,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  Search,
  QrCode,
  Plus,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VolunteerCheckin {
  id: string;
  event_name: string;
  event_location: string | null;
  hours: number;
  check_in_time: string;
  notes: string | null;
  created_at: string;
}

const Volunteer = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [checkins, setCheckins] = useState<VolunteerCheckin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [hours, setHours] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCheckins();
    }
  }, [user]);

  const fetchCheckins = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("volunteer_checkins")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCheckins(data || []);
    } catch (error: any) {
      console.error("Error fetching check-ins:", error);
      
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
          title: "Error",
          description: "Failed to load volunteer check-ins",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to check in",
        variant: "destructive",
      });
      return;
    }

    if (!eventName.trim()) {
      toast({
        title: "Event name required",
        description: "Please enter an event name",
        variant: "destructive",
      });
      return;
    }

    const hoursNum = parseFloat(hours);
    if (!hours || hoursNum <= 0) {
      toast({
        title: "Invalid hours",
        description: "Please enter a valid number of hours",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("volunteer_checkins")
        .insert({
          user_id: user.id,
          event_name: eventName.trim(),
          event_location: eventLocation.trim() || null,
          hours: hoursNum,
          notes: notes.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      const pointsEarned = Math.floor(hoursNum * 50); // 50 points per hour

      toast({
        title: "Checked in! 🎉",
        description: `You've checked in to ${eventName}. Earned ${pointsEarned} Karma Points!`,
      });

      // Reset form
      setEventName("");
      setEventLocation("");
      setHours("");
      setNotes("");
      setIsDialogOpen(false);

      // Refresh check-ins
      fetchCheckins();
    } catch (error: any) {
      console.error("Error checking in:", error);
      toast({
        title: "Check-in failed",
        description: error.message || "Failed to check in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalHours = checkins.reduce((sum, checkin) => sum + parseFloat(checkin.hours.toString()), 0);
  const totalPoints = Math.floor(totalHours * 50);

  const filteredCheckins = checkins.filter(checkin =>
    checkin.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (checkin.event_location && checkin.event_location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading volunteer events...</p>
        </div>
      </div>
    );
  }

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
            <Heart className="h-8 w-8 text-secondary" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Volunteer Events
            </h1>
          </div>
          <p className="text-muted-foreground">Join community events and earn Karma Points</p>
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div className="text-3xl font-bold">{totalHours.toFixed(1)}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-secondary" />
                <div className="text-3xl font-bold">{totalPoints.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Events Attended</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-accent" />
                <div className="text-3xl font-bold">{checkins.length}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search check-ins by event name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Check-In
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Check In to Volunteer Event</DialogTitle>
                <DialogDescription>
                  Record your volunteer hours to earn Karma Points (50 points per hour)
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCheckIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="eventName">Event Name *</Label>
                  <Input
                    id="eventName"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g., Central Park Cleanup"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventLocation">Location</Label>
                  <Input
                    id="eventLocation"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="e.g., Central Park, NYC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours Volunteered *</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="e.g., 3.5"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    You'll earn {hours ? Math.floor(parseFloat(hours || "0") * 50) : 0} Karma Points
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional details about your volunteer work..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking in...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Check In
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Check-ins List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Volunteer Check-Ins</h2>
          {filteredCheckins.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredCheckins.map((checkin) => {
                const checkInDate = new Date(checkin.check_in_time);
                const pointsEarned = Math.floor(parseFloat(checkin.hours.toString()) * 50);
                
                return (
                  <Card key={checkin.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="mb-2">{checkin.event_name}</CardTitle>
                          {checkin.event_location && (
                            <CardDescription className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {checkin.event_location}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {checkInDate.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {checkin.hours} {checkin.hours === 1 ? "hour" : "hours"}
                        </div>
                        {checkin.notes && (
                          <div className="pt-2 text-muted-foreground">
                            <p className="text-sm">{checkin.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                        <Badge variant="secondary">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {pointsEarned} pts earned
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold mb-2">No check-ins yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start volunteering and check in to earn Karma Points!
                </p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Check In Now
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Volunteer;

