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
      }
    ],
  },
  allowedDevOrigins: ['192.168.1.84', 'localhost'],
};

module.exports = nextConfig;
