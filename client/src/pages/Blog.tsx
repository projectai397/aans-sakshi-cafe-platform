import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowRight, BookOpen } from "lucide-react";

export default function Blog() {
  const [selectedDivision, setSelectedDivision] = useState<"all" | "ave" | "sakshi" | "subcircle" | "general">("all");
  
  const { data: allArticles = [] } = trpc.articles.list.useQuery({ limit: 100 });
  const { data: aveArticles = [] } = trpc.articles.byDivision.useQuery({ division: "ave" });
  const { data: sakshiArticles = [] } = trpc.articles.byDivision.useQuery({ division: "sakshi" });
  const { data: subcircleArticles = [] } = trpc.articles.byDivision.useQuery({ division: "subcircle" });

  const getArticles = () => {
    switch (selectedDivision) {
      case "ave":
        return aveArticles;
      case "sakshi":
        return sakshiArticles;
      case "subcircle":
        return subcircleArticles;
      case "general":
        return allArticles.filter(a => a.division === "general");
      default:
        return allArticles;
    }
  };

  const articles = getArticles();
  const divisions = [
    { id: "all", label: "All Articles" },
    { id: "ave", label: "AVE" },
    { id: "sakshi", label: "Sakshi" },
    { id: "subcircle", label: "SubCircle" },
    { id: "general", label: "General" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Blog</span>
          </Link>
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Back to Home</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 border-b border-border">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">AANS Blog & News</h1>
            <p className="text-xl text-muted-foreground">
              Latest updates, insights, and stories from AANS divisions. Discover thought leadership on conscious AI, business automation, and sustainable living.
            </p>
          </div>
        </div>
      </section>

      {/* Division Filter */}
      <section className="py-8 border-b border-border">
        <div className="container">
          <div className="flex flex-wrap gap-3">
            {divisions.map((div) => (
              <Button
                key={div.id}
                variant={selectedDivision === div.id ? "default" : "outline"}
                onClick={() => setSelectedDivision(div.id as any)}
              >
                {div.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20">
        <div className="container">
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No articles found in this category yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Card key={article.id} className="border-border hover:border-primary/40 transition-colors overflow-hidden">
                  {article.imageUrl && (
                    <div className="w-full h-48 overflow-hidden">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {article.division?.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{article.excerpt || article.content.substring(0, 100)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">By {article.author || "AANS Team"}</span>
                      <Link href={`/blog/${article.slug}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Read <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-primary/10 border-t border-border">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest news, insights, and updates from AANS.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 AANS Blog. Insights on conscious AI and sustainable business.</p>
        </div>
      </footer>
    </div>
  );
}
