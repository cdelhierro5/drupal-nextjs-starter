import { GraphQLClient } from 'graphql-request';
import type { Article, ArticleConnection, Page } from '@/types/drupal';

// ---------------------------------------------------------------------------
// Client setup
// ---------------------------------------------------------------------------

const GRAPHQL_URL = process.env.DRUPAL_GRAPHQL_URL!;

if (!GRAPHQL_URL) {
  throw new Error('Missing env var: DRUPAL_GRAPHQL_URL');
}

/**
 * Server-side GraphQL client.
 * Credentials never leave the server — DRUPAL_GRAPHQL_URL is a server env var.
 */
export const drupalClient = new GraphQLClient(GRAPHQL_URL, {
  headers: {
    // Add Authorization header here if using simple_oauth:
    // Authorization: `Bearer ${await getAccessToken()}`,
  },
  // Next.js 14 fetch options for ISR / caching
  fetch: (url, options) =>
    fetch(url, {
      ...options,
      next: { revalidate: 60 }, // Revalidate cached responses every 60s
    }),
});

// ---------------------------------------------------------------------------
// Fragments
// ---------------------------------------------------------------------------

const ARTICLE_FIELDS = /* GraphQL */ `
  fragment ArticleFields on Article {
    id
    title
    path
    summary
    publishedAt
    image {
      url
      alt
      width
      height
    }
    tags {
      id
      name
      path
    }
    author {
      name
    }
  }
`;

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const GET_ARTICLES = /* GraphQL */ `
  ${ARTICLE_FIELDS}
  query GetArticles($limit: Int, $offset: Int) {
    articles(limit: $limit, offset: $offset) {
      items {
        ...ArticleFields
      }
      total
      hasMore
    }
  }
`;

const GET_ARTICLE = /* GraphQL */ `
  query GetArticle($path: String!) {
    article(path: $path) {
      id
      title
      path
      body
      summary
      publishedAt
      updatedAt
      image {
        url
        alt
        width
        height
      }
      tags {
        id
        name
        path
      }
      author {
        name
        picture {
          url
          alt
        }
      }
      metatags {
        name
        content
      }
    }
  }
`;

const GET_PAGE = /* GraphQL */ `
  query GetPage($path: String!) {
    page(path: $path) {
      id
      title
      path
      body
      metatags {
        name
        content
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Data fetching functions
// ---------------------------------------------------------------------------

/**
 * Fetches a paginated list of articles.
 * Used in the blog index with ISR.
 */
export async function getArticles(
  limit = 10,
  offset = 0
): Promise<ArticleConnection> {
  const data = await drupalClient.request<{ articles: ArticleConnection }>(
    GET_ARTICLES,
    { limit, offset }
  );
  return data.articles;
}

/**
 * Fetches a single article by path alias.
 * Returns null if the path is not found or not an article.
 */
export async function getArticle(path: string): Promise<Article | null> {
  try {
    const data = await drupalClient.request<{ article: Article | null }>(
      GET_ARTICLE,
      { path }
    );
    return data.article;
  } catch {
    return null;
  }
}

/**
 * Fetches a basic page by path alias.
 */
export async function getPage(path: string): Promise<Page | null> {
  try {
    const data = await drupalClient.request<{ page: Page | null }>(
      GET_PAGE,
      { path }
    );
    return data.page;
  } catch {
    return null;
  }
}

/**
 * Fetches all article paths for static generation (generateStaticParams).
 */
export async function getAllArticlePaths(): Promise<string[]> {
  const connection = await getArticles(100, 0);
  return connection.items.map((a) => a.path);
}
