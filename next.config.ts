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
  experimental: {
    // Approval-request PDFs are uploaded through server actions; the default
    // body cap is 1MB. Validation caps the file at 4MB; 4.5MB matches
    // Vercel's platform request limit (this option is global, so keep it as
    // tight as the largest legitimate upload allows).
    serverActions: { bodySizeLimit: "4.5mb" },
  },
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
