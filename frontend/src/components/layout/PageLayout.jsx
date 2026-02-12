import { ExclamationCircleFilled, LoginOutlined, SecurityScanOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Breadcrumb, Dropdown, Form, Input, Layout, Menu, Modal, notification, theme } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '~/state';
import { showNotification } from '~/lib/utils';
import callApi from '~/lib/utils/api';
import { getAccessTokenPayload, removeTokensFromCookie } from '~/lib/utils/cookies';
const { Header, Sider, Content } = Layout;

export default function PageLayout({ menuItems }) {
    const [modal, modalContextHolder] = Modal.useModal();
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
    const [isMobile, setIsMobile] = useState(false);

    const [currentPath, setCurrentPath] = useState(menuItems[0].key);

    const [isOpenModal, setIsOpenModal] = useState(false);

    const studentName = useAppStore((state) => state.studentName);
    const studentAvatar = useAppStore((state) => state.studentAvatar);
    const clearSession = useAppStore((state) => state.clearSession);

    const [passwordSubmitting, setPasswordSubmitting] = useState(false);
    const accountId = getAccessTokenPayload()?.accountId || '';

    const [changePasswordForm] = Form.useForm();

    const handleMenuClick = ({ key }) => {
        setCurrentPath(key);
        if (isMobile) {
            setCollapsed(true);
        }
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
                modal.confirm({
                    title: 'Bạn chắc chắn muốn đăng xuất ?',
                    icon: <ExclamationCircleFilled />,
                    onOk() {
                        removeTokensFromCookie();
                        clearSession();
                        navigate('/login', { replace: true });
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

    const currentMenuItem = useMemo(
        () => menuItems.find((item) => item.key === currentPath) ?? menuItems[0],
        [currentPath, menuItems],
    );

    const currentLabel =
        typeof currentMenuItem?.label === 'string'
            ? currentMenuItem.label
            : currentMenuItem?.label?.props?.children || 'Trang chủ';

    const homeKey = menuItems[0]?.key ?? '/';
    const isHome = currentMenuItem?.key === homeKey;
    const breadcrumbItems = isHome
        ? [{ title: <span className="breadcrumb-current">Trang chủ</span> }]
        : [
              {
                  title: (
                      <button type="button" className="breadcrumb-link breadcrumb-home" onClick={() => setCurrentPath(homeKey)}>
                          Trang chủ
                      </button>
                  ),
              },
              {
                  title: <span className="breadcrumb-current">{currentLabel}</span>,
              },
          ];

    const validatePassword = (password) => {
        const { oldPassword, newPassword } = password;
        if (oldPassword === newPassword)
            return {
                valid: false,
                errorMessage: 'Mật khẩu mới phải khác với mật khẩu cũ',
            };
        return { valid: true };
    };

    const handleChangePassword = async () => {
        let values;
        try {
            values = await changePasswordForm.validateFields();
        } catch (error) {
            return;
        }
        const { valid, errorMessage } = validatePassword(values);
        if (!valid) return notification.warning({ message: errorMessage });
        if (!accountId) return notification.error({ message: 'Không xác định được tài khoản' });

        setPasswordSubmitting(true);
        try {
            const res = await callApi({
                method: 'PUT',
                url: `/accounts/changePassword/${accountId}`,
                data: values,
            });
            showNotification('success', res.message);
            setIsOpenModal(false);
            changePasswordForm.resetFields();
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPasswordSubmitting(false);
        }
    };
    return (
        <>
            {modalContextHolder}
            <Layout className="app-shell">
                {isMobile && !collapsed && (
                    <div className="sidebar-overlay" onClick={() => setCollapsed(true)} aria-hidden="true" />
                )}
                <Sider
                    className="app-sidebar"
                    width={240}
                    collapsedWidth={isMobile ? 0 : 72}
                    breakpoint="lg"
                    collapsible
                    trigger={null}
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    onBreakpoint={(broken) => {
                        setIsMobile(broken);
                        setCollapsed(broken);
                    }}>
                    <div className="sidebar-mobile-controls">
                        <button
                            type="button"
                            className="sidebar-close"
                            onClick={() => setCollapsed(true)}
                            aria-label="Đóng menu">
                            ✕
                        </button>
                    </div>
                    <div className="brand">
                        <div className="brand-mark">SM</div>
                        {!collapsed && (
                            <div className="brand-text">
                                <span>Student</span>
                                <span>Manager</span>
                            </div>
                        )}
                    </div>
                    <Menu
                        mode="inline"
                        selectedKeys={[currentPath]}
                        onClick={handleMenuClick}
                        items={menuItems}
                        className="app-menu"
                    />
                </Sider>
                <Layout className="app-main" style={{ background: colorBgContainer }}>
                    <Header className="app-header">
                        <div className="header-inner">
                            <div className="header-left">
                                <div className="header-title-row">
                                    <button
                                        type="button"
                                        className="sidebar-toggle"
                                        onClick={() => setCollapsed((prev) => !prev)}
                                        aria-label="Mở menu">
                                        ☰
                                    </button>
                                    <div className="page-title">{currentLabel}</div>
                                </div>
                            </div>
                            <div className="header-right">
                                <div className="header-user-chip">
                                    <span className="header-username">{studentName || 'Tài khoản'}</span>
                                    <Dropdown
                                        menu={{
                                            items: dropdownItems,
                                            onClick: handleDropDownClick,
                                        }}
                                        placement="bottomRight"
                                        trigger={['click']}
                                        overlayClassName="header-user-dropdown">
                                        <Avatar size={40} src={studentAvatar}>
                                            {studentName?.slice(0, 1)?.toUpperCase()}
                                        </Avatar>
                                    </Dropdown>
                                </div>
                            </div>
                        </div>
                    </Header>
                    <Content className="app-content">
                        <div className="content-inner">
                            <div className="content-breadcrumb-wrap">
                                <Breadcrumb className="page-breadcrumb" separator="•" items={breadcrumbItems} />
                            </div>
                            <div className="content-card">{currentMenuItem?.content}</div>
                        </div>
                    </Content>
                </Layout>
            </Layout>

            <Modal
                title="Đổi mật khẩu"
                open={isOpenModal}
                onOk={handleChangePassword}
                confirmLoading={passwordSubmitting}
                onCancel={() => {
                    setIsOpenModal(false);
                    changePasswordForm.resetFields();
                }}
                okText="Thay đổi">
                <Form form={changePasswordForm} layout="vertical">
                    <Form.Item
                        label="Mật khẩu cũ:"
                        name="oldPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu cũ' },
                            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                        ]}>
                        <Input
                            type="password"
                            placeholder="Nhập mật khẩu cũ"
                            autoComplete="current-password"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Mật khẩu mới:"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                        ]}>
                        <Input
                            type="password"
                            placeholder="Nhập mật khẩu mới"
                            autoComplete="new-password"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Nhập lại mật khẩu:"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng nhập lại mật khẩu mới' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu mới và nhập lại không trùng khớp'));
                                },
                            }),
                        ]}>
                        <Input
                            type="password"
                            placeholder="Nhập lại mật khẩu mới"
                            autoComplete="new-password"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
