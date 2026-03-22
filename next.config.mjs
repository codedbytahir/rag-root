/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["llamaindex","@llamaindex/openai"],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'file.garden',
        port: '',
        pathname: '/**',
      },
    ],
  },
};
