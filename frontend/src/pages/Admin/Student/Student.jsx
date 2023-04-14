/* eslint-disable jsx-a11y/anchor-is-valid */
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, Modal, Popconfirm, Row, Select, Space, Spin, Table, Upload } from 'antd';
import Search from 'antd/es/input/Search';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import removeDiacritics from 'remove-diacritics';
import { STORE } from '~/contants';
import { pageLoadingState } from '~/recoil/store/app';
import { showNotification } from '~/utils';
import './Student.scss';
import callApi from '~/utils/api';

export default function StudentPage() {
    const [searchValue, setSearchValue] = useState('');

    const [isEdit, setIsEdit] = useState(false);

    const [isOpenModal, setIsOpenModal] = useState(false);

    const [students, setStudents] = useState([]);

    const [pagination, setPagination] = useState({
        current: STORE.current,
        pageSize: STORE.pageSize,
        onChange: (e) => setPagination({ ...pagination, current: e }),
    });

    const [selectStudent, setSelectStudent] = useState({});

    const [pageLoading, setPageLoading] = useRecoilState(pageLoadingState);

    const getStudents = async () => {
        setPageLoading(true);
        try {
            const res = await callApi({ method: 'get', url: `/students` });
            setStudents(res.data);
        } catch (error) {
            showNotification('error', error.message);
        } finally {
            setPageLoading(false);
        }
    };
    useEffect(() => {
        getStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showModal = (type, item) => {
        if (type === 'add') {
            setIsEdit(false);
            setSelectStudent({});
        } else {
            setIsEdit(true);
            setSelectStudent(item);
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
                res = await callApi({
                    method: 'put',
                    url: `/students/${selectStudent._id}`,
                    data: selectStudent,
                });
                setStudents((preStudents) => {
                    const index = preStudents.findIndex((item) => item._id === selectStudent._id);
                    preStudents[index] = { ...preStudents[index], ...res.data };
                    return preStudents;
                });
                showNotification('success', res.message);
            } else {
                res = await callApi({ method: 'post', url: '/students', data: selectStudent });
                setStudents([res.data, ...students]);
            }
            setIsOpenModal(false);
        } catch (error) {
            showNotification('error', error.message);
        } finally {
            setPageLoading(false);
        }
    };

    const hanldeDeleteStudent = async (idDelete) => {
        setPageLoading(true);
        try {
            const res = await callApi({ method: 'delete', url: `/students/${idDelete}` });
            setStudents((pre) => pre.filter((student) => student._id !== idDelete));
            showNotification('success', res.message);
        } catch (error) {
            showNotification('error', error.message);
        } finally {
            setPageLoading(false);
        }
    };

    const columns = [
        {
            title: 'Mã sinh viên',
            dataIndex: 'code',
            width: '15%',
            sorter: (a, b) => a.code.localeCompare(b.code),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Email',
            dataIndex: 'email',
            width: '20%',
            sorter: (a, b) => a.email.localeCompare(b.email),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Họ tên',
            dataIndex: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            width: '10%',
            sorter: (a, b) => a.gender.localeCompare(b.gender),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            width: '15%',
            sorter: (a, b) => a.address.localeCompare(b.address),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            width: '15%',
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
                                Bạn có chắc chắn muốn xóa sinh viên <strong>{item.name}</strong>?
                            </span>
                        }
                        onConfirm={() => hanldeDeleteStudent(item._id)}
                        okText="Đồng ý"
                        cancelText="Hủy"w
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
        return students.filter(
            (item) =>
                removeDiacritics(item.name)?.toLowerCase().indexOf(removeDiacritics(searchValue).toLowerCase()) >= 0,
        );
    };

    const handleSearch = () => {};

    const handleUploadExcel = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        setPageLoading(true);
        try {
            const res = await callApi({ method: 'post', url: `/students/uploadExcel`, data: formData });
            setStudents((prevStudents) => [...prevStudents, ...res.data]);
            showNotification('success', res.message);
        } catch (error) {
            showNotification('error', error.message);
        } finally {
            setPageLoading(false);
        }
    };
    return (
        <Spin spinning={pageLoading}>
            <Row className="row-wrapper">
                <Col span={12}>
                    <Search
                        allowClear
                        placeholder="Tìm kiếm theo tên sinh viên"
                        onSearch={handleSearch}
                        onChange={(e) => setSearchValue(e.target.value)}
                        enterButton
                    />
                </Col>
                <Col span={12} className="col-wrapper">
                    <Button type="primary" className="button-box" onClick={() => showModal('add')}>
                        Thêm sinh viên
                    </Button>
                    <Upload
                        showUploadList={false}
                        accept=".xls, .xlsx"
                        customRequest={({ file }) => {
                            handleUploadExcel(file);
                        }}>
                        <Button type="primary">Nhập Excel</Button>
                    </Upload>
                </Col>
            </Row>

            <Table columns={columns} dataSource={getDataSource()} size="small" pagination={pagination} rowKey="_id" />

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
                    <Row gutter={32}>
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
                                    value={dayjs(selectStudent?.dateOfBirth)}
                                    onChange={(_, dateString) => {
                                        selectStudent({ ...selectStudent, dateOfBirth: dateString });
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="Số điện thoại">
                        <Input value={selectStudent?.phone} name="name" onChange={handleChangeInput} />
                    </Form.Item>
                    <Form.Item label="Địa chỉ hiện tại:">
                        <Input value={selectStudent?.address} name="name" onChange={handleChangeInput} />
                    </Form.Item>
                    <Form.Item label="Nơi sinh:">
                        <Input value={selectStudent?.placeOfBirth} name="placeOfBirth" onChange={handleChangeInput} />
                    </Form.Item>
                </Form>
            </Modal>
        </Spin>
    );
}
