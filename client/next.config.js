/** @type {import('next').NextConfig}  */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    // Disable runtime JS modifications
    runtime: 'nodejs',
    // Enable server components
    serverComponents: true,
  },
  generateBuildId: async () => {
    return 'build'
  }
};

module.exports = nextConfig;