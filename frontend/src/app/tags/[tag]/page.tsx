import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticles } from '@/lib/drupal';
import { ArticleCard } from '@/components/ui/ArticleCard';
import Link from 'next/link';

export const revalidate = 300;

interface TagPageProps {
  params: { tag: string };
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tagName = decodeURIComponent(params.tag).replace(/-/g, ' ');
  return {
    title: `#${tagName}`,
    description: `Articles tagged with "${tagName}"`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const tagSlug = decodeURIComponent(params.tag);
  const tagName = tagSlug.replace(/-/g, ' ');

  const { items: allArticles } = await getArticles(100, 0);

  // Client-side filter by tag name (case-insensitive)
  const articles = allArticles.filter(article =>
    article.tags.some(t => t.name.toLowerCase() === tagName.toLowerCase())
  );

  if (articles.length === 0) notFound();

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">›</span>
        <Link href="/tags">Tags</Link>
        <span aria-hidden="true">›</span>
        <span>#{tagName}</span>
      </nav>

      <header className="page-header">
        <h1><span className="tag tag--heading">#{tagName}</span></h1>
        <p>{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
      </header>

      <ul className="grid">
        {articles.map(article => (
          <li key={article.id}>
            <ArticleCard article={article} />
          </li>
        ))}
      </ul>
    </div>
  );
}
