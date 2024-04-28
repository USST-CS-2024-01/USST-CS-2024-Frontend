import { get, post, put, del } from './request';

export async function getMeUser() {
    const user = await get('/user/me');
    return user?.data;
}


export async function getAvatar(userId) {
    const avatar = await get(`/user/${userId}/avatar`);
    return avatar?.data?.avatar;
}