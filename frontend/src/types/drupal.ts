// Types generated from the Drupal GraphQL schema.
// Keep in sync with nextjs_graphql_api.graphqls

export interface Article {
  id: string;
  title: string;
  path: string;
  summary?: string;
  body?: string;
  author?: Author;
  image?: MediaImage;
  tags: Term[];
  publishedAt?: string;
  updatedAt?: string;
  metatags: Metatag[];
}

export interface Page {
  id: string;
  title: string;
  path: string;
  body?: string;
  metatags: Metatag[];
}

export interface ArticleConnection {
  items: Article[];
  total: number;
  hasMore: boolean;
}

export interface Author {
  name: string;
  picture?: MediaImage;
}

export interface MediaImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface Term {
  id: string;
  name: string;
  path?: string;
}

export interface Metatag {
  name: string;
  content: string;
}
