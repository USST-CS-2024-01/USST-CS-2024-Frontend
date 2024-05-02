/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
            config.plugins.push(new MonacoWebpackPlugin({
                languages: ['markdown'],
            }));
        }
        return config;
    }
}

module.exports = nextConfig
