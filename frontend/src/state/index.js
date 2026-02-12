import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
    persist(
        (set) => ({
            loading: false,
            studentName: '',
            studentAvatar: '',
            setLoading: (loading) => set({ loading: Boolean(loading) }),
            setStudentName: (studentName) => set({ studentName: coerceString(studentName) }),
            setStudentAvatar: (studentAvatar) => set({ studentAvatar: coerceString(studentAvatar) }),
            clearSession: () => set({ loading: false, studentName: '', studentAvatar: '' }),
        }),
        {
            name: 'app-store',
            partialize: (state) => ({
                studentName: state.studentName,
                studentAvatar: state.studentAvatar,
            }),
        },
    ),
);

const coerceString = (value) => (typeof value === 'string' ? value : value ? String(value) : '');

export default useAppStore;
