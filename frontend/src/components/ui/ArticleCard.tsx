import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/types/drupal';
import { readingTime, formatDate } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const time = article.body ? readingTime(article.body)
             : article.summary ? readingTime(article.summary)
             : null;

  return (
    <article className="card">
      {article.image && (
        <Link href={article.path} className="card__image-wrapper" tabIndex={-1}>
          <Image
            src={article.image.url}
            alt={article.image.alt ?? article.title}
            width={600}
            height={340}
            className="card__image"
          />
        </Link>
      )}

      <div className="card__body">
        {article.tags.length > 0 && (
          <div className="card__tags">
            {article.tags.slice(0, 2).map(tag => (
              <Link
                key={tag.id}
                href={`/tags/${encodeURIComponent(tag.name.toLowerCase().replace(/\s+/g, '-'))}`}
                className="tag"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        <h2 className="card__title">
          <Link href={article.path}>{article.title}</Link>
        </h2>

        {article.summary && (
          <p className="card__summary">{article.summary}</p>
        )}

        <footer className="card__footer">
          <div>
            {article.author && <span>{article.author.name}</span>}
            {article.publishedAt && (
              <time dateTime={article.publishedAt} style={{ marginLeft: article.author ? '.5rem' : 0 }}>
                {formatDate(article.publishedAt)}
              </time>
            )}
          </div>
          {time && <span className="card__reading-time">{time}</span>}
        </footer>
      </div>
    </article>
  );
}
