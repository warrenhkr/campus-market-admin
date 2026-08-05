import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Désactivé pour éviter la double-invocation des Server Actions en dev
  // (React StrictMode causerait request_count = 3 pour 1 seul clic OTP)
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
}

export default nextConfig

