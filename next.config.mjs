/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.backblazeb2.com', // Autorise tous les serveurs Backblaze
      },
    ],
  },
};

export default nextConfig;
