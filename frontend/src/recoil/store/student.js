import { atom } from 'recoil';
import { persistAtom } from '../persist';

export const studentIdState = atom({
    key: '@student/id',
    default: '',
    effects_UNSTABLE: [persistAtom],
});
export const studentNameState = atom({
    key: '@student/name',
    default: '',
    effects_UNSTABLE: [persistAtom],
});
export const studentAvatarState = atom({
    key: '@student/avatar',
    default: '',
    effects_UNSTABLE: [persistAtom],
});
