import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { accountState } from '~/recoil/store';
import { getCookieValue } from '~/utils/cookies';

const PUBLIC_ROUTES = ['/login'];

const ProtectedComponents = ({ children }) => {
    const location = useLocation();

    const navigate = useNavigate();

    const { pathname } = location;

    const [isRender, setIsRender] = useState(false);

    const accountRole = useRecoilValue(accountState.role);
    const accessToken = getCookieValue('accessToken');
    const accountId = useRecoilValue(accountState.id);

    useEffect(() => {
        document.title = accountRole === 'admin' ? 'Quản lý sinh viên' : 'Sinh viên';
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
    }, [pathname, accountId]);

    return <>{isRender ? children : null}</>;
};
export default ProtectedComponents;
