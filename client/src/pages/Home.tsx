import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { ArrowRight, Brain, Building2, Palette, TrendingUp, Zap, Target, Users, Sparkles, Download, Leaf, Wind } from "lucide-react";
import { downloadResearchSummary } from "@/lib/pdf-utils";
import ContactForm from "@/components/ContactForm";
import SevaTokenCalculator from "@/components/SevaTokenCalculator";
import LiveChat from "@/components/LiveChat";

export default function Home() {
  const { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation - Ghibli styled */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-ghibli">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl text-primary">AANS</span>
          </div>
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <a href="#overview" onClick={(e) => { e.preventDefault(); document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm font-medium hover:text-primary transition-colors cursor-pointer whitespace-nowrap">Overview</a>
            <a href="#divisions" onClick={(e) => { e.preventDefault(); document.getElementById('divisions')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm font-medium hover:text-primary transition-colors cursor-pointer whitespace-nowrap">Divisions</a>
            <a href="#financials" onClick={(e) => { e.preventDefault(); document.getElementById('financials')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm font-medium hover:text-primary transition-colors cursor-pointer whitespace-nowrap">Financials</a>
            <a href="#advantages" onClick={(e) => { e.preventDefault(); document.getElementById('divisions')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm font-medium hover:text-primary transition-colors cursor-pointer whitespace-nowrap">Advantages</a>
            <a href="#technical" onClick={(e) => { e.preventDefault(); document.getElementById('technical')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm font-medium hover:text-primary transition-colors cursor-pointer whitespace-nowrap">Technical</a>
          </div>
        </div>
      </nav>

      {/* Hero Section - Ghibli aesthetic */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/ghibli-hero-bg.png" 
            alt="Ghibli-style landscape" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/40" />
        </div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 animate-float opacity-60">
          <Leaf className="h-8 w-8 text-ghibli-soft-green" />
        </div>
        <div className="absolute top-40 right-20 animate-float opacity-50" style={{ animationDelay: "1s" }}>
          <Wind className="h-6 w-6 text-ghibli-sky-blue" />
        </div>
        <div className="absolute bottom-32 left-1/4 animate-gentle-sway opacity-40">
          <Sparkles className="h-10 w-10 text-ghibli-soft-pink" />
        </div>

        <div className="relative container py-24 md:py-40 flex flex-col md:flex-row items-center gap-12">
          {/* Left content */}
          <div className="max-w-2xl animate-soft-fade">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 rounded-full px-4 py-1">
              Research Summary
            </Badge>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-foreground leading-tight">
              AANS
            </h1>
            <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-6 text-primary">
              Autonomous AI Neural System
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              India's first three-division conscious AI platform company, making consciousness accessible, measurable, and rewarding for every Indian.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2 btn-ghibli">
                Explore Platform <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={downloadResearchSummary} className="gap-2 rounded-full">
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>

          {/* Right character illustration */}
          <div className="hidden lg:block flex-1 animate-gentle-sway">
            <img 
              src="/ghibli-character-hero.png" 
              alt="Ghibli character" 
              className="w-full max-w-md drop-shadow-lg"
            />
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <img 
            src="/ghibli-wave-divider.png" 
            alt="Wave divider" 
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* Company Overview */}
      <section id="overview" className="py-20 border-b border-border">
        <div className="container">
          <div className="max-w-3xl mb-12 animate-soft-fade">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">Company Overview</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              AANS Private Limited operates three synergistic divisions that transform business operations, consumer wellness, and underground culture through measurable impact and shared values. Founded in 2025 and headquartered in Ahmedabad, Gujarat, the company combines the <strong>Sakshi Manifest</strong> (seven principles of conscious living) with the <strong>Seva Token System</strong> (unified impact measurement currency).
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-3xl text-foreground">₹174 Cr</h3>
                  <p className="text-sm text-muted-foreground">Year 5 Revenue</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Combined revenue across all three divisions with 34% EBITDA margin</p>
            </div>

            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-accent/10">
                  <Target className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-3xl text-foreground">₹5.2L Cr</h3>
                  <p className="text-sm text-muted-foreground">Market Opportunity</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Total addressable market across B2B and B2C segments</p>
            </div>

            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-3xl text-foreground">1,180</h3>
                  <p className="text-sm text-muted-foreground">Team Scale</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Projected headcount by Year 5 across all operations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Divisions */}
      <section id="divisions" className="py-20 bg-muted/20">
        <div className="container">
          <div className="max-w-3xl mb-12 animate-soft-fade">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">Three Synergistic Divisions</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Each division addresses distinct markets while sharing technology, philosophy, and the Seva Token System for cross-brand synergies.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* AVE Division */}
            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-primary/10">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <Badge className="mb-2 bg-primary/20 text-primary border-primary/30 rounded-full">B2B SaaS</Badge>
                  <h3 className="font-display font-bold text-2xl text-foreground">AVE</h3>
                  <p className="text-sm text-muted-foreground">Autonomous Value Engine</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Target Market</h4>
                  <p className="text-sm text-muted-foreground">65 million Indian SMEs (10-250 employees)</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Core Product</h4>
                  <p className="text-sm text-muted-foreground">AI-powered business automation platform with 9 integrated modules</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Year 5 Revenue</h4>
                  <p className="text-2xl font-display font-bold text-primary">₹120 Crores</p>
                </div>
              </div>
            </div>

            {/* Sakshi Division */}
            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-accent/10">
                  <Sparkles className="h-7 w-7 text-accent" />
                </div>
                <div>
                  <Badge className="mb-2 bg-accent/20 text-accent border-accent/30 rounded-full">B2C Wellness</Badge>
                  <h3 className="font-display font-bold text-2xl text-foreground">Sakshi</h3>
                  <p className="text-sm text-muted-foreground">Conscious Living Ecosystem</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Target Market</h4>
                  <p className="text-sm text-muted-foreground">45 million Indian wellness consumers</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Core Product</h4>
                  <p className="text-sm text-muted-foreground">Membership-based wellness ecosystem with 3 tiers and 50+ programs</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Year 5 Revenue</h4>
                  <p className="text-2xl font-display font-bold text-accent">₹42 Crores</p>
                </div>
              </div>
            </div>

            {/* SubCircle Division */}
            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-muted-purple/10">
                  <Palette className="h-7 w-7 text-muted-purple" />
                </div>
                <div>
                  <Badge className="mb-2 bg-muted-purple/20 text-muted-purple border-muted-purple/30 rounded-full">B2C Culture</Badge>
                  <h3 className="font-display font-bold text-2xl text-foreground">SubCircle</h3>
                  <p className="text-sm text-muted-foreground">Creator Economy Platform</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Target Market</h4>
                  <p className="text-sm text-muted-foreground">30 million Indian creators and culture enthusiasts</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Core Product</h4>
                  <p className="text-sm text-muted-foreground">Marketplace platform for cultural creators with 2,000+ products</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Year 5 Revenue</h4>
                  <p className="text-2xl font-display font-bold text-muted-purple">₹12 Crores</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Highlights */}
      <section id="financials" className="py-20 border-b border-border">
        <div className="container">
          <div className="max-w-3xl mb-12 animate-soft-fade">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">Financial Highlights</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Conservative projections based on market research, comparable company analysis, and conservative adoption rates across all three divisions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card-ghibli animate-soft-fade">
              <h3 className="font-display font-bold text-2xl text-foreground mb-6">5-Year Revenue Projection</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground">Year 1</span>
                  <span className="font-bold text-foreground">₹8 Cr</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground">Year 2</span>
                  <span className="font-bold text-foreground">₹22 Cr</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground">Year 3</span>
                  <span className="font-bold text-foreground">₹58 Cr</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground">Year 4</span>
                  <span className="font-bold text-foreground">₹115 Cr</span>
                </div>
                <div className="flex justify-between items-center pt-3 bg-primary/5 px-4 py-3 rounded-lg">
                  <span className="font-semibold text-foreground">Year 5</span>
                  <span className="font-display font-bold text-2xl text-primary">₹174 Cr</span>
                </div>
              </div>
            </div>

            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.1s" }}>
              <h3 className="font-display font-bold text-2xl text-foreground mb-6">Unit Economics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground">AVE LTV:CAC</span>
                  <span className="font-bold text-primary">7:1</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground">Sakshi LTV:CAC</span>
                  <span className="font-bold text-accent">5:1</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground">SubCircle LTV:CAC</span>
                  <span className="font-bold text-muted-purple">4:1</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground">Gross Margin</span>
                  <span className="font-bold text-foreground">72%</span>
                </div>
                <div className="flex justify-between items-center pt-3 bg-primary/5 px-4 py-3 rounded-lg">
                  <span className="font-semibold text-foreground">EBITDA Margin (Y5)</span>
                  <span className="font-display font-bold text-2xl text-primary">34%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Advantages */}
      <section id="advantages" className="py-20 bg-muted/20">
        <div className="container">
          <div className="max-w-3xl mb-12 animate-soft-fade">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">Strategic Advantages</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              AANS combines unique technology, philosophy, and market positioning to create defensible competitive advantages across all three divisions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-ghibli animate-soft-fade">
              <div className="flex gap-4">
                <div className="p-3 rounded-full bg-primary/10 h-fit">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Philosophy-Driven AI</h3>
                  <p className="text-sm text-muted-foreground">All products embed the Sakshi Manifest (7 principles of conscious living) into their core algorithms, creating a unique value proposition that competitors cannot replicate.</p>
                </div>
              </div>
            </div>

            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.1s" }}>
              <div className="flex gap-4">
                <div className="p-3 rounded-full bg-accent/10 h-fit">
                  <Target className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Unified Impact Currency</h3>
                  <p className="text-sm text-muted-foreground">The Seva Token System creates cross-brand synergies and network effects, allowing users to earn and redeem tokens across all three divisions.</p>
                </div>
              </div>
            </div>

            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.2s" }}>
              <div className="flex gap-4">
                <div className="p-3 rounded-full bg-primary/10 h-fit">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Proprietary AI Technology</h3>
                  <p className="text-sm text-muted-foreground">Custom-built NLP and ML models trained on Indian context, languages, and business practices. 40% cheaper to operate than global alternatives.</p>
                </div>
              </div>
            </div>

            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.3s" }}>
              <div className="flex gap-4">
                <div className="p-3 rounded-full bg-accent/10 h-fit">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Founder-Led Execution</h3>
                  <p className="text-sm text-muted-foreground">Experienced founding team with 50+ years combined experience in AI, SaaS, wellness, and creator economy sectors.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seva Token Calculator */}
      <section className="py-20 border-b border-border">
        <div className="container">
          <div className="max-w-3xl mb-12 animate-soft-fade">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">Seva Token Calculator</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Explore how you can earn Seva Tokens across all three divisions and redeem them for rewards and benefits.
            </p>
          </div>
          <SevaTokenCalculator />
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-muted/20">
        <div className="container max-w-2xl">
          <div className="mb-12 animate-soft-fade text-center">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">Get In Touch</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Interested in learning more about AANS? Connect with our team to discuss partnerships, investments, or collaboration opportunities.
            </p>
          </div>
          <div className="card-ghibli">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Live Chat Widget */}
      <LiveChat />

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-display font-bold text-lg text-foreground mb-4">AANS</h3>
              <p className="text-sm text-muted-foreground">Autonomous AI Neural System - Making consciousness accessible, measurable, and rewarding.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Divisions</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/ave" className="hover:text-primary transition-colors">AVE (B2B SaaS)</a></li>
                <li><a href="/sakshi" className="hover:text-primary transition-colors">Sakshi (B2C Wellness)</a></li>
                <li><a href="/subcircle" className="hover:text-primary transition-colors">SubCircle (B2C Culture)</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="/careers" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a></li>
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
