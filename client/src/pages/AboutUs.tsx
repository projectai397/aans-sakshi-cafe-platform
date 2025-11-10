import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function AboutUs() {
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
            <Button variant="ghost" size="sm">Back to Home</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <Badge className="mb-4">About AANS</Badge>
          <h1 className="text-5xl font-bold mb-6">About AANS</h1>
          <p className="text-xl text-muted-foreground">
            AANS (Autonomous AI Neural System) is a philosophy-driven technology company transforming how businesses operate, people live, and culture thrives through three synergistic divisions.
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To create a world where conscious AI empowers businesses to scale sustainably, individuals to live with purpose, and communities to thrive through shared values and impact-driven innovation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To build an integrated ecosystem of AI-powered solutions that serve 65M Indian SMEs, transform wellness consciousness, and celebrate underground culture—all while maintaining philosophical integrity and environmental stewardship.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-card/30 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Our Core Values</h2>
          
          <div className="space-y-6">
            {[
              {
                title: "Philosophy-Driven Innovation",
                desc: "Every feature is built on management wisdom from Drucker, Musk, Buffett, Bezos, and Kotler. We believe technology should serve human wisdom, not replace it."
              },
              {
                title: "Conscious Business",
                desc: "Profitability and purpose go hand-in-hand. We track ESG metrics, employee wellness, and community impact as seriously as financial returns."
              },
              {
                title: "Scalable Simplicity",
                desc: "Our systems grow from 10 to 10,000 employees without exponential cost increases or system changes. Simplicity is our competitive advantage."
              },
              {
                title: "Synergistic Ecosystem",
                desc: "AVE, Sakshi, and SubCircle are not separate businesses—they're three expressions of one philosophy. Cross-division benefits create exponential value."
              },
              {
                title: "Transparency & Governance",
                desc: "We operate with full transparency in our financial reporting, corporate governance, and decision-making processes. Stakeholder trust is non-negotiable."
              },
              {
                title: "Impact Measurement",
                desc: "Every initiative is measured for business impact, employee wellness impact, and community impact. What gets measured gets managed."
              },
            ].map((value, idx) => (
              <div key={idx} className="flex gap-4 p-6 border border-border rounded-lg hover:border-primary/40 transition-colors">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founding Story */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-8">Our Founding Story</h2>
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p>
              AANS was founded on the belief that conscious AI could solve three critical problems in the Indian economy: SME business inefficiency, individual wellness crisis, and cultural erosion among youth.
            </p>
            
            <p>
              Our founder observed that while global companies like Zoho and SAP dominated enterprise software, they were too expensive and complex for India's 65 million SMEs. Simultaneously, wellness seekers were paying premium prices for fragmented services, and Gen Z was losing connection to authentic culture.
            </p>
            
            <p>
              Rather than build three separate companies, we created one integrated ecosystem where:
            </p>
            
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>AVE</strong> automates business operations, freeing entrepreneurs to focus on strategy and growth</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>Sakshi</strong> helps employees and entrepreneurs achieve wellness and conscious living</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span><strong>SubCircle</strong> celebrates culture and sustainability for the next generation</span>
              </li>
            </ul>
            
            <p>
              The three divisions create synergies: AVE customers get Sakshi wellness benefits for employees. Sakshi members get SubCircle cultural experiences. SubCircle creators get AVE business tools. One ecosystem, three expressions, infinite possibilities.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership Message */}
      <section className="py-20 bg-card/30 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-8">Founder's Message</h2>
          
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                  👤
                </div>
                <div>
                  <CardTitle>Founder & CEO</CardTitle>
                  <CardDescription>AANS - Autonomous AI Neural System</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed text-muted-foreground italic">
                "We're not building another software company. We're building a movement. A movement where conscious AI serves human wisdom, where business success includes employee wellness, and where technology celebrates culture instead of erasing it. AANS is our answer to the question: What if business could be both profitable and purposeful?"
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Legal Details */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-8">Legal & Corporate Details</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: "CIN Number", value: "[CIN Number]" },
              { label: "GSTIN", value: "[GSTIN Number]" },
              { label: "PAN", value: "[PAN Number]" },
              { label: "Company Type", value: "Private Limited Company" },
              { label: "Registered Address", value: "[Full Address with City, State, PIN]" },
              { label: "Incorporation Date", value: "[Date of Incorporation]" },
              { label: "Financial Year", value: "April - March" },
              { label: "Auditor", value: "[Auditor Name & Firm]" },
            ].map((detail, idx) => (
              <Card key={idx} className="border-border">
                <CardHeader>
                  <CardDescription className="text-xs">{detail.label}</CardDescription>
                  <CardTitle className="text-lg">{detail.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/10">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Learn More About Our Divisions</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore how AVE, Sakshi, and SubCircle are transforming business, wellness, and culture.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/ave">
              <Button className="gap-2">
                AVE <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sakshi">
              <Button variant="outline" className="gap-2">
                Sakshi <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/subcircle">
              <Button variant="outline" className="gap-2">
                SubCircle <ArrowRight className="h-4 w-4" />
              </Button>
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
