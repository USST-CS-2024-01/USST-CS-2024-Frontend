import { get, post, put, del } from './request';

export async function getClassTaskList(classId) {
    const data = await get(`/class/${classId}/task/list`);
    return data;
}

export async function getClassTaskChain(classId) {
    const data = await get(`/class/${classId}/task_chain`);
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

export async function submitTaskDeliveryDraft(classId, groupId, taskId) {
    const delivery = await post(`/class/${classId}/group/${groupId}/task/${taskId}/delivery/draft/submit`)
    return delivery?.data;
}

export async function createTaskDeliveryDraft(classId, groupId, taskId) {
    const delivery = await post(`/class/${classId}/group/${groupId}/task/${taskId}/delivery/draft`, {})
    return delivery?.data;
}

export async function approveTaskDeliveryAudit(classId, groupId, taskId, score) {
    const payload = {};
    if (score) {
        payload.score = score
    }
    const delivery = await post(`/class/${classId}/group/${groupId}/task/${taskId}/delivery/review/approve`, payload);
    return delivery?.data;
}

export async function rejectTaskDeliveryAudit(classId, groupId, taskId, delivery_comments) {
    const delivery = await post(`/class/${classId}/group/${groupId}/task/${taskId}/delivery/review/reject`, { delivery_comments })
    return delivery?.data;
}

export async function getTaskLatestDelivery(classId, taskId) {
    const data = await get(`/class/${classId}/task/${taskId}/delivery/latest`)
    return data;
}

export async function scoreTaskForGroupMember(classId, groupId, taskId, userId, score) {
    const data = await post(`/class/${classId}/group/${groupId}/task/${taskId}/score`, {
        user_id: userId,
        score,
        score_details: {}
    })
    return data;
}

export async function getScoreDetailOfTaskForGroupMember(classId, groupId, taskId) {
    const data = await get(`/class/${classId}/group/${groupId}/task/${taskId}/score`)
    return data;
}

export async function openNextTask(classId, groupId) {
    const data = await post(`/class/${classId}/group/${groupId}/next_task`)
    return data;
}