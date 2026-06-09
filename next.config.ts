import type { NextConfig } from "next";

// Admin-uploaded images are served from the Supabase public storage bucket
// (`site-media`). Allow next/image to optimise them. Host is derived from
// SUPABASE_URL so it follows the project, with the axon-syria ref as fallback.
const supabaseHost = (() => {
  try {
    return process.env.SUPABASE_URL
      ? new URL(process.env.SUPABASE_URL).hostname
      : "uhuoqcuhwfgnylcljhct.supabase.co";
  } catch {
    return "uhuoqcuhwfgnylcljhct.supabase.co";
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
