import { atom } from 'recoil';
import { persistAtom } from '../persist';
export const appState = {
    loading: atom({
        key: '@app/loading',
        default: false,
    }),
};

export const accountState = {
    id: atom({
        key: '@account/id',
        default: '',
        effects_UNSTABLE: [persistAtom],
    }),
    role: atom({
        key: '@account/role',
        default: '',
        effects_UNSTABLE: [persistAtom],
    }),
};

export const studentState = {
    id: atom({
        key: '@student/id',
        default: '',
        effects_UNSTABLE: [persistAtom],
    }),
    name: atom({
        key: '@student/name',
        default: '',
        effects_UNSTABLE: [persistAtom],
    }),
    avatar: atom({
        key: '@student/avatar',
        default: '',
        effects_UNSTABLE: [persistAtom],
    }),
};
