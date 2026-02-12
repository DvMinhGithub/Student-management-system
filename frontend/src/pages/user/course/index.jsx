import { Button, Popconfirm, Select, Spin, Table, Tag } from 'antd';
import Search from 'antd/es/input/Search';
import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '~/state';
import removeDiacritics from 'remove-diacritics';
import { STORE } from '~/lib/constants';
import { showNotification } from '~/lib/utils';
import api from '~/lib/utils/api';
import { getAccessTokenPayload } from '~/lib/utils/cookies';

export default function CoursePage() {
    const [searchValue, setSearchValue] = useState({ nameSemester: '', nameCourse: '' });
    const [reloadKey, setReloadKey] = useState(0);

    const [pagination, setPagination] = useState({
        current: STORE.current,
        pageSize: STORE.pageSize,
        onChange: (e) => setPagination({ ...pagination, current: e }),
    });

    const [courses, setCourses] = useState([]);

    const [semesters, setSemesters] = useState([]);

    const studentId = getAccessTokenPayload()?.userId || '';
    const pageLoading = useAppStore((state) => state.loading);
    const setPageLoading = useAppStore((state) => state.setLoading);

    const getCourses = async () => {
        try {
            setPageLoading(true);
            const res = await api.get('/courses');
            const courseList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
            setCourses(courseList);
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
            setPageLoading(false);
        } catch (error) {
            showNotification('error', error);
            setPageLoading(false);
        }
    };

    useEffect(() => {
        document.title = 'Môn học';
        getSemesters();
        getCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reloadKey]);

    const handleRegisCourse = async (courseId) => {
        if (!studentId) {
            showNotification('error', 'Không xác định được tài khoản sinh viên');
            return;
        }
        try {
            setPageLoading(true);
            const res = await api.put(`/students/register/${studentId}`, { courseId });
            showNotification('success', res.message);
        } catch (error) {
            const message = error?.data?.message || error?.response?.data?.message || error?.message;
            showNotification('info', message || 'Đăng ký môn học thất bại');
        } finally {
            setPageLoading(false);
        }
    };

    const handleCancelRegisCourse = async (courseId) => {
        if (!studentId) {
            showNotification('error', 'Không xác định được tài khoản sinh viên');
            return;
        }
        try {
            setPageLoading(true);
            const res = await api.put(`/students/cancelRegister/${studentId}`, { courseId });
            showNotification('success', res.message);
        } catch (error) {
            const message = error?.data?.message || error?.response?.data?.message || error?.message;
            showNotification('info', message || 'Hủy đăng ký môn học thất bại');
        } finally {
            setPageLoading(false);
        }
    };

    const isRegistered = (course) => Array.isArray(course?.students) && course.students.includes(studentId);

    const handleToggleCourse = async (course) => {
        if (!course?._id) return;
        if (isRegistered(course)) {
            await handleCancelRegisCourse(course._id);
        } else {
            await handleRegisCourse(course._id);
        }
        setReloadKey((prev) => prev + 1);
    };

    const normalizedCourses = Array.isArray(courses) ? courses : [];

    const columns = [
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (_, record) =>
                isRegistered(record) ? <Tag color="success">Đã đăng ký</Tag> : <Tag color="default">Chưa đăng ký</Tag>,
            sorter: (a, b) => Number(isRegistered(b)) - Number(isRegistered(a)),
            width: 140,
        },
        {
            title: 'Thao tác',
            dataIndex: 'operation',
            render: (_, record) => (
                <Popconfirm
                    title={isRegistered(record) ? 'Bạn có muốn hủy đăng ký môn học này?' : 'Bạn có muốn đăng ký môn học này?'}
                    onConfirm={() => handleToggleCourse(record)}
                    okText="Xác nhận"
                    cancelText="Hủy">
                    <Button size="small" className={`course-action-btn ${isRegistered(record) ? 'is-registered' : ''}`}>
                        {isRegistered(record) ? 'Hủy đăng ký' : 'Đăng ký'}
                    </Button>
                </Popconfirm>
            ),
            width: 140,
        },
        {
            title: 'Mã môn học',
            dataIndex: 'code',
            sorter: (a, b) => a.code.localeCompare(b.code),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Tên môn học',
            dataIndex: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Số tín chỉ',
            dataIndex: 'credits',
            sorter: (a, b) => a.credits - b.credits,
            width: 110,
        },
        {
            title: 'Học kỳ',
            dataIndex: 'semesters',
            render: (semesters) =>
                Array.isArray(semesters) && semesters.length > 0
                    ? semesters.map((item) => item?.name).filter(Boolean).join(', ')
                    : '-',
        },
    ];

    const dataSource = useMemo(() => {
        return normalizedCourses
            .filter((item) =>
                !searchValue?.nameSemester
                    ? true
                    : item.semesters?.some(
                          (semester) =>
                              removeDiacritics(semester?.name || '')
                                  ?.toLowerCase()
                                  .indexOf(removeDiacritics(searchValue?.nameSemester).toLowerCase()) >= 0,
                      ),
            )
            .filter((item) =>
                removeDiacritics(item?.name || '')
                    ?.toLowerCase()
                    .indexOf(removeDiacritics(searchValue?.nameCourse).toLowerCase()) >= 0,
            );
    }, [normalizedCourses, searchValue]);

    const registeredCount = useMemo(
        () => normalizedCourses.filter((course) => isRegistered(course)).length,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [normalizedCourses, studentId],
    );

    const clearFilters = () => setSearchValue({ nameSemester: '', nameCourse: '' });

    return (
        <Spin spinning={pageLoading}>
            <div className="course-page">
                <div className="table-head">
                    <div>
                        <h3 className="table-title">Đăng ký môn học</h3>
                        <p className="table-subtitle">Chọn học kỳ và tìm kiếm môn học phù hợp để đăng ký nhanh hơn.</p>
                    </div>
                    <div className="table-meta">
                        <Tag color="blue">Tổng môn: {normalizedCourses.length}</Tag>
                        <Tag color="green">Đã đăng ký: {registeredCount}</Tag>
                    </div>
                </div>

                <div className="course-filters">
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
                        className="course-filter-semester"
                    />
                    <Search
                        allowClear
                        value={searchValue.nameCourse}
                        placeholder="Tìm kiếm theo tên môn học"
                        onChange={(e) => setSearchValue({ ...searchValue, nameCourse: e.target.value })}
                        enterButton
                        className="course-filter-search"
                    />
                    <Button onClick={clearFilters} className="course-filter-clear">
                        Xóa lọc
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={dataSource}
                    size="small"
                    pagination={pagination}
                    rowKey="_id"
                    scroll={{ x: 900 }}
                />
            </div>
        </Spin>
    );
}
