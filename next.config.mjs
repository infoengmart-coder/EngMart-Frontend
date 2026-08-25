/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: `typescript.ignoreBuildErrors: true` used to sit here, which let a
  // build containing real type errors ship to production silently. `tsc
  // --noEmit` passes cleanly, so the guard is back on: a type error should
  // fail the build rather than reach a customer.
  images: {
    // Product imagery is served from the Django media host, which is not
    // listed in `remotePatterns`. Leave optimisation off until that host is
    // configured, otherwise every product image 400s in production.
    unoptimized: true,
  },
}

export default nextConfig
