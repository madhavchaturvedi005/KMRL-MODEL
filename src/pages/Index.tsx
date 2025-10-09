import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, Search, Zap, Shield, Users, Brain, FileText, Clock, Target, Play, CheckCircle } from "lucide-react";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 overflow-x-hidden">
      {/* Header */}
      <header className={`container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 transition-all duration-1000 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg">
              <img src="/kmrl-logo.svg" alt="KMRL Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              <span className="hidden sm:inline">KMRL Knowledge Lens</span>
              <span className="sm:hidden">KMRL</span>
            </span>
          </div>
          <Button
            onClick={() => navigate('/login')}
            size="sm"
            className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary-hover text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Access Dashboard</span>
            <span className="sm:hidden">Login</span>
            <ArrowRight className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero Content - Centered */}
          <div className={`space-y-6 sm:space-y-8 transition-all duration-1000 delay-300 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <Badge className="mb-4 sm:mb-6 animate-scale-in shadow-lg w-fit mx-auto" variant="secondary">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="text-xs sm:text-sm">AI-Powered Document Intelligence</span>
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight px-4">
              <span className="bg-gradient-to-r from-primary via-primary-hover to-primary bg-clip-text text-transparent animate-fade-in block">
                Transform Document Chaos
              </span>
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent animate-fade-in-up block">
                Into Clear Intelligence
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              KMRL Knowledge Lens eliminates information overload by automatically processing, summarizing,
              and delivering critical insights from thousands of documents to the right stakeholders.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="text-sm sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary-hover group w-full sm:w-auto"
              >
                Explore Dashboard
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="text-sm sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border-2 hover:bg-accent/50 transition-all duration-300 hover:scale-105 w-full sm:w-auto">
                <Play className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-8 sm:pt-12 border-t border-border/50 max-w-2xl mx-auto">
              {[
                { number: "1000+", label: "Documents Processed" },
                { number: "95%", label: "Time Saved" },
                { number: "24/7", label: "Real-time Processing" }
              ].map((stat, index) => (
                <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${0.8 + index * 0.2}s` }}>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">{stat.number}</div>
                  <div className="text-sm sm:text-base text-muted-foreground leading-tight mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* Solution Overview */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="text-center mb-12 sm:mb-16 relative z-10 animate-fade-in-up">
            <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 w-fit mx-auto">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="text-xs sm:text-sm">Intelligent Solution</span>
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              The KMRL Knowledge Lens Solution
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              An AI-powered platform that automatically delivers rapid, trustworthy, and relevant summaries
              of critical information to every stakeholder.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 relative z-10">
            {[
              {
                icon: FileText,
                title: "Unified Ingestion",
                description: "Automatically collect documents from all sources into a central repository",
                features: ["Email monitoring", "SharePoint sync", "OCR for scans", "WhatsApp integration"],
                color: "blue"
              },
              {
                icon: Brain,
                title: "AI Intelligence",
                description: "Process documents to extract meaning, classify, and summarize content",
                features: ["Auto-classification", "Entity extraction", "Multi-level summaries", "Semantic search"],
                color: "purple"
              },
              {
                icon: Zap,
                title: "Smart Delivery",
                description: "Push relevant information to the right people through personalized dashboards",
                features: ["Role-based views", "Proactive alerts", "Mobile access", "Real-time updates"],
                color: "green"
              },
              {
                icon: Search,
                title: "Full Traceability",
                description: "Maintain clear links to source documents with feedback mechanisms",
                features: ["Source verification", "Audit trails", "Quality feedback", "Continuous learning"],
                color: "orange"
              }
            ].map((solution, index) => (
              <Card key={index} className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all duration-300 hover:scale-105 hover:shadow-xl group">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center space-y-3 sm:space-y-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                      <solution.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base mb-2 text-foreground group-hover:text-primary transition-colors duration-300">{solution.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">{solution.description}</p>
                    </div>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {solution.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-center justify-start">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0" />
                          <span className="text-left">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
          <Badge className="mb-4 sm:mb-6 bg-success/10 text-success border-success/20 w-fit mx-auto">
            <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            <span className="text-xs sm:text-sm">Immediate Impact</span>
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-success to-success/70 bg-clip-text text-transparent">
            Transform Your Operations
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            See immediate improvements across all departments
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {[
            "Instant decision-making with pre-digested summaries",
            "Cross-functional awareness eliminates departmental silos",
            "Automated compliance monitoring reduces legal risks",
            "Permanent institutional knowledge preservation",
            "Eliminate duplicated summarization efforts",
            "Scale operations safely and efficiently"
          ].map((benefit, index) => (
            <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-6 rounded-xl bg-gradient-to-br from-card to-card-hover border border-border/50 hover:border-success/30 transition-all duration-300 hover:scale-105 animate-fade-in-up group shadow-sm hover:shadow-lg" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-success to-success/70 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform mt-0.5">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <p className="text-sm sm:text-base text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">{benefit}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem Statement */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-amber-200/50 dark:border-amber-800/50">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
            <Badge className="mb-4 sm:mb-6 bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700 w-fit mx-auto">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span className="text-xs sm:text-sm">Current Challenges</span>
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              The Silent Productivity Tax
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              KMRL processes thousands of critical documents daily, creating information overload that slows decisions and increases risks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Clock,
                title: "Information Latency",
                description: "Decision-making is slow as managers waste time finding actionable information in lengthy documents."
              },
              {
                icon: Users,
                title: "Siloed Awareness",
                description: "Departments are disconnected, leading to inefficient and sometimes contradictory actions."
              },
              {
                icon: Shield,
                title: "Compliance Exposure",
                description: "Critical regulatory updates are easily missed, creating significant legal and safety risks."
              },
              {
                icon: Brain,
                title: "Knowledge Attrition",
                description: "Valuable expertise is lost when employees leave because it's locked in unsearchable files."
              },
              {
                icon: FileText,
                title: "Duplicated Effort",
                description: "Teams waste time independently creating summaries of the same documents."
              },
              {
                icon: Target,
                title: "Growing Complexity",
                description: "KMRL's expansion will exponentially increase the data burden without proper systems."
              }
            ].map((problem, index) => (
              <Card key={index} className="border-amber-200/50 bg-white/50 hover:bg-amber-50/80 dark:border-amber-700/50 dark:bg-amber-950/10 dark:hover:bg-amber-900/20 transition-all duration-300 hover:scale-105 hover:shadow-lg group backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-800/40 transition-colors duration-300">
                      <problem.icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base mb-2 text-foreground group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors duration-300">{problem.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{problem.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary-hover/20 to-primary/20 rounded-2xl sm:rounded-3xl blur-3xl"></div>
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary-hover text-primary-foreground relative overflow-hidden shadow-2xl border-0 animate-scale-in">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <CardContent className="p-6 sm:p-8 lg:p-12 relative z-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6">
                <img src="/kmrl-logo.svg" alt="KMRL Logo" className="w-full h-full object-contain filter brightness-0 invert" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Ready to Transform Your Document Workflow?</h2>
              <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
                Experience the power of AI-driven document intelligence and eliminate information overload today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/login')}
                  className="text-sm sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group w-full sm:w-auto"
                >
                  Access Your Dashboard
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" className="text-sm sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 w-full sm:w-auto">
                  <Play className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Schedule Demo
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold">99.9%</div>
                  <div className="text-xs sm:text-sm opacity-80">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold">ISO 27001</div>
                  <div className="text-xs sm:text-sm opacity-80">Certified</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold">GDPR</div>
                  <div className="text-xs sm:text-sm opacity-80">Compliant</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-border/50 bg-gradient-to-r from-muted/30 to-muted/10 mt-12 sm:mt-20">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shadow-md">
              <img src="/kmrl-logo.svg" alt="KMRL Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-base sm:text-lg bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              KMRL Knowledge Lens
            </span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Intelligent Document Processing for Modern Organizations
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Powered by Advanced AI • Built for Scale • Secured by Design
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;