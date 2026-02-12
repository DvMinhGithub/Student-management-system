import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAccessTokenPayload, getCookieValue } from '~/lib/utils/cookies';

const PUBLIC_ROUTES = ['/login'];

const ProtectedComponents = ({ children }) => {
    const location = useLocation();

    const { pathname } = location;

    const accessToken = getCookieValue('accessToken');
    const accountRole = getAccessTokenPayload()?.role;

    useEffect(() => {
        document.title = accountRole === 'admin' ? 'Quản lý sinh viên' : 'Sinh viên';
    }, [accountRole]);

    if (accessToken) {
        if (accountRole === 'admin' && pathname !== '/admin') {
            return <Navigate to="/admin" replace />;
        }
        if (accountRole !== 'admin' && pathname === '/admin') {
            return <Navigate to="/" replace />;
        }
        if (accountRole !== 'admin' && pathname === '/login') {
            return <Navigate to="/" replace />;
        }
        return <>{children}</>;
    }

    if (!PUBLIC_ROUTES.includes(pathname)) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
export default ProtectedComponents;
