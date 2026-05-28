/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ["app", "components", "lib"]
  },
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;
