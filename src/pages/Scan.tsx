import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Scan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tipId, setTipId] = useState("");
  const [recipient, setRecipient] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [tipAmount, setTipAmount] = useState("");

  const handleScan = () => {
    setIsScanning(true);
    // Simulate QR scan
    setTimeout(() => {
      setIsScanning(false);
      // Mock recipient data
      setRecipient({
        id: "rec_123",
        name: "Sarah Martinez",
        bio: "Street musician bringing joy to the city",
        location: "Central Park, NYC",
        tags: ["Musician", "Artist"],
        totalTips: 1240,
        tipCount: 47,
        avatar: null
      });
      toast({
        title: "QR Code scanned!",
        description: "Found recipient profile",
      });
    }, 1500);
  };

  const handleTipIdSearch = () => {
    if (!tipId.trim()) {
      toast({
        title: "Enter a TipID",
        description: "Please enter a valid TipID to search",
        variant: "destructive",
      });
      return;
    }
    
    // Mock search
    setRecipient({
      id: "rec_456",
      name: "Alex Chen",
      bio: "Community artist creating public murals",
      location: "Brooklyn, NYC",
      tags: ["Artist", "Community"],
      totalTips: 890,
      tipCount: 32,
      avatar: null
    });
    toast({
      title: "Recipient found!",
      description: "Ready to tip",
    });
  };

  const handleTip = () => {
    if (!tipAmount || parseFloat(tipAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid tip amount",
        variant: "destructive",
      });
      return;
    }

    // Mock tip processing
    toast({
      title: "Tip sent! 🎉",
      description: `You've sent $${tipAmount} to ${recipient.name}`,
    });
    
    setTimeout(() => {
      setRecipient(null);
      setTipAmount("");
      setTipId("");
      navigate("/dashboard");
    }, 2000);
  };

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
                <CardDescription>Point your camera at a recipient's QR code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center border-2 border-dashed border-primary/30">
                  {isScanning ? (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-muted-foreground">Scanning...</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <QrCode className="h-24 w-24 text-primary/50 mx-auto" />
                      <p className="text-muted-foreground">Camera will activate when you click scan</p>
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleScan} 
                  disabled={isScanning}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                  size="lg"
                >
                  {isScanning ? "Scanning..." : "Start Scanning"}
                </Button>
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
                    onClick={handleTipIdSearch}
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                  >
                    Search
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
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white">
                  {recipient.name[0]}
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-xl font-semibold">{recipient.name}</h3>
                    <p className="text-sm text-muted-foreground">{recipient.bio}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {recipient.location}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recipient.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
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
                disabled={!tipAmount || parseFloat(tipAmount) <= 0}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                size="lg"
              >
                <Heart className="mr-2 h-5 w-5" />
                Send ${tipAmount || "0"} Tip
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                <Sparkles className="inline h-3 w-3 mr-1" />
                You'll earn {Math.floor(parseFloat(tipAmount || "0") * 2)} Kindness Points
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Scan;

