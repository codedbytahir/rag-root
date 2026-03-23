/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["llamaindex", "@llamaindex/openai"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "file.garden",
        pathname: "/aQTok757O1Vcuyyw/**",
      },
    ],
  },
};

export default nextConfig;