import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone } from "lucide-react";

const CTA = () => {
  return (
    <div className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-5" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-sm border border-border rounded-[2rem] p-12 md:p-16 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-full shadow-lg">
              <Smartphone className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Available on iOS & Android
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Make a{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                Difference?
              </span>
            </h2>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands making kindness their superpower. Scan, tip, volunteer, and see your impact grow.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-lg hover:shadow-xl text-lg px-8 group"
                onClick={() => window.location.href = "/auth"}
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-primary/20 hover:bg-primary/5 text-lg px-8"
                onClick={() => window.location.href = "/scan"}
              >
                Try Scanning
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="pt-8 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Bank-level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                <span>100% Anonymous</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span>No Hidden Fees</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTA;
