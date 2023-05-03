import AdminPage from '~/pages/Admin';
import AuthPage from '~/pages/Auth/AuthPage';
import UserPage from '~/pages/User';

const publicRoutes = [
    { path: '/login', element: <AuthPage /> },
    { path: '/', element: <UserPage /> },
    { path: '/admin', element: <AdminPage /> },
];

const privateRoutes = [];
export { publicRoutes, privateRoutes };
