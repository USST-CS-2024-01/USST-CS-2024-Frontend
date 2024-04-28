import config from "./config";
import { getSessionId } from "@/store/session";

export async function request(url, options) {
    const token = await getSessionId();
    if (token) {
        options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        };
    }

    if (!url.startsWith('http')) {
        url = `${config.API_URL}${url}`;
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            return;
        }

        if (data.code !== 200) {
            throw data;
        }

        return data;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}

export function get(url) {
    return request(url, {
        method: 'GET',
    });
}

export function post(url, data) {
    return request(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export function put(url, data) {
    return request(url, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export function del(url) {
    return request(url, {
        method: 'DELETE',
    });
}

