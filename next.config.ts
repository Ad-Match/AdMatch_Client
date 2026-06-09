import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

const revision =
  spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout?.trim() ||
  randomUUID();

const withSerwist = withSerwistInit({
  disable: process.env.NODE_ENV === 'development',
  additionalPrecacheEntries: [{ url: '/~offline', revision }],
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default withSerwist(nextConfig);
