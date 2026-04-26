import type { Metadata } from 'next';
import { getArticles } from '@/lib/drupal';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { Pagination } from '@/components/ui/Pagination';

export const revalidate = 60;

const PAGE_SIZE = 9;

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Latest articles from our Drupal-powered blog.',
};

interface BlogPageProps {
  searchParams: { page?: string };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const currentPage = Math.max(1, Number(searchParams.page ?? 1));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const { items: articles, total, hasMore } = await getArticles(PAGE_SIZE, offset);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="container">
      <header className="page-header">
        <h1>Blog</h1>
        <p>{total} articles</p>
      </header>

      {articles.length === 0 ? (
        <p>No articles found. Create some content in Drupal first.</p>
      ) : (
        <>
          <ul className="grid">
            {articles.map((article) => (
              <li key={article.id}>
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasMore={hasMore}
          />
        </>
      )}
    </div>
  );
}
