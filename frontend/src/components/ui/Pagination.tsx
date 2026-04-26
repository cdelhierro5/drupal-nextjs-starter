import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export function Pagination({ currentPage, totalPages, hasMore }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Blog pagination">
      {currentPage > 1 && (
        <Link
          href={`/blog?page=${currentPage - 1}`}
          className="pagination__btn"
          aria-label="Previous page"
        >
          ← Previous
        </Link>
      )}

      <span className="pagination__info">
        Page {currentPage} of {totalPages}
      </span>

      {hasMore && (
        <Link
          href={`/blog?page=${currentPage + 1}`}
          className="pagination__btn"
          aria-label="Next page"
        >
          Next →
        </Link>
      )}
    </nav>
  );
}
