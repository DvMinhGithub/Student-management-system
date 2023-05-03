/* eslint-disable jsx-a11y/anchor-is-valid */
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Modal, Popconfirm, Row, Select, Space, Spin, Table, Upload } from 'antd';
import Search from 'antd/es/input/Search';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import removeDiacritics from 'remove-diacritics';
import { STORE } from '~/contants';
import { appState } from '~/recoil/store';
import { showNotification } from '~/utils';
import api from '~/utils/api';
import './Teacher.scss';

export default function TeacherPage() {
    const [searchValue, setSearchValue] = useState('');

    const [isEdit, setIsEdit] = useState(false);

    const [isOpenModal, setIsOpenModal] = useState(false);

    const [selectedTeacher, setSelectedTeacher] = useState({});

    const [pagination, setPagination] = useState({
        current: STORE.current,
        pageSize: STORE.pageSize,
        onChange: (e) => setPagination({ ...pagination, current: e }),
    });

    const [listTeachers, setListTeachers] = useState([]);

    const [listCourse, setListCourse] = useState([]);

    const [pageLoading, setPageLoading] = useRecoilState(appState.loading);

    const getAllTeachers = async () => {
        setPageLoading(true);
        try {
            const res = await api.get('/teachers');
            setListTeachers(res.data);
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };

    const getAllCourses = async () => {
        setPageLoading(true);
        try {
            const res = await api.get('/courses');
            setListCourse(res.data);
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };
    useEffect(() => {
        document.title = 'Giảng viên';
        getAllTeachers();
        getAllCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUploadExcel = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        setPageLoading(true);
        try {
            const res = await api.post(`teachers/uploadExcel`, formData);
            setListTeachers([...listTeachers, ...res.data]);
            showNotification('success', res.message);
        } catch (error) {
            showNotification('error', `Failed to upload Excel file: ${error.data.message}`);
        } finally {
            setPageLoading(false);
        }
    };

    const showModal = (type, item) => {
        if (type === 'add') {
            setIsEdit(false);
            setSelectedTeacher({});
        } else {
            setIsEdit(true);
            setSelectedTeacher(item);
        }
        setIsOpenModal(true);
    };

    const handleChangeInput = (e) => {
        const { name, value } = e.target;
        setSelectedTeacher((preCourse) => ({
            ...preCourse,
            [name]: value,
        }));
    };

    const handleOK = async () => {
        const courses = selectedTeacher.courseId
            ? selectedTeacher.courseId
            : selectedTeacher.courses.map((course) => course._id);
        const teacherToUpdate = { ...selectedTeacher, courses };

        setPageLoading(true);
        try {
            let res;
            if (isEdit) {
                res = await api.put(`/teachers/${selectedTeacher._id}`, teacherToUpdate);
                setListTeachers((prevList) => {
                    const index = prevList.findIndex((teacher) => teacher._id === selectedTeacher._id);
                    prevList[index] = { ...prevList[index], ...res.data };
                    return prevList;
                });
            } else {
                res = await api.post('/teachers', selectedTeacher);
                setListTeachers((prevListTeachers) => [...prevListTeachers, res.data]);
            }
            showNotification('success', res.message);
            setIsOpenModal(false);
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };

    const handleDeleteTeacher = async (teacher) => {
        setPageLoading(true);
        try {
            const res = await api.delete(`/teachers/${teacher._id}`);
            setListTeachers((pre) => pre.filter((item) => item._id !== teacher._id));
            showNotification('success', res.message);
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };

    const columns = [
        {
            title: 'Mã giảng viên',
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
            width: '20%',
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
            title: 'Môn học',
            dataIndex: 'courses',
            key: 'courses',
            render: (courses) => (
                <span>
                    {courses.map((course) => (
                        <span key={course._id}>
                            {course.name}
                            <br />
                        </span>
                    ))}
                </span>
            ),
        },
        {
            title: 'Hành động',
            render: (_, item) => (
                <Space size="middle">
                    <a style={{ color: 'blue' }} onClick={() => showModal('edit', item)}>
                        <EditOutlined />
                    </a>
                    <Popconfirm
                        title={
                            <span>
                                Bạn có chắc chắn muốn xóa giảng viên <br /> <strong>{item.name}</strong>?
                            </span>
                        }
                        onConfirm={() => handleDeleteTeacher(item)}
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
        return listTeachers.filter(
            (item) =>
                removeDiacritics(item.name)?.toLowerCase().indexOf(removeDiacritics(searchValue).toLowerCase()) >= 0,
        );
    };
    return (
        <Spin spinning={pageLoading}>
            <Row className="row-wrapper">
                <Col span={12}>
                    <Search
                        placeholder="Tìm kiếm theo tên giảng viên"
                        onChange={(e) => setSearchValue(e.target.value)}
                        enterButton
                    />
                </Col>
                <Col span={12} className="col-wrapper">
                    <Button type="primary" onClick={() => showModal('add')} className="button-box">
                        Thêm giảng viên
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
                title={isEdit ? 'Cập nhật giảng viên' : 'Thêm giảng viên'}
                okText={isEdit ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
                onCancel={() => setIsOpenModal(false)}
                onOk={handleOK}>
                <Form layout="vertical">
                    <Form.Item label="Email:">
                        <Input value={selectedTeacher?.email} name="email" onChange={handleChangeInput} />
                    </Form.Item>
                    <Form.Item label="Tên giảng viên:">
                        <Input value={selectedTeacher?.name} name="name" onChange={handleChangeInput} />
                    </Form.Item>
                    <Form.Item label="Môn học:">
                        <Select
                            mode="multiple"
                            options={listCourse?.map((course) => ({
                                key: course._id,
                                value: course._id,
                                label: course.name,
                            }))}
                            style={{ width: '100%' }}
                            value={selectedTeacher.courses?.map((item) => item._id)}
                            onChange={(value) => {
                                const courses = listCourse.filter((course) => value.includes(course._id));
                                setSelectedTeacher({
                                    ...selectedTeacher,
                                    courseId: value,
                                    courses,
                                });
                            }}
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Spin>
    );
}
