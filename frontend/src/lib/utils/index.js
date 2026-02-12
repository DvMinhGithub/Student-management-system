import { notification } from 'antd';

export const showNotification = (type, message) => {
    const safeMessage = normalizeMessage(message);
    notification[type]({ message: safeMessage });
};

const normalizeMessage = (message) => {
    if (!message) return 'Unknown error';
    if (typeof message === 'string') return message;
    if (message?.response?.data?.message) return message.response.data.message;
    if (message?.data?.message) return message.data.message;
    if (message?.message) return message.message;
    try {
        return JSON.stringify(message);
    } catch (error) {
        return String(message);
    }
};
