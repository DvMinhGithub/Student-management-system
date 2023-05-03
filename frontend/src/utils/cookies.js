export const setTokensInCookie = (accessToken, refreshToken) => {
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toUTCString(), // 1 week
    };
    document.cookie = `accessToken=${accessToken}; ${cookieOptions}`;
    document.cookie = `refreshToken=${refreshToken}; ${cookieOptions}`;
};

export const removeTokensFromCookie = () => {
    document.cookie = 'accessToken=; path=/;';
    document.cookie = 'refreshToken=; path=/;';
};

export const getCookieValue = (name) => {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName === name) {
            return cookieValue;
        }
    }
    return null;
};
