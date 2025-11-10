import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Target, TrendingUp, Users, Zap, Award, BarChart3 } from "lucide-react";

export default function Marketing() {
  const services = [
    {
      title: "AVE - Business Automation",
      description: "9 integrated modules for SME business automation with 80-90% cost advantage",
      icon: "⚙️"
    },
    {
      title: "Sakshi - Wellness Ecosystem",
      description: "7 integrated centers for conscious living, meditation, learning, and community",
      icon: "🧘"
    },
    {
      title: "SubCircle - Culture & Thrift",
      description: "Secondhand fashion platform celebrating underground culture and sustainability",
      icon: "👕"
    },
  ];

  const caseStudies = [
    {
      title: "SME Automation Success",
      company: "Manufacturing Company",
      challenge: "Manual processes causing 40% operational inefficiency",
      solution: "Implemented AVE's 9 modules for end-to-end automation",
      result: "60% efficiency improvement, ₹50L annual savings"
    },
    {
      title: "Employee Wellness Program",
      company: "Tech Startup",
      challenge: "High employee burnout and attrition rates",
      solution: "Integrated Sakshi wellness ecosystem for employee wellness",
      result: "35% reduction in attrition, 45% improvement in engagement"
    },
    {
      title: "Sustainable Fashion Launch",
      company: "Fashion Retailer",
      challenge: "Need for sustainable, circular economy model",
      solution: "Partnered with SubCircle for secondhand marketplace",
      result: "20% revenue from sustainable channel, strong Gen Z engagement"
    },
  ];

  const marketSegments = [
    { segment: "SME Automation (AVE)", size: "65M SMEs in India", potential: "₹120 Cr Y5" },
    { segment: "Wellness Seekers (Sakshi)", size: "500M+ individuals", potential: "₹48 Cr Y5" },
    { segment: "Gen Z Consumers (SubCircle)", size: "200M+ Gen Z", potential: "₹6 Cr Y5" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/company" className="flex items-center gap-2 hover:opacity-80">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="font-bold text-xl">AANS</span>
          </Link>
          <Link href="/company">
            <Button variant="ghost" size="sm">Back</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <Badge className="mb-4">Marketing & Sales</Badge>
          <h1 className="text-5xl font-bold mb-6">Brand & Growth Strategy</h1>
          <p className="text-xl text-muted-foreground">
            Driving growth across three synergistic divisions with data-driven marketing and customer-centric sales strategies.
          </p>
        </div>
      </section>

      {/* Brand Strategy */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Brand & Growth Strategy</h2>
          
          <div className="space-y-6">
            {[
              {
                title: "Philosophy-Driven Positioning",
                desc: "AANS is positioned as the conscious AI platform that serves businesses, individuals, and communities with integrity and purpose."
              },
              {
                title: "Market Expansion",
                desc: "Aggressive expansion across India's SME market (65M potential customers) while building wellness and culture communities."
              },
              {
                title: "Customer Acquisition",
                desc: "Multi-channel acquisition strategy combining digital marketing, partnerships, and community-driven growth."
              },
              {
                title: "Retention & Expansion",
                desc: "Focus on customer lifetime value through cross-division synergies and continuous innovation."
              },
              {
                title: "Brand Partnerships",
                desc: "Strategic partnerships with complementary brands to expand reach and create ecosystem value."
              },
            ].map((item, idx) => (
              <Card key={idx} className="border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services & Products */}
      <section className="py-20 bg-card/30 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Services & Products</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <Card key={idx} className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription className="mt-2">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={service.title.includes("AVE") ? "/ave" : service.title.includes("Sakshi") ? "/sakshi" : "/subcircle"}>
                    <Button className="w-full gap-2" size="sm">
                      Learn More <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Digital Marketing */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Digital Marketing Strategy</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Search Engine Optimization (SEO)",
                tactics: ["Keyword research & optimization", "Content marketing", "Technical SEO", "Link building"]
              },
              {
                title: "Paid Advertising",
                tactics: ["Google Ads campaigns", "Meta/Facebook advertising", "LinkedIn B2B campaigns", "Retargeting campaigns"]
              },
              {
                title: "Email Marketing",
                tactics: ["Newsletter campaigns", "Segmented messaging", "Automation workflows", "Personalization"]
              },
              {
                title: "Social Media Marketing",
                tactics: ["Content calendar management", "Community engagement", "Influencer partnerships", "Social listening"]
              },
            ].map((channel, idx) => (
              <Card key={idx} className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    {channel.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {channel.tactics.map((tactic, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-primary">•</span> {tactic}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Market Segments */}
      <section className="py-20 bg-card/30 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Market Segments Served</h2>
          
          <div className="space-y-4">
            {marketSegments.map((market, idx) => (
              <Card key={idx} className="border-accent/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{market.segment}</CardTitle>
                      <CardDescription className="mt-2">Market Size: {market.size}</CardDescription>
                    </div>
                    <Badge className="bg-primary/20 text-primary">{market.potential}</Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Case Studies & Success Stories</h2>
          
          <div className="space-y-6">
            {caseStudies.map((study, idx) => (
              <Card key={idx} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{study.title}</CardTitle>
                      <CardDescription className="mt-2">{study.company}</CardDescription>
                    </div>
                    <Award className="h-6 w-6 text-primary flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Challenge</h4>
                    <p className="text-sm text-muted-foreground">{study.challenge}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Solution</h4>
                    <p className="text-sm text-muted-foreground">{study.solution}</p>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <h4 className="font-semibold text-sm mb-1 text-green-500">Result</h4>
                    <p className="text-sm text-green-500">{study.result}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partner & Channel Program */}
      <section className="py-20 bg-card/30 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Partner & Channel Program</h2>
          
          <Card className="border-primary/20 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Partnership Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Technology Partners</h4>
                <p className="text-sm text-muted-foreground">Integration partnerships with complementary SaaS platforms and service providers.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Channel Partners</h4>
                <p className="text-sm text-muted-foreground">Reseller and distribution partnerships to expand market reach and customer base.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Strategic Alliances</h4>
                <p className="text-sm text-muted-foreground">Co-marketing and co-selling agreements with strategic partners for mutual growth.</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Partner Benefits",
                items: ["Revenue sharing model", "Marketing support", "Technical training", "Dedicated partner manager"]
              },
              {
                title: "Partner Requirements",
                items: ["Minimum sales targets", "Customer support commitment", "Brand compliance", "Regular reporting"]
              },
            ].map((section, idx) => (
              <Card key={idx} className="border-accent/20">
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-primary">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Marketing Materials */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Downloadable Marketing Materials</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Company Profile", desc: "Overview of AANS and its three divisions", icon: "📄" },
              { title: "Marketing Deck", desc: "Comprehensive presentation for investors and partners", icon: "📊" },
              { title: "Product Brochure", desc: "Detailed features and benefits of each division", icon: "📋" },
              { title: "Case Studies PDF", desc: "Detailed success stories and client testimonials", icon: "🏆" },
            ].map((material, idx) => (
              <Card key={idx} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{material.title}</CardTitle>
                      <CardDescription className="mt-2">{material.desc}</CardDescription>
                    </div>
                    <span className="text-3xl">{material.icon}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button size="sm" className="w-full gap-2">
                    <ArrowRight className="h-4 w-4" /> Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/10">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Become a Partner</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our growing network of partners and drive growth together.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button className="gap-2">
              Partner With Us <ArrowRight className="h-4 w-4" />
            </Button>
            <Link href="/company/contact">
              <Button variant="outline">Contact Sales</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 AANS - Autonomous AI Neural System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
