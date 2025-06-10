// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  server: {
    actions: {
      bodySizeLimit: "10mb", // Adjust this limit as per your needs
    },
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/admin",
        permanent: true, // Use 'false' if you want a temporary redirect
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*", // your Laravel API
      },
    ];
  },
};

module.exports = nextConfig;
