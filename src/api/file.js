import { get, put, post, del } from './request';
import { getSessionId } from '@/store/session';
import config from './config';

export async function getFileList(params, sort, filter) {
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
        params['order_by'] = 'modify_date';
        params['asc'] = false;
    }

    const urlParams = new URLSearchParams(params);
    const data = await get(`/file/list?${urlParams.toString()}`);

    data.success = true;
    return data;
}


export async function downloadFile(id) {
    const res = await get(`/file/${id}/download`);
    return res?.data;
}

export async function deleteFile(id) {
    const res = await del(`/file/${id}`);
    return res?.data;
}

export async function updateFile(id, data) {
    const res = await put(`/file/${id}`, data);
    return res?.data;
}

export async function getOnlineEditLink(id) {
    const token = await getSessionId();
    return `${config.API_URL}/file/${id}/onlyoffice/view?token=${token}`;
}