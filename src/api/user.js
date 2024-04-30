import { get, post, put, del } from './request';

export async function getMeUser() {
    const user = await get('/user/me');
    return user?.data;
}


export async function getAvatar(userId) {
    const avatar = await get(`/user/${userId}/avatar`);
    return avatar?.data?.avatar;
}

export async function updateMeUser(data) {
    const user = await put('/user/me', {
        email: data?.email,
        password: data?.password,
    });
    return user?.data;
}

export async function getUserList(params, sort, filter) {
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
    const data = await get(`/user/list?${urlParams.toString()}`);

    data.success = true;
    return data;
}

export async function getUser(id) {
    const user = await get(`/user/${id}`);
    return user?.data;
}

export async function createUser(data) {
    const user = await post('/user/create', data);
    return user?.data;
}

export async function updateUser(id, data) {
    const user = await put(`/user/${id}`, data);
    return user?.data;
}

export async function deleteUser(id) {
    const user = await del(`/user/${id}`);
    return user?.data;
}
