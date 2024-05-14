import { get, post, put, del } from './request';

export async function getClassTaskList(classId) {
    const data = await get(`/class/${classId}/task/list`);
    return data;
}

export async function getClassTask(classId, taskId) {
    const data = await get(`/class/${classId}/task/${taskId}`);
    return data?.data;
}

export async function updateClassTask(classId, taskId, data) {
    const task = await put(`/class/${classId}/task/${taskId}`, data);
    return task?.data;
}

export async function createClassTask(classId, data) {
    const task = await post(`/class/${classId}/task/create`, data);
    return task?.data;
}

export async function deleteClassTask(classId, taskId) {
    const task = await del(`/class/${classId}/task/${taskId}`);
    return task?.data;
}

export async function setTaskSequence(classId, data) {
    const task = await post(`/class/${classId}/task/sequence`, data);
    return task?.data;
}

export async function getGroupTaskChain(classId, groupId) {
    const data = await get(`/class/${classId}/group/${groupId}/task_chain`);
    return data;
}

export async function getTaskMemberScore(classId, groupId, taskId) {
    const data = await get(`/class/${classId}/group/${groupId}/task/${taskId}/group_score`)
    return data;
}

export async function setTaskMemberScore(classId, groupId, taskId, data) {
    const score = await post(`/class/${classId}/group/${groupId}/task/${taskId}/group_score`, data)
    return score;
}

export async function getCompletedMemberList(classId, groupId, taskId) {
    const data = await get(`/class/${classId}/group/${groupId}/task/${taskId}/group_score/finished`)
    return data;
}

export async function checkTaskCanDelivery(classId, groupId, taskId) {
    const data = await get(`/class/${classId}/group/${groupId}/task/${taskId}/delivery/check`)
    return data;
}

export async function getTaskDeliveryList(classId, groupId, taskId) {
    const data = await get(`/class/${classId}/group/${groupId}/task/${taskId}/delivery/list`)
    return data;
}

export async function addTaskDeliveryDraftItem(classId, groupId, taskId, data) {
    const delivery = await post(`/class/${classId}/group/${groupId}/task/${taskId}/delivery/draft/item`, data)
    return delivery?.data;
}

export async function deleteTaskDeliveryDraftItem(classId, groupId, taskId, itemId) {
    const delivery = await del(`/class/${classId}/group/${groupId}/task/${taskId}/delivery/draft/item/${itemId}`)
    return delivery?.data;
}