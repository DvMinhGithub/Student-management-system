import { LoginOutlined, SecurityScanOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Breadcrumb, Dropdown, Layout, Menu, Spin, theme } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { pageLoadingState } from '~/recoil/store/app';
import { studentAvatarState, studentNameState } from '~/recoil/store/student';
import './index.scss';
const { Header, Footer, Sider, Content } = Layout;

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

    const studentName = useRecoilValue(studentNameState);

    const studentAvatar = useRecoilValue(studentAvatarState);

    const [pageLoading, setPageLoading] = useRecoilState(pageLoadingState);

    const handleMenuClick = ({ key }) => {
        setCurrentPath(key);
    };

    const handleDropDownClick = ({ key }) => {
        switch (key) {
            case 'changePassword':
                break;
            case 'myInfo':
                setCurrentPath(menuItems[0].key);
                break;
            case 'logout':
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
                                    <Avatar size={42} src={studentAvatar ? studentAvatar : UserOutlined} />
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
        </Spin>
    );
}
