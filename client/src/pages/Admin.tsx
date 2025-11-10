import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { BarChart3, BookOpen, Users, Settings, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Admin() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("articles");

  const { data: articles = [] } = trpc.articles.list.useQuery({ limit: 100 });
  
  // Check if user is admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">You need admin privileges to access this page.</p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-20"} border-r border-border bg-card/30 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && <h2 className="font-bold text-lg">AANS Admin</h2>}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: "articles", label: "Articles", icon: BookOpen },
            { id: "divisions", label: "Divisions", icon: BarChart3 },
            { id: "subscribers", label: "Subscribers", icon: Users },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-card"
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && "Logout"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-border bg-card/30 p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
            <Badge variant="outline">{user?.role}</Badge>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "articles" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Articles Management</h2>
                <Button>Create Article</Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Published Articles</CardTitle>
                  <CardDescription>Manage all blog articles and content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-semibold">Title</th>
                          <th className="text-left py-3 px-4 font-semibold">Division</th>
                          <th className="text-left py-3 px-4 font-semibold">Author</th>
                          <th className="text-left py-3 px-4 font-semibold">Date</th>
                          <th className="text-left py-3 px-4 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {articles.slice(0, 5).map((article) => (
                          <tr key={article.id} className="border-b border-border/50 hover:bg-card/50">
                            <td className="py-3 px-4">{article.title}</td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">{article.division}</Badge>
                            </td>
                            <td className="py-3 px-4">{article.author}</td>
                            <td className="py-3 px-4 text-xs text-muted-foreground">
                              {new Date(article.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">Edit</Button>
                                <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "divisions" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Division Content Management</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {["ave", "sakshi", "subcircle"].map((division) => (
                  <Card key={division} className="border-border">
                    <CardHeader>
                      <CardTitle className="capitalize">{division}</CardTitle>
                      <CardDescription>Manage {division} content and metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">Edit Content</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "subscribers" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Newsletter Subscribers</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Subscriber List</CardTitle>
                  <CardDescription>Manage newsletter subscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Subscriber management interface coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Admin Settings</h2>
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Configure admin dashboard and content settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Settings interface coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
