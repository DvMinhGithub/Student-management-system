import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
});

API.interceptors.request.use(
    async function (config) {
        return config;
    },
    function (error) {
        return Promise.reject(error);
    },
);

API.interceptors.response.use(
    function (response) {
        return response.data;
    },
    function (error) {
        return Promise.reject(error.response);
    },
);

const api = {
    get: (url, token, params) => {
        const config = token ? { headers: { Authorization: `Bearer ${token}` }, params } : { params };
        return API.get(url, config);
    },
    post: (url, data, token) => {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        return API.post(url, data, { headers });
    },
    put: (url, data, token) => {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        return API.put(url, data, { headers });
    },
    delete: (url, token) => {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        return API.delete(url, { headers });
    },
};

export default api;
