import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, FileText, Target, Users, CheckCircle2 } from "lucide-react";


const Landing = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/builder");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="editorial-heading text-xl font-semibold tracking-tight">
            Career Card
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/builder")} size="sm">
                Go to Builder
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => navigate("/auth")} size="sm">
                Get Started
              </Button>
            )}
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4 text-accent" />
              Professional Career Profiles
            </div>
            <h1 className="editorial-heading text-5xl lg:text-6xl font-semibold leading-[1.1] text-foreground">
              Showcase your career story beautifully
            </h1>
            <p className="editorial-body text-lg text-muted-foreground max-w-2xl mx-auto">
              Create stunning, professional career cards that highlight your experience, 
              projects, and unique value. Stand out to recruiters with a polished, 
              shareable portfolio.
            </p>
            <Button size="lg" onClick={handleGetStarted} className="h-12 px-8">
              Create Your Card
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="editorial-heading text-3xl lg:text-4xl font-semibold text-foreground mb-4">
              Everything you need to stand out
            </h2>
            <p className="editorial-body text-muted-foreground max-w-2xl mx-auto">
              Our career card builder provides all the tools to create a compelling professional narrative.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={FileText}
              title="Rich Sections"
              description="Capture your complete professional story with dedicated sections for experience, projects, impacts, frameworks, and more."
            />
            <FeatureCard 
              icon={Target}
              title="AI-Powered Scoring"
              description="Get instant feedback on how well your career card matches specific roles with our intelligent scoring system."
            />
            <FeatureCard 
              icon={Users}
              title="Shareable Profiles"
              description="Export as PDF or share via link. Your career card is always accessible and professionally formatted."
            />
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="vesper-card p-8 space-y-6">
                <h3 className="editorial-heading text-2xl font-semibold">Card Sections</h3>
                <div className="space-y-4">
                  {[
                    "Professional profile & summary",
                    "Work experience timeline",
                    "Featured projects with details",
                    "Greatest career impacts",
                    "Preferred work styles",
                    "Technical frameworks & tools",
                    "Self-learning & hobbies",
                    "Code showcase snippets"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                      <span className="editorial-body text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="editorial-heading text-3xl lg:text-4xl font-semibold text-foreground">
                A complete picture of your professional identity
              </h2>
              <p className="editorial-body text-lg text-muted-foreground">
                Go beyond the traditional resume. Career cards let you showcase not just 
                what you've done, but how you work, what drives you, and where you excel.
              </p>
              <p className="editorial-body text-muted-foreground">
                Whether you're a developer showcasing code, a designer highlighting projects, 
                or a leader demonstrating impact—your career card tells the full story.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-foreground text-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="editorial-heading text-3xl lg:text-4xl font-semibold mb-6">
            Ready to create your career card?
          </h2>
          <p className="editorial-body text-lg opacity-80 mb-8 max-w-xl mx-auto">
            Join professionals who are standing out with beautifully crafted career profiles.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={handleGetStarted}
            className="h-12 px-8"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="editorial-heading text-lg font-medium">Career Card</div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Career Card. Build your professional story.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) => (
  <div className="vesper-card p-8 space-y-4">
    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
      <Icon className="h-6 w-6 text-accent" />
    </div>
    <h3 className="editorial-heading text-xl font-semibold text-foreground">{title}</h3>
    <p className="editorial-body text-muted-foreground">{description}</p>
  </div>
);

export default Landing;
