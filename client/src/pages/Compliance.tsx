import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Shield, Lock, Leaf, TrendingUp, Download, AlertCircle } from "lucide-react";

export default function Compliance() {
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
          <Badge className="mb-4">Legal, IT, CSR & Investor Relations</Badge>
          <h1 className="text-5xl font-bold mb-6">Compliance & Strategic Initiatives</h1>
          <p className="text-xl text-muted-foreground">
            Transparent governance, robust security, community impact, and investor confidence.
          </p>
        </div>
      </section>

      {/* Legal & Compliance */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Legal & Compliance</h2>
          
          <div className="space-y-6 mb-8">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Compliance Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      period: "Monthly",
                      items: ["Payroll & TDS", "Bank Reconciliation", "GST Compliance"]
                    },
                    {
                      period: "Quarterly",
                      items: ["GST Returns", "TDS Returns", "Board Meetings", "Compliance Review"]
                    },
                    {
                      period: "Half-Yearly",
                      items: ["Statutory Audit", "Internal Audit", "Compliance Certification"]
                    },
                    {
                      period: "Annual",
                      items: ["Income Tax Filing", "ROC Filings", "Annual Audit", "Board Resolutions"]
                    },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <h4 className="font-semibold mb-3">{item.period}</h4>
                      <ul className="space-y-2">
                        {item.items.map((i, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="text-primary">✓</span> {i}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle>Statutory Filings Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Ministry of Corporate Affairs (MCA)</h4>
                  <p className="text-sm text-muted-foreground">Annual returns, financial statements, board resolutions, and director disclosures</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Income Tax Department</h4>
                  <p className="text-sm text-muted-foreground">Annual income tax returns, TDS filings, and tax compliance certifications</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">GST Authority</h4>
                  <p className="text-sm text-muted-foreground">Monthly/quarterly GST returns and compliance documentation</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Other Regulatory Bodies</h4>
                  <p className="text-sm text-muted-foreground">Industry-specific filings and compliance with relevant authorities</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Legal Advisors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Company Secretary</p>
                  <p className="font-semibold">[CS Name & Firm]</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Legal Counsel</p>
                  <p className="font-semibold">[Law Firm Name]</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tax Advisor</p>
                  <p className="font-semibold">[CA Firm Name]</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="text-lg">Contracts & Policies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Customer Contracts</p>
                  <p className="font-semibold">Standard terms and conditions</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vendor Agreements</p>
                  <p className="font-semibold">Procurement and service agreements</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employment Contracts</p>
                  <p className="font-semibold">Employee agreements and policies</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy & Terms */}
      <section className="py-20 bg-card/30 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Privacy & Legal Policies</h2>
          
          <div className="space-y-6">
            {[
              {
                title: "Privacy Policy",
                desc: "How we collect, use, and protect your personal information in compliance with data protection laws"
              },
              {
                title: "Terms of Use",
                desc: "Terms and conditions governing your use of AANS products and services"
              },
              {
                title: "Cookie Policy",
                desc: "Information about cookies and tracking technologies used on our website"
              },
              {
                title: "Data Protection Policy",
                desc: "Our commitment to protecting personal data and GDPR/DPDP compliance"
              },
              {
                title: "Anti-Bribery & Corruption Policy",
                desc: "Zero tolerance for bribery, corruption, and unethical business practices"
              },
              {
                title: "Whistleblower Policy",
                desc: "Confidential reporting mechanism for ethical concerns and violations"
              },
            ].map((policy, idx) => (
              <Card key={idx} className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">{policy.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{policy.desc}</p>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="h-4 w-4" /> Download PDF
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* IT & Security */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Information Technology & Security</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  IT Infrastructure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Cloud Platform</h4>
                  <p className="text-sm text-muted-foreground">AWS/Azure enterprise-grade cloud infrastructure</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Network Security</h4>
                  <p className="text-sm text-muted-foreground">Enterprise firewalls, VPNs, and intrusion detection</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Disaster Recovery</h4>
                  <p className="text-sm text-muted-foreground">Multi-region redundancy and failover systems</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Encryption</h4>
                  <p className="text-sm text-muted-foreground">End-to-end encryption for data in transit and at rest</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Access Control</h4>
                  <p className="text-sm text-muted-foreground">Role-based access control and multi-factor authentication</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Compliance</h4>
                  <p className="text-sm text-muted-foreground">ISO 27001 certified and SOC 2 Type II compliant</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Cloud & Backup Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Data Backup Strategy</h4>
                <p className="text-sm text-muted-foreground">Automated daily backups with 30-day retention and geo-redundancy</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Disaster Recovery Plan</h4>
                <p className="text-sm text-muted-foreground">RTO: 4 hours, RPO: 1 hour with regular DR drills</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Business Continuity</h4>
                <p className="text-sm text-muted-foreground">99.99% uptime SLA with redundant systems and failover</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CSR */}
      <section className="py-20 bg-card/30 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Corporate Social Responsibility (CSR)</h2>
          
          <Card className="border-primary/20 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-primary" />
                CSR Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                AANS is committed to creating positive social and environmental impact through our CSR initiatives. We focus on education, environmental sustainability, community development, and employee volunteering to build a better future for all stakeholders.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {[
              {
                title: "Community Projects",
                items: [
                  "Education & Skill Development",
                  "Healthcare & Wellness",
                  "Environmental Conservation",
                  "Rural Development"
                ]
              },
              {
                title: "Impact Metrics",
                items: [
                  "1,000+ Students Trained",
                  "500+ Lives Impacted",
                  "50+ Trees Planted",
                  "₹50L+ Invested in CSR"
                ]
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
                        <span className="text-primary">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>CSR Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Download our comprehensive annual CSR report detailing our initiatives, impact metrics, and future commitments.
              </p>
              <Button className="gap-2">
                <Download className="h-4 w-4" /> Download CSR Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Investor Relations */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Investor Relations</h2>
          
          <div className="space-y-6 mb-8">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Business Model Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  AANS operates a three-division synergistic model targeting ₹174 Cr revenue by Year 5 with 60-85% gross margins. Each division serves distinct markets while creating cross-division value through the Seva Token ecosystem.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { name: "AVE", revenue: "₹120 Cr Y5", margin: "80-90%" },
                    { name: "Sakshi", revenue: "₹48 Cr Y5", margin: "70-75%" },
                    { name: "SubCircle", revenue: "₹6 Cr Y5", margin: "60-65%" },
                  ].map((div, idx) => (
                    <div key={idx} className="p-3 bg-card border border-border rounded-lg">
                      <p className="font-semibold">{div.name}</p>
                      <p className="text-sm text-muted-foreground">{div.revenue}</p>
                      <p className="text-xs text-primary mt-1">{div.margin} margin</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle>Key Financial Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { metric: "Total Projected Revenue (Y5)", value: "₹174 Crores" },
                    { metric: "Gross Margin", value: "60-85%" },
                    { metric: "Target Market Size", value: "65M+ SMEs" },
                    { metric: "Team Size", value: "1,180+ People" },
                    { metric: "Customer Acquisition Cost", value: "₹[Amount]" },
                    { metric: "Customer Lifetime Value", value: "₹[Amount]" },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-card border border-border rounded-lg">
                      <p className="text-xs text-muted-foreground">{item.metric}</p>
                      <p className="font-semibold text-lg mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Investor Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Investor Pitch Deck",
                  "Financial Projections",
                  "Cap Table Summary",
                  "Board Reports"
                ].map((doc, idx) => (
                  <Button key={idx} variant="outline" className="w-full justify-start gap-2">
                    <Download className="h-4 w-4" /> {doc}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="text-lg">Press & Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Latest Press Release</h4>
                  <p className="text-sm text-muted-foreground">[Date] - [Press Release Title]</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Media Kit</h4>
                  <p className="text-sm text-muted-foreground">Logos, company information, and media resources</p>
                </div>
                <Button variant="outline" className="w-full gap-2">
                  <Download className="h-4 w-4" /> Download Media Kit
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/10">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Investor Inquiries</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Interested in learning more about investment opportunities? Contact our investor relations team.
          </p>
          <Link href="/company/contact">
            <Button className="gap-2">
              Contact Investor Relations <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
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
