
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.paypal.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'space.gov.ae',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.rmcad.edu',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.durable.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
