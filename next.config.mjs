/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure allowed image domains
  images: {
    domains: ['randomuser.me'], 
  },

  // Enable experimental features
  experimental: {
    turbo: false, // Disable TurboPack (use Webpack instead)
    serverActions: {
      bodySizeLimit: "5mb", // Set max request body size for server actions
    },
  },
};

export default nextConfig;
