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
  }
};

export default nextConfig;
