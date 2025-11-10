import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Users, Target, Zap, Shield, TrendingUp, Award } from "lucide-react";

export default function CompanyHome() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="font-bold text-xl">AANS</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/company/about" className="text-sm hover:text-primary transition-colors">About</Link>
            <Link href="/company/management" className="text-sm hover:text-primary transition-colors">Leadership</Link>
            <Link href="/company/contact" className="text-sm hover:text-primary transition-colors">Contact</Link>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        <div className="relative container">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Autonomous AI Neural System</Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              AANS: Conscious AI for Business & Wellness
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Three synergistic divisions transforming how businesses operate, people live, and culture thrives. Built on management wisdom from Drucker, Musk, Buffett, and Bezos.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/company/about">
                <Button size="lg" className="gap-2">
                  Explore Our Mission <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                View Investor Deck
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-20 border-b border-border">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: "Total Projected Revenue (Y5)", value: "₹174 Crores", icon: TrendingUp },
              { label: "Target Market", value: "65M SMEs", icon: Target },
              { label: "Team Size", value: "1,180+ People", icon: Users },
              { label: "Gross Margin", value: "60-85%", icon: Award },
            ].map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <Card key={idx} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="h-6 w-6 text-primary" />
                      <CardDescription className="text-xs">{metric.label}</CardDescription>
                    </div>
                    <CardTitle className="text-3xl">{metric.value}</CardTitle>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Three Divisions */}
      <section className="py-20 bg-card/30 border-b border-border">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12 text-center">Our Three Synergistic Divisions</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "AVE",
                subtitle: "Autonomous Value Engine",
                description: "B2B SaaS automation for 65M Indian SMEs. 9 integrated modules, 80-90% cheaper than competitors.",
                metrics: "₹120 Cr Y5 Revenue",
                link: "/ave"
              },
              {
                name: "Sakshi",
                subtitle: "Conscious Living Ecosystem",
                description: "B2C wellness platform with 7 integrated centers. Meditation, learning, marketplace, and community.",
                metrics: "₹48 Cr Y5 Revenue",
                link: "/sakshi"
              },
              {
                name: "SubCircle",
                subtitle: "Underground Culture & Thrift",
                description: "B2C secondhand fashion with stories. Circular economy meets underground culture for Gen Z.",
                metrics: "₹6 Cr Y5 Revenue",
                link: "/subcircle"
              },
            ].map((division, idx) => (
              <Card key={idx} className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
                <CardHeader>
                  <Badge className="w-fit mb-2">{division.subtitle}</Badge>
                  <CardTitle className="text-3xl">{division.name}</CardTitle>
                  <CardDescription className="text-base mt-2">{division.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-semibold text-primary">{division.metrics}</p>
                  </div>
                  <Link href={division.link}>
                    <Button className="w-full gap-2">
                      Learn More <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-20 border-b border-border">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12">Our Values</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Philosophy-Driven AI",
                desc: "Built on management wisdom from Drucker, Musk, Buffett, Bezos, and Kotler with ESG tracking.",
                icon: "🧠"
              },
              {
                title: "Conscious Business",
                desc: "Creating impact through sustainable practices, employee wellness, and community contribution.",
                icon: "🌱"
              },
              {
                title: "Scalable Innovation",
                desc: "Grow from 10 to 10,000 employees without changing systems or exponential cost increases.",
                icon: "🚀"
              },
              {
                title: "Synergistic Ecosystem",
                desc: "Three divisions working together to serve businesses, individuals, and communities holistically.",
                icon: "🔗"
              },
            ].map((value, idx) => (
              <Card key={idx} className="border-accent/20">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{value.icon}</span>
                    <div>
                      <CardTitle>{value.title}</CardTitle>
                      <CardDescription className="mt-2">{value.desc}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/10">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of businesses, individuals, and communities part of the AANS ecosystem.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <Link href="/company/contact">
              <Button size="lg" variant="outline">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/company/about" className="hover:text-primary">About Us</Link></li>
                <li><Link href="/company/management" className="hover:text-primary">Leadership</Link></li>
                <li><Link href="/company/careers" className="hover:text-primary">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Divisions</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/ave" className="hover:text-primary">AVE</Link></li>
                <li><Link href="/sakshi" className="hover:text-primary">Sakshi</Link></li>
                <li><Link href="/subcircle" className="hover:text-primary">SubCircle</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Use</Link></li>
                <li><Link href="/compliance" className="hover:text-primary">Compliance</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">LinkedIn</a></li>
                <li><a href="#" className="hover:text-primary">Twitter</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 AANS - Autonomous AI Neural System. All rights reserved.</p>
            <p className="mt-2">CIN: [CIN Number] | GSTIN: [GSTIN] | Registered Address: [Address]</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
