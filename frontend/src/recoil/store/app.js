import { atom } from 'recoil';

export const pageLoadingState = atom({
    key: '@pageLoading',
    default: false,
});
