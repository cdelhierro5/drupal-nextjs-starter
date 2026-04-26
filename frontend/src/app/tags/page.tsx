import type { Metadata } from 'next';
import Link from 'next/link';
import { getArticles } from '@/lib/drupal';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Tags',
  description: 'Browse articles by topic.',
};

export default async function TagsPage() {
  // Fetch a broad set of articles to extract all unique tags
  const { items } = await getArticles(100, 0);

  const tagMap = new Map<string, { name: string; path?: string; count: number }>();

  items.forEach(article => {
    article.tags.forEach(tag => {
      const existing = tagMap.get(tag.id);
      if (existing) {
        existing.count++;
      } else {
        tagMap.set(tag.id, { name: tag.name, path: tag.path ?? undefined, count: 1 });
      }
    });
  });

  const tags = Array.from(tagMap.values()).sort((a, b) => b.count - a.count);

  return (
    <div className="container">
      <header className="page-header">
        <h1>Tags</h1>
        <p>{tags.length} topics</p>
      </header>

      {tags.length === 0 ? (
        <p>No tags found. Add taxonomy terms to your articles in Drupal.</p>
      ) : (
        <div className="tags-cloud">
          {tags.map(tag => (
            <Link
              key={tag.name}
              href={`/tags/${encodeURIComponent(tag.name.toLowerCase().replace(/\s+/g, '-'))}`}
              className="tag tag--large"
            >
              {tag.name}
              <span className="tag-count">{tag.count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
