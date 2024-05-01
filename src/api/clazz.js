import {get, post, put, del} from './request';

export async function getClassList(params, sort, filter) {
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
    const data = await get(`/class/list?${urlParams.toString()}`);

    data.success = true;
    return data;
}

export async function getClass(id) {
    const clazz = await get(`/class/${id}`);
    return clazz?.data;
}

export async function createClass(data) {
    const clazz = await post('/class/create', data);
    return clazz?.data?.id;
}

export async function updateClass(id, data) {
    const clazz = await put(`/class/${id}`, data);
    return clazz?.data;
}

export async function deleteClass(id) {
    const clazz = await del(`/class/${id}`);
    return clazz?.data;
}