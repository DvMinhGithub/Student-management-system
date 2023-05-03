import axios from 'axios';
import { getCookieValue, setTokensInCookie } from './cookies';
import { STORE } from '~/contants';

const API = axios.create({
    baseURL: STORE.BASE_URL,
    timeout: 10000, // 10 seconds
});

API.interceptors.request.use(
    async function (config) {
        const token = getCookieValue('accessToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    function (error) {
        return Promise.reject(error);
    },
);

API.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 403) {
            const refreshToken = getCookieValue('refreshToken');
            const res = await API.post('/auth/refresh', {
                refreshToken,
            });
            setTokensInCookie(res.accessToken, res.refreshToken);

            originalRequest.headers.Authorization = `Bearer ${res.accessToken}`;
            return API(originalRequest);
        }
        return Promise.reject(error);
    },
);

// const api = {
//     get: (url, token, params) => {
//         const config = token ? { headers: { Authorization: `Bearer ${token}` }, params } : { params };
//         return API.get(url, config);
//     },
//     post: (url, data, token) => {
//         const headers = token ? { Authorization: `Bearer ${token}` } : {};
//         return API.post(url, data, { headers });
//     },
//     put: (url, data, token) => {
//         const headers = token ? { Authorization: `Bearer ${token}` } : {};
//         return API.put(url, data, { headers });
//     },
//     delete: (url, token) => {
//         const headers = token ? { Authorization: `Bearer ${token}` } : {};
//         return API.delete(url, { headers });
//     },
// };

const api = {
    get: (url) => {
        return API.get(url);
    },
    post: (url, data) => {
        return API.post(url, data);
    },
    put: (url, data) => {
        return API.put(url, data);
    },
    delete: (url) => {
        return API.delete(url);
    },
};

export default api;
