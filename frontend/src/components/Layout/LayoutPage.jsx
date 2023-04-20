import { ExclamationCircleFilled, LoginOutlined, SecurityScanOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Breadcrumb, Dropdown, Form, Input, Layout, Menu, Modal, Spin, notification, theme } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { accountState, appState, studentState } from '~/recoil/store';
import { showNotification } from '~/utils';
import callApi from '~/utils/api';
import './LayoutPage.scss';
const { Header, Sider, Content } = Layout;

export default function PageLayout({ menuItems }) {
    const navigate = useNavigate();

    const dropdownItems = [
        {
            key: 'myInfo',
            label: <span>Tài khoản của tôi</span>,
            icon: <UserOutlined />,
        },
        {
            key: 'changePassword',
            label: <span>Đổi mật khẩu</span>,
            icon: <SecurityScanOutlined />,
        },
        {
            key: 'logout',
            label: <span>Đăng xuất</span>,
            icon: <LoginOutlined />,
            danger: true,
        },
    ];

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const [collapsed, setCollapsed] = useState(false);

    const [currentPath, setCurrentPath] = useState(menuItems[0].key);

    const [isOpenModal, setIsOpenModal] = useState(false);

    const studentName = useRecoilValue(studentState.name);
    const studentAvatar = useRecoilValue(studentState.avatar);

    const accountId = useRecoilValue(accountState.id);
    const [accessToken, setAccessToken] = useRecoilState(accountState.accessToken);

    const [pageLoading, setPageLoading] = useRecoilState(appState.loading);

    const [changePassword, setChangePassword] = useState({});

    const handleMenuClick = ({ key }) => {
        setCurrentPath(key);
    };

    const handleDropDownClick = ({ key }) => {
        switch (key) {
            case 'changePassword':
                setIsOpenModal(true);
                break;
            case 'myInfo':
                setCurrentPath(menuItems[0].key);
                break;
            case 'logout':
                Modal.confirm({
                    title: 'Bạn chắc chắn muốn đăng xuất ?',
                    icon: <ExclamationCircleFilled />,
                    onOk() {
                        setAccessToken('');
                        navigate('/login');
                    },
                    onCancel() {
                        setCurrentPath(menuItems[0].key);
                    },
                });
                break;
            default:
                break;
        }
    };

    const currentMenuItem = menuItems.find((item) => item.key === currentPath);

    const breadcrumbItems = [
        {
            href: '/home',
            title: 'Trang chủ',
        },
        {
            href: currentMenuItem.key,
            title: currentMenuItem.label,
        },
    ];

    const validatePassword = (password) => {
        const { oldPassword, newPassword, confirmPassword } = password;
        if (oldPassword === newPassword)
            return {
                valid: false,
                errorMessage: 'Mật khẩu mới phải khác với mật khẩu cũ',
            };
        if (newPassword !== confirmPassword)
            return {
                valid: false,
                errorMessage: 'Mật khẩu mới và nhập lại không trùng khớp',
            };
        return { valid: true };
    };

    const handleChangePassword = async () => {
        const { valid, errorMessage } = validatePassword(changePassword);
        if (!valid) {
            notification.warning({ message: errorMessage });
            return;
        }

        setPageLoading(true);
        try {
            const res = await callApi({
                method: 'PUT',
                url: `/accounts/changePassword/${accountId}`,
                data: changePassword,
                accessToken,
            });
            showNotification('success', res.message);
        } catch (error) {
            if (error.status === 401) setAccessToken('');
            showNotification('error', error.data.message);
        } finally {
            setIsOpenModal(false);
            setPageLoading(false);
        }
    };

    const handleChangeInput = (e) => {
        const { name, value } = e.target;
        setChangePassword((prePassword) => ({
            ...prePassword,
            [name]: value,
        }));
    };
    return (
        <Spin spinning={pageLoading}>
            <Layout style={{ minHeight: '100vh' }}>
                <Layout style={{ background: colorBgContainer }}>
                    <Sider
                        style={{ background: colorBgContainer, height: '100%' }}
                        collapsible
                        collapsed={collapsed}
                        onCollapse={(value) => setCollapsed(value)}>
                        <div className="logo" />
                        <Menu
                            style={{ fontWeight: 500 }}
                            defaultSelectedKeys={['1']}
                            mode="inline"
                            onClick={handleMenuClick}
                            items={menuItems}
                        />
                    </Sider>
                    <Layout className="site-layout" style={{ padding: 24 }}>
                        <Header className="site-layout-background page__header">
                            <div className="header-left">
                                <Breadcrumb
                                    className="header-breadcrumb ant-breadcrumb-separator"
                                    separator=">>"
                                    items={breadcrumbItems}
                                />
                            </div>
                            <div className="header-right">
                                <span className="header-username">{studentName}</span>
                                <Dropdown
                                    menu={{
                                        items: dropdownItems,
                                        onClick: handleDropDownClick,
                                    }}>
                                    <Avatar size={42} src={studentAvatar} />
                                </Dropdown>
                            </div>
                        </Header>
                        <Content className="page__content">
                            <div className="site-layout-background">
                                {menuItems.map((item) => {
                                    if (item.key === currentPath) {
                                        return <div key={item.key}>{item.content}</div>;
                                    }
                                    return null;
                                })}
                            </div>
                        </Content>
                    </Layout>
                </Layout>
            </Layout>

            <Modal
                title="Đổi mật khẩu"
                open={isOpenModal}
                onOk={handleChangePassword}
                onCancel={() => setIsOpenModal(false)}
                okText="Thay đổi">
                <Form layout="vertical">
                    <Form.Item label="Mật khẩu cũ:">
                        <Input
                            type="password"
                            name="oldPassword"
                            placeholder="Nhập mật khẩu cũ"
                            onChange={handleChangeInput}
                        />
                    </Form.Item>
                    <Form.Item label="Mật khẩu mới:">
                        <Input
                            type="password"
                            name="newPassword"
                            placeholder="Nhập mật khẩu mới"
                            onChange={handleChangeInput}
                        />
                    </Form.Item>
                    <Form.Item label="Nhập lại mật khẩu:">
                        <Input
                            type="password"
                            name="confirmPassword"
                            placeholder="Nhập lại mật khẩu mới"
                            onChange={handleChangeInput}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Spin>
    );
}
