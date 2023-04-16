import { Button, Form, Input, Spin, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import callApi from '~/utils/api';
import { accessTokenState, accountIdState, accountRoleState } from '~/recoil/store/account';
import { pageLoadingState } from '~/recoil/store/app';
import { studentAvatarState, studentIdState, studentNameState } from '~/recoil/store/student';
import { showNotification } from '~/utils';
import './LoginPage.scss';

export default function LoginPage() {
    const setAccessToken = useSetRecoilState(accessTokenState);

    const setStudentId = useSetRecoilState(studentIdState);

    const setStudentName = useSetRecoilState(studentNameState);

    const setStudentAvatar = useSetRecoilState(studentAvatarState);

    const setAccountId = useSetRecoilState(accountIdState);

    const setAccouuntRole = useSetRecoilState(accountRoleState);

    const [pageLoading, setPageLoading] = useRecoilState(pageLoadingState);

    const [tabKey, setTabKey] = useState('signIn');

    const [accountLogin, setAccountLogin] = useState({});

    const [accountRegister, setAccountRegister] = useState({});

    useEffect(() => {
        document.title = tabKey === 'signIn' ? 'Đăng nhập' : 'Đăng ký';
    }, [tabKey]);

    const handleChangeTab = (key) => setTabKey(key);

    const handleChangeInput = (e) => {
        const { name, value } = e.target;
        tabKey === 'signIn'
            ? setAccountLogin((pre) => ({ ...pre, [name]: value }))
            : setAccountRegister((pre) => ({ ...pre, [name]: value }));
    };

    const handleLogin = async () => {
        setPageLoading(true);
        try {
            const res = await callApi({ method: 'post', url: '/auth/login', data: accountLogin });
            setAccessToken(res.token);
            setAccountId(res.data._id);
            setAccouuntRole(res.data.role);
            setStudentId(res.data[res.data.role]._id);
            setStudentName(res.data[res.data.role].name);
            setStudentAvatar(res.data[res.data.role].avatar);
            showNotification('success', res.message);
        } catch (error) {
            if (error.status === 401) setAccessToken('');
            showNotification('error', error.data.message);
        } finally {
            setPageLoading(false);
        }
    };

    const handleRegister = async () => {
        setPageLoading(true);
        try {
            const res = await callApi({ method: 'post', url: '/auth/register', data: accountRegister });
            showNotification('success', res.message);
            setTabKey('signIn');
        } catch (error) {
            if (error.status === 401) setAccessToken('');
            showNotification('error', error.data.message);
        } finally {
            setPageLoading(false);
        }
    };

    const items = [
        {
            key: 'signIn',
            label: <h3>Đăng nhập</h3>,
            children: (
                <Form>
                    <Form.Item label="Tài khoản">
                        <Input name="username" onChange={handleChangeInput} placeholder="Tài khoản" />
                    </Form.Item>
                    <Form.Item label="Mật khẩu">
                        <Input
                            type="password"
                            name="password"
                            placeholder="Mật khẩu"
                            onChange={handleChangeInput}
                            autoComplete="on"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" style={{ width: '100%' }} onClick={handleLogin}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            ),
        },
        {
            key: 'singUp',
            label: <h3>Đăng ký</h3>,
            children: (
                <Form>
                    <Form.Item label="Email">
                        <Input name="email" onChange={handleChangeInput} placeholder="Email" />
                    </Form.Item>
                    <Form.Item label="Tài khoản">
                        <Input name="username" onChange={handleChangeInput} placeholder="Tài khoản" />
                    </Form.Item>
                    <Form.Item label="Họ tên">
                        <Input name="name" onChange={handleChangeInput} placeholder="Họ tên" />
                    </Form.Item>
                    <Form.Item label="Mật khẩu">
                        <Input
                            type="password"
                            name="password"
                            placeholder="Mật khẩu"
                            onChange={handleChangeInput}
                            autoComplete="on"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" style={{ width: '100%' }} onClick={handleRegister}>
                            Đăng ký
                        </Button>
                    </Form.Item>
                </Form>
            ),
        },
    ];
    return (
        <Spin spinning={pageLoading}>
            <div className="tab-container">
                <Tabs defaultActiveKey={tabKey} centered items={items} onChange={handleChangeTab} />
            </div>
        </Spin>
    );
}
