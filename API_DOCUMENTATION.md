# AANS Research Website - API Documentation

## Overview

The AANS Research Website uses **tRPC** (TypeScript Remote Procedure Call) for type-safe API communication between the frontend and backend. This documentation provides a complete reference for all available API procedures, authentication, and integration patterns.

**Base URL:** `http://localhost:3000/trpc` (development)

**Technology Stack:**
- Backend: Express.js + Node.js
- ORM: Drizzle ORM
- Database: MySQL/TiDB
- Type Safety: TypeScript + tRPC

---

## Table of Contents

1. [Authentication](#authentication)
2. [API Procedures](#api-procedures)
3. [Database Schema](#database-schema)
4. [Error Handling](#error-handling)
5. [Code Examples](#code-examples)
6. [Integration Guides](#integration-guides)

---

## Authentication

### OAuth 2.0 Integration

The AANS website uses Manus OAuth for user authentication. All protected routes require a valid JWT token.

**OAuth Configuration:**
- Provider: Manus OAuth Server
- Flow: Authorization Code
- Scope: `openid profile email`

### Session Management

User sessions are managed through cookies and JWT tokens. The authentication system automatically handles token refresh and session persistence.

**Protected Routes:**
- `/portal` - Internal Management Portal
- `/admin` - Admin Dashboard
- `/analytics` - Analytics Dashboard

### Login Flow

```
1. User clicks "Login" button
2. Redirected to OAuth provider
3. User authenticates with credentials
4. OAuth provider returns authorization code
5. Backend exchanges code for JWT token
6. Token stored in secure HTTP-only cookie
7. User redirected to dashboard
```

---

## API Procedures

### Articles Router

The Articles router provides full CRUD operations for blog articles and news content.

#### `articles.list`

Retrieve all published articles with optional filtering.

**Parameters:**
- `limit` (optional): Number of articles to return (default: 10)
- `division` (optional): Filter by division ("ave", "sakshi", "subcircle", "general")

**Returns:**
```typescript
{
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  division: "ave" | "sakshi" | "subcircle" | "general";
  author: string;
  imageUrl: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}[]
```

**Example:**
```typescript
const articles = await trpc.articles.list.query({ limit: 5, division: "ave" });
```

#### `articles.getBySlug`

Retrieve a single article by its slug (URL-friendly identifier).

**Parameters:**
- `slug` (required): Article slug

**Returns:** Single article object or null

**Example:**
```typescript
const article = await trpc.articles.getBySlug.query({ slug: "aans-launches-subcircle" });
```

#### `articles.create`

Create a new blog article (admin only).

**Parameters:**
- `title` (required): Article title
- `slug` (required): URL-friendly identifier
- `content` (required): Article content (markdown supported)
- `excerpt` (optional): Short summary
- `division` (optional): Division category
- `author` (optional): Author name
- `published` (optional): Publication status

**Returns:** Created article object

**Example:**
```typescript
const newArticle = await trpc.articles.create.mutate({
  title: "New Blog Post",
  slug: "new-blog-post",
  content: "# Article Content\n\nThis is the article body.",
  division: "general",
  author: "Rajesh Kumar",
  published: true,
});
```

#### `articles.update`

Update an existing article (admin only).

**Parameters:**
- `id` (required): Article ID
- `title` (optional): Updated title
- `content` (optional): Updated content
- `published` (optional): Updated status

**Returns:** Updated article object

#### `articles.delete`

Delete an article (admin only).

**Parameters:**
- `id` (required): Article ID

**Returns:** Success confirmation

---

### Newsletter Router

Manage newsletter subscriptions and subscriber communications.

#### `newsletter.subscribe`

Subscribe a user to the newsletter.

**Parameters:**
- `email` (required): Subscriber email
- `name` (optional): Subscriber name

**Returns:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Example:**
```typescript
const result = await trpc.newsletter.subscribe.mutate({
  email: "user@example.com",
  name: "John Doe",
});
```

#### `newsletter.unsubscribe`

Unsubscribe from the newsletter.

**Parameters:**
- `email` (required): Subscriber email

**Returns:** Success confirmation

#### `newsletter.getSubscribers`

Retrieve all newsletter subscribers (admin only).

**Returns:** Array of subscriber objects

---

### Divisions Router

Access division-specific content and metrics.

#### `divisions.getContent`

Get detailed content for a specific division.

**Parameters:**
- `division` (required): Division name ("ave", "sakshi", "subcircle")

**Returns:**
```typescript
{
  id: number;
  division: string;
  title: string;
  description: string;
  features: string;
  metrics: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

**Example:**
```typescript
const aveContent = await trpc.divisions.getContent.query({ division: "ave" });
```

#### `divisions.getAllContent`

Retrieve content for all divisions.

**Returns:** Array of division content objects

**Example:**
```typescript
const allDivisions = await trpc.divisions.getAllContent.query();
```

---

### Seva Tokens Router

Track and manage Seva Token system for users.

#### `sevaTokens.getUserTokens`

Get Seva Token balance for a specific user.

**Parameters:**
- `userId` (required): User ID

**Returns:**
```typescript
{
  id: number;
  userId: number;
  division: string;
  activity: string;
  tokensEarned: number;
  tokensRedeemed: number;
  description: string | null;
  createdAt: Date;
}[]
```

**Example:**
```typescript
const userTokens = await trpc.sevaTokens.getUserTokens.query({ userId: 1 });
```

#### `sevaTokens.addTokens`

Award tokens to a user for an activity.

**Parameters:**
- `userId` (required): User ID
- `division` (required): Division name
- `tokensEarned` (required): Number of tokens
- `activity` (required): Activity description
- `description` (optional): Additional details

**Returns:** Created token record

---

## Database Schema

### Users Table

Stores user authentication and profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| openId | VARCHAR(64) | OAuth identifier (unique) |
| name | TEXT | User full name |
| email | VARCHAR(320) | Email address |
| loginMethod | VARCHAR(64) | OAuth provider |
| role | ENUM | "user" or "admin" |
| createdAt | TIMESTAMP | Account creation date |
| updatedAt | TIMESTAMP | Last update date |
| lastSignedIn | TIMESTAMP | Last login date |

### Articles Table

Stores blog posts and news articles.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| title | VARCHAR(255) | Article title |
| slug | VARCHAR(255) | URL-friendly identifier (unique) |
| excerpt | TEXT | Short summary |
| content | TEXT | Full article content |
| division | ENUM | Category (ave, sakshi, subcircle, general) |
| author | VARCHAR(255) | Author name |
| imageUrl | VARCHAR(512) | Featured image URL |
| published | BOOLEAN | Publication status |
| createdAt | TIMESTAMP | Creation date |
| updatedAt | TIMESTAMP | Last update date |

### Subscribers Table

Stores newsletter subscription information.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| email | VARCHAR(320) | Email address (unique) |
| name | VARCHAR(255) | Subscriber name |
| subscribed | BOOLEAN | Subscription status |
| createdAt | TIMESTAMP | Subscription date |
| updatedAt | TIMESTAMP | Last update date |

### DivisionContent Table

Stores division-specific information and metrics.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| division | ENUM | Division name (ave, sakshi, subcircle) |
| title | VARCHAR(255) | Division title |
| description | TEXT | Division description |
| features | TEXT | Key features |
| metrics | TEXT | Performance metrics |
| imageUrl | VARCHAR(512) | Division image |
| createdAt | TIMESTAMP | Creation date |
| updatedAt | TIMESTAMP | Last update date |

### SevaTokens Table

Tracks Seva Token transactions and balances.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| userId | INT | User ID (foreign key) |
| division | ENUM | Division name |
| activity | VARCHAR(255) | Activity description |
| tokensEarned | INT | Tokens awarded |
| tokensRedeemed | INT | Tokens used |
| description | TEXT | Additional details |
| createdAt | TIMESTAMP | Transaction date |

---

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```typescript
{
  code: string;           // Error code (e.g., "UNAUTHORIZED", "NOT_FOUND")
  message: string;        // Human-readable error message
  cause?: unknown;        // Underlying error details
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | User not authenticated |
| FORBIDDEN | 403 | User lacks required permissions |
| NOT_FOUND | 404 | Requested resource not found |
| BAD_REQUEST | 400 | Invalid request parameters |
| INTERNAL_SERVER_ERROR | 500 | Server error |
| CONFLICT | 409 | Resource already exists |

### Error Handling Example

```typescript
try {
  const article = await trpc.articles.create.mutate({
    title: "New Article",
    slug: "new-article",
    content: "Content",
  });
} catch (error) {
  if (error.code === "UNAUTHORIZED") {
    console.error("Please log in first");
  } else if (error.code === "CONFLICT") {
    console.error("Article slug already exists");
  } else {
    console.error("Unexpected error:", error.message);
  }
}
```

---

## Code Examples

### React Component Example

```typescript
import { trpc } from "@/utils/trpc";
import { useEffect, useState } from "react";

export function ArticlesList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const data = await trpc.articles.list.query({ limit: 10 });
        setArticles(data);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {articles.map((article) => (
        <article key={article.id}>
          <h2>{article.title}</h2>
          <p>{article.excerpt}</p>
          <a href={`/blog/${article.slug}`}>Read More</a>
        </article>
      ))}
    </div>
  );
}
```

### Newsletter Subscription Example

```typescript
import { trpc } from "@/utils/trpc";
import { useState } from "react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await trpc.newsletter.subscribe.mutate({
        email,
        name: "Subscriber",
      });
      setMessage("Successfully subscribed!");
      setEmail("");
    } catch (error) {
      setMessage("Failed to subscribe. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubscribe}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit">Subscribe</button>
      {message && <p>{message}</p>}
    </form>
  );
}
```

### Admin Article Creation Example

```typescript
import { trpc } from "@/utils/trpc";
import { useState } from "react";

export function CreateArticle() {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    division: "general",
    author: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const article = await trpc.articles.create.mutate(formData);
      console.log("Article created:", article);
      // Reset form or redirect
    } catch (error) {
      console.error("Failed to create article:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Slug"
        value={formData.slug}
        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
        required
      />
      <textarea
        placeholder="Content (Markdown)"
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        required
      />
      <select
        value={formData.division}
        onChange={(e) => setFormData({ ...formData, division: e.target.value })}
      >
        <option value="general">General</option>
        <option value="ave">AVE</option>
        <option value="sakshi">Sakshi</option>
        <option value="subcircle">SubCircle</option>
      </select>
      <button type="submit">Create Article</button>
    </form>
  );
}
```

---

## Integration Guides

### Frontend Integration

The frontend uses tRPC with React Query for data fetching and caching.

**Setup:**
```typescript
// client/src/utils/trpc.ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers";

export const trpc = createTRPCReact<AppRouter>();
```

**Usage in Components:**
```typescript
// Always import trpc from the utils file
import { trpc } from "@/utils/trpc";

// Use in components
const { data, isLoading } = trpc.articles.list.useQuery({ limit: 10 });
```

### Mobile App Integration

The React Native mobile app can integrate with the same tRPC backend.

**Setup:**
```typescript
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/server/routers";

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://your-domain.com/trpc",
    }),
  ],
});
```

### Third-Party API Integration

To integrate external APIs with AANS:

1. Create a new router in `server/routers.ts`
2. Implement API calls using tRPC procedures
3. Add authentication checks if needed
4. Document the new procedures

**Example:**
```typescript
export const externalApi = router({
  getWeather: publicProcedure
    .input(z.object({ city: z.string() }))
    .query(async ({ input }) => {
      // Call external weather API
      const response = await fetch(`https://api.weather.com/...`);
      return response.json();
    }),
});
```

---

## Deployment Checklist

Before deploying the AANS website to production:

- [ ] Set environment variables (DATABASE_URL, JWT_SECRET, etc.)
- [ ] Configure CORS for allowed domains
- [ ] Set up SSL/TLS certificates
- [ ] Enable database backups
- [ ] Configure email service (SendGrid)
- [ ] Set up monitoring and logging
- [ ] Test all API endpoints
- [ ] Verify authentication flows
- [ ] Load test the application
- [ ] Set up CDN for static assets

---

## Support & Resources

For additional help:

- **Documentation:** `/docs` on the website
- **GitHub Issues:** Report bugs and feature requests
- **Email:** support@aans.com
- **Discord Community:** Join our developer community

---

**Last Updated:** November 9, 2025
**API Version:** 1.0.0
**Status:** Production Ready
