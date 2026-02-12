export const setTokensInCookie = (accessToken, refreshToken) => {
    const maxAge = 60 * 60 * 24 * 7; // 1 week
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';

    document.cookie = `accessToken=${encodeURIComponent(accessToken)}; Path=/; Max-Age=${maxAge}; SameSite=Strict${secure}`;
    document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; Path=/; Max-Age=${maxAge}; SameSite=Strict${secure}`;
};

export const removeTokensFromCookie = () => {
    document.cookie = 'accessToken=; Path=/; Max-Age=0; SameSite=Strict';
    document.cookie = 'refreshToken=; Path=/; Max-Age=0; SameSite=Strict';
};

export const getCookieValue = (name) => {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName === name) return decodeURIComponent(cookieValue || '');
    }
    return null;
};

const decodeBase64Url = (value) => {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return atob(padded);
};

export const getAccessTokenPayload = () => {
    const accessToken = getCookieValue('accessToken');
    if (!accessToken) return null;

    const tokenParts = accessToken.split('.');
    if (tokenParts.length < 2) return null;

    try {
        const parsed = JSON.parse(decodeBase64Url(tokenParts[1]));
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
        return null;
    }
};
