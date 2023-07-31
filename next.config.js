/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    trailingSlash: true,
    output: 'export',
    distDir: '_static',
    images: {
        unoptimized: true
    }
}

module.exports = {
    ...nextConfig,
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"]
        });

        return config;
    }
};
