import { site_config } from '@/api/index';
const SITE_CONFIG_KEY = 'scs:site_config';

export async function getSiteConfig() {
    const configStr = localStorage.getItem(SITE_CONFIG_KEY);
    try {
        const config = JSON.parse(configStr);
        if (config.expires > Date.now()) {
            return config.data;
        }
    } catch (error) {

    }

    const newConfig = await site_config.getSiteConfig();
    localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify({
        expires: Date.now() + 86400000,
        data: newConfig,
    }));

    return newConfig;
}