import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { accessTokenState, accountRoleState } from '../recoil/store/account';

const PUBLIC_ROUTES = ['/login'];

const ProtectedComponents = ({ children }) => {
    const location = useLocation();

    const navigate = useNavigate();

    const { pathname } = location;

    const [isRender, setIsRender] = useState(false);

    const accessToken = useRecoilValue(accessTokenState);

    const accountRole = useRecoilValue(accountRoleState);

    useEffect(() => {
        document.title = accountRole === 'admin' ? 'Quản lý sinh viên' : 'Sinh vien';
        if (accessToken) {
            if (accountRole === 'admin') {
                navigate('/admin');
                setIsRender(true);
            } else if (pathname === '/login') {
                navigate('/');
            } else {
                setIsRender(true);
            }
        } else {
            if (!PUBLIC_ROUTES.includes(pathname)) {
                navigate('/login');
            } else {
                setIsRender(true);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, accessToken]);

    return <>{isRender ? children : null}</>;
};
export default ProtectedComponents;
