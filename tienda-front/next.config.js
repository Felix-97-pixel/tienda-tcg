const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cards.scryfall.io',
      },
      {
        protocol: 'https',
        hostname: 'images.pokemontcg.io',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'cmsassets.rgpub.io',
      },
      {
        protocol: 'https',
        hostname: 'images.scrydex.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
      }
    ],
  },
  allowedDevOrigins: ['192.168.1.84', 'localhost'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/tiendas',
        destination: '/stores',
        permanent: true,
      },
      {
        source: '/vender-cartas',
        destination: '/sell-cards',
        permanent: true,
      },
      {
        source: '/terminos-y-condiciones',
        destination: '/terms-and-conditions',
        permanent: true,
      },
      {
        source: '/politica-de-privacidad',
        destination: '/privacy-policy',
        permanent: true,
      },
      {
        source: '/recuperar-cuenta',
        destination: '/forgot-password',
        permanent: true,
      },
      {
        source: '/restablecer-contrasena',
        destination: '/reset-password',
        permanent: true,
      },
      {
        source: '/signin',
        destination: '/login',
        permanent: true,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
