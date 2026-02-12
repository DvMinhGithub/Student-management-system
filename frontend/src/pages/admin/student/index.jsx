import { Button, Col, DatePicker, Form, Input, Modal, Popconfirm, Row, Select, Spin, Table, Tag, Upload } from 'antd';
import Search from 'antd/es/input/Search';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import removeDiacritics from 'remove-diacritics';
import { STORE } from '~/lib/constants';
import { showNotification } from '~/lib/utils';
import api from '~/lib/utils/api';
import { useAppStore } from '~/state';

export default function StudentPage() {
    const [searchValue, setSearchValue] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectStudent, setSelectStudent] = useState({});

    const [pagination, setPagination] = useState({
        current: STORE.current,
        pageSize: STORE.pageSize,
        onChange: (e) => setPagination({ ...pagination, current: e }),
    });

    const pageLoading = useAppStore((state) => state.loading);
    const setPageLoading = useAppStore((state) => state.setLoading);

    const getStudents = async () => {
        setPageLoading(true);
        try {
            const res = await api.get('/students');
            setStudents(Array.isArray(res?.data) ? res.data : []);
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        document.title = 'Sinh viên';
        getStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showModal = (type, item) => {
        if (type === 'add') {
            setIsEdit(false);
            setSelectStudent({});
        } else {
            setIsEdit(true);
            setSelectStudent(item || {});
        }
        setIsOpenModal(true);
    };

    const handleChangeInput = (e) => {
        const { name, value } = e.target;
        setSelectStudent((preStudent) => ({
            ...preStudent,
            [name]: value,
        }));
    };

    const handleOk = async () => {
        setPageLoading(true);
        try {
            let res;
            if (isEdit) {
                res = await api.put(`/students/${selectStudent._id}`, selectStudent);
                const updatedStudent = res?.data ?? res;
                setStudents((preStudents) =>
                    preStudents.map((item) => (item._id === selectStudent._id ? { ...item, ...updatedStudent } : item)),
                );
            } else {
                res = await api.post('/students', selectStudent);
                if (res?.data) {
                    setStudents((prev) => [res.data, ...prev]);
                }
            }
            showNotification('success', res.message);
            setIsOpenModal(false);
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };

    const hanldeDeleteStudent = async (idDelete) => {
        setPageLoading(true);
        try {
            const res = await api.delete(`/students/${idDelete}`);
            setStudents((pre) => pre.filter((student) => student._id !== idDelete));
            showNotification('success', res.message);
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };

    const handleUploadExcel = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        setPageLoading(true);
        try {
            const res = await api.post(`/students/uploadExcel`, formData);
            setStudents(Array.isArray(res?.data) ? res.data : []);
            showNotification('success', res.message);
            return true;
        } catch (error) {
            showNotification('error', error);
            return false;
        } finally {
            setPageLoading(false);
        }
    };

    const filteredStudents = useMemo(() => {
        const query = removeDiacritics(searchValue).toLowerCase();
        return (Array.isArray(students) ? students : []).filter((item) => {
            const code = removeDiacritics(item?.code || '').toLowerCase();
            const name = removeDiacritics(item?.name || '').toLowerCase();
            const email = removeDiacritics(item?.email || '').toLowerCase();
            return code.includes(query) || name.includes(query) || email.includes(query);
        });
    }, [students, searchValue]);

    const columns = [
        {
            title: 'Mã sinh viên',
            dataIndex: 'code',
            width: 150,
            sorter: (a, b) => (a?.code || '').localeCompare(b?.code || ''),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Email',
            dataIndex: 'email',
            width: 220,
            sorter: (a, b) => (a?.email || '').localeCompare(b?.email || ''),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Họ tên',
            dataIndex: 'name',
            sorter: (a, b) => (a?.name || '').localeCompare(b?.name || ''),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            width: 110,
            render: (gender) => (
                <Tag color={gender === 'Nữ' ? 'magenta' : 'blue'}>{gender || 'Chưa cập nhật'}</Tag>
            ),
            sorter: (a, b) => (a?.gender || '').localeCompare(b?.gender || ''),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            width: 220,
            sorter: (a, b) => (a?.address || '').localeCompare(b?.address || ''),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            width: 140,
        },
        {
            title: 'Hành động',
            render: (_, item) => (
                <div className="admin-table-actions">
                    <Button size="small" className="admin-table-btn admin-table-btn-edit" onClick={() => showModal('edit', item)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title={
                            <span>
                                Bạn có chắc chắn muốn xóa sinh viên <strong>{item.name}</strong>?
                            </span>
                        }
                        onConfirm={() => hanldeDeleteStudent(item._id)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                        okType="danger">
                        <Button danger size="small">
                            Xóa
                        </Button>
                    </Popconfirm>
                </div>
            ),
            width: 130,
            fixed: 'right',
        },
    ];

    return (
        <Spin spinning={pageLoading}>
            <div className="admin-student-page">
                <div className="table-head">
                    <div>
                        <h3 className="table-title">Quản lý sinh viên</h3>
                        <p className="table-subtitle">Quản lý hồ sơ sinh viên và import dữ liệu nhanh bằng file Excel.</p>
                    </div>
                    <div className="table-meta">
                        <Tag color="geekblue">Sinh viên: {filteredStudents.length}</Tag>
                    </div>
                </div>

                <div className="admin-student-toolbar">
                    <Search
                        allowClear
                        value={searchValue}
                        placeholder="Tìm kiếm theo mã, tên hoặc email sinh viên"
                        onChange={(e) => setSearchValue(e.target.value)}
                        enterButton
                        className="admin-student-search"
                    />
                    <div className="admin-student-toolbar-actions">
                        <Button type="primary" className="button-box" onClick={() => showModal('add')}>
                            Thêm sinh viên
                        </Button>
                        <Upload
                            showUploadList={false}
                            accept=".xls, .xlsx"
                            customRequest={async ({ file, onSuccess, onError }) => {
                                const ok = await handleUploadExcel(file);
                                if (ok) onSuccess?.('ok');
                                else onError?.(new Error('Upload failed'));
                            }}>
                            <Button type="primary" ghost>
                                Nhập Excel
                            </Button>
                        </Upload>
                    </div>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredStudents}
                    size="small"
                    pagination={pagination}
                    rowKey="_id"
                    scroll={{ x: 1120 }}
                />
            </div>

            <Modal
                open={isOpenModal}
                title={isEdit ? 'Cập nhật sinh viên' : 'Thêm sinh viên'}
                okText={isEdit ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
                onCancel={() => setIsOpenModal(false)}
                onOk={handleOk}>
                <Form layout="vertical">
                    <Form.Item label="Mã sinh viên:">
                        <Input value={selectStudent?.code} disabled />
                    </Form.Item>
                    <Form.Item label="Email:">
                        <Input value={selectStudent?.email} name="email" onChange={handleChangeInput} />
                    </Form.Item>
                    <Form.Item label="Tên sinh viên:">
                        <Input value={selectStudent?.name} name="name" onChange={handleChangeInput} />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Giới tính">
                                <Select
                                    value={selectStudent?.gender}
                                    options={[
                                        { value: 'Nam', label: 'Nam' },
                                        { value: 'Nữ', label: 'Nữ' },
                                    ]}
                                    onChange={(value) => setSelectStudent({ ...selectStudent, gender: value })}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Ngày sinh:">
                                <DatePicker
                                    placeholder="Ngày sinh"
                                    name="dateOfBirth"
                                    format="DD-MM-YYYY"
                                    style={{ width: '100%' }}
                                    value={selectStudent?.dateOfBirth ? dayjs(selectStudent.dateOfBirth) : null}
                                    onChange={(_, dateString) => {
                                        setSelectStudent({ ...selectStudent, dateOfBirth: dateString });
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="Số điện thoại">
                        <Input value={selectStudent?.phone} name="phone" onChange={handleChangeInput} />
                    </Form.Item>
                    <Form.Item label="Địa chỉ hiện tại:">
                        <Input value={selectStudent?.address} name="address" onChange={handleChangeInput} />
                    </Form.Item>
                    <Form.Item label="Nơi sinh:">
                        <Input value={selectStudent?.placeOfBirth} name="placeOfBirth" onChange={handleChangeInput} />
                    </Form.Item>
                </Form>
            </Modal>
        </Spin>
    );
}
