import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getArticle, getAllArticlePaths } from '@/lib/drupal';
import { readingTime, formatDate } from '@/lib/utils';

export const revalidate = 60;

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const paths = await getAllArticlePaths();
  return paths.map(path => ({ slug: path.replace('/blog/', '') }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticle(`/blog/${params.slug}`);
  if (!article) return { title: 'Not found' };
  const metaMap = Object.fromEntries(article.metatags.map(m => [m.name, m.content]));
  return {
    title: metaMap['title'] ?? article.title,
    description: metaMap['description'] ?? article.summary,
    openGraph: {
      title: metaMap['og:title'] ?? article.title,
      description: metaMap['og:description'] ?? article.summary,
      images: article.image ? [{ url: article.image.url }] : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(`/blog/${params.slug}`);
  if (!article) notFound();

  const time = article.body ? readingTime(article.body) : null;

  return (
    <article className="container article">

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">›</span>
        <Link href="/blog">Blog</Link>
        <span aria-hidden="true">›</span>
        <span>{article.title}</span>
      </nav>

      <header className="article__header">
        {article.tags.length > 0 && (
          <ul className="article__tags">
            {article.tags.map(tag => (
              <li key={tag.id}>
                <Link
                  href={`/tags/${encodeURIComponent(tag.name.toLowerCase().replace(/\s+/g, '-'))}`}
                  className="tag"
                >
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <h1 className="article__title">{article.title}</h1>

        <div className="article__meta">
          {article.author && <span>By {article.author.name}</span>}
          {article.publishedAt && (
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          )}
          {time && <span className="article__reading-time">⏱ {time}</span>}
        </div>
      </header>

      {article.image && (
        <div className="article__hero-image">
          <Image
            src={article.image.url}
            alt={article.image.alt ?? article.title}
            width={article.image.width ?? 1200}
            height={article.image.height ?? 630}
            priority
          />
        </div>
      )}

      {article.body && (
        <div
          className="article__body prose"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />
      )}
    </article>
  );
}
