import AdminPage from '~/pages/admin';
import AuthPage from '~/pages/auth';
import UserPage from '~/pages/user';

const publicRoutes = [
    { path: '/login', element: <AuthPage /> },
    { path: '/', element: <UserPage /> },
    { path: '/admin', element: <AdminPage /> },
];

export { publicRoutes };
