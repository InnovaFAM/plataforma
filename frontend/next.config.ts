import {NextConfig} from "next";
import createNextIntlPlugin from 'next-intl/plugin';

import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

const withNextIntl = createNextIntlPlugin();
const nextConfig: NextConfig = {
    reactStrictMode: true,
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
