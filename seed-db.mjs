import { drizzle } from "drizzle-orm/mysql2";
import { users, articles, subscribers, divisionContent, sevaTokens } from "./drizzle/schema.ts";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

async function seedDatabase() {
  console.log("🌱 Starting database seeding...\n");

  try {
    // Clear existing data
    console.log("Clearing existing data...");
    await db.delete(articles);
    await db.delete(subscribers);
    await db.delete(divisionContent);
    await db.delete(sevaTokens);

    // Seed Blog Articles
    console.log("📰 Seeding blog articles...");
    const articles_data = [
      {
        title: "AANS Launches SubCircle: Sustainable Fashion for Gen Z",
        slug: "aans-launches-subcircle",
        content: "SubCircle is our latest venture in sustainable fashion, connecting Gen Z consumers with underground culture and thrift fashion. This platform enables creators to monetize their content while promoting conscious consumption.",
        excerpt: "Revolutionary secondhand marketplace connecting Gen Z with sustainable fashion",
        division: "SubCircle",
        author: "Rajesh Kumar",
        published: true,
      },
      {
        title: "AVE Platform Reaches 100+ Enterprise Clients",
        slug: "ave-reaches-100-clients",
        content: "Our AVE division has successfully onboarded 100+ enterprise clients, automating over 10,000 business processes. This milestone demonstrates the market demand for conscious AI-powered business automation.",
        excerpt: "AVE division achieves major milestone with 100+ enterprise clients",
        division: "AVE",
        author: "Amit Patel",
        published: true,
      },
      {
        title: "Sakshi Wellness Platform Hits 50,000 Active Users",
        slug: "sakshi-50k-users",
        content: "Sakshi has grown to 50,000 active users exploring conscious wellness practices. The platform now offers 7 integrated wellness centers covering physical, mental, and spiritual health.",
        excerpt: "Sakshi wellness ecosystem reaches 50,000 users milestone",
        division: "Sakshi",
        author: "Priya Sharma",
        published: true,
      },
      {
        title: "The Future of Conscious AI in Business",
        slug: "future-conscious-ai",
        content: "As AI becomes increasingly integrated into business operations, the importance of conscious AI principles cannot be overstated. At AANS, we believe AI should serve humanity, not replace it.",
        excerpt: "Exploring how conscious AI is reshaping modern business",
        division: "General",
        author: "Rajesh Kumar",
        published: true,
      },
      {
        title: "Sustainable Business Models: AANS Approach",
        slug: "sustainable-business-models",
        content: "AANS operates on a sustainable business model that balances profitability with social impact. Our three divisions demonstrate how businesses can grow while maintaining ethical standards.",
        excerpt: "How AANS builds sustainable and ethical business models",
        division: "General",
        author: "Neha Singh",
        published: true,
      },
      {
        title: "Employee Wellness at AANS: Our Culture",
        slug: "employee-wellness-culture",
        content: "At AANS, we believe happy employees create better products. Our comprehensive wellness program includes mental health support, fitness benefits, and flexible work arrangements.",
        excerpt: "Discover how AANS prioritizes employee wellness and culture",
        division: "General",
        author: "Anjali Gupta",
        published: true,
      },
      {
        title: "Seva Token System: Rewarding Conscious Behavior",
        slug: "seva-token-system",
        content: "The Seva Token System is our innovative approach to rewarding conscious behavior across all divisions. Users earn tokens for sustainable choices and can redeem them for exclusive benefits.",
        excerpt: "Understanding the Seva Token System and its benefits",
        division: "General",
        author: "Amit Patel",
        published: true,
      },
      {
        title: "AANS Expands to 3 New Cities",
        slug: "aans-expansion-cities",
        content: "AANS is expanding its operations to Delhi, Hyderabad, and Pune. This expansion will create 200+ new jobs and bring our services closer to customers across India.",
        excerpt: "AANS announces expansion to 3 new cities in India",
        division: "General",
        author: "Vikram Desai",
        published: true,
      },
      {
        title: "AVE Enterprise: Automating Complex Workflows",
        slug: "ave-enterprise-workflows",
        content: "AVE Enterprise is designed for large organizations with complex workflows. Our latest release includes advanced process mining, predictive analytics, and intelligent automation capabilities.",
        excerpt: "AVE Enterprise introduces advanced workflow automation features",
        division: "AVE",
        author: "Amit Patel",
        published: true,
      },
      {
        title: "Sakshi's New Meditation Module Launches",
        slug: "sakshi-meditation-module",
        content: "Sakshi introduces a new meditation module with guided sessions from expert practitioners. The module includes personalized recommendations based on user preferences and wellness goals.",
        excerpt: "Sakshi launches new meditation module with expert guidance",
        division: "Sakshi",
        author: "Priya Sharma",
        published: true,
      },
    ];

    for (const article of articles_data) {
      await db.insert(articles).values({
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        division: article.division,
        author: article.author,
        published: article.published,
        createdAt: new Date(),
      });
    }
    console.log(`✓ Added ${articles_data.length} blog articles\n`);

    // Seed Newsletter Subscribers
    console.log("📧 Seeding newsletter subscribers...");
    const subscribers_data = [
      { email: "investor1@example.com", name: "John Investor" },
      { email: "investor2@example.com", name: "Sarah Chen" },
      { email: "partner@example.com", name: "Michael Partners" },
      { email: "customer1@example.com", name: "Rajesh Customer" },
      { email: "customer2@example.com", name: "Priya User" },
    ];

    for (const sub of subscribers_data) {
      await db.insert(subscribers).values({
        email: sub.email,
        name: sub.name,
        subscribed: true,
        subscribedAt: new Date(),
      });
    }
    console.log(`✓ Added ${subscribers_data.length} newsletter subscribers\n`);

    // Seed Division Content
    console.log("🏢 Seeding division content...");
    const divisions_data = [
      {
        name: "AVE",
        description: "B2B SaaS automation platform for enterprise workflows",
        revenue: "₹80 Cr",
        users: "100+",
        features: "9 integrated modules, AI-powered automation, real-time analytics",
      },
      {
        name: "Sakshi",
        description: "B2C wellness ecosystem with 7 integrated centers",
        revenue: "₹28 Cr",
        users: "50,000+",
        features: "Meditation, fitness, nutrition, mental health, spiritual growth",
      },
      {
        name: "SubCircle",
        description: "B2C culture & thrift platform for Gen Z",
        revenue: "₹6 Cr",
        users: "10,000+",
        features: "Secondhand fashion, creator community, quarterly events",
      },
    ];

    for (const div of divisions_data) {
      await db.insert(divisionContent).values({
        division: div.name,
        name: div.name,
        description: div.description,
        revenue: div.revenue,
        activeUsers: div.users,
        features: div.features,
        updatedAt: new Date(),
      });
    }
    console.log(`✓ Added ${divisions_data.length} division content records\n`);

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Blog Articles: ${articles_data.length}`);
    console.log(`   - Subscribers: ${subscribers_data.length}`);
    console.log(`   - Divisions: ${divisions_data.length}`);
    console.log("\n✨ Your database is now populated with realistic data!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
