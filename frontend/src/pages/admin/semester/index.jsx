import { Button, Col, DatePicker, Form, Input, Modal, Popconfirm, Row, Spin, Table, Tag } from 'antd';
import Search from 'antd/es/input/Search';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import removeDiacritics from 'remove-diacritics';
import { STORE } from '~/lib/constants';
import { showNotification } from '~/lib/utils';
import api from '~/lib/utils/api';
import { useAppStore } from '~/state';

export default function SemesterPage() {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [semesters, setSemesters] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [selectedSemester, setSelectedSemester] = useState({});

    const [pagination, setPagination] = useState({
        current: STORE.current,
        pageSize: STORE.pageSize,
        onChange: (e) => setPagination({ ...pagination, current: e }),
    });

    const pageLoading = useAppStore((state) => state.loading);
    const setPageLoading = useAppStore((state) => state.setLoading);

    const getSemesters = async () => {
        setPageLoading(true);
        try {
            const res = await api.get('/semesters');
            setSemesters(Array.isArray(res?.data) ? res.data : []);
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        document.title = 'Học kỳ';
        getSemesters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showModal = (type, semester) => {
        if (type === 'add') {
            setIsEdit(false);
            setSelectedSemester({});
        } else {
            setIsEdit(true);
            setSelectedSemester(semester || {});
        }
        setIsOpenModal(true);
    };

    const handleOk = async () => {
        setPageLoading(true);
        try {
            let res;
            if (isEdit) {
                res = await api.put(`/semesters/${selectedSemester._id}`, selectedSemester);
                const updatedSemester = res?.data ?? res;
                setSemesters((preSemester) =>
                    preSemester.map((item) => (item._id === selectedSemester._id ? { ...item, ...updatedSemester } : item)),
                );
            } else {
                res = await api.post('/semesters', selectedSemester);
                if (res?.data) {
                    setSemesters((prev) => [res.data, ...prev]);
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

    const handleDelete = async (id) => {
        setPageLoading(true);
        try {
            const res = await api.delete(`/semesters/${id}`);
            setSemesters((pre) => pre.filter((semester) => semester._id !== id));
            showNotification('success', res.message);
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };

    const handleChangeInput = (e) => {
        const { name, value } = e.target;
        setSelectedSemester((pre) => ({
            ...pre,
            [name]: value,
        }));
    };

    const filteredSemesters = useMemo(() => {
        const query = removeDiacritics(searchValue).toLowerCase();
        return (Array.isArray(semesters) ? semesters : []).filter((item) =>
            removeDiacritics(item?.name || '')
                .toLowerCase()
                .includes(query),
        );
    }, [searchValue, semesters]);

    const columns = [
        {
            title: 'Mã học kỳ',
            dataIndex: 'code',
            key: 'code',
            sorter: (a, b) => (a?.code || '').localeCompare(b?.code || ''),
            sortDirections: ['ascend', 'descend'],
            width: 160,
        },
        {
            title: 'Tên học kỳ',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => (a?.name || '').localeCompare(b?.name || ''),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (startDate) => (startDate ? dayjs(startDate).format('DD-MM-YYYY') : '-'),
            sorter: (a, b) => dayjs(a?.startDate).unix() - dayjs(b?.startDate).unix(),
            sortDirections: ['descend', 'ascend'],
            width: 160,
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (endDate) => (endDate ? dayjs(endDate).format('DD-MM-YYYY') : '-'),
            sorter: (a, b) => dayjs(a?.endDate).unix() - dayjs(b?.endDate).unix(),
            sortDirections: ['descend', 'ascend'],
            width: 160,
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
                                Bạn có chắc chắn muốn xóa học kỳ <strong>{item.name}</strong> ?
                            </span>
                        }
                        onConfirm={() => handleDelete(item._id)}
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
            <div className="admin-semester-page">
                <div className="table-head">
                    <div>
                        <h3 className="table-title">Quản lý học kỳ</h3>
                        <p className="table-subtitle">Theo dõi thời gian và quản lý các học kỳ trong hệ thống.</p>
                    </div>
                    <div className="table-meta">
                        <Tag color="geekblue">Học kỳ: {filteredSemesters.length}</Tag>
                    </div>
                </div>

                <Row gutter={[10, 10]} className="admin-semester-toolbar">
                    <Col xs={24} lg={14}>
                        <Search
                            value={searchValue}
                            placeholder="Tìm kiếm theo tên học kỳ"
                            onChange={(e) => setSearchValue(e.target.value)}
                            enterButton
                            allowClear
                        />
                    </Col>
                    <Col xs={24} lg={10} className="admin-semester-toolbar-actions">
                        <Button type="primary" onClick={() => showModal('add')}>
                            Thêm học kỳ
                        </Button>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={filteredSemesters}
                    size="small"
                    pagination={pagination}
                    rowKey="_id"
                    scroll={{ x: 900 }}
                />
            </div>

            <Modal
                open={isOpenModal}
                title={isEdit ? 'Cập nhật học kỳ' : 'Thêm học kỳ'}
                okText={isEdit ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
                onCancel={() => setIsOpenModal(false)}
                onOk={handleOk}>
                <Form layout="vertical">
                    <Form.Item label="Mã học kỳ">
                        <Input
                            placeholder="Nhập mã học kỳ"
                            name="code"
                            value={selectedSemester?.code}
                            onChange={handleChangeInput}
                        />
                    </Form.Item>
                    <Form.Item label="Tên học kỳ">
                        <Input
                            placeholder="Nhập tên học kỳ"
                            name="name"
                            value={selectedSemester?.name}
                            onChange={handleChangeInput}
                        />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Ngày bắt đầu">
                                <DatePicker
                                    placeholder="Chọn ngày bắt đầu"
                                    style={{ width: '100%' }}
                                    name="startDate"
                                    format="YYYY-MM-DD"
                                    value={selectedSemester?.startDate ? dayjs(selectedSemester.startDate) : null}
                                    onChange={(_, dateString) => {
                                        setSelectedSemester({ ...selectedSemester, startDate: dateString });
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Ngày kết thúc">
                                <DatePicker
                                    placeholder="Chọn ngày kết thúc"
                                    style={{ width: '100%' }}
                                    name="endDate"
                                    format="YYYY-MM-DD"
                                    value={selectedSemester?.endDate ? dayjs(selectedSemester.endDate) : null}
                                    onChange={(_, dateString) => {
                                        setSelectedSemester({ ...selectedSemester, endDate: dateString });
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </Spin>
    );
}
