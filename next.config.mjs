/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Serve modern formats automatically (AVIF first, WebP fallback for older clients).
    formats: ['image/avif', 'image/webp'],
    // Portrait cards: keep generated variants lean for small mobile viewports.
    deviceSizes: [360, 420, 640, 768, 1024, 1280],
    imageSizes: [120, 160, 220, 320],
    qualities: [55, 70, 82],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
}

export default nextConfig
