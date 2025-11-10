import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { BarChart3, Users, DollarSign, TrendingUp, Settings, LogOut, Menu, X, FileText, Calendar, Briefcase, PieChart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Portal() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState<"dashboard" | "hrms" | "accounting" | "crm" | "documents">("dashboard");

  const handleLogout = () => {
    logout();
    setLocation("/");
    toast.success("Logged out successfully");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md border-primary/20">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to access the management portal</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const modules = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "hrms", label: "HRMS", icon: Users },
    { id: "accounting", label: "Accounting", icon: DollarSign },
    { id: "crm", label: "CRM", icon: TrendingUp },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} border-r border-border bg-card/30 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && <span className="font-bold text-lg">AANS Portal</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-background rounded">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  activeModule === module.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-background"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{module.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <div className={`flex items-center gap-2 ${!sidebarOpen && "justify-center"}`}>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
              {user.name?.[0] || "U"}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full gap-2"
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold capitalize">{activeModule} Module</h1>
            <Link href="/company">
              <Button variant="ghost" size="sm">Back to Website</Button>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {/* Dashboard */}
          {activeModule === "dashboard" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Welcome, {user.name}</h2>
                <div className="grid md:grid-cols-4 gap-6">
                  {[
                    { label: "Total Revenue", value: "₹114 Cr", change: "+12%" },
                    { label: "Active Users", value: "50K+", change: "+8%" },
                    { label: "Team Members", value: "1,180", change: "+15%" },
                    { label: "Customer Retention", value: "92%", change: "+3%" },
                  ].map((metric, idx) => (
                    <Card key={idx} className="border-primary/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <p className="text-xs text-green-500 mt-1">{metric.change} from last month</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle>Revenue by Division</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "AVE", revenue: "₹80 Cr", percentage: 70 },
                        { name: "Sakshi", revenue: "₹28 Cr", percentage: 25 },
                        { name: "SubCircle", revenue: "₹6 Cr", percentage: 5 },
                      ].map((div, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-semibold">{div.name}</span>
                            <span className="text-sm">{div.revenue}</span>
                          </div>
                          <div className="w-full bg-border rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${div.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-accent/20">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <FileText className="h-4 w-4" /> Generate Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Users className="h-4 w-4" /> View Team
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <DollarSign className="h-4 w-4" /> View Financials
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* HRMS Module */}
          {activeModule === "hrms" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Human Resources Management System</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: "Attendance", desc: "Track employee attendance and leave", icon: "📅" },
                  { title: "Leave Management", desc: "Manage leave requests and approvals", icon: "🏖️" },
                  { title: "Payroll", desc: "Process salaries and generate payslips", icon: "💰" },
                  { title: "Performance", desc: "Track performance reviews and ratings", icon: "⭐" },
                  { title: "Training", desc: "Manage training programs and certifications", icon: "📚" },
                  { title: "Directory", desc: "Employee directory and contact information", icon: "👥" },
                ].map((item, idx) => (
                  <Card key={idx} className="border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <CardDescription className="mt-2">{item.desc}</CardDescription>
                        </div>
                        <span className="text-3xl">{item.icon}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button size="sm" variant="outline" className="w-full">Access Module</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Accounting Module */}
          {activeModule === "accounting" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Accounting & Finance Module</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: "Invoices", desc: "Create and manage customer invoices", icon: "📄" },
                  { title: "Expenses", desc: "Track and categorize business expenses", icon: "💸" },
                  { title: "Receipts", desc: "Manage vendor receipts and payments", icon: "🧾" },
                  { title: "Reports", desc: "Generate financial reports and statements", icon: "📊" },
                  { title: "Budget", desc: "Create and monitor departmental budgets", icon: "💼" },
                  { title: "Audit Trail", desc: "View transaction history and audit logs", icon: "🔍" },
                ].map((item, idx) => (
                  <Card key={idx} className="border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <CardDescription className="mt-2">{item.desc}</CardDescription>
                        </div>
                        <span className="text-3xl">{item.icon}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button size="sm" variant="outline" className="w-full">Access Module</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* CRM Module */}
          {activeModule === "crm" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Customer Relationship Management</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: "Leads", desc: "Manage sales leads and prospects", icon: "🎯" },
                  { title: "Pipeline", desc: "Track deals through sales pipeline", icon: "📈" },
                  { title: "Customers", desc: "Maintain customer database and profiles", icon: "👤" },
                  { title: "Campaigns", desc: "Create and track marketing campaigns", icon: "📢" },
                  { title: "Tasks", desc: "Assign and track sales tasks", icon: "✓" },
                  { title: "Reports", desc: "Generate sales and pipeline reports", icon: "📊" },
                ].map((item, idx) => (
                  <Card key={idx} className="border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <CardDescription className="mt-2">{item.desc}</CardDescription>
                        </div>
                        <span className="text-3xl">{item.icon}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button size="sm" variant="outline" className="w-full">Access Module</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Documents Module */}
          {activeModule === "documents" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Document Management System</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: "Policies", desc: "Company policies and procedures", icon: "📋" },
                  { title: "Contracts", desc: "Customer and vendor contracts", icon: "📜" },
                  { title: "Reports", desc: "Financial and operational reports", icon: "📊" },
                  { title: "Compliance", desc: "Compliance documents and certifications", icon: "✓" },
                  { title: "Templates", desc: "Document templates and forms", icon: "📑" },
                  { title: "Archive", desc: "Historical documents and archives", icon: "🗂️" },
                ].map((item, idx) => (
                  <Card key={idx} className="border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <CardDescription className="mt-2">{item.desc}</CardDescription>
                        </div>
                        <span className="text-3xl">{item.icon}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button size="sm" variant="outline" className="w-full">Access Module</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
