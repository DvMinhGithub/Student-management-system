import { notification } from 'antd';
import { useRecoilValue } from 'recoil';
import { accessTokenState } from '~/recoil/store/account';

export const showNotification = (type, message) => {
    notification[type]({
        message,
    });
};

