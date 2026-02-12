import axios from 'axios';
import { getCookieValue, removeTokensFromCookie, setTokensInCookie } from './cookies';
import { STORE } from '~/lib/constants';
import { useAppStore } from '~/state';

const API = axios.create({
    baseURL: STORE.BASE_URL,
    timeout: 10000, // 10 seconds
});

const REFRESH_IGNORED_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh'];
const REFRESH_STATUS = [401, 403];
const REFRESH_URL = `${String(STORE.BASE_URL || '').replace(/\/+$/, '')}/auth/refresh`;

let isRefreshing = false;
let pendingRequests = [];

const isEnvelope = (payload) => {
    return (
        payload &&
        typeof payload === 'object' &&
        !Array.isArray(payload) &&
        typeof payload.success === 'boolean' &&
        typeof payload.statusCode === 'number' &&
        Object.prototype.hasOwnProperty.call(payload, 'message') &&
        Object.prototype.hasOwnProperty.call(payload, 'data')
    );
};

const unwrapResponse = (payload) => {
    if (!isEnvelope(payload)) return payload;

    const message = typeof payload.message === 'string' ? payload.message : 'Success';
    const data = payload.data ?? null;

    if (data && typeof data === 'object' && !Array.isArray(data)) {
        return { message, ...data };
    }

    return { message, data };
};

const normalizeError = (error) => {
    const envelope = error?.response?.data;
    if (!isEnvelope(envelope)) return error;

    const base = { message: envelope.message || error?.message || 'Request failed' };
    const extra = envelope.errors;

    if (extra && typeof extra === 'object' && !Array.isArray(extra)) {
        error.data = { ...base, ...extra };
    } else if (extra !== undefined && extra !== null) {
        error.data = { ...base, detail: extra };
    } else {
        error.data = base;
    }

    error.status = envelope.statusCode || error?.response?.status;
    error.message = envelope.message || error.message;

    if (error.response) {
        error.response.data = envelope;
    }

    return error;
};

const flushQueue = (error, accessToken = null) => {
    pendingRequests.forEach(({ resolve, reject }) => {
        if (error) return reject(error);
        return resolve(accessToken);
    });
    pendingRequests = [];
};

const goToLogin = () => {
    const { clearSession } = useAppStore.getState();
    clearSession?.();
    removeTokensFromCookie();

    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.replace('/login');
    }
};

API.interceptors.request.use(
    function (config) {
        const token = getCookieValue('accessToken');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    },
);

API.interceptors.response.use(
    (response) => {
        return unwrapResponse(response?.data);
    },
    async (error) => {
        const originalRequest = error.config;
        const status = error?.response?.status;

        if (!originalRequest || !REFRESH_STATUS.includes(status)) {
            return Promise.reject(normalizeError(error));
        }

        if (originalRequest._retry || REFRESH_IGNORED_ROUTES.some((route) => originalRequest.url?.includes(route))) {
            return Promise.reject(normalizeError(error));
        }

        const refreshToken = getCookieValue('refreshToken');
        if (!refreshToken) {
            goToLogin();
            return Promise.reject(normalizeError(error));
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingRequests.push({ resolve, reject });
            }).then((newAccessToken) => {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return API(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const refreshResponse = await axios.post(REFRESH_URL, { refreshToken }, { timeout: 10000 });
            const refreshData = unwrapResponse(refreshResponse?.data) || {};
            const { accessToken, refreshToken: newRefreshToken } = refreshData;

            if (!accessToken || !newRefreshToken) {
                throw error;
            }

            setTokensInCookie(accessToken, newRefreshToken);
            flushQueue(null, accessToken);

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return API(originalRequest);
        } catch (refreshError) {
            const normalizedRefreshError = normalizeError(refreshError);
            flushQueue(normalizedRefreshError);
            goToLogin();
            return Promise.reject(normalizedRefreshError);
        } finally {
            isRefreshing = false;
        }
    },
);

const callApi = (config) => API(config);
callApi.get = (url, config) => API.get(url, config);
callApi.post = (url, data, config) => API.post(url, data, config);
callApi.put = (url, data, config) => API.put(url, data, config);
callApi.delete = (url, config) => API.delete(url, config);

export default callApi;
