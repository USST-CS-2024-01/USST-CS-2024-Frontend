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
