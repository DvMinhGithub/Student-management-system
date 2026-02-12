import { Button, Form, Input, Spin, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '~/state';
import { showNotification } from '~/lib/utils';
import callApi from '~/lib/utils/api';
import { setTokensInCookie } from '~/lib/utils/cookies';

export default function AuthPage() {
    const setStudentName = useAppStore((state) => state.setStudentName);
    const setStudentAvatar = useAppStore((state) => state.setStudentAvatar);

    const pageLoading = useAppStore((state) => state.loading);
    const setPageLoading = useAppStore((state) => state.setLoading);
    const navigate = useNavigate();

    const [tabKey, setTabKey] = useState('signIn');

    const [loginForm] = Form.useForm();
    const [registerForm] = Form.useForm();

    useEffect(() => {
        document.title = tabKey === 'signIn' ? 'Đăng nhập' : 'Đăng ký';
    }, [tabKey]);

    const handleChangeTab = (key) => setTabKey(key);

    const handleLogin = async (values) => {
        const payload = {
            username: values.username?.trim(),
            password: values.password,
        };
        setPageLoading(true);
        try {
            const res = await callApi({ method: 'post', url: '/auth/login', data: payload });
            setTokensInCookie(res.accessToken, res.refreshToken);

            const meRes = await callApi.get('/auth/me/profile');
            const me = meRes?.data ?? meRes ?? {};
            setStudentName(me.name);
            setStudentAvatar(me.avatar);
            navigate(me?.role === 'admin' ? '/admin' : '/', { replace: true });
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };

    const handleRegister = async (values) => {
        const payload = {
            email: values.email?.trim()?.toLowerCase(),
            username: values.username?.trim(),
            name: values.name?.trim(),
            password: values.password,
        };
        setPageLoading(true);
        try {
            const res = await callApi({ method: 'post', url: '/auth/register', data: payload });
            showNotification('success', res.message);
            registerForm.resetFields();
            setTabKey('signIn');
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };

    const items = [
        {
            key: 'signIn',
            label: <span className="auth-tab-label">Đăng nhập</span>,
            children: (
                <Form form={loginForm} layout="vertical" className="auth-form" onFinish={handleLogin}>
                    <Form.Item
                        label="Tài khoản"
                        name="username"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tài khoản' },
                            {
                                pattern: /^[a-zA-Z0-9._-]{4,30}$/,
                                message: 'Tài khoản 4-30 ký tự, chỉ gồm chữ, số, ., _, -',
                            },
                        ]}>
                        <Input placeholder="Tài khoản" />
                    </Form.Item>
                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu' },
                            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                        ]}>
                        <Input
                            type="password"
                            placeholder="Mật khẩu"
                            autoComplete="on"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="auth-submit-btn">
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            ),
        },
        {
            key: 'singUp',
            label: <span className="auth-tab-label">Đăng ký</span>,
            children: (
                <Form form={registerForm} layout="vertical" className="auth-form" onFinish={handleRegister}>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' },
                        ]}>
                        <Input placeholder="Email" />
                    </Form.Item>
                    <Form.Item
                        label="Tài khoản"
                        name="username"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tài khoản' },
                            {
                                pattern: /^[a-zA-Z0-9._-]{4,30}$/,
                                message: 'Tài khoản 4-30 ký tự, chỉ gồm chữ, số, ., _, -',
                            },
                        ]}>
                        <Input placeholder="Tài khoản" />
                    </Form.Item>
                    <Form.Item
                        label="Họ tên"
                        name="name"
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ tên' },
                            { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' },
                            { max: 80, message: 'Họ tên tối đa 80 ký tự' },
                        ]}>
                        <Input placeholder="Họ tên" />
                    </Form.Item>
                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu' },
                            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                        ]}>
                        <Input
                            type="password"
                            placeholder="Mật khẩu"
                            autoComplete="new-password"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Nhập lại mật khẩu"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng nhập lại mật khẩu' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                },
                            }),
                        ]}>
                        <Input
                            type="password"
                            placeholder="Nhập lại mật khẩu"
                            autoComplete="on"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="auth-submit-btn">
                            Đăng ký
                        </Button>
                    </Form.Item>
                </Form>
            ),
        },
    ];
    return (
        <div className="auth-shell">
            <div className="auth-hero">
                <div className="auth-hero-content">
                    <span className="auth-badge">Student Manager</span>
                    <h1>Quản lý sinh viên dễ dàng hơn.</h1>
                    <p>Đăng nhập để truy cập hệ thống học vụ, lịch học và thông tin cá nhân.</p>
                    <div className="auth-metrics">
                        <div className="auth-metric-card">
                            <strong>+1200</strong>
                            <span>Sinh viên</span>
                        </div>
                        <div className="auth-metric-card">
                            <strong>+80</strong>
                            <span>Giảng viên</span>
                        </div>
                        <div className="auth-metric-card">
                            <strong>+30</strong>
                            <span>Học phần</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="auth-card">
                <div className="auth-card-shell">
                    <div className="auth-card-head">
                        <h2>{tabKey === 'signIn' ? 'Đăng nhập' : 'Đăng ký'}</h2>
                        <p>Vui lòng điền thông tin để tiếp tục.</p>
                    </div>
                    <Spin spinning={pageLoading}>
                        <Tabs activeKey={tabKey} centered items={items} onChange={handleChangeTab} className="auth-tabs" />
                    </Spin>
                </div>
            </div>
        </div>
    );
}
