import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Palette, Zap, Users, TrendingUp, Leaf, Sparkles, Wind } from "lucide-react";
import { Link } from "wouter";

export default function SubCircle() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation - Ghibli styled */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur shadow-ghibli">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <div className="p-2 rounded-full bg-muted-purple/10">
              <Palette className="h-5 w-5 text-muted-purple" />
            </div>
            <span className="font-display font-bold text-xl text-muted-purple">SubCircle</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Back to Home</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Ghibli aesthetic with creative theme */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-muted-purple/10 via-background to-ghibli-soft-pink/10" />
        
        {/* Floating creative elements */}
        <div className="absolute top-20 left-10 animate-float opacity-40">
          <Sparkles className="h-8 w-8 text-muted-purple" />
        </div>
        <div className="absolute top-40 right-20 animate-float opacity-50" style={{ animationDelay: "1s" }}>
          <Palette className="h-6 w-6 text-ghibli-soft-pink" />
        </div>
        <div className="absolute bottom-32 left-1/3 animate-gentle-sway opacity-40">
          <Wind className="h-10 w-10 text-muted-purple" />
        </div>

        <div className="relative container py-24 md:py-40 flex flex-col md:flex-row items-center gap-12">
          {/* Left content */}
          <div className="max-w-2xl animate-soft-fade">
            <Badge className="mb-4 bg-muted-purple/20 text-muted-purple border-muted-purple/30 rounded-full px-4 py-1">
              B2C Culture & Thrift
            </Badge>
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 text-foreground">
              SubCircle
            </h1>
            <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-6 text-muted-purple">
              Underground Culture & Thrift
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Curated secondhand fashion with stories. Circular economy meets underground culture for the 18-35 creative generation. Every piece has a history, every creator has a voice.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2 btn-ghibli" style={{ background: "var(--muted-purple)", color: "var(--background)" }}>
                Shop Now <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full">
                Explore Community
              </Button>
            </div>
          </div>

          {/* Right character illustration */}
          <div className="hidden lg:block flex-1 animate-gentle-sway">
            <img 
              src="/ghibli-subcircle-character.png" 
              alt="SubCircle creative character" 
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
                <div className="p-3 rounded-full bg-muted-purple/10">
                  <TrendingUp className="h-6 w-6 text-muted-purple" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-3xl text-foreground">₹12 Cr</h3>
                  <p className="text-sm text-muted-foreground">Year 5 Revenue</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Projected revenue with 65% gross margins</p>
            </div>

            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-muted-purple/10">
                  <Users className="h-6 w-6 text-muted-purple" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-3xl text-foreground">30M</h3>
                  <p className="text-sm text-muted-foreground">Target Market</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Indian creators and culture enthusiasts</p>
            </div>

            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-muted-purple/10">
                  <Zap className="h-6 w-6 text-muted-purple" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-3xl text-foreground">4:1</h3>
                  <p className="text-sm text-muted-foreground">LTV:CAC Ratio</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Strong unit economics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-muted/20">
        <div className="container">
          <div className="max-w-3xl mb-12 animate-soft-fade">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">Platform Features</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              SubCircle combines a curated marketplace with community features, enabling creators and collectors to connect, share, and celebrate underground culture.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Curated Marketplace", desc: "Hand-picked secondhand fashion pieces with authentic stories and creator profiles" },
              { title: "Creator Dashboard", desc: "Tools for sellers to manage inventory, track sales, and build their audience" },
              { title: "Community Forum", desc: "Connect with like-minded creators and collectors, share culture and trends" },
              { title: "Story Tagging", desc: "Every piece comes with its story - history, origin, and cultural significance" },
              { title: "Circular Economy", desc: "Trade, resell, and recycle fashion sustainably with environmental tracking" },
              { title: "Events & Meetups", desc: "Organize and attend underground culture events, pop-ups, and collaborations" },
              { title: "Creator Rewards", desc: "Earn Seva Tokens for sales, community engagement, and cultural contributions" },
              { title: "Trend Analytics", desc: "Discover trending pieces, emerging creators, and cultural movements in real-time" },
            ].map((feature, idx) => (
              <div key={idx} className="card-ghibli animate-soft-fade" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="flex gap-4">
                  <div className="p-3 rounded-full bg-muted-purple/10 h-fit">
                    <Sparkles className="h-6 w-6 text-muted-purple" />
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

      {/* Creator Tiers */}
      <section className="py-20 border-b border-border">
        <div className="container">
          <div className="max-w-3xl mb-12 animate-soft-fade">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">Creator Tiers</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Join SubCircle as a creator and grow your audience while celebrating underground culture. Choose the tier that fits your journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Emerging",
                commission: "15%",
                features: [
                  "Basic storefront",
                  "Up to 50 listings",
                  "Community access",
                  "Monthly newsletter",
                  "Basic analytics"
                ]
              },
              {
                name: "Rising Star",
                commission: "10%",
                features: [
                  "Premium storefront",
                  "Unlimited listings",
                  "Featured placement",
                  "Weekly promotion",
                  "Advanced analytics",
                  "Seva Token rewards"
                ],
                highlighted: true
              },
              {
                name: "Icon",
                commission: "5%",
                features: [
                  "VIP storefront",
                  "Unlimited listings",
                  "Priority support",
                  "Exclusive events",
                  "Custom branding",
                  "Premium Seva Tokens",
                  "Revenue sharing"
                ]
              }
            ].map((tier, idx) => (
              <div 
                key={idx} 
                className={`card-ghibli animate-soft-fade transition-all duration-300 ${tier.highlighted ? "ring-2 ring-muted-purple shadow-ghibli-lg scale-105" : ""}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="mb-6">
                  <h3 className="font-display font-bold text-2xl text-foreground mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-bold text-3xl text-foreground">{tier.commission}</span>
                    <span className="text-sm text-muted-foreground">commission</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, fidx) => (
                    <li key={fidx} className="flex gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4 text-muted-purple flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="w-full btn-ghibli rounded-full" style={{ background: "var(--muted-purple)", color: "var(--background)" }}>
                  Join as {tier.name}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Underground Culture */}
      <section className="py-20 bg-muted/20">
        <div className="container">
          <div className="max-w-3xl mb-12 animate-soft-fade">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">Underground Culture Categories</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Explore diverse creative communities and subcultures celebrating authentic expression and artistic freedom.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: "Indie Fashion", desc: "Independent designers and vintage fashion collectors" },
              { name: "Street Art", desc: "Graffiti, street art, and urban culture merchandise" },
              { name: "Music Culture", desc: "Band merch, vinyl records, and music community items" },
              { name: "Gaming & Anime", desc: "Retro gaming, anime, and pop culture collectibles" },
              { name: "DIY & Craft", desc: "Handmade items, zines, and DIY culture products" },
              { name: "Sustainable Fashion", desc: "Eco-conscious and ethical fashion choices" },
              { name: "Subculture Wear", desc: "Goth, punk, emo, and alternative fashion" },
              { name: "Vintage & Retro", desc: "Authentic vintage pieces from past decades" },
            ].map((category, idx) => (
              <div key={idx} className="card-ghibli animate-soft-fade" style={{ animationDelay: `${idx * 0.05}s` }}>
                <h3 className="font-semibold text-foreground mb-2 text-lg">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted-purple/5">
        <div className="container text-center animate-soft-fade">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">Join the Underground</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Whether you're a creator, collector, or culture enthusiast, SubCircle is your platform to celebrate authentic expression and connect with your community.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="gap-2 btn-ghibli" style={{ background: "var(--muted-purple)", color: "var(--background)" }}>
              Start Selling <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full">
              Browse Marketplace
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-display font-bold text-lg text-foreground mb-4">SubCircle</h3>
              <p className="text-sm text-muted-foreground">Underground culture and thrift marketplace for creators.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Marketplace</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Browse</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Sellers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Categories</a></li>
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
