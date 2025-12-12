import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Plus, X, MapPin, Camera } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  story: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  tags: string[];
  location: string | null;
  is_public: boolean;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || !user) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: profile.display_name,
          bio: profile.bio,
          story: profile.story,
          location: profile.location,
          tags: profile.tags,
          is_public: profile.is_public,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      
      toast({
        title: "Profile saved!",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save your profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    if (!newTag.trim() || !profile) return;
    if (profile.tags.includes(newTag.trim())) {
      toast({
        title: "Tag exists",
        description: "This tag is already added.",
        variant: "destructive",
      });
      return;
    }
    setProfile({ ...profile, tags: [...profile.tags, newTag.trim()] });
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    if (!profile) return;
    setProfile({ ...profile, tags: profile.tags.filter((t) => t !== tagToRemove) });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 rounded-3xl bg-gradient-to-r from-primary/20 to-secondary/20 mb-20 overflow-hidden">
          <button className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-full p-3 hover:bg-background transition-colors">
            <Camera className="h-5 w-5 text-foreground" />
          </button>
          
          {/* Avatar */}
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary p-1">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-4xl font-bold text-primary">
                  {profile.display_name?.[0]?.toUpperCase() || "?"}
                </div>
              </div>
              <button className="absolute bottom-0 right-0 bg-primary rounded-full p-2 hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-8 animate-fade-in">
          {/* Basic Info */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Basic Info</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={profile.display_name || ""}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  placeholder="Your display name"
                  className="h-12 rounded-xl bg-card/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="location"
                    value={profile.location || ""}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="City, Country"
                    className="h-12 pl-10 rounded-xl bg-card/50"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Bio */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Short Bio</h2>
            <Textarea
              value={profile.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="A brief description about yourself..."
              className="min-h-[100px] rounded-xl bg-card/50 resize-none"
            />
          </section>

          {/* Story */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Your Story</h2>
            <p className="text-sm text-muted-foreground">
              Share your journey, experiences, and what drives you. This helps the community connect with you.
            </p>
            <Textarea
              value={profile.story || ""}
              onChange={(e) => setProfile({ ...profile, story: e.target.value })}
              placeholder="Tell your story..."
              className="min-h-[200px] rounded-xl bg-card/50 resize-none"
            />
          </section>

          {/* Tags */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Tags</h2>
            <p className="text-sm text-muted-foreground">
              Add tags to help people find and connect with you.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                className="h-10 rounded-xl bg-card/50"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button onClick={addTag} size="icon" className="h-10 w-10 rounded-xl">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </section>

          {/* Visibility */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Profile Visibility</h2>
            <div className="flex items-center gap-4 p-4 bg-card/50 rounded-xl">
              <input
                type="checkbox"
                id="isPublic"
                checked={profile.is_public}
                onChange={(e) => setProfile({ ...profile, is_public: e.target.checked })}
                className="w-5 h-5 rounded border-border accent-primary"
              />
              <Label htmlFor="isPublic" className="flex-1 cursor-pointer">
                <span className="block font-medium">Make profile public</span>
                <span className="text-sm text-muted-foreground">
                  Allow others to discover and view your profile
                </span>
              </Label>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
