import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * On-demand ISR revalidation endpoint.
 *
 * Drupal calls this webhook (via a hook or Rules module) whenever a node
 * is published, updated or deleted. Next.js then invalidates the cached
 * page immediately rather than waiting for the 60s revalidate window.
 *
 * Drupal configuration:
 *   POST https://yoursite.com/api/revalidate
 *   Header: x-revalidate-secret: <DRUPAL_REVALIDATE_SECRET>
 *   Body: { "path": "/blog/my-article" }
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');

  if (secret !== process.env.DRUPAL_REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  let path: string;

  try {
    const body = await request.json();
    path = body.path;

    if (!path || typeof path !== 'string') {
      throw new Error('Missing or invalid path');
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body. Expected { path: string }' },
      { status: 400 }
    );
  }

  revalidatePath(path);

  return NextResponse.json({
    revalidated: true,
    path,
    timestamp: new Date().toISOString(),
  });
}
