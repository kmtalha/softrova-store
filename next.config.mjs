/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wgeludechvdbubndlzmf.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8ilfApFeSW-QJ0KMDPGBZg_3WxH6gvV',
  },
};

export default nextConfig;
