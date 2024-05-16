import {get, post, put, del} from './request';


export async function getRepoRecordList(classId, groupId, params, sort, filter) {
    params.page = params.current;
    params.page_size = params.pageSize;

    delete params.current;
    delete params.pageSize;

    if (sort) {
        Object.keys(sort).forEach(key => {
            params['order_by'] = key;
            params['asc'] = sort[key] === 'ascend';
        })
    }

    if (!params['order_by']) {
        params['order_by'] = 'id';
        params['asc'] = false;
    }

    const urlParams = new URLSearchParams(params);
    const data = await get(`/class/${classId}/group/${groupId}/repo_record/list?${urlParams.toString()}`);

    data.success = true;
    return data;
}


export async function createRepoRecord(classId, groupId, data) {
    const repoRecord = await post(`/class/${classId}/group/${groupId}/repo_record/create`, data);
    return repoRecord?.data;
}

export async function deleteRepoRecord(classId, groupId, repoRecordId) {
    const repoRecord = await del(`/class/${classId}/group/${groupId}/repo_record/${repoRecordId}`);
    return repoRecord?.data;
}

export async function downloadRepoRecordArchive(classId, groupId, repoRecordId) {
    const repoRecord = await get(`/class/${classId}/group/${groupId}/repo_record/${repoRecordId}/archive`);
    return repoRecord?.data;
}