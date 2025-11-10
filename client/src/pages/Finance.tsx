import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Download, TrendingUp, DollarSign, FileText, ArrowRight, BarChart3 } from "lucide-react";

export default function Finance() {
  const financialMetrics = [
    { label: "Total Assets", value: "₹[Amount]", change: "+15% YoY" },
    { label: "Total Revenue", value: "₹[Amount]", change: "+22% YoY" },
    { label: "Operating Profit", value: "₹[Amount]", change: "+18% YoY" },
    { label: "Cash Reserves", value: "₹[Amount]", change: "+8% YoY" },
  ];

  const downloadableReports = [
    {
      title: "Annual Financial Report FY 2024-25",
      description: "Comprehensive financial statements including P&L, balance sheet, and cash flow",
      icon: "📊",
      size: "2.4 MB"
    },
    {
      title: "Financial Summary FY 2024-25",
      description: "Executive summary of key financial metrics and performance indicators",
      icon: "📈",
      size: "1.2 MB"
    },
    {
      title: "Auditor's Report",
      description: "Independent auditor's certification and findings",
      icon: "✓",
      size: "0.8 MB"
    },
    {
      title: "Accounting Policies & Standards",
      description: "Detailed accounting policies and standards followed by the company",
      icon: "📋",
      size: "1.5 MB"
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
          <Badge className="mb-4">Finance & Accounting</Badge>
          <h1 className="text-5xl font-bold mb-6">Accounting & Finance</h1>
          <p className="text-xl text-muted-foreground">
            Transparent financial management, robust accounting practices, and comprehensive reporting for all stakeholders.
          </p>
        </div>
      </section>

      {/* Financial Highlights */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Financial Highlights FY 2024-25</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {financialMetrics.map((metric, idx) => (
              <Card key={idx} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription>{metric.label}</CardDescription>
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-3xl mt-2">{metric.value}</CardTitle>
                  <p className="text-sm text-green-500 mt-2">{metric.change}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Financial Management Overview */}
      <section className="py-20 bg-card/30 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Financial Management Overview</h2>
          
          <div className="space-y-6">
            {[
              {
                title: "Financial Planning & Budgeting",
                desc: "Comprehensive annual budgeting process with quarterly reviews and variance analysis to ensure financial discipline and strategic alignment."
              },
              {
                title: "Treasury Management",
                desc: "Professional management of cash flow, liquidity, and working capital to optimize financial resources and minimize costs."
              },
              {
                title: "Cost Management",
                desc: "Rigorous cost control measures and continuous optimization of operational expenses while maintaining service quality."
              },
              {
                title: "Financial Controls",
                desc: "Robust internal controls and segregation of duties to prevent fraud and ensure accuracy of financial records."
              },
              {
                title: "Risk Management",
                desc: "Proactive identification and mitigation of financial risks including market, credit, and operational risks."
              },
              {
                title: "Investor Relations",
                desc: "Transparent communication with investors and stakeholders regarding financial performance and strategic initiatives."
              },
            ].map((item, idx) => (
              <Card key={idx} className="border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
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

      {/* Auditor Details */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-8">Auditor Details</h2>
          
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>External Auditor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Auditor Firm Name</p>
                <p className="font-semibold text-lg">[Auditor Firm Name & Registration Number]</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Partner in Charge</p>
                <p className="font-semibold">[Partner Name]</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Information</p>
                <p className="font-semibold">[Email & Phone]</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Audit Committee</p>
                <p className="font-semibold">Meets quarterly to review audit findings and financial controls</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Accounting Policies */}
      <section className="py-20 bg-card/30 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Accounting Policies & Standards</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Accounting Standards",
                items: ["Indian Accounting Standards (Ind-AS)", "GAAP Compliance", "Fair Value Measurement", "Consolidation Principles"]
              },
              {
                title: "Revenue Recognition",
                items: ["Performance Obligation Identification", "Transaction Price Determination", "Timing of Recognition", "Contract Modifications"]
              },
              {
                title: "Asset Management",
                items: ["Depreciation Methods", "Impairment Testing", "Valuation Techniques", "Useful Life Assessment"]
              },
              {
                title: "Liability & Equity",
                items: ["Provision Recognition", "Contingent Liabilities", "Share Capital Accounting", "Dividend Policy"]
              },
            ].map((policy, idx) => (
              <Card key={idx} className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">{policy.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {policy.items.map((item, i) => (
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

      {/* Expense & Vendor Policy */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Expense Policy & Vendor Management</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Expense Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Travel Expenses</h4>
                  <p className="text-sm text-muted-foreground">Reimbursement for business travel including flights, accommodation, and meals as per company guidelines.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Office Expenses</h4>
                  <p className="text-sm text-muted-foreground">Approval required for office supplies, equipment, and facility-related expenses above threshold limits.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Entertainment & Gifts</h4>
                  <p className="text-sm text-muted-foreground">Strict guidelines for client entertainment and gifts to ensure compliance and ethical standards.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Vendor Payment Process
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Vendor Onboarding</h4>
                  <p className="text-sm text-muted-foreground">Comprehensive vendor vetting process including financial health check and compliance verification.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Payment Terms</h4>
                  <p className="text-sm text-muted-foreground">Standard payment terms of 30-45 days from invoice date with early payment discounts available.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Invoice Processing</h4>
                  <p className="text-sm text-muted-foreground">Automated invoice processing with three-way matching (PO, receipt, invoice) for accuracy.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Downloadable Reports */}
      <section className="py-20 bg-card/30 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12">Downloadable Reports & Documents</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {downloadableReports.map((report, idx) => (
              <Card key={idx} className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="mt-2">{report.description}</CardDescription>
                    </div>
                    <span className="text-3xl">{report.icon}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{report.size}</span>
                    <Button size="sm" className="gap-2">
                      <Download className="h-4 w-4" /> Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tax Compliance */}
      <section className="py-20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-8">Tax Compliance & Statutory Filings</h2>
          
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Annual Compliance Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { period: "Quarterly", items: ["GST Returns", "TDS Filings", "Quarterly Compliance"] },
                  { period: "Half-Yearly", items: ["Interim Financial Statements", "Compliance Review", "Internal Audit"] },
                  { period: "Annual", items: ["Income Tax Returns", "Annual Audit", "ROC Filings", "Board Resolutions"] },
                  { period: "As Required", items: ["Statutory Notices", "Regulatory Filings", "Disclosure Updates"] },
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/10">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Need Financial Information?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Contact our Finance department for detailed financial information or investor relations inquiries.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/company/contact">
              <Button className="gap-2">
                Contact Finance Team <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline">Request Investor Deck</Button>
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
