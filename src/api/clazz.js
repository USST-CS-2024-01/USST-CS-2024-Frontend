import { get, post, put, del } from './request';

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

export async function importClassMember(id, data) {
    const clazz = await post(`/class/${id}/member`, {
        user_dict: data
    });
    return clazz;
}

export async function deleteClassMember(id, userIdList) {
    const clazz = await del(`/class/${id}/member`, {
        user_id_list: userIdList
    });
    return clazz?.data;
}

export async function getClassMember(id) {
    const clazz = await get(`/class/${id}/member`);
    return clazz;
}

export async function switchToGroupStage(id) {
    const clazz = await post(`/class/${id}/group/start`);
    return clazz?.data;
}

export async function switchToArchiveStage(id) {
    const clazz = await post(`/class/${id}/archive`);
    return clazz?.data;
}

export async function revertArchiveStage(id) {
    const clazz = await del(`/class/${id}/archive`);
    return clazz?.data;
}

export async function getRoleList(id) {
    const clazz = await get(`/class/${id}/role/list`);
    return clazz?.data;
}

export async function createRole(id, data) {
    const clazz = await post(`/class/${id}/role/create`, data);
    return clazz?.data;
}

export async function updateRole(id, roleId, data) {
    const clazz = await put(`/class/${id}/role/${roleId}`, data);
    return clazz?.data;
}

export async function deleteRole(id, roleId) {
    const clazz = await del(`/class/${id}/role/${roleId}`);
    return clazz?.data;
}



export async function switchToTeachingStage(id) {
    const clazz = await post(`/class/${id}/task/start`);
    return clazz?.data;
}