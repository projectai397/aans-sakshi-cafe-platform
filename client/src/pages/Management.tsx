import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Users, Shield, BookOpen, ArrowRight } from "lucide-react";

export default function Management() {
  const boardMembers = [
    {
      name: "Founder & CEO",
      title: "Visionary Leader",
      bio: "Philosophy-driven entrepreneur with 20+ years in business automation and conscious capitalism.",
      expertise: ["Strategy", "Philosophy", "Business Model"]
    },
    {
      name: "Independent Director 1",
      title: "Corporate Governance Expert",
      bio: "Former CFO of Fortune 500 company with expertise in compliance and corporate governance.",
      expertise: ["Finance", "Governance", "Compliance"]
    },
    {
      name: "Independent Director 2",
      title: "Technology Visionary",
      bio: "AI researcher and entrepreneur with deep expertise in machine learning and scalable systems.",
      expertise: ["AI/ML", "Technology", "Innovation"]
    },
  ];

  const leadershipTeam = [
    {
      name: "Chief Executive Officer (CEO)",
      division: "Overall",
      responsibilities: ["Strategic direction", "Board liaison", "Stakeholder relations", "Overall performance"]
    },
    {
      name: "Chief Financial Officer (CFO)",
      division: "Finance",
      responsibilities: ["Financial planning", "Audit management", "Investor relations", "Compliance"]
    },
    {
      name: "Chief Marketing Officer (CMO)",
      division: "Marketing & Sales",
      responsibilities: ["Brand strategy", "Growth marketing", "Sales pipeline", "Market expansion"]
    },
    {
      name: "Chief Technology Officer (CTO)",
      division: "Technology",
      responsibilities: ["Tech architecture", "AI/ML strategy", "Infrastructure", "Security"]
    },
    {
      name: "Chief Human Resources Officer (CHRO)",
      division: "Human Resources",
      responsibilities: ["Talent acquisition", "Culture development", "Employee wellness", "Compliance"]
    },
    {
      name: "Chief Operations Officer (COO)",
      division: "Operations",
      responsibilities: ["Process optimization", "Supply chain", "Quality assurance", "Efficiency"]
    },
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
          <Badge className="mb-4">Management & Governance</Badge>
          <h1 className="text-5xl font-bold mb-6">Leadership & Governance</h1>
          <p className="text-xl text-muted-foreground">
            Transparent, professional leadership committed to corporate governance excellence and stakeholder value creation.
          </p>
        </div>
      </section>

      {/* Board of Directors */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Board of Directors</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {boardMembers.map((member, idx) => (
              <Card key={idx} className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl mb-4">
                    👤
                  </div>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription className="text-base">{member.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{member.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((exp, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-card/30 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Executive Leadership Team</h2>
          
          <div className="space-y-4">
            {leadershipTeam.map((leader, idx) => (
              <Card key={idx} className="border-accent/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{leader.name}</CardTitle>
                      <CardDescription>{leader.division}</CardDescription>
                    </div>
                    <Badge variant="outline">{leader.division}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Key Responsibilities:</h4>
                      <ul className="space-y-1">
                        {leader.responsibilities.map((resp, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex gap-2">
                            <span className="text-primary">•</span> {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Organizational Structure */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-8">Organizational Structure</h2>
          
          <Card className="border-primary/20 p-8">
            <div className="space-y-8">
              {/* CEO Level */}
              <div className="text-center">
                <div className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold mb-4">
                  Chief Executive Officer (CEO)
                </div>
              </div>

              {/* Dividing Line */}
              <div className="flex justify-center">
                <div className="w-1 h-8 bg-primary/30"></div>
              </div>

              {/* Department Heads */}
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: "Finance & Accounting", icon: "💰" },
                  { title: "Marketing & Sales", icon: "📈" },
                  { title: "Technology & Operations", icon: "⚙️" },
                ].map((dept, idx) => (
                  <div key={idx} className="text-center">
                    <div className="inline-block bg-accent/20 border border-accent/40 px-6 py-3 rounded-lg font-semibold">
                      <span className="mr-2">{dept.icon}</span> {dept.title}
                    </div>
                  </div>
                ))}
              </div>

              {/* Dividing Line */}
              <div className="flex justify-center">
                <div className="w-1 h-8 bg-primary/30"></div>
              </div>

              {/* Teams */}
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: "HR & Culture", dept: "Finance" },
                  { name: "Compliance & Legal", dept: "Finance" },
                  { name: "Product & Engineering", dept: "Technology" },
                  { name: "Infrastructure & Security", dept: "Technology" },
                  { name: "Brand & Communications", dept: "Marketing" },
                  { name: "Sales & Partnerships", dept: "Marketing" },
                ].map((team, idx) => (
                  <div key={idx} className="text-center">
                    <div className="inline-block bg-card border border-border px-4 py-2 rounded text-sm">
                      {team.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Corporate Governance */}
      <section className="py-20 bg-card/30 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Corporate Governance Framework</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Board Committees",
                items: [
                  "Audit Committee",
                  "Compensation Committee",
                  "Governance Committee",
                  "Risk Management Committee"
                ]
              },
              {
                title: "Governance Policies",
                items: [
                  "Board Charter",
                  "Committee Charters",
                  "Code of Conduct",
                  "Whistleblower Policy"
                ]
              },
              {
                title: "Compliance & Risk",
                items: [
                  "Risk Management Framework",
                  "Internal Audit",
                  "External Audit",
                  "Regulatory Compliance"
                ]
              },
              {
                title: "Transparency & Reporting",
                items: [
                  "Annual Reports",
                  "Financial Statements",
                  "Governance Reports",
                  "ESG Reporting"
                ]
              },
            ].map((section, idx) => (
              <Card key={idx} className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    {section.title}
                  </CardTitle>
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

      {/* Code of Conduct */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-8">Code of Conduct</h2>
          
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Our Ethical Standards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    title: "Integrity & Honesty",
                    desc: "We conduct business with integrity, honesty, and transparency in all dealings with stakeholders."
                  },
                  {
                    title: "Respect & Diversity",
                    desc: "We respect the dignity of all individuals and foster an inclusive workplace free from discrimination."
                  },
                  {
                    title: "Compliance",
                    desc: "We comply with all applicable laws, regulations, and internal policies without exception."
                  },
                  {
                    title: "Confidentiality",
                    desc: "We protect confidential information and use it only for legitimate business purposes."
                  },
                  {
                    title: "Conflict of Interest",
                    desc: "We disclose and manage conflicts of interest to ensure fair and objective decision-making."
                  },
                  {
                    title: "Environmental & Social Responsibility",
                    desc: "We operate sustainably and contribute positively to the communities we serve."
                  },
                ].map((item, idx) => (
                  <div key={idx} className="pb-6 border-b border-border last:border-0 last:pb-0">
                    <h4 className="font-semibold mb-2">{item.title}</h4>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/10">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Learn More About AANS</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore our company structure, divisions, and governance framework.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/company/about">
              <Button className="gap-2">
                About Us <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/company/contact">
              <Button variant="outline">Contact Us</Button>
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
