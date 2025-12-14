import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { QRScanner } from "@/components/QRScanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  QrCode, 
  ArrowLeft, 
  Search,
  User,
  MapPin,
  Heart,
  DollarSign,
  Sparkles,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RecipientProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  location: string | null;
  tags: string[];
  avatar_url: string | null;
  totalTips: number;
  tipCount: number;
}

const Scan = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tipId, setTipId] = useState("");
  const [recipient, setRecipient] = useState<RecipientProfile | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tipAmount, setTipAmount] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Parse QR payload - handles both plain TipID and structured JSON
  const parseQRPayload = (decodedText: string): string => {
    try {
      // Try to parse as JSON (base64 or direct JSON)
      let data: any;
      
      // Check if it's base64 encoded JSON
      if (decodedText.startsWith('{')) {
        data = JSON.parse(decodedText);
      } else {
        // Try base64 decode
        try {
          const decoded = atob(decodedText);
          if (decoded.startsWith('{')) {
            data = JSON.parse(decoded);
          } else {
            // Not JSON, treat as plain TipID
            return decodedText.trim().toUpperCase();
          }
        } catch {
          // Not base64, treat as plain TipID
          return decodedText.trim().toUpperCase();
        }
      }

      // Handle structured QR payload
      if (data.type === "tip" || data.type === "payment") {
        // Extract TipID from structured payload
        if (data.tip_id || data.tipId || data.id) {
          return (data.tip_id || data.tipId || data.id).toString().trim().toUpperCase();
        }
      }

      // If it's JSON but doesn't have expected structure, try to find TipID
      if (data.tip_id || data.tipId) {
        return (data.tip_id || data.tipId).toString().trim().toUpperCase();
      }

      // Fallback: return original text
      return decodedText.trim().toUpperCase();
    } catch (error) {
      // Not JSON, treat as plain TipID
      return decodedText.trim().toUpperCase();
    }
  };

  const handleQRScan = (decodedText: string) => {
    setIsScanning(false);
    
    // Parse the QR payload
    const tipId = parseQRPayload(decodedText);
    
    if (!tipId) {
      toast({
        title: "Invalid QR Code",
        description: "The scanned QR code doesn't contain a valid TipID",
        variant: "destructive",
      });
      return;
    }

    // Set the TipID and trigger search
    setTipId(tipId);
    // Automatically search for the recipient
    setTimeout(() => {
      handleTipIdSearch(tipId);
    }, 100);
  };

  const handleTipIdSearch = async (searchTipId?: string) => {
    const tipIdToSearch = searchTipId || tipId;
    
    if (!tipIdToSearch.trim()) {
      toast({
        title: "Enter a TipID",
        description: "Please enter a valid TipID to search",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to search for recipients",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setRecipient(null);

    try {
      // Search for recipient code
      const { data: recipientCode, error: codeError } = await (supabase as any)
        .from("recipient_codes")
        .select("user_id")
        .eq("tip_id", tipIdToSearch.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (codeError) throw codeError;

      if (!recipientCode) {
        toast({
          title: "TipID not found",
          description: "No active recipient found with this TipID",
          variant: "destructive",
        });
        setIsSearching(false);
        return;
      }

      // Get recipient profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", recipientCode.user_id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        toast({
          title: "Profile not found",
          description: "Recipient profile could not be loaded",
          variant: "destructive",
        });
        setIsSearching(false);
        return;
      }

      // Get tip statistics
      const { data: tips, error: tipsError } = await (supabase as any)
        .from("tips")
        .select("amount")
        .eq("recipient_id", recipientCode.user_id);

      if (tipsError) throw tipsError;

      const totalTips = tips?.reduce((sum, tip) => sum + parseFloat(tip.amount.toString()), 0) || 0;
      const tipCount = tips?.length || 0;

      setRecipient({
        id: profile.id,
        user_id: profile.user_id,
        display_name: profile.display_name,
        bio: profile.bio,
        location: profile.location,
        tags: profile.tags || [],
        avatar_url: profile.avatar_url,
        totalTips,
        tipCount,
      });

      toast({
        title: "Recipient found!",
        description: "Ready to tip",
      });
    } catch (error: any) {
      console.error("Error searching for recipient:", error);
      
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
          title: "Search failed",
          description: error.message || "Failed to search for recipient",
          variant: "destructive",
        });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleTip = async () => {
    if (!tipAmount || parseFloat(tipAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid tip amount",
        variant: "destructive",
      });
      return;
    }

    if (!user || !recipient) {
      toast({
        title: "Error",
        description: "Missing user or recipient information",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const amount = parseFloat(tipAmount);

      // Create tip record
      const { data: tip, error: tipError } = await (supabase as any)
        .from("tips")
        .insert({
          giver_id: user.id,
          recipient_id: recipient.user_id,
          amount: amount,
          is_anonymous: false,
        })
        .select()
        .single();

      if (tipError) throw tipError;

      toast({
        title: "Tip sent! 🎉",
        description: `You've sent $${amount.toFixed(2)} to ${recipient.display_name || "recipient"}`,
      });

      // Reset form and navigate
      setTimeout(() => {
        setRecipient(null);
        setTipAmount("");
        setTipId("");
        navigate("/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Error processing tip:", error);
      toast({
        title: "Tip failed",
        description: error.message || "Failed to process tip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
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
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Scan & Tip
          </h1>
          <p className="text-muted-foreground">Support artists and community members instantly</p>
        </div>

        <Tabs defaultValue="scan" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan">Scan QR Code</TabsTrigger>
            <TabsTrigger value="tipid">Enter TipID</TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scan QR Code</CardTitle>
                <CardDescription>Point your camera at a recipient's QR code to find them instantly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isScanning ? (
                  <>
                    <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center border-2 border-dashed border-primary/30">
                      <div className="text-center space-y-4">
                        <QrCode className="h-24 w-24 text-primary/50 mx-auto" />
                        <p className="text-muted-foreground">Click below to start scanning</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setIsScanning(true)} 
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                      size="lg"
                    >
                      <QrCode className="mr-2 h-5 w-5" />
                      Start Scanning
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Make sure to allow camera access when prompted
                    </p>
                  </>
                ) : (
                  <div className="space-y-4">
                    <QRScanner
                      onScan={handleQRScan}
                      onClose={() => setIsScanning(false)}
                      isActive={isScanning}
                    />
                    <Button 
                      onClick={() => setIsScanning(false)} 
                      variant="outline"
                      className="w-full"
                    >
                      Stop Scanning
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tipid" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enter TipID</CardTitle>
                <CardDescription>Type or paste a TipID to find a recipient</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Enter TipID (e.g., TK-ABC123)"
                      value={tipId}
                      onChange={(e) => setTipId(e.target.value)}
                      className="pl-10 h-12"
                      onKeyDown={(e) => e.key === "Enter" && handleTipIdSearch()}
                    />
                  </div>
                  <Button 
                    onClick={() => handleTipIdSearch()}
                    disabled={isSearching}
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      "Search"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recipient Profile */}
        {recipient && (
          <Card className="animate-fade-in border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Recipient Found</CardTitle>
              <CardDescription>Review and send your tip</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Info */}
              <div className="flex items-start gap-4">
                {recipient.avatar_url ? (
                  <img
                    src={recipient.avatar_url}
                    alt={recipient.display_name || "Recipient"}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white">
                    {(recipient.display_name || "R")[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-xl font-semibold">{recipient.display_name || "Anonymous"}</h3>
                    {recipient.bio && (
                      <p className="text-sm text-muted-foreground">{recipient.bio}</p>
                    )}
                  </div>
                  {recipient.location && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {recipient.location}
                      </div>
                    </div>
                  )}
                  {recipient.tags && recipient.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {recipient.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-xl">
                <div>
                  <div className="text-2xl font-bold text-primary">${recipient.totalTips.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total Received</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">{recipient.tipCount}</div>
                  <div className="text-xs text-muted-foreground">Tips Received</div>
                </div>
              </div>

              {/* Tip Amount */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Tip Amount</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 25, 50].map((amount) => (
                    <Button
                      key={amount}
                      variant={tipAmount === amount.toString() ? "default" : "outline"}
                      onClick={() => setTipAmount(amount.toString())}
                      className={tipAmount === amount.toString() ? "bg-primary" : ""}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Custom amount"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    className="pl-10 h-12"
                    min="1"
                  />
                </div>
              </div>

              {/* Action */}
              <Button
                onClick={handleTip}
                disabled={!tipAmount || parseFloat(tipAmount) <= 0 || isProcessing}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-5 w-5" />
                    Send ${tipAmount || "0"} Tip
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                <Sparkles className="inline h-3 w-3 mr-1" />
                You'll earn {Math.floor(parseFloat(tipAmount || "0") * 10)} Kindness Points
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Scan;

