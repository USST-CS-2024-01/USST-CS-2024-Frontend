import { get, post, put, del } from './request';
import CryptoJS from 'crypto-js';

export async function initAuth() {
    return post('/auth/init', {});
}

export async function login(username, password, session) {
    let { session_id, key, iv } = session;
    key = CryptoJS.enc.Hex.parse(key);
    iv = CryptoJS.enc.Hex.parse(iv);
    let result = CryptoJS.AES.encrypt(password, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    let b64 = result.ciphertext.toString(CryptoJS.enc.Base64);
    return post('/auth/login', {
        username,
        password: b64,
        session_id,
    });
}


export async function logout() {
    return post('/auth/logout', {});
}
