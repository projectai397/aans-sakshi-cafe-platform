import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Streamdown } from "streamdown";

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = trpc.articles.bySlug.useQuery({ slug: slug || "" });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
        <Link href="/blog">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Button>
          </Link>
        </div>
      </nav>

      {/* Article Header */}
      <section className="py-12 border-b border-border">
        <div className="container max-w-3xl">
          <div className="mb-6">
            <Badge className="mb-4">{article.division?.toUpperCase()}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>
            <p className="text-xl text-muted-foreground">{article.excerpt}</p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{article.author || "AANS Team"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(article.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Image */}
      {article.imageUrl && (
        <section className="py-8">
          <div className="container max-w-3xl">
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
        </section>
      )}

      {/* Article Content */}
      <section className="py-12 flex-1">
        <div className="container max-w-3xl">
          <div className="prose prose-invert max-w-none">
            <Streamdown>{article.content}</Streamdown>
          </div>
        </div>
      </section>

      {/* Related Articles CTA */}
      <section className="py-12 border-t border-border bg-card/30">
        <div className="container max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-4">Explore More Articles</h2>
          <p className="text-muted-foreground mb-8">Discover more insights and updates from AANS.</p>
          <Link href="/blog">
            <Button size="lg">Browse All Articles</Button>
          </Link>
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
