/** @type {import('next').NextConfig} */

// Post images are served by the API, so its origin must be allowed for next/image.
function apiImagePattern() {
  try {
    const { protocol, hostname, port } = new URL(process.env.NEXT_PUBLIC_BASE_PATH);
    return [{ protocol: protocol.replace(":", ""), hostname, port, pathname: "/uploads/**" }];
  } catch {
    return [];
  }
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: apiImagePattern(),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
