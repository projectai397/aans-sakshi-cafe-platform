import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, Zap, Target, TrendingUp, Users, CheckCircle2, Sparkles, Leaf } from "lucide-react";
import { Link } from "wouter";

export default function AVE() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation - Ghibli styled */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur shadow-ghibli">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <div className="p-2 rounded-full bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl text-primary">AVE</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Back to Home</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Ghibli aesthetic */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
        
        {/* Floating decorative elements */}
        <div className="absolute top-20 right-10 animate-float opacity-40">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div className="absolute bottom-32 left-1/4 animate-gentle-sway opacity-30">
          <Zap className="h-10 w-10 text-primary" />
        </div>

        <div className="relative container py-24 md:py-40 flex flex-col md:flex-row items-center gap-12">
          {/* Left content */}
          <div className="max-w-2xl animate-soft-fade">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 rounded-full px-4 py-1">
              B2B SaaS Platform
            </Badge>
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 text-foreground">
              AVE
            </h1>
            <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-6 text-primary">
              Autonomous Value Engine
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              AI-powered business automation for 65 million Indian SMEs. 80-90% cheaper than Zoho/SAP with 90-day implementation guarantee and philosophy-driven ESG tracking.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2 btn-ghibli">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Right character illustration */}
          <div className="hidden lg:block flex-1 animate-gentle-sway">
            <img 
              src="/ghibli-ave-character.png" 
              alt="AVE character" 
              className="w-full max-w-md drop-shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-20 border-b border-border">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card-ghibli animate-soft-fade">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-3xl text-foreground">₹120 Cr</h3>
                  <p className="text-sm text-muted-foreground">Year 5 Revenue</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Projected revenue with 85% gross margins</p>
            </div>

            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-3xl text-foreground">65M</h3>
                  <p className="text-sm text-muted-foreground">Market Size (SMEs)</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Total addressable market in India</p>
            </div>

            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-3xl text-foreground">7:1</h3>
                  <p className="text-sm text-muted-foreground">LTV:CAC Ratio</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Highly efficient unit economics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-muted/20">
        <div className="container">
          <div className="max-w-3xl mb-12 animate-soft-fade">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">Core Features</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              AVE combines 9 integrated modules with philosophy-driven AI to deliver comprehensive business automation that's affordable and accessible for Indian SMEs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "CRM & Sales", desc: "Lead management, pipeline tracking, and sales forecasting with AI insights" },
              { title: "Inventory & Supply Chain", desc: "Real-time inventory tracking, supplier management, and demand forecasting" },
              { title: "Financial Management", desc: "Invoicing, expense tracking, and financial reporting with compliance" },
              { title: "HR & Payroll", desc: "Employee management, attendance, leave tracking, and automated payroll" },
              { title: "Project Management", desc: "Task tracking, team collaboration, and resource allocation" },
              { title: "Customer Support", desc: "Ticket management, knowledge base, and customer satisfaction tracking" },
              { title: "Analytics & Reporting", desc: "Custom dashboards, real-time KPIs, and predictive analytics" },
              { title: "Philosophy-Driven ESG", desc: "Track environmental and social impact aligned with Sakshi Manifest" },
            ].map((feature, idx) => (
              <div key={idx} className="card-ghibli animate-soft-fade" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="flex gap-4">
                  <div className="p-3 rounded-full bg-primary/10 h-fit">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Advantage */}
      <section className="py-20 border-b border-border">
        <div className="container">
          <div className="max-w-3xl mb-12 animate-soft-fade">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">Why Choose AVE?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              AVE stands out from competitors with unique advantages tailored for Indian businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card-ghibli animate-soft-fade">
              <h3 className="font-display font-bold text-2xl text-foreground mb-4">80-90% Cheaper</h3>
              <p className="text-muted-foreground mb-4">Compared to Zoho, SAP, and other enterprise solutions, AVE delivers the same functionality at a fraction of the cost.</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> No hidden fees or setup costs</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> Flexible pricing per module</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> Free training and onboarding</li>
              </ul>
            </div>

            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.1s" }}>
              <h3 className="font-display font-bold text-2xl text-foreground mb-4">90-Day Implementation</h3>
              <p className="text-muted-foreground mb-4">We guarantee full implementation and training within 90 days, with dedicated support throughout.</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> Dedicated implementation team</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> Data migration included</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> 24/7 support during transition</li>
              </ul>
            </div>

            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.2s" }}>
              <h3 className="font-display font-bold text-2xl text-foreground mb-4">Philosophy-Driven AI</h3>
              <p className="text-muted-foreground mb-4">Built on the Sakshi Manifest, AVE's AI makes decisions aligned with conscious business principles.</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> ESG impact tracking</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> Ethical decision-making</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> Seva Token integration</li>
              </ul>
            </div>

            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.3s" }}>
              <h3 className="font-display font-bold text-2xl text-foreground mb-4">Indian Context</h3>
              <p className="text-muted-foreground mb-4">Built specifically for Indian businesses with support for local languages, compliance, and payment methods.</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> GST compliance built-in</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> Multi-language support</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> Local payment gateways</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container text-center animate-soft-fade">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">Ready to Transform Your Business?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of Indian SMEs already using AVE to automate their operations and focus on growth.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="gap-2 btn-ghibli">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-display font-bold text-lg text-foreground mb-4">AVE</h3>
              <p className="text-sm text-muted-foreground">AI-powered business automation for Indian SMEs.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="/" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="/" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 AANS Full Pvt. Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
