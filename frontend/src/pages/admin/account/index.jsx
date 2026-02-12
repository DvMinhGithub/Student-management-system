import { Button, Col, Form, Input, Modal, Popconfirm, Row, Select, Spin, Table, Tag } from 'antd';
import Search from 'antd/es/input/Search';
import { useEffect, useMemo, useState } from 'react';
import removeDiacritics from 'remove-diacritics';
import { STORE } from '~/lib/constants';
import { showNotification } from '~/lib/utils';
import api from '~/lib/utils/api';
import { useAppStore } from '~/state';

export default function AccountPage() {
    const [searchValue, setSearchValue] = useState('');
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [listAccount, setListAccount] = useState([]);
    const [selectAccount, setSelectAccount] = useState(null);
    const [roleFilter, setRoleFilter] = useState('all');

    const [pagination, setPagination] = useState({
        current: STORE.current,
        pageSize: STORE.pageSize,
        onChange: (e) => setPagination({ ...pagination, current: e }),
    });

    const pageLoading = useAppStore((state) => state.loading);
    const setPageLoading = useAppStore((state) => state.setLoading);

    const roleOptions = [
        { value: 'all', label: 'Tất cả vai trò' },
        { value: 'admin', label: 'Admin' },
        { value: 'teacher', label: 'Giảng viên' },
        { value: 'student', label: 'Sinh viên' },
    ];

    const getAccounts = async () => {
        setPageLoading(true);
        try {
            const res = await api.get('/accounts');
            setListAccount(Array.isArray(res?.data) ? res.data : []);
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        document.title = 'Tài khoản';
        getAccounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showModalUpSert = (item) => {
        setSelectAccount(item);
        setIsOpenModal(true);
    };

    const handleChangeInput = (e) => {
        const { name, value } = e.target;
        setSelectAccount((preAccount) => ({
            ...preAccount,
            [name]: value,
        }));
    };

    const handleOk = async () => {
        if (!selectAccount?._id) return;
        setPageLoading(true);
        try {
            const res = await api.put(`/accounts/${selectAccount._id}`, selectAccount);
            const updatedAccount = res?.data ?? res;
            setListAccount((preAccounts) =>
                preAccounts.map((item) => (item._id === selectAccount._id ? { ...item, ...updatedAccount } : item)),
            );
            setIsOpenModal(false);
            showNotification('success', res.message);
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };

    const hanndleDelete = async (idDelete) => {
        setPageLoading(true);
        try {
            const res = await api.delete(`/accounts/${idDelete}`);
            setListAccount((preAccounts) => preAccounts.filter((item) => item._id !== idDelete));
            showNotification('success', res.message);
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };

    const handleResetPassword = async (id) => {
        setPageLoading(true);
        try {
            const res = await api.put(`/accounts/${id}/resetPassword`);
            showNotification('success', res.message);
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };

    const filteredAccounts = useMemo(() => {
        const normalized = Array.isArray(listAccount) ? listAccount : [];
        const query = removeDiacritics(searchValue).toLowerCase();

        return normalized
            .filter((item) => (roleFilter === 'all' ? true : item.role === roleFilter))
            .filter((item) => {
                const username = removeDiacritics(item?.username || '').toLowerCase();
                const email = removeDiacritics(item?.[item?.role]?.email || '').toLowerCase();
                return username.includes(query) || email.includes(query);
            });
    }, [listAccount, roleFilter, searchValue]);

    const accountStats = useMemo(() => {
        const stats = { total: filteredAccounts.length, admin: 0, teacher: 0, student: 0 };
        filteredAccounts.forEach((item) => {
            if (item?.role && Object.prototype.hasOwnProperty.call(stats, item.role)) {
                stats[item.role] += 1;
            }
        });
        return stats;
    }, [filteredAccounts]);

    const columns = [
        {
            title: 'Email',
            render: (_, item) => item?.[item?.role]?.email || '-',
            sorter: (a, b) => (a?.[a?.role]?.email || '').localeCompare(b?.[b?.role]?.email || ''),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Username',
            dataIndex: 'username',
            sorter: (a, b) => (a?.username || '').localeCompare(b?.username || ''),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Role',
            render: (_, item) => {
                const role = item?.role || 'unknown';
                let color = role.length > 5 ? 'geekblue' : 'green';
                if (role === 'admin') color = 'volcano';
                return (
                    <Tag color={color} key={item._id}>
                        {role.toUpperCase()}
                    </Tag>
                );
            },
            sorter: (a, b) => (a?.role || '').localeCompare(b?.role || ''),
            sortDirections: ['ascend', 'descend'],
            width: 120,
        },
        {
            title: 'Hành động',
            render: (_, item) => (
                <div className="admin-table-actions">
                    <Popconfirm
                        title={
                            <span>
                                Bạn có chắc chắn muốn đặt lại mật khẩu tài khoản <strong>{item.username}</strong>?
                            </span>
                        }
                        onConfirm={() => handleResetPassword(item._id)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                        okType="danger">
                        <Button size="small" className="admin-table-btn admin-table-btn-warn">
                            Reset MK
                        </Button>
                    </Popconfirm>

                    <Button size="small" className="admin-table-btn admin-table-btn-edit" onClick={() => showModalUpSert(item)}>
                        Sửa
                    </Button>

                    <Popconfirm
                        title={
                            <span>
                                Bạn có chắc chắn muốn xóa tài khoản <strong>{item.username}</strong>?
                            </span>
                        }
                        onConfirm={() => hanndleDelete(item._id)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                        okType="danger">
                        <Button danger size="small">
                            Xóa
                        </Button>
                    </Popconfirm>
                </div>
            ),
            width: 220,
        },
    ];

    return (
        <Spin spinning={pageLoading}>
            <div className="admin-account-page">
                <div className="table-head">
                    <div>
                        <h3 className="table-title">Quản lý tài khoản</h3>
                        <p className="table-subtitle">Theo dõi và cập nhật quyền truy cập người dùng.</p>
                    </div>
                    <div className="table-meta">
                        <Tag color="geekblue">Tổng: {accountStats.total}</Tag>
                        <Tag color="volcano">Admin: {accountStats.admin}</Tag>
                        <Tag color="blue">GV: {accountStats.teacher}</Tag>
                        <Tag color="green">SV: {accountStats.student}</Tag>
                    </div>
                </div>

                <Row gutter={[10, 10]} className="admin-account-toolbar">
                    <Col xs={24} lg={14}>
                        <Search
                            allowClear
                            value={searchValue}
                            placeholder="Tìm kiếm theo username hoặc email"
                            onChange={(e) => setSearchValue(e.target.value)}
                            enterButton
                        />
                    </Col>
                    <Col xs={24} lg={10}>
                        <Select
                            value={roleFilter}
                            onChange={setRoleFilter}
                            options={roleOptions}
                            className="admin-account-filter-role"
                        />
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={filteredAccounts}
                    size="middle"
                    pagination={pagination}
                    rowKey="_id"
                    scroll={{ x: 960 }}
                />
            </div>

            <Modal
                open={isOpenModal}
                title="Cập nhật tài khoản"
                okText="Cập nhật"
                cancelText="Hủy"
                onCancel={() => setIsOpenModal(false)}
                onOk={handleOk}>
                <Form layout="vertical">
                    <Form.Item label="Email:">
                        <Input value={selectAccount?.[selectAccount?.role]?.email} name="email" disabled />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Username:">
                                <Input value={selectAccount?.username} name="username" onChange={handleChangeInput} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Role:">
                                <Select
                                    value={selectAccount?.role}
                                    options={[
                                        { value: 'admin', label: 'Admin' },
                                        { value: 'teacher', label: 'Giảng viên' },
                                        { value: 'student', label: 'Sinh viên' },
                                    ]}
                                    onChange={(value) => setSelectAccount({ ...selectAccount, role: value })}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </Spin>
    );
}
