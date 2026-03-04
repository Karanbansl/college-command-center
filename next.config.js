/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // basePath is set via env var in GitHub Actions (e.g. /college-command-center)
  // Locally it stays empty so http://localhost:3000 works as-is
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
