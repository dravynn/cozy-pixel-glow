import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  QrCode
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  name: string;
  organization: string;
  location: string;
  date: string;
  time: string;
  duration: string;
  attendees: number;
  karmaPoints: number;
  description: string;
  status: "upcoming" | "active" | "past";
}

const Volunteer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const events: Event[] = [
    {
      id: "1",
      name: "Central Park Cleanup",
      organization: "Guaranteed Karma",
      location: "Central Park, NYC",
      date: "2024-12-20",
      time: "10:00 AM",
      duration: "3 hours",
      attendees: 45,
      karmaPoints: 100,
      description: "Join us for a community cleanup event. We'll be removing litter and beautifying the park.",
      status: "upcoming"
    },
    {
      id: "2",
      name: "Street Art Festival",
      organization: "Guaranteed Karma",
      location: "Brooklyn Bridge Park",
      date: "2024-12-22",
      time: "2:00 PM",
      duration: "4 hours",
      attendees: 120,
      karmaPoints: 150,
      description: "Support local artists and help set up the festival. Great opportunity to meet the community!",
      status: "upcoming"
    },
    {
      id: "3",
      name: "Community Garden Planting",
      organization: "Guaranteed Karma",
      location: "Prospect Park",
      date: "2024-12-18",
      time: "9:00 AM",
      duration: "2 hours",
      attendees: 28,
      karmaPoints: 75,
      description: "Help plant seasonal vegetables and flowers in our community garden.",
      status: "active"
    },
  ];

  const pastEvents: Event[] = [
    {
      id: "4",
      name: "Beach Cleanup",
      organization: "Guaranteed Karma",
      location: "Coney Island",
      date: "2024-12-10",
      time: "8:00 AM",
      duration: "3 hours",
      attendees: 67,
      karmaPoints: 100,
      description: "Cleaned up the beach and collected over 200 lbs of trash.",
      status: "past"
    },
  ];

  const handleCheckIn = (event: Event) => {
    toast({
      title: "Checked in! 🎉",
      description: `You've checked in to ${event.name}. Earn ${event.karmaPoints} Karma Points!`,
    });
    // In real app, this would update the event status and user's karma points
  };

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search events by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <Card 
                key={event.id}
                className={`hover:shadow-lg transition-all cursor-pointer ${
                  event.status === "active" ? "border-2 border-primary/30 bg-primary/5" : ""
                }`}
                onClick={() => setSelectedEvent(event)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{event.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mb-3">
                        <Heart className="h-4 w-4 text-secondary" />
                        {event.organization}
                      </CardDescription>
                    </div>
                    {event.status === "active" && (
                      <Badge className="bg-primary text-white">Active Now</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {event.time} • {event.duration}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {event.attendees} attending
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-secondary" />
                        <span className="font-semibold">{event.karmaPoints} Karma Points</span>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckIn(event);
                        }}
                        className="bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white"
                        size="sm"
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        Check In
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Past Events */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Past Events</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {pastEvents.map((event) => (
              <Card key={event.id} className="opacity-75">
                <CardHeader>
                  <CardTitle className="mb-2">{event.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-secondary" />
                    {event.organization}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {event.date}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <Badge variant="secondary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {event.karmaPoints} pts earned
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Event Detail Modal (simplified - would be a proper dialog in production) */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedEvent(null)}>
            <Card className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <CardTitle>{selectedEvent.name}</CardTitle>
                <CardDescription>{selectedEvent.organization}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{selectedEvent.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Location</div>
                    <div className="font-medium">{selectedEvent.location}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Date & Time</div>
                    <div className="font-medium">{selectedEvent.date} at {selectedEvent.time}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Duration</div>
                    <div className="font-medium">{selectedEvent.duration}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Karma Points</div>
                    <div className="font-medium text-secondary">{selectedEvent.karmaPoints} pts</div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      handleCheckIn(selectedEvent);
                      setSelectedEvent(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white"
                  >
                    Check In Now
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Volunteer;

