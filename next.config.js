const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent importing Node built-ins in browser bundles
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
  reactStrictMode: true
};

module.exports = nextConfig;
