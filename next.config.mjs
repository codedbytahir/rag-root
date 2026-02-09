/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["llamaindex","@llamaindex/openai"],
  },
};
