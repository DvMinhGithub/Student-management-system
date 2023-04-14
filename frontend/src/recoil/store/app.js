import { atom } from 'recoil';

export const pageLoadingState = atom({
    key: '@app/loading',
    default: false,
});
