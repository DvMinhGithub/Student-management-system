/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Col, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Spin, Table, Tag, Upload } from 'antd';
import Search from 'antd/es/input/Search';
import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '~/state';
import removeDiacritics from 'remove-diacritics';
import { STORE } from '~/lib/constants';
import { showNotification } from '~/lib/utils';
import api from '~/lib/utils/api';

export default function CoursePage() {
    const [searchValue, setSearchValue] = useState({ nameCourse: '', nameSemester: '' });

    const [isEdit, setIsEdit] = useState(false);

    const [isOpenModal, setIsOpenModal] = useState(false);

    const [pagination, setPagination] = useState({
        current: STORE.current,
        pageSize: STORE.pageSize,
        onChange: (e) => setPagination({ ...pagination, current: e }),
    });

    const [selectedCourse, setSelectedCourse] = useState({ semesters: [] });

    const [courses, setCourses] = useState([]);

    const [semesters, setSemesters] = useState([]);

    const pageLoading = useAppStore((state) => state.loading);
    const setPageLoading = useAppStore((state) => state.setLoading);

    const getCourses = async () => {
        setPageLoading(true);
        try {
            const res = await api.get('/courses');
            setCourses(Array.isArray(res?.data) ? res.data : []);
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };

    const getSemesters = async () => {
        try {
            setPageLoading(true);
            const res = await api.get('/semesters');
            setSemesters(Array.isArray(res?.data) ? res.data : []);
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };
    useEffect(() => {
        document.title = 'Môn học';
        getCourses();
        getSemesters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showModalUpSert = (type, item) => {
        if (type === 'add') {
            setIsEdit(false);
            setSelectedCourse({ semesters: [] });
        } else {
            setIsEdit(true);
            setSelectedCourse({
                ...item,
                semesters: Array.isArray(item?.semesters) ? [...item.semesters] : [],
            });
        }
        setIsOpenModal(true);
    };

    const handleChangeInput = (e) => {
        const { name, value } = e.target;
        setSelectedCourse((preCourse) => ({
            ...preCourse,
            [name]: value,
        }));
    };

    const handleOk = async () => {
        setPageLoading(true);
        try {
            let res;
            const normalizedSemesters = Array.isArray(selectedCourse?.semesters)
                ? selectedCourse.semesters.map((semester) => semester?._id || semester).filter(Boolean)
                : [];
            const payload = {
                ...selectedCourse,
                semesters: normalizedSemesters,
            };

            if (isEdit) {
                res = await api.put(`/courses/${selectedCourse._id}`, payload);
                setCourses((prevCourses) => {
                    return prevCourses.map((course) => (course._id === selectedCourse._id ? (res?.data ?? course) : course));
                });
            } else {
                res = await api.post('/courses', payload);
                if (res?.data) {
                    setCourses((prevCourses) => [res.data, ...prevCourses]);
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

    const handleDelete = async (idDelete) => {
        setPageLoading(true);
        try {
            const res = await api.delete(`/courses/${idDelete}`);
            setCourses((prevCourses) => prevCourses.filter((course) => course._id !== idDelete));
            showNotification('success', res.message);
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };

    const normalizedCourses = Array.isArray(courses) ? courses : [];

    const columns = [
        {
            title: 'Mã môn học',
            dataIndex: 'code',
            sorter: (a, b) => a.code.localeCompare(b.code),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Tên môn học',
            dataIndex: 'name',
            width: '30%',
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Số tín chỉ',
            dataIndex: 'credits',
            width: '10%',
            sorter: (a, b) => Number(a.credits || 0) - Number(b.credits || 0),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Học kỳ',
            dataIndex: ['semesters'],
            render: (courseSemesters) => (
                <div className="course-semesters-cell">
                    {Array.isArray(courseSemesters) && courseSemesters.length > 0
                        ? courseSemesters.map((semester) => (
                              <Tag key={semester._id || semester.name} color="default">
                                  {semester.name}
                              </Tag>
                          ))
                        : '-'}
                </div>
            ),
            sorter: (a, b) => (a.semesters?.length || 0) - (b.semesters?.length || 0),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            render: (_, item) => (
                <div className="admin-course-actions-cell">
                    <Button size="small" className="admin-course-edit-btn" onClick={() => showModalUpSert('edit', item)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title={
                            <span>
                                Bạn có chắc chắn muốn xóa môn học <strong>{item.name}</strong>?
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
            width: 150,
        },
    ];

    const dataSource = useMemo(() => {
        return normalizedCourses
            .filter((item) =>
                searchValue?.nameSemester
                    ? item.semesters?.some(
                          (semester) =>
                              removeDiacritics(semester?.name || '')
                                  ?.toLowerCase()
                                  .indexOf(removeDiacritics(searchValue?.nameSemester).toLowerCase()) >= 0,
                      )
                    : true,
            )
            .filter(
                (item) =>
                    removeDiacritics(item?.name || '')
                        ?.toLowerCase()
                        .indexOf(removeDiacritics(searchValue?.nameCourse).toLowerCase()) >= 0,
            );
    }, [normalizedCourses, searchValue]);

    const handleUploadExcel = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        setPageLoading(true);
        try {
            const res = await api.post(`/courses/uploadExcel`, formData);
            const uploadedList = Array.isArray(res?.data) ? res.data : [];
            setCourses(uploadedList);
            showNotification('success', res.message);
            return true;
        } catch (error) {
            showNotification('error', error);
            return false;
        } finally {
            setPageLoading(false);
        }
    };

    const clearFilters = () => setSearchValue({ nameCourse: '', nameSemester: '' });

    return (
        <Spin spinning={pageLoading}>
            <div className="admin-course-page">
                <div className="table-head">
                    <div>
                        <h3 className="table-title">Quản lý môn học</h3>
                        <p className="table-subtitle">Quản lý danh sách môn học, học kỳ và import dữ liệu từ Excel.</p>
                    </div>
                    <div className="table-meta">
                        <Tag color="blue">Môn học: {normalizedCourses.length}</Tag>
                        <Tag color="purple">Học kỳ: {semesters.length}</Tag>
                    </div>
                </div>

                <div className="admin-course-toolbar">
                    <div className="admin-course-filters">
                        <Select
                            showSearch
                            allowClear
                            value={searchValue.nameSemester || undefined}
                            options={semesters?.map((semester) => ({
                                key: semester._id,
                                value: semester.name,
                                label: semester.name,
                            }))}
                            onChange={(value) =>
                                setSearchValue({ ...searchValue, nameSemester: value !== undefined ? value : '' })
                            }
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            placeholder="Lọc theo học kỳ"
                            className="admin-course-filter-semester"
                        />
                        <Search
                            allowClear
                            value={searchValue.nameCourse}
                            placeholder="Tìm kiếm theo tên môn học"
                            onChange={(e) => setSearchValue({ ...searchValue, nameCourse: e.target.value })}
                            className="admin-course-filter-search"
                            enterButton
                        />
                    </div>

                    <div className="admin-course-toolbar-actions">
                        <Button onClick={clearFilters}>Xóa lọc</Button>
                        <Button type="primary" onClick={() => showModalUpSert('add')}>
                            Thêm môn học
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
                    dataSource={dataSource}
                    size="small"
                    pagination={pagination}
                    rowKey="_id"
                    scroll={{ x: 980 }}
                />
            </div>

            <Modal
                open={isOpenModal}
                title={isEdit ? 'Cập nhật môn học' : 'Thêm môn học'}
                okText={isEdit ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
                onCancel={() => setIsOpenModal(false)}
                onOk={handleOk}>
                <Form layout="vertical">
                    <Form.Item label="Mã môn học:">
                        <Input value={selectedCourse?.code} name="code" onChange={handleChangeInput} />
                    </Form.Item>
                    <Form.Item label="Tên môn học:">
                        <Input value={selectedCourse?.name} name="name" onChange={handleChangeInput} />
                    </Form.Item>
                    <Row gutter={32}>
                        <Col span={12}>
                            <Form.Item label="Số tín chỉ:">
                                <InputNumber
                                    style={{ width: '100%' }}
                                    value={selectedCourse?.credits}
                                    name="credits"
                                    onChange={(value) => setSelectedCourse({ ...selectedCourse, credits: value })}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Chọn học kỳ:">
                                <Select
                                    showSearch
                                    allowClear
                                    mode="multiple"
                                    value={selectedCourse.semesters?.map((item) => item?._id || item)}
                                    options={semesters?.map((semester) => ({
                                        key: semester._id,
                                        value: semester._id,
                                        label: semester.name,
                                    }))}
                                    style={{ width: '100%' }}
                                    onChange={(key) => {
                                        const selectedSemesters = semesters.filter((s) => {
                                            return key.includes(s._id);
                                        });
                                        setSelectedCourse({
                                            ...selectedCourse,
                                            semesters: selectedSemesters,
                                        });
                                    }}
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    placeholder="Chọn học kỳ"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </Spin>
    );
}
