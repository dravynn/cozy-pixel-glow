import { QrCode, Heart, Gift, Shield, Globe, Sparkles } from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "Instant Cashless Tipping",
    description: "Scan QR codes or enter TipIDs to instantly tip artists, musicians, and community members. No cash needed.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Heart,
    title: "Volunteer Integration",
    description: "Partner with Guaranteed Karma to combine volunteering with digital giving. Earn Karma Points for every hour.",
    gradient: "from-secondary to-accent",
  },
  {
    icon: Sparkles,
    title: "Gamification & Rewards",
    description: "Earn Kindness Points, unlock badges, and climb leaderboards. Make generosity fun and measurable.",
    gradient: "from-accent to-primary",
  },
  {
    icon: Gift,
    title: "TapKind Jr. for Kids",
    description: "Teach children empathy through supervised missions, creative activities, and parent-matched giving.",
    gradient: "from-primary to-accent",
  },
  {
    icon: Globe,
    title: "Impact Dashboard",
    description: "See your collective impact in real-time. Track volunteer hours, tips, and the Global Karma Index.",
    gradient: "from-secondary to-primary",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Minimal PII, encrypted data, and anonymous tipping options. Your kindness, your privacy.",
    gradient: "from-accent to-secondary",
  },
];

const Features = () => {
  return (
    <div className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why People Love{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              TapKind
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            More than just tipping—it's a complete kindness ecosystem with volunteering, gamification, and impact tracking
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient glow on hover */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
