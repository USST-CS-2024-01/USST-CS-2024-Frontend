import { user } from '@/api/index';
const AVATARS = {}


export async function getAvatar(id) {
    id = id.toString();
    if (!AVATARS[id]) {
        AVATARS[id] = await user.getAvatar(id);
    }
    return AVATARS[id];
}

