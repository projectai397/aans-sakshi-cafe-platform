import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Zap, Shield, Users, Briefcase, Award, Download } from "lucide-react";

export default function Operations() {
  const operationsAreas = [
    {
      title: "Operations Workflow",
      desc: "End-to-end process optimization from customer acquisition to delivery and support",
      icon: "⚙️"
    },
    {
      title: "Infrastructure & Facilities",
      desc: "State-of-the-art offices and cloud infrastructure supporting 1,180+ team members",
      icon: "🏢"
    },
    {
      title: "Supply Chain Partners",
      desc: "Vetted network of logistics, technology, and service partners ensuring quality delivery",
      icon: "🚚"
    },
    {
      title: "Quality Assurance",
      desc: "Rigorous QA processes and continuous improvement frameworks across all divisions",
      icon: "✓"
    },
  ];

  const hrPolicies = [
    {
      title: "Recruitment & Onboarding",
      desc: "Comprehensive hiring process with focus on cultural fit and skill alignment"
    },
    {
      title: "Compensation & Benefits",
      desc: "Competitive salary, health insurance, retirement plans, and wellness benefits"
    },
    {
      title: "Professional Development",
      desc: "Training programs, mentorship, and career advancement opportunities"
    },
    {
      title: "Work-Life Balance",
      desc: "Flexible work arrangements, paid time off, and mental health support"
    },
    {
      title: "Diversity & Inclusion",
      desc: "Commitment to building an inclusive workplace free from discrimination"
    },
    {
      title: "Performance Management",
      desc: "Regular feedback, goal setting, and transparent performance evaluation"
    },
  ];

  const jobCategories = [
    { title: "Engineering & Technology", openings: 45, icon: "💻" },
    { title: "Product & Design", openings: 12, icon: "🎨" },
    { title: "Sales & Business Development", openings: 28, icon: "📈" },
    { title: "Marketing & Communications", openings: 15, icon: "📢" },
    { title: "Operations & Finance", openings: 18, icon: "💰" },
    { title: "Human Resources", openings: 8, icon: "👥" },
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
          <Badge className="mb-4">Operations & HR</Badge>
          <h1 className="text-5xl font-bold mb-6">Operations & Human Resources</h1>
          <p className="text-xl text-muted-foreground">
            Building a world-class organization with efficient operations, talented people, and a thriving culture.
          </p>
        </div>
      </section>

      {/* Operations Overview */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Operations Overview</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {operationsAreas.map((area, idx) => (
              <Card key={idx} className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <div className="text-4xl mb-4">{area.icon}</div>
                  <CardTitle>{area.title}</CardTitle>
                  <CardDescription className="mt-2">{area.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Operations Workflow */}
      <section className="py-20 bg-card/30 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Operations Workflow</h2>
          
          <div className="space-y-4">
            {[
              { stage: "1. Customer Acquisition", desc: "Multi-channel marketing and sales pipeline management" },
              { stage: "2. Onboarding", desc: "Seamless customer onboarding and training" },
              { stage: "3. Service Delivery", desc: "Efficient delivery of products and services" },
              { stage: "4. Support & Success", desc: "Ongoing customer support and success management" },
              { stage: "5. Feedback & Improvement", desc: "Continuous feedback collection and process improvement" },
            ].map((item, idx) => (
              <Card key={idx} className="border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Badge className="bg-primary/20 text-primary">{item.stage.split(".")[0]}</Badge>
                    {item.stage.split(". ")[1]}
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

      {/* Quality & Safety */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Quality Assurance & Safety</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Quality Standards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">ISO Certifications</h4>
                  <p className="text-sm text-muted-foreground">ISO 9001, ISO 27001, and industry-specific certifications</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">QA Processes</h4>
                  <p className="text-sm text-muted-foreground">Automated testing, manual QA, and continuous monitoring</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Compliance</h4>
                  <p className="text-sm text-muted-foreground">Regular audits and compliance checks across all operations</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Safety & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Workplace Safety</h4>
                  <p className="text-sm text-muted-foreground">OSHA compliance and regular safety training programs</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Data Security</h4>
                  <p className="text-sm text-muted-foreground">Enterprise-grade security and data protection measures</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Risk Management</h4>
                  <p className="text-sm text-muted-foreground">Proactive identification and mitigation of operational risks</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* HR Vision & Policies */}
      <section className="py-20 bg-card/30 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">HR Vision & Policies</h2>
          
          <Card className="border-primary/20 mb-8">
            <CardHeader>
              <CardTitle>Our HR Philosophy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We believe that our people are our greatest asset. We're committed to creating a workplace where talented individuals can do their best work, grow professionally, and achieve their full potential. We foster a culture of respect, collaboration, continuous learning, and mutual success.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {hrPolicies.map((policy, idx) => (
              <Card key={idx} className="border-accent/20">
                <CardHeader>
                  <CardTitle className="text-lg">{policy.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{policy.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Careers */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Careers at AANS</h2>
          
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">Open Positions</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {jobCategories.map((category, idx) => (
                <Card key={idx} className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription className="mt-2">{category.openings} open positions</CardDescription>
                      </div>
                      <span className="text-3xl">{category.icon}</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Life @ AANS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Our Culture</h4>
                <p className="text-sm text-muted-foreground">
                  We're building a culture of innovation, collaboration, and conscious business. Our team is diverse, talented, and passionate about making a positive impact.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Benefits</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Competitive salary and performance bonuses</li>
                  <li>• Comprehensive health insurance and wellness programs</li>
                  <li>• Flexible work arrangements and remote options</li>
                  <li>• Professional development and training budget</li>
                  <li>• Stock options and profit sharing</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Training & Development */}
      <section className="py-20 bg-card/30 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Training & Development</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Onboarding Program",
                items: ["Company orientation", "Role-specific training", "Mentorship pairing", "30-60-90 day plan"]
              },
              {
                title: "Continuous Learning",
                items: ["Online courses", "Workshops & seminars", "Conference attendance", "Certification programs"]
              },
              {
                title: "Leadership Development",
                items: ["Manager training", "Executive coaching", "Succession planning", "Leadership programs"]
              },
              {
                title: "Career Advancement",
                items: ["Career pathing", "Internal mobility", "Skill development", "Promotion opportunities"]
              },
            ].map((program, idx) => (
              <Card key={idx} className="border-accent/20">
                <CardHeader>
                  <CardTitle className="text-lg">{program.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {program.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-primary">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Employee Code of Conduct */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-8">Employee Code of Conduct</h2>
          
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Our Ethical Standards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "Professional Conduct", desc: "Maintain professional behavior and respect for colleagues and clients" },
                { title: "Integrity", desc: "Act with honesty and integrity in all business dealings" },
                { title: "Confidentiality", desc: "Protect company and customer confidential information" },
                { title: "Conflict of Interest", desc: "Disclose and manage potential conflicts of interest" },
                { title: "Anti-Harassment", desc: "Zero tolerance for harassment, discrimination, or bullying" },
                { title: "Compliance", desc: "Follow all applicable laws, regulations, and company policies" },
              ].map((item, idx) => (
                <div key={idx} className="pb-4 border-b border-border last:border-0 last:pb-0">
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* HR Downloads */}
      <section className="py-20 bg-card/30 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">HR Documents & Resources</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Employee Handbook", icon: "📖", size: "2.1 MB" },
              { title: "Leave Policy", icon: "📅", size: "0.8 MB" },
              { title: "Code of Conduct", icon: "⚖️", size: "1.2 MB" },
              { title: "Benefits Guide", icon: "🎁", size: "1.5 MB" },
            ].map((doc, idx) => (
              <Card key={idx} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <CardDescription className="mt-2">{doc.size}</CardDescription>
                    </div>
                    <span className="text-3xl">{doc.icon}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button size="sm" className="w-full gap-2">
                    <Download className="h-4 w-4" /> Download
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
          <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're hiring talented individuals to help us build the future of conscious AI and sustainable business.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button className="gap-2">
              View All Jobs <ArrowRight className="h-4 w-4" />
            </Button>
            <Link href="/company/contact">
              <Button variant="outline">Contact HR</Button>
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
