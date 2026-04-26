# Drupal + Next.js Headless Starter

> Production-ready headless starter: Drupal 10 as a GraphQL backend + Next.js 14 App Router frontend.  
> Built by [Carlos Del Hierro](https://www.carlosdelhierro.com) — Drupal Senior Developer.

[![Drupal](https://img.shields.io/badge/Drupal-10.x-0678BE?style=flat-square&logo=drupal)](https://www.drupal.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![GraphQL](https://img.shields.io/badge/GraphQL-SDL%20schema-E10098?style=flat-square&logo=graphql)](https://graphql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-GPL--2.0-blue?style=flat-square)](LICENSE)

---

## What this is

A full-stack headless Drupal starter that demonstrates how to build a modern content platform using Drupal as the editorial backend and Next.js as the frontend delivery layer. This is not a demo — it's the architecture pattern I use in production projects.

The key choices here: GraphQL over JSON:API (typed schema, no over-fetching), App Router over Pages Router (React Server Components, native caching), and ISR with on-demand revalidation so pages stay fast without a CDN purge layer.

---

## Table of contents

- [Architecture overview](#architecture-overview)
- [Why these choices](#why-these-choices)
- [What's included](#whats-included)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [GraphQL API reference](#graphql-api-reference)
- [Frontend pages and routes](#frontend-pages-and-routes)
- [ISR and on-demand revalidation](#isr-and-on-demand-revalidation)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Extending the schema](#extending-the-schema)
- [Adding a new frontend page](#adding-a-new-frontend-page)
- [Deployment](#deployment)
- [FAQ](#faq)

---

## Architecture overview

```
┌─────────────────────────────────────────────────────┐
│                  Editorial layer                     │
│                                                      │
│   Drupal 10 CMS  ─── GraphQL API ───────────────┐   │
│   (DDEV local)        /graphql endpoint          │   │
│                                                  │   │
│   Custom module: nextjs_graphql_api              │   │
│   └── SDL schema (.graphqls file)                │   │
│   └── Schema plugin (@Schema annotation)         │   │
│   └── Extension plugin (@SchemaExtension)        │   │
│   └── Resolver classes per type/field            │   │
└──────────────────────────────────────────────────┼───┘
                                                   │
                    GraphQL queries (server-side only)
                                                   │
┌──────────────────────────────────────────────────▼───┐
│                  Delivery layer                      │
│                                                      │
│   Next.js 14 (App Router)                            │
│   └── React Server Components (no client JS needed)  │
│   └── ISR: pages cached 60s, revalidated on demand   │
│   └── generateStaticParams: all slugs pre-rendered   │
│   └── generateMetadata: SEO tags from Drupal         │
│                                                      │
│   Pages: / → /blog → /blog/[slug] → /tags/[tag]     │
│   API:   /api/revalidate (webhook from Drupal)       │
└──────────────────────────────────────────────────────┘
                         │
              Static HTML + minimal JS
                         │
                     Browser
```

**One important security detail:** The Drupal GraphQL URL is a server-only environment variable (`DRUPAL_GRAPHQL_URL`). It's never exposed to the browser. All GraphQL requests happen server-side in React Server Components. The browser only receives rendered HTML.

---

## Why these choices

### GraphQL over JSON:API

Drupal's JSON:API is excellent for simple use cases, but GraphQL offers meaningful advantages for complex frontends: you define exactly what data you need in the query, related entities are fetched in a single round-trip, and the schema is self-documenting. The `drupal/graphql` v4 module with a custom SDL schema gives full control over the API surface without exposing internal Drupal structures.

### App Router over Pages Router

Next.js 14 App Router brings React Server Components, which means components that fetch data at the server level with no client-side JavaScript cost. The native `fetch` API with built-in ISR support (via the `next` option) makes caching straightforward without extra libraries.

### ISR over SSR or SSG only

Pure SSG rebuilds everything on every content change. Pure SSR hits the database on every request. ISR gives the best of both: pages are statically generated and served from cache, but revalidated automatically every 60 seconds, and immediately when Drupal triggers the webhook. This works well for news and editorial content.

### Custom GraphQL module over auto-generated schemas

Auto-generated schemas expose too much — internal field names, revision data, entity IDs that should be implementation details. A hand-written SDL schema is a clean contract between backend and frontend that you control.

---

## What's included

**Backend (Drupal)**
- Custom `nextjs_graphql_api` module with a hand-written SDL schema
- `@Schema` plugin registering the `nextjs_api` schema
- `@SchemaExtension` plugin with all field resolvers (Article, Page, Author, MediaImage, Term, Metatag)
- `ArticleConnection` wrapper for paginated queries
- DDEV configuration with `api` hostname alias

**Frontend (Next.js)**
- Home page with latest articles
- Blog index with server-side pagination
- Article detail page with SSG + ISR
- Tags index and tag detail pages
- 404 and global error pages
- On-demand revalidation webhook at `/api/revalidate`
- Full TypeScript — types match the GraphQL schema exactly
- Dark theme with reading time, breadcrumbs, and animated article cards
- `ArticleCard`, `Pagination`, `Header`, `Footer` components
- `readingTime()`, `formatDate()`, `truncate()` utilities

---

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) + [DDEV](https://ddev.readthedocs.io) ≥ 1.22
- Node.js ≥ 18
- Composer ≥ 2
- An Anthropic API key is **not** needed for this project

---

## Quick start

### 1. Start the Drupal backend

```bash
cd backend
ddev start
composer install
ddev drush site:install standard \
  --account-name=admin \
  --account-pass=admin \
  --yes
ddev drush en graphql nextjs_graphql_api -y
ddev drush cr
```

The backend is now at `https://drupal-nextjs-backend.ddev.site`.

Open the GraphQL explorer at `https://drupal-nextjs-backend.ddev.site/graphql` (you may need to enable the `graphql_ui` submodule first: `ddev drush en graphql_ui -y`).

### 2. Create some content

Log in at `https://drupal-nextjs-backend.ddev.site/user/login` (admin / admin).

Create a few **Article** nodes with a title, body, and at least one tag. Make sure they are published and have URL aliases like `/blog/my-article`.

### 3. Start the Next.js frontend

```bash
cd frontend
cp .env.local.example .env.local
# .env.local is pre-configured for DDEV — no changes needed for local dev
npm install
npm run dev
```

The frontend is now at `http://localhost:3000`.

---

## GraphQL API reference

The schema is defined in `backend/web/modules/custom/nextjs_graphql_api/nextjs_graphql_api.graphqls`.

### Queries

#### `articles(limit, offset)` → `ArticleConnection`

Fetch a paginated list of published articles, newest first.

```graphql
query GetArticles($limit: Int, $offset: Int) {
  articles(limit: $limit, offset: $offset) {
    items {
      id
      title
      path
      summary
      publishedAt
      image { url alt width height }
      tags { id name path }
      author { name }
    }
    total
    hasMore
  }
}
```

#### `article(path)` → `Article`

Fetch a single article by its Drupal path alias.

```graphql
query GetArticle($path: String!) {
  article(path: $path) {
    id
    title
    path
    body
    summary
    publishedAt
    updatedAt
    image { url alt width height }
    tags { id name path }
    author { name picture { url alt } }
    metatags { name content }
  }
}
```

#### `page(path)` → `Page`

Fetch a basic page by path alias.

```graphql
query GetPage($path: String!) {
  page(path: $path) {
    id
    title
    path
    body
    metatags { name content }
  }
}
```

### Types

| Type | Fields |
|------|--------|
| `Article` | id, title, path, summary, body, author, image, tags, publishedAt, updatedAt, metatags |
| `ArticleConnection` | items, total, hasMore |
| `Page` | id, title, path, body, metatags |
| `Author` | name, picture |
| `MediaImage` | url, alt, width, height |
| `Term` | id, name, path |
| `Metatag` | name, content |

---

## Frontend pages and routes

| Route | File | Rendering |
|-------|------|-----------|
| `/` | `app/page.tsx` | ISR (60s) |
| `/blog` | `app/blog/page.tsx` | ISR (60s) + search params pagination |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | SSG + ISR (60s) |
| `/tags` | `app/tags/page.tsx` | ISR (300s) |
| `/tags/[tag]` | `app/tags/[tag]/page.tsx` | ISR (300s) |
| `/api/revalidate` | `app/api/revalidate/route.ts` | API route (POST) |

All content pages use `generateMetadata()` to pull SEO tags from Drupal's Metatag module and write them to `<head>` automatically.

---

## ISR and on-demand revalidation

### Background revalidation

Every page has a `revalidate` export that tells Next.js how long to serve a cached version before re-fetching from Drupal:

```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 60; // seconds
```

After 60 seconds, the next request triggers a background re-fetch. The user still gets the cached page instantly.

### On-demand revalidation

When Drupal publishes or updates content, it can call the revalidation webhook to purge the cache immediately:

```bash
curl -X POST https://yoursite.com/api/revalidate \
  -H "x-revalidate-secret: your-secret-here" \
  -H "Content-Type: application/json" \
  -d '{"path": "/blog/my-article"}'
```

**Setting up the webhook from Drupal:**

The cleanest approach is a custom module that implements `hook_node_update` and sends the POST request:

```php
function mymodule_node_update(NodeInterface $node): void {
  if ($node->bundle() !== 'article') {
    return;
  }

  $alias = \Drupal::service('path_alias.manager')
    ->getAliasByPath('/node/' . $node->id());

  \Drupal::httpClient()->post(getenv('NEXTJS_REVALIDATE_URL'), [
    'headers' => [
      'x-revalidate-secret' => getenv('NEXTJS_REVALIDATE_SECRET'),
      'Content-Type' => 'application/json',
    ],
    'json' => ['path' => $alias],
  ]);
}
```

Alternatively use the Rules module to trigger this via a UI rule.

---

## Environment variables

### Backend (Drupal — `.env` or Drupal settings)

```bash
NEXTJS_REVALIDATE_URL=https://yoursite.com/api/revalidate
NEXTJS_REVALIDATE_SECRET=your-shared-secret
```

### Frontend (Next.js — `.env.local`)

```bash
# Drupal backend URL — server-side only, never exposed to browser
DRUPAL_BASE_URL=https://drupal-nextjs-backend.ddev.site
DRUPAL_GRAPHQL_URL=https://drupal-nextjs-backend.ddev.site/graphql

# Must match the secret configured in Drupal
DRUPAL_REVALIDATE_SECRET=your-shared-secret

# Public site URL — used in metadata
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Project structure

```
drupal-nextjs-starter/
│
├── backend/                    # Drupal 10
│   ├── .ddev/                  # DDEV configuration
│   ├── composer.json           # Drupal + GraphQL module dependencies
│   └── web/
│       └── modules/custom/
│           └── nextjs_graphql_api/
│               ├── nextjs_graphql_api.info.yml
│               ├── nextjs_graphql_api.graphqls      # SDL schema
│               └── src/
│                   ├── Plugin/GraphQL/
│                   │   ├── Schema/NextjsApiSchema.php      # @Schema plugin
│                   │   └── SchemaExtension/
│                   │       └── NextjsApiSchemaExtension.php # All resolvers
│                   └── Wrappers/
│                       └── ArticleConnection.php            # Pagination wrapper
│
└── frontend/                   # Next.js 14
    ├── next.config.js
    ├── tsconfig.json
    ├── .env.local.example
    └── src/
        ├── app/
        │   ├── layout.tsx              # Root layout + metadata
        │   ├── page.tsx                # Home page
        │   ├── not-found.tsx           # Custom 404
        │   ├── global-error.tsx        # Error boundary
        │   ├── globals.css             # Dark theme + design system
        │   ├── blog/
        │   │   ├── page.tsx            # Blog index with pagination
        │   │   └── [slug]/page.tsx     # Article detail (SSG + ISR)
        │   ├── tags/
        │   │   ├── page.tsx            # All tags
        │   │   └── [tag]/page.tsx      # Articles by tag
        │   └── api/revalidate/
        │       └── route.ts            # ISR webhook
        ├── components/
        │   ├── ui/
        │   │   ├── ArticleCard.tsx     # Card with reading time + tag links
        │   │   └── Pagination.tsx
        │   └── layout/
        │       ├── Header.tsx
        │       └── Footer.tsx
        ├── lib/
        │   ├── drupal.ts               # GraphQL client + all queries + fetch functions
        │   └── utils.ts                # readingTime, formatDate, truncate
        └── types/
            └── drupal.ts               # TypeScript types matching the schema
```

---

## Extending the schema

### Adding a new field to an existing type

**1. Add the field to the SDL schema** (`nextjs_graphql_api.graphqls`):

```graphql
type Article {
  # existing fields...
  readTime: Int  # ← new field
}
```

**2. Add the resolver in `NextjsApiSchemaExtension.php`**:

```php
$r->addFieldResolver('Article', 'readTime',
  $b->produce('property_path')
    ->map('type', $b->fromValue('entity:node'))
    ->map('value', $b->fromParent())
    ->map('path', $b->fromValue('field_read_time.value'))
);
```

**3. Update the TypeScript type** (`src/types/drupal.ts`):

```typescript
export interface Article {
  // existing fields...
  readTime?: number;
}
```

**4. Update the GraphQL query** in `src/lib/drupal.ts` to include the new field.

### Adding a new query

Same process: add to the SDL `Query` type, add a resolver in the extension, add a fetch function in `drupal.ts`, add a TypeScript type if needed.

---

## Adding a new frontend page

Example: adding a `/authors/[name]` page.

**1. Add the GraphQL query** to `src/lib/drupal.ts`:

```typescript
const GET_AUTHOR_ARTICLES = /* GraphQL */ `
  query GetAuthorArticles($name: String!, $limit: Int) {
    articles(limit: $limit, offset: 0) {
      items {
        ...ArticleFields
      }
    }
  }
`;

export async function getArticlesByAuthor(name: string): Promise<Article[]> {
  const data = await drupalClient.request<{ articles: ArticleConnection }>(
    GET_AUTHOR_ARTICLES, { name, limit: 50 }
  );
  return data.articles.items.filter(a => a.author?.name === name);
}
```

**2. Create the page** at `src/app/authors/[name]/page.tsx`:

```typescript
export default async function AuthorPage({ params }: { params: { name: string } }) {
  const articles = await getArticlesByAuthor(decodeURIComponent(params.name));
  if (!articles.length) notFound();

  return (
    <div className="container">
      <h1>{decodeURIComponent(params.name)}</h1>
      <ul className="grid">
        {articles.map(article => (
          <li key={article.id}><ArticleCard article={article} /></li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Deployment

### Frontend → Vercel (recommended)

```bash
vercel --prod
```

Set these environment variables in the Vercel dashboard:

```
DRUPAL_BASE_URL=https://cms.yourdomain.com
DRUPAL_GRAPHQL_URL=https://cms.yourdomain.com/graphql
DRUPAL_REVALIDATE_SECRET=your-secret
NEXT_PUBLIC_SITE_URL=https://www.yourdomain.com
```

### Backend → Any PHP 8.1+ host

Drupal 10 works on Acquia, Platform.sh, Pantheon, Kinsta, or any VPS. Set the database credentials and run `composer install --no-dev --optimize-autoloader`.

Enable these Drupal modules for production:

```bash
drush en big_pipe internal_page_cache dynamic_page_cache -y
drush config:set system.performance css.preprocess 1 -y
drush config:set system.performance js.preprocess 1 -y
drush pmu devel -y
drush cr
```

---

## FAQ

**Q: Why use GraphQL and not JSON:API?**
JSON:API is included in Drupal core and works well, but it over-fetches by default and requires multiple requests for related data. GraphQL lets the frontend define exactly what it needs in a single query. The `drupal/graphql` v4 module with a custom SDL schema is the most flexible approach.

**Q: Can I use this with Pages Router instead of App Router?**
The GraphQL client (`src/lib/drupal.ts`) works the same in both routers. The main difference is that App Router uses `fetch` with the `next` option for ISR, while Pages Router uses `getStaticProps` with `revalidate`. You would need to rewrite the page components but could keep the data-fetching layer.

**Q: The GraphQL explorer shows no schema. What's wrong?**
Make sure both `graphql` and `nextjs_graphql_api` modules are enabled. Also enable `graphql_ui`: `drush en graphql_ui -y`. Then go to `/admin/config/graphql` and add a server using the `nextjs_api` schema.

**Q: Metatags are not appearing in the Next.js `<head>`. Why?**
The `metatag` Drupal module must be installed and configured for the content type. Check that metatag values are set on the specific node. The `generateMetadata()` function in the article page reads from `article.metatags`, which comes from the `metatags` field resolver in the GraphQL schema.

**Q: How do I handle authentication for private content?**
Uncomment the `Authorization` header in the `drupalClient` initialization in `src/lib/drupal.ts` and implement OAuth2 using Drupal's `simple_oauth` module. Add the client credentials to your environment variables.

---

## Author

**Carlos Del Hierro** — Drupal Senior Developer
🌐 [carlosdelhierro.com](https://www.carlosdelhierro.com)
💼 [LinkedIn](https://www.linkedin.com/in/carlosdelhierrodev)
🐙 [GitHub](https://github.com/cdelhierro5)

---

## License

GPL-2.0-or-later
