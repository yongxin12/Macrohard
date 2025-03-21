import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose'],
  webpack: (config) => {
    // Add support for importing PDF files
    config.module.rules.push({
      test: /\.(pdf)$/i,
      type: 'asset/resource',
    });
    return config;
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};

export default nextConfig;
