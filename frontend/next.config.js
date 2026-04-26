/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow images from the Drupal backend domain.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drupal-nextjs-backend.ddev.site',
        pathname: '/sites/default/files/**',
      },
      // Add your production Drupal domain here.
      // { protocol: 'https', hostname: 'cms.yourdomain.com' },
    ],
  },

  // Rewrite /graphql requests to Drupal during development
  // so the frontend never exposes the CMS URL to the browser.
  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? [
          {
            source: '/__drupal/:path*',
            destination: `${process.env.DRUPAL_BASE_URL}/:path*`,
          },
        ]
      : [];
  },
};

module.exports = nextConfig;
