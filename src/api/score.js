import { get, post, put, del } from './request';

export async function getClassScoreList(classId) {
    const data = await get(`/class/${classId}/score/list`);
    return data;
}