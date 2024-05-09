import { get, post, put, del } from './request';

export async function getClassGroupList(classId) {
    const data = await get(`/class/${classId}/group/list`);
    return data;
}

export async function getClassGroup(classId, groupId) {
    const data = await get(`/class/${classId}/group/${groupId}`);
    return data?.data;
}

export async function updateClassGroup(classId, groupId, data) {
    const group = await put(`/class/${classId}/group/${groupId}`, data);
    return group?.data;
}

export async function createClassGroup(classId, data) {
    const group = await post(`/class/${classId}/group/create`, data);
    return group?.data;
}

export async function deleteClassGroup(classId, groupId) {
    const group = await del(`/class/${classId}/group/${groupId}`);
    return group?.data;
}

export async function deleteGroupMember(classId, groupId, memberId) {
    const group = await del(`/class/${classId}/group/${groupId}/member/${memberId}`);
    return group?.data;
}

export async function addGroupMember(classId, groupId, memberId) {
    const group = await post(`/class/${classId}/group/${groupId}/member/${memberId}`);
    return group?.data;
}

export async function updateGroupMember(classId, groupId, memberId, data) {
    const group = await put(`/class/${classId}/group/${groupId}/member/${memberId}`, data);
    return group?.data;
}

export async function acceptGroupMember(classId, groupId, memberId) {
    const group = await post(`/class/${classId}/group/${groupId}/member/${memberId}/approve`);
    return group?.data;
}

export async function getMyGroupMember(classId) {
    const group = await get(`/class/${classId}/group/my`);
    return group?.data;
}

export async function auditGroup(classId, groupId) {
    const group = await post(`/class/${classId}/group/${groupId}/approve`);
    return group?.data;
}

export async function revokeAuditGroup(classId, groupId) {
    const group = await del(`/class/${classId}/group/${groupId}/approve`);
    return group?.data;
}


export async function getGroupTaskList(classId, groupId, status, kw = "") {
    const searchParams = new URLSearchParams();
    searchParams.set('status', status);
    kw = kw.trim();
    if (kw.length > 0) {
        searchParams.set('kw', kw);
    }
    searchParams.set('order_by', 'priority');
    searchParams.set('asc', 'false');
    const data = await get(`/class/${classId}/group/${groupId}/group_task/list?${searchParams.toString()}`);
    return data;
}

export async function getGroupTaskDetail(classId, groupId, taskId) {
    const data = await get(`/class/${classId}/group/${groupId}/group_task/${taskId}`);
    return data?.data;
}

export async function createGroupTask(classId, groupId, data) {
    const task = await post(`/class/${classId}/group/${groupId}/group_task/create`, data);
    return task?.data;
}

export async function updateGroupTask(classId, groupId, taskId, data) {
    const task = await put(`/class/${classId}/group/${groupId}/group_task/${taskId}`, data);
    return task?.data;
}

export async function deleteGroupTask(classId, groupId, taskId) {
    const task = await del(`/class/${classId}/group/${groupId}/group_task/${taskId}`);
    return task?.data;
}

export async function getGroupMeetingList(classId, groupId, params) {
    params.page = params.current;
    params.page_size = params.pageSize;

    delete params.current;
    delete params.pageSize;

    const urlParams = new URLSearchParams(params);
    const data = await get(`/class/${classId}/group/${groupId}/meeting/list?${urlParams.toString()}`);

    const tsNow = new Date().getTime() / 1000;
    // 小于当前时间的倒序排列
    let finished = data.data.filter(item => item.end_time < tsNow).sort((a, b) => b.end_time - a.end_time);
    // 大于当前时间的正序排列
    let upcoming = data.data.filter(item => item.end_time >= tsNow).sort((a, b) => a.end_time - b.end_time);

    data.data = upcoming.concat(finished); // 合并
    data.success = true;
    return data;
}

export async function attendGroupMeeting(classId, groupId, meetingId) {
    const data = await post(`/class/${classId}/group/${groupId}/meeting/${meetingId}/attend`);
    return data;
}

export async function deleteGroupMeeting(classId, groupId, meetingId) {
    const data = await del(`/class/${classId}/group/${groupId}/meeting/${meetingId}`);
    return data;
}

export async function updateGroupMeeting(classId, groupId, meetingId, data) {
    const meeting = await put(`/class/${classId}/group/${groupId}/meeting/${meetingId}`, data);
    return meeting?.data;
}

export async function createGroupMeeting(classId, groupId, data) {
    const meeting = await post(`/class/${classId}/group/${groupId}/meeting/create`, data);
    return meeting?.data;
}
