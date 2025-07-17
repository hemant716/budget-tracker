/** @type {import('next').NextConfig} */
const nextConfig = {
     images: {
    domains: ['randomuser.me'], 
  },
  experimental: {
    turbo: false, 
    serverActions:{
      bodySizeLimit:"5mb",
    },
  },
};

export default nextConfig;
