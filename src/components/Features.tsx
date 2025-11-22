import { QrCode, Heart, Gift, Shield, Globe, Sparkles } from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "Instant QR Scanning",
    description: "Simply scan a QR code to tip service workers in seconds. No apps to download, no accounts needed.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Shield,
    title: "100% Anonymous",
    description: "Your identity stays private. Support your community without revealing personal information.",
    gradient: "from-secondary to-accent",
  },
  {
    icon: Gift,
    title: "Earn Rewards",
    description: "Every tip you give earns you rewards. The more you contribute, the more you unlock.",
    gradient: "from-accent to-primary",
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Connected across 850+ cities worldwide. Your kindness travels beyond borders.",
    gradient: "from-primary to-accent",
  },
  {
    icon: Heart,
    title: "Community Impact",
    description: "See real-time impact of your contributions. Watch communities thrive together.",
    gradient: "from-secondary to-primary",
  },
  {
    icon: Sparkles,
    title: "Seamless Experience",
    description: "Beautiful, intuitive design that makes giving back feel natural and joyful.",
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
              CityCareConnect
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            More than just tipping—it's about building connections and nurturing communities
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
