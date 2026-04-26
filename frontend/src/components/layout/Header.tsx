import Link from 'next/link';

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-header__logo">
          🔷 Drupal + Next.js
        </Link>
        <nav className="site-header__nav" aria-label="Main navigation">
          <Link href="/">Home</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/tags">Tags</Link>
        </nav>
      </div>
    </header>
  );
}
