import { Button, Form, Input, Modal, Popconfirm, Select, Spin, Table, Tag, Upload } from 'antd';
import Search from 'antd/es/input/Search';
import { useEffect, useMemo, useState } from 'react';
import removeDiacritics from 'remove-diacritics';
import { STORE } from '~/lib/constants';
import { showNotification } from '~/lib/utils';
import api from '~/lib/utils/api';
import { useAppStore } from '~/state';

export default function TeacherPage() {
    const [searchValue, setSearchValue] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState({ courses: [] });
    const [listTeachers, setListTeachers] = useState([]);
    const [listCourse, setListCourse] = useState([]);

    const [pagination, setPagination] = useState({
        current: STORE.current,
        pageSize: STORE.pageSize,
        onChange: (e) => setPagination({ ...pagination, current: e }),
    });

    const pageLoading = useAppStore((state) => state.loading);
    const setPageLoading = useAppStore((state) => state.setLoading);

    const getAllTeachers = async () => {
        setPageLoading(true);
        try {
            const res = await api.get('/teachers');
            setListTeachers(Array.isArray(res?.data) ? res.data : []);
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
            setListCourse(Array.isArray(res?.data) ? res.data : []);
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
            setListTeachers(Array.isArray(res?.data) ? res.data : []);
            showNotification('success', res.message);
            return true;
        } catch (error) {
            showNotification('error', `Failed to upload Excel file: ${error?.data?.message || error?.message}`);
            return false;
        } finally {
            setPageLoading(false);
        }
    };

    const showModal = (type, item) => {
        if (type === 'add') {
            setIsEdit(false);
            setSelectedTeacher({ courses: [] });
        } else {
            setIsEdit(true);
            setSelectedTeacher({
                ...item,
                courses: Array.isArray(item?.courses) ? [...item.courses] : [],
            });
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
        const courses = Array.isArray(selectedTeacher?.courses)
            ? selectedTeacher.courses.map((course) => course?._id || course).filter(Boolean)
            : [];
        const teacherPayload = { ...selectedTeacher, courses };

        setPageLoading(true);
        try {
            let res;
            if (isEdit) {
                res = await api.put(`/teachers/${selectedTeacher._id}`, teacherPayload);
                const updatedTeacher = res?.data ?? res;
                setListTeachers((prevList) =>
                    prevList.map((teacher) => (teacher._id === selectedTeacher._id ? { ...teacher, ...updatedTeacher } : teacher)),
                );
            } else {
                res = await api.post('/teachers', teacherPayload);
                if (res?.data) {
                    setListTeachers((prev) => [res.data, ...prev]);
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

    const filteredTeachers = useMemo(() => {
        const query = removeDiacritics(searchValue).toLowerCase();
        return (Array.isArray(listTeachers) ? listTeachers : []).filter((item) => {
            const code = removeDiacritics(item?.code || '').toLowerCase();
            const name = removeDiacritics(item?.name || '').toLowerCase();
            const email = removeDiacritics(item?.email || '').toLowerCase();
            return code.includes(query) || name.includes(query) || email.includes(query);
        });
    }, [listTeachers, searchValue]);

    const columns = [
        {
            title: 'Mã giảng viên',
            dataIndex: 'code',
            width: 160,
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
            width: 220,
            sorter: (a, b) => (a?.name || '').localeCompare(b?.name || ''),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            width: 110,
            render: (gender) => <Tag color={gender === 'Nữ' ? 'magenta' : 'blue'}>{gender || 'Chưa cập nhật'}</Tag>,
            sorter: (a, b) => (a?.gender || '').localeCompare(b?.gender || ''),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Môn học',
            dataIndex: 'courses',
            key: 'courses',
            render: (courses) => (
                <div className="teacher-courses-cell">
                    {Array.isArray(courses) && courses.length > 0
                        ? courses.map((course) => (
                              <Tag key={course._id || course.name} color="default">
                                  {course.name}
                              </Tag>
                          ))
                        : '-'}
                </div>
            ),
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
                                Bạn có chắc chắn muốn xóa giảng viên <strong>{item.name}</strong>?
                            </span>
                        }
                        onConfirm={() => handleDeleteTeacher(item)}
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
            <div className="admin-teacher-page">
                <div className="table-head">
                    <div>
                        <h3 className="table-title">Quản lý giảng viên</h3>
                        <p className="table-subtitle">Theo dõi giảng viên và danh sách môn học phụ trách.</p>
                    </div>
                    <div className="table-meta">
                        <Tag color="geekblue">Giảng viên: {filteredTeachers.length}</Tag>
                        <Tag color="cyan">Môn học: {listCourse.length}</Tag>
                    </div>
                </div>

                <div className="admin-teacher-toolbar">
                    <Search
                        value={searchValue}
                        placeholder="Tìm kiếm theo mã, tên hoặc email giảng viên"
                        onChange={(e) => setSearchValue(e.target.value)}
                        enterButton
                        allowClear
                        className="admin-teacher-search"
                    />
                    <div className="admin-teacher-toolbar-actions">
                        <Button type="primary" onClick={() => showModal('add')} className="button-box">
                            Thêm giảng viên
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
                    dataSource={filteredTeachers}
                    size="small"
                    pagination={pagination}
                    rowKey="_id"
                    scroll={{ x: 1100 }}
                />
            </div>

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
                            value={selectedTeacher.courses?.map((item) => item?._id || item)}
                            onChange={(value) => {
                                const courses = listCourse.filter((course) => value.includes(course._id));
                                setSelectedTeacher({
                                    ...selectedTeacher,
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
