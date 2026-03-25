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
  async redirects() {
    return [
      {
        source: '/dashboard/docs',
        destination: '/docs',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
