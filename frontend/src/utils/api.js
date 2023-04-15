import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api/v1/',
    timeout: 10000,
});

const callApi = async ({ method, url, data, params, accessToken }) => {
    const headers = { Authorization: `Bearer ${accessToken}` };
    const config = { headers };
    if (params) config.params = params;
    try {
        const res = await apiClient({
            method,
            url,
            data,
            ...config,
        });
        return res.data;
    } catch (error) {
        throw error.response.data;
    }
};

export default callApi;
