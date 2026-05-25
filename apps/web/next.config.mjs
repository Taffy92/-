/** @type {import('next').NextConfig} */
const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://hm.baidu.com https://*.baidu.com https://*.bdstatic.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' blob: data: https:",
  "worker-src 'self' blob: data:",
  "frame-src 'self' https://googleads.g.doubleclick.net https://*.googlesyndication.com https://*.doubleclick.net",
  "upgrade-insecure-requests"
].join("; ");

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=()"
  },
  {
    key: "X-Frame-Options",
    value: "DENY"
  },
  {
    key: "Content-Security-Policy",
    value: cspDirectives
  }
];

const nextConfig = {
  output: "export",
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  transpilePackages: [
    "@doctool/ui",
    "@doctool/shared",
    "@doctool/image-core",
    "@doctool/pdf-core",
    "@doctool/export-core",
    "@doctool/media-core"
  ],
  webpack(config) {
    config.resolve.alias.canvas = false;
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
