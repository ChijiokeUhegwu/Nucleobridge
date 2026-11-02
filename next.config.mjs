/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: '/login', destination: '/auth?view=login', permanent: false },
      { source: '/signup', destination: '/auth?view=signup', permanent: false },
      { source: '/forgot-password', destination: '/auth?view=forgot-password', permanent: false },
      { source: '/reset-password', destination: '/auth?view=reset-password', permanent: false },
    ];
  },
};

export default nextConfig;

