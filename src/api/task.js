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