import { atom } from 'recoil';
import { persistAtom } from '../persist';
import { useRecoilValue } from 'recoil';

export const accessTokenState = atom({
    key: '@accessToken',
    default: '',
    effects_UNSTABLE: [persistAtom],
});
export const accountIdState = atom({
    key: '@accountId',
    default: '',
    effects_UNSTABLE: [persistAtom],
});
export const accountRoleState = atom({
    key: '@accountRole',
    default: '',
    effects_UNSTABLE: [persistAtom],
});

