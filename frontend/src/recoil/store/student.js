import { atom } from 'recoil';
import { persistAtom } from '../persist';

export const studentIdState = atom({
    key: '@studentId',
    default: '',
    effects_UNSTABLE: [persistAtom],
});
export const studentNameState = atom({
    key: '@studentName',
    default: '',
    effects_UNSTABLE: [persistAtom],
});
export const studentAvatarState = atom({
    key: '@studentAvatar',
    default: '',
    effects_UNSTABLE: [persistAtom],
});
