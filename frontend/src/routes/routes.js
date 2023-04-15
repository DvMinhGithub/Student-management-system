import AdminPage from '~/pages/Admin';
import LoginPage from '~/pages/Login/LoginPage';
import UserPage from '~/pages/User';

const publicRoutes = [
    { path: '/login', element: <LoginPage /> },
    { path: '/', element: <UserPage /> },
    { path: '/admin', element: <AdminPage /> },
];

const privateRoutes = [];
export { publicRoutes, privateRoutes };
