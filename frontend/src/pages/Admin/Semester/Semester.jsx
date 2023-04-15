/* eslint-disable jsx-a11y/anchor-is-valid */
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, Modal, Popconfirm, Row, Space, Spin, Table } from 'antd';
import Search from 'antd/es/input/Search';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import removeDiacritics from 'remove-diacritics';
import { STORE } from '~/contants';
import { pageLoadingState } from '~/recoil/store/app';
import { showNotification } from '~/utils';
import callApi from '~/utils/api';
import './Semester.scss';

export default function SemesterPage() {
    const [isOpenModal, setIsOpenModal] = useState(false);

    const [isEdit, setIsEdit] = useState(false);

    const [semesters, setSemesters] = useState([]);

    const [pagination, setPagination] = useState({
        current: STORE.current,
        pageSize: STORE.pageSize,
        onChange: (e) => setPagination({ ...pagination, current: e }),
    });

    const [searchValue, setSearchValue] = useState('');

    const [selectedSemester, setSelectedSemester] = useState(null);

    const [pageLoading, setPageLoading] = useRecoilState(pageLoadingState);

    const getSemesters = async () => {
        setPageLoading(true);
        try {
            const res = await callApi({ method: 'get', url: '/semesters' });
            setSemesters(res.data);
        } catch (error) {
            showNotification('error', error.message);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        getSemesters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showModal = (type, semester) => {
        if (type === 'add') {
            setIsEdit(false);
            setSelectedSemester(null);
        } else {
            setIsEdit(true);
            setSelectedSemester(semester);
        }
        setIsOpenModal(true);
    };

    const handleOk = async () => {
        setPageLoading(true);
        try {
            let res;
            if (isEdit) {
                res = await callApi({
                    method: 'put',
                    url: `/semesters/${selectedSemester._id}`,
                    data: selectedSemester,
                });
                setSemesters((preSemester) => {
                    const index = preSemester.findIndex((item) => item._id === selectedSemester._id);
                    preSemester[index] = { ...preSemester[index], ...res.data };
                    return preSemester;
                });
            } else {
                res = await callApi({ method: 'post', url: '/semesters', data: selectedSemester });
                setSemesters([...semesters, res.data]);
            }
            showNotification('success', res.message);
            setIsOpenModal(false);
        } catch (error) {
            showNotification('error', error.message);
        } finally {
            setPageLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setPageLoading(true);
        try {
            const res = await callApi({ method: 'delete', url: `/semesters/${id}` });
            setSemesters((pre) => pre.filter((student) => student._id !== id));
            showNotification('success', res.message);
        } catch (error) {
            showNotification('error', error.message);
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

    const columns = [
        {
            title: 'Mã học kỳ',
            dataIndex: 'code',
            key: 'code',
            sorter: (a, b) => a.code.localeCompare(b.code),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Tên học kỳ',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (startDate) => dayjs(startDate).format('DD-MM-YYYY'),
            sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (startDate) => dayjs(startDate).format('DD-MM-YYYY'),
            sorter: (a, b) => dayjs(a.endDate).unix() - dayjs(b.endDate).unix(),
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            render: (_, item) => (
                <Space size="middle">
                    <a style={{ color: 'blue' }} onClick={() => showModal('edit', item)}>
                        <EditOutlined />
                    </a>
                    <Popconfirm
                        title={
                            <span>
                                Bạn có chắc chắn muốn xóa học kỳ <br />
                                <strong>{item.name}</strong> ?
                            </span>
                        }
                        onConfirm={() => handleDelete(item._id)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                        okType="danger">
                        <a style={{ color: 'red' }}>
                            <DeleteOutlined />
                        </a>
                    </Popconfirm>
                </Space>
            ),
            width: '10%',
        },
    ];

    const getDataSource = () => {
        return semesters.filter(
            (item) =>
                removeDiacritics(item.name)?.toLowerCase().indexOf(removeDiacritics(searchValue).toLowerCase()) >= 0,
        );
    };
    return (
        <Spin spinning={pageLoading}>
            <Row className="row-wrapper">
                <Col span={12}>
                    <Search
                        placeholder="Tìm kiếm theo tên học kỳ"
                        onChange={(e) => setSearchValue(e.target.value)}
                        enterButton
                        allowClear
                    />
                </Col>
                <Col span={12} className="col-wrapper">
                    <Button type="primary" onClick={() => showModal('add')}>
                        Thêm học kỳ
                    </Button>
                </Col>
            </Row>
            <Table columns={columns} dataSource={getDataSource()} size="small" pagination={pagination} rowKey="_id" />
            <Modal
                open={isOpenModal}
                title={isEdit ? 'Cập nhật học kỳ' : 'Thêm học kỳ'}
                okText={isEdit ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
                onCancel={() => setIsOpenModal(false)}
                onOk={handleOk}>
                <Form layout="vertical">
                    <Form.Item label="Mã học kỳ" style={{ marginTop: '12px', fontWeight: 600 }}>
                        <Input
                            placeholder="Nhập mã học kỳ"
                            name="code"
                            value={selectedSemester?.code}
                            onChange={handleChangeInput}
                        />
                    </Form.Item>
                    <Form.Item label="Tên học kỳ" style={{ marginTop: '12px', fontWeight: 600 }}>
                        <Input
                            placeholder="Nhập tên học kỳ"
                            name="name"
                            value={selectedSemester?.name}
                            onChange={handleChangeInput}
                        />
                    </Form.Item>
                    <Row gutter={32}>
                        <Col span={12}>
                            <Form.Item label="Ngày bắt đầu" style={{ marginTop: '12px', fontWeight: 600 }}>
                                <DatePicker
                                    placeholder="Chọn ngày bắt đầu"
                                    style={{ width: '100%' }}
                                    name="startDate"
                                    format="YYYY-MM-DD"
                                    value={dayjs(selectedSemester?.startDate)}
                                    onChange={(_, dateString) => {
                                        setSelectedSemester({ ...selectedSemester, startDate: dateString });
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Ngày kết thúc" style={{ marginTop: '12px', fontWeight: 600 }}>
                                <DatePicker
                                    placeholder="Chọn ngày bắt đầu"
                                    style={{ width: '100%' }}
                                    name="endDate"
                                    format="YYYY-MM-DD"
                                    value={dayjs(selectedSemester?.endDate)}
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
