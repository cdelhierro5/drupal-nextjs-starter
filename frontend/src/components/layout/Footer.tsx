export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p>
          Powered by{' '}
          <a href="https://www.drupal.org" target="_blank" rel="noopener noreferrer">Drupal 10</a>
          {' '}+{' '}
          <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">Next.js 14</a>
          {' '}· GraphQL
        </p>
        <p>
          Built by{' '}
          <a href="https://www.carlosdelhierro.com" target="_blank" rel="noopener noreferrer">
            Carlos Del Hierro
          </a>
        </p>
      </div>
    </footer>
  );
}
