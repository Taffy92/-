export const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://hm.baidu.com https://*.baidu.com https://*.bdstatic.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' blob: data: https://*.tcloudbase.com https://*.tcloudbaseapp.com https://hm.baidu.com https://*.baidu.com https://*.bdstatic.com",
  "media-src 'self' blob: data:",
  "manifest-src 'self'",
  "worker-src 'self' blob: data:",
  "frame-src 'self' https://*.baidu.com https://*.bdstatic.com",
  "upgrade-insecure-requests"
].join("; ");

export const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=()" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy }
];

export const metaContentSecurityPolicy = contentSecurityPolicy
  .split("; ")
  .filter((directive) => !directive.startsWith("frame-ancestors"))
  .join("; ");

export const securityMetaTags = [
  { httpEquiv: "Content-Security-Policy", content: metaContentSecurityPolicy },
  { name: "referrer", content: "strict-origin-when-cross-origin" },
  { httpEquiv: "Permissions-Policy", content: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=()" },
  { httpEquiv: "X-Content-Type-Options", content: "nosniff" }
];
