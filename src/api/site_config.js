import { get, post, put, del } from './request';

export async function getSiteConfig() {
    const config = await get('/config/site_config');
    return config?.data;
}

export async function getAllConfig() {
    const config = await get('/config/list');
    return config?.data;
}

export async function updateConfig(key, value) {
    const config = await put(`/config/${key}`, {
        value,
    });
    return config?.data;
}