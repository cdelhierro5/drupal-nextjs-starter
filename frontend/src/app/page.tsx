import Link from 'next/link';
import { getArticles } from '@/lib/drupal';
import { ArticleCard } from '@/components/ui/ArticleCard';

// ISR — revalidate every 60 seconds
export const revalidate = 60;

export default async function HomePage() {
  const { items: articles, total } = await getArticles(6, 0);

  return (
    <div className="container">
      <section className="hero">
        <h1>Drupal + Next.js Starter</h1>
        <p>
          Headless Drupal 10 · GraphQL API · Next.js 14 App Router · TypeScript
        </p>
        <Link href="/blog" className="btn">
          Read the blog →
        </Link>
      </section>

      <section className="articles-grid">
        <h2>Latest articles <span className="muted">({total} total)</span></h2>

        {articles.length === 0 ? (
          <p>No articles published yet. Add some content in Drupal.</p>
        ) : (
          <ul className="grid">
            {articles.map((article) => (
              <li key={article.id}>
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
