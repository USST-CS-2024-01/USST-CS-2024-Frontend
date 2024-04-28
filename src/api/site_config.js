import { get, post, put, del } from './request';

export async function getSiteConfig() {
    const config = await get('/config/site_config');
    return config?.data;
}