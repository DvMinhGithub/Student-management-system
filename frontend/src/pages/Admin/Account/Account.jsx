/* eslint-disable jsx-a11y/anchor-is-valid */
import { DeleteOutlined, EditOutlined, LockOutlined } from '@ant-design/icons';
import { Col, Form, Input, Modal, Popconfirm, Row, Select, Space, Spin, Table, Tag, Tooltip } from 'antd';
import Search from 'antd/es/input/Search';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import removeDiacritics from 'remove-diacritics';
import { STORE } from '~/contants';
import { accessTokenState } from '~/recoil/store/account';
import { pageLoadingState } from '~/recoil/store/app';
import { showNotification } from '~/utils';
import callApi from '~/utils/api';
import './Account.scss';

export default function AccountPage() {
    const [searchValue, setSearchValue] = useState('');

    const [isEdit, setIsEdit] = useState(false);

    const [isOpenModal, setIsOpenModal] = useState(false);

    const [listAccount, setListAccount] = useState([]);

    let [selectAccount, setSelectAccount] = useState(null);

    const [pagination, setPagination] = useState({
        current: STORE.current,
        pageSize: STORE.pageSize,
        onChange: (e) => setPagination({ ...pagination, current: e }),
    });

    const [accessToken, setAccessToken] = useRecoilState(accessTokenState);
    const [pageLoading, setPageLoading] = useRecoilState(pageLoadingState);

    const getAccounts = async () => {
        setPageLoading(true);
        try {
            const res = await callApi({ method: 'get', url: '/accounts', accessToken });
            setListAccount(res.data);
        } catch (error) {
            if (error.status === 401) setAccessToken('');
            showNotification('error', error.data.message);
        } finally {
            setPageLoading(false);
        }
    };
    useEffect(() => {
        document.title = 'Tài khoản'
        getAccounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showModalUpSert = (type, item) => {
        if (type === 'edit') {
            setIsEdit(true);
            setSelectAccount(item);
        }
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
        setPageLoading(true);
        try {
            const res = await callApi({ method: 'put', url: `/accounts/${selectAccount._id}`, data: selectAccount, accessToken });
            setListAccount((preAccounts) => {
                const index = preAccounts.findIndex((item) => item._id === selectAccount._id);
                preAccounts[index] = { ...preAccounts[index], ...selectAccount };
                return preAccounts;
            });
            setIsOpenModal(false);
            showNotification('success', res.message);
        } catch (error) {
            if (error.status === 401) setAccessToken('');
            showNotification('error', error.data.message);
        } finally {
            setPageLoading(false);
        }
    };

    const hanndleDelete = async (idDelete) => {
        setPageLoading(true);
        try {
            const res = await callApi({ method: 'delete', url: `/accounts/${idDelete}`, accessToken });
            setListAccount((preAccounts) => preAccounts.filter((item) => item._id !== idDelete));
            showNotification('success', res.message);
        } catch (error) {
            if (error.status === 401) setAccessToken('');
            showNotification('error', error.data.message);
        } finally {
            setPageLoading(false);
        }
    };

    const handleResetPassword = async (id) => {
        setPageLoading(true);
        try {
            const res = await callApi({ method: 'put', url: `/accounts/${id}/resetPassword`, accessToken });
            showNotification('success', res.message);
        } catch (error) {
            if (error.status === 401) setAccessToken('');
            showNotification('error', error.data.message);
        } finally {
            setPageLoading(false);
        }
    };

    const columns = [
        {
            title: 'Email',
            render: (_, item) => {
                return item[item.role].email;
            },
            sorter: (a, b) => a.student.email.localeCompare(b.student.email),
            sortDirections: ['ascend', 'descend'],
        },

        {
            title: 'Username',
            dataIndex: 'username',
            sorter: (a, b) => a.username.localeCompare(b.username),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Role',
            render: (_, item) => {
                const role = item.role;
                let color = role.length > 5 ? 'geekblue' : 'green';
                if (item.role === 'admin') {
                    color = 'volcano';
                }
                return (
                    <Tag color={color} key={item._id}>
                        {role.toUpperCase()}
                    </Tag>
                );
            },
            sorter: (a, b) => a.role.localeCompare(b.role),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Hành động',
            render: (_, item) => (
                <Space size="middle">
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
                        <Tooltip title="Đặt lại mật khẩu">
                            <LockOutlined />
                        </Tooltip>
                    </Popconfirm>
                    <Tooltip title="Sửa">
                        <a style={{ color: 'blue' }} onClick={() => showModalUpSert('edit', item)}>
                            <EditOutlined />
                        </a>
                    </Tooltip>
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
                        <Tooltip title="Xóa">
                            <a style={{ color: 'red' }}>
                                <DeleteOutlined />
                            </a>
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const getDataSource = () => {
        return listAccount.filter(
            (item) =>
                removeDiacritics(item.username)?.toLowerCase().indexOf(removeDiacritics(searchValue).toLowerCase()) >=
                0,
        );
    };
    return (
        <Spin spinning={pageLoading}>
            <Row className="row-wrapper">
                <Col span={12}>
                    <Search
                        placeholder="Tìm kiếm theo username"
                        onChange={(e) => setSearchValue(e.target.value)}
                        enterButton
                    />
                </Col>
            </Row>
            <Table columns={columns} dataSource={getDataSource()} size="small" pagination={pagination} rowKey="_id" />
            <Modal
                open={isOpenModal}
                title={isEdit ? 'Cập nhật tài khoản' : 'Thêm tài khoản'}
                okText={isEdit ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
                onCancel={() => setIsOpenModal(false)}
                onOk={handleOk}>
                <Form layout="vertical">
                    <Form.Item label="Email:">
                        <Input value={selectAccount?.student?.email} name="email" disabled />
                    </Form.Item>
                    <Row gutter={32}>
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
