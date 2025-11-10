import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Heart, Zap, Users, Sparkles, TrendingUp, Leaf, Wind, Flower2 } from "lucide-react";
import { Link } from "wouter";

export default function Sakshi() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation - Ghibli styled */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur shadow-ghibli">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <div className="p-2 rounded-full bg-accent/10">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <span className="font-display font-bold text-xl text-accent">Sakshi</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Back to Home</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Ghibli aesthetic with nature theme */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-ghibli-soft-green/10" />
        
        {/* Floating nature elements */}
        <div className="absolute top-20 left-10 animate-float opacity-40">
          <Leaf className="h-8 w-8 text-ghibli-soft-green" />
        </div>
        <div className="absolute top-40 right-20 animate-float opacity-50" style={{ animationDelay: "1s" }}>
          <Flower2 className="h-6 w-6 text-accent" />
        </div>
        <div className="absolute bottom-32 left-1/3 animate-gentle-sway opacity-40">
          <Wind className="h-10 w-10 text-ghibli-sky-blue" />
        </div>

        <div className="relative container py-24 md:py-40 flex flex-col md:flex-row items-center gap-12">
          {/* Left content */}
          <div className="max-w-2xl animate-soft-fade">
            <Badge className="mb-4 bg-accent/20 text-accent border-accent/30 rounded-full px-4 py-1">
              B2C Wellness
            </Badge>
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 text-foreground">
              Sakshi
            </h1>
            <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-6 text-accent">
              Conscious Living Ecosystem
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Experience the Sakshi Manifest through 7 integrated centers: Cafe, Oasis, Meditation, Learning, Marketplace, Community, and Events. Transform your wellness journey with conscious living.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2 btn-ghibli" style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>
                Book Your Experience <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full">
                Explore Centers
              </Button>
            </div>
          </div>

          {/* Right character illustration */}
          <div className="hidden lg:block flex-1 animate-gentle-sway">
            <img 
              src="/ghibli-sakshi-character.png" 
              alt="Sakshi wellness character" 
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
                <div className="p-3 rounded-full bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-3xl text-foreground">₹42 Cr</h3>
                  <p className="text-sm text-muted-foreground">Year 5 Revenue</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Projected revenue with 68% gross margins</p>
            </div>

            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-accent/10">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-3xl text-foreground">45M</h3>
                  <p className="text-sm text-muted-foreground">Target Market</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Indian wellness consumers seeking conscious living</p>
            </div>

            <div className="card-ghibli animate-soft-fade" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-accent/10">
                  <Heart className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-3xl text-foreground">5:1</h3>
                  <p className="text-sm text-muted-foreground">LTV:CAC Ratio</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Highly efficient unit economics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Seven Centers */}
      <section className="py-20 bg-muted/20">
        <div className="container">
          <div className="max-w-3xl mb-12 animate-soft-fade">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">Seven Conscious Centers</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Each center embodies one principle of the Sakshi Manifest, creating an integrated ecosystem for conscious living and wellness.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { 
                title: "Cafe", 
                principle: "Nourishment",
                desc: "Organic, locally-sourced cafe serving conscious cuisine with mindful eating experiences" 
              },
              { 
                title: "Oasis", 
                principle: "Rejuvenation",
                desc: "Spa and wellness center offering holistic treatments, yoga, and energy healing" 
              },
              { 
                title: "Meditation", 
                principle: "Inner Peace",
                desc: "Dedicated meditation halls with guided sessions, sound baths, and breathwork" 
              },
              { 
                title: "Learning", 
                principle: "Growth",
                desc: "Educational hub offering courses in wellness, philosophy, and conscious living" 
              },
              { 
                title: "Marketplace", 
                principle: "Exchange",
                desc: "Curated marketplace for conscious products, wellness goods, and handmade crafts" 
              },
              { 
                title: "Community", 
                principle: "Connection",
                desc: "Social hub for members to connect, share experiences, and build relationships" 
              },
              { 
                title: "Events", 
                principle: "Celebration",
                desc: "Host workshops, retreats, festivals, and cultural events celebrating conscious living" 
              },
              { 
                title: "Seva", 
                principle: "Service",
                desc: "Volunteer programs and community service initiatives aligned with social impact" 
              },
            ].map((center, idx) => (
              <div key={idx} className="card-ghibli animate-soft-fade" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="mb-4">
                  <Badge className="bg-accent/20 text-accent border-accent/30 rounded-full mb-2">
                    {center.principle}
                  </Badge>
                  <h3 className="font-display font-bold text-2xl text-foreground">{center.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{center.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-20 border-b border-border">
        <div className="container">
          <div className="max-w-3xl mb-12 animate-soft-fade">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">Membership Tiers</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Choose the membership that aligns with your wellness journey and conscious living goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Essential",
                price: "₹999",
                period: "/month",
                features: [
                  "Access to all 7 centers",
                  "2 visits per week",
                  "Monthly group sessions",
                  "Marketplace 10% discount",
                  "Community access"
                ],
                color: "primary"
              },
              {
                name: "Premium",
                price: "₹2,499",
                period: "/month",
                features: [
                  "Unlimited center access",
                  "Priority booking",
                  "Weekly 1-on-1 sessions",
                  "Marketplace 20% discount",
                  "Event priority access",
                  "Seva Token rewards"
                ],
                color: "accent",
                highlighted: true
              },
              {
                name: "Elite",
                price: "₹4,999",
                period: "/month",
                features: [
                  "VIP center access",
                  "24/7 concierge support",
                  "Personalized wellness plan",
                  "Marketplace 30% discount",
                  "Exclusive events & retreats",
                  "Premium Seva Tokens",
                  "Lifetime membership option"
                ],
                color: "primary"
              }
            ].map((tier, idx) => (
              <div 
                key={idx} 
                className={`card-ghibli animate-soft-fade transition-all duration-300 ${tier.highlighted ? "ring-2 ring-accent shadow-ghibli-lg scale-105" : ""}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="mb-6">
                  <h3 className="font-display font-bold text-2xl text-foreground mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-bold text-4xl text-foreground">{tier.price}</span>
                    <span className="text-sm text-muted-foreground">{tier.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, fidx) => (
                    <li key={fidx} className="flex gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="w-full btn-ghibli rounded-full">
                  Choose {tier.name}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sakshi Manifest */}
      <section className="py-20 bg-muted/20">
        <div className="container">
          <div className="max-w-3xl mb-12 animate-soft-fade">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">The Sakshi Manifest</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Seven principles of conscious living that guide every aspect of Sakshi and create a foundation for wellness and personal growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { num: "1", title: "Awareness", desc: "Cultivate mindfulness and consciousness in every moment" },
              { num: "2", title: "Authenticity", desc: "Live true to your values and genuine self" },
              { num: "3", title: "Balance", desc: "Harmonize body, mind, spirit, and community" },
              { num: "4", title: "Compassion", desc: "Practice kindness toward self and others" },
              { num: "5", title: "Contribution", desc: "Give back to community and society" },
              { num: "6", title: "Continuity", desc: "Build sustainable practices for long-term wellness" },
              { num: "7", title: "Connection", desc: "Foster deep relationships with people and nature" },
            ].map((principle, idx) => (
              <div key={idx} className="card-ghibli animate-soft-fade" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="flex gap-4">
                  <div className="p-3 rounded-full bg-accent/10 h-fit">
                    <span className="font-display font-bold text-xl text-accent">{principle.num}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{principle.title}</h3>
                    <p className="text-sm text-muted-foreground">{principle.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent/5">
        <div className="container text-center animate-soft-fade">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground">Begin Your Conscious Journey</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of members transforming their lives through conscious living and integrated wellness.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="gap-2 btn-ghibli" style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>
              Book Your Experience <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full">
              Schedule Tour
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-display font-bold text-lg text-foreground mb-4">Sakshi</h3>
              <p className="text-sm text-muted-foreground">Conscious living ecosystem for wellness and personal growth.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Centers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Cafe</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Oasis</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Meditation</a></li>
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
