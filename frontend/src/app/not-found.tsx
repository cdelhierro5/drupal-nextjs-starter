import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="not-found container">
      <div className="not-found__code">404</div>
      <h1 className="not-found__title">Page not found</h1>
      <p className="not-found__desc">
        The content you&apos;re looking for doesn&apos;t exist or has been moved in Drupal.
      </p>
      <div className="not-found__actions">
        <Link href="/" className="btn">← Back to home</Link>
        <Link href="/blog" className="btn btn--ghost">Browse articles</Link>
      </div>
    </div>
  );
}
