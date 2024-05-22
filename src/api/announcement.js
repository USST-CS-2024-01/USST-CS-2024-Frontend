import {get, post, put, del} from './request';

//http://192.168.19.2:9999/api/v1/announcement/list?status=unread
export async function getAnnouncementList(params, sort) {
    params.page = params.current;
    params.page_size = params.pageSize;

    delete params.current;
    delete params.pageSize;

    if (params.page === undefined) {
        params.page = 1;
    }
    if (params.page_size === undefined) {
        params.page_size = 1;
    }

    if (sort) {
        Object.keys(sort).forEach(key => {
            params['order_by'] = key;
            params['asc'] = sort[key] === 'ascend';
        })
    }

    if (!params['order_by']) {
        params['order_by'] = 'publish_time';
        params['asc'] = false;
    }

    const urlParams = new URLSearchParams(params);
    const data = await get(`/announcement/list?${urlParams.toString()}`);
    return data;
}

export async function getUnReadTotal(classId) {
    const data = await get(`/announcement/list?status=unread&class_id=${classId}`);
    return data;
}

export async function updateAnnouncement(id, data) {
    const announcement = await put(`/announcement/${id}`, data);
    return announcement?.data;
}

export async function createAnnouncement(class_id, data) {
    data.receiver_type = "class"
    data.receiver_id = class_id;
    data.receiver_role = null;

    const announcement = await post(`/announcement/create`, data);
    return announcement?.data;
}

export async function deleteAnnouncement(id) {
    const data = await del(`/announcement/${id}`);
    return data;
}

export async function setReadAnnouncement(id) {
    const data = await post(`/announcement/${id}/read`);
    return data;
}

export async function getAnnouncementInfo(id) {
    const data = await get(`/announcement/${id}`);
    return data;
}