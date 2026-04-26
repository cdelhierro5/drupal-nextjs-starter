'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="not-found container">
          <div className="not-found__code">500</div>
          <h1 className="not-found__title">Something went wrong</h1>
          <p className="not-found__desc">
            {error.message ?? 'An unexpected error occurred. The Drupal backend may be unreachable.'}
          </p>
          <div className="not-found__actions">
            <button className="btn" onClick={reset}>Try again</button>
          </div>
        </div>
      </body>
    </html>
  );
}
