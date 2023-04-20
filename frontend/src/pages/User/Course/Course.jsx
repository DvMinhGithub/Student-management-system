import { Checkbox, Col, Popconfirm, Row, Select, Spin, Table } from 'antd';
import Search from 'antd/es/input/Search';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import removeDiacritics from 'remove-diacritics';
import { STORE } from '~/contants';
import { accountState, appState, studentState } from '~/recoil/store';
import { showNotification } from '~/utils';
import api from '~/utils/api';
import './Course.scss';

export default function CoursePage() {
    const [searchValue, setSearchValue] = useState({ nameSemester: '', nameCourse: '' });

    const [checkbox, setCheckbox] = useState(false);

    const [pagination, setPagination] = useState({
        current: STORE.current,
        pageSize: STORE.pageSize,
        onChange: (e) => setPagination({ ...pagination, current: e }),
    });

    const [courses, setCourses] = useState([]);

    const [semesters, setSemesters] = useState([]);

    const studentId = useRecoilValue(studentState.id);

    const [accessToken, setAccessToken] = useRecoilState(accountState.accessToken);

    const [pageLoading, setPageLoading] = useRecoilState(appState.loading);

    const getCourses = async () => {
        try {
            setPageLoading(true);
            const res = await api.get('/courses', accessToken);
            setCourses(res);
        } catch (error) {
            if (error.status === 401) setAccessToken('');
            showNotification('error', error.data.message);
        } finally {
            setPageLoading(false);
        }
    };

    const getSemesters = async () => {
        try {
            setPageLoading(true);

            const res = await api.get('/semesters', accessToken);
            setSemesters(res.data);
            setPageLoading(false);
        } catch (error) {
            if (error.status === 401) setAccessToken('');
            showNotification('error', error.data.message);
            setPageLoading(false);
        }
    };

    useEffect(() => {
        document.title = 'Môn học';
        getSemesters();
        getCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkbox]);

    const handleRegisCourse = async (courseId) => {
        try {
            setPageLoading(true);
            const res = await api.put(`/students/register/${studentId}`, { courseId }, accessToken);
            showNotification('success', res.message);
        } catch (error) {
            showNotification('info', error.data.message);
        } finally {
            setPageLoading(false);
        }
    };

    const handleCancelRegisCourse = async (courseId) => {
        try {
            setPageLoading(true);
            const res = await api.put(`/students/cancelRegister/${studentId}`, { courseId }, accessToken);
            showNotification('success', res.message);
        } catch (error) {
            showNotification('info', error.data.message);
        } finally {
            setPageLoading(false);
        }
    };

    const handleDelete = (courseId) => {
        checkbox ? handleRegisCourse(courseId) : handleCancelRegisCourse(courseId);
        setCheckbox((pre) => !pre);
    };

    const columns = [
        {
            title: 'Đăng ký',
            dataIndex: 'operation',
            render: (_, record) => (
                <Popconfirm title="Bạn có muôn đăng ký học ?" onConfirm={() => handleDelete(record._id)}>
                    <Checkbox
                        checked={record.students.includes(studentId)}
                        onChange={(e) => {
                            setCheckbox(e.target.checked);
                        }}
                    />
                </Popconfirm>
            ),
            sorter: (a, b) => {
                if (a.students.includes(studentId) && !b.students.includes(studentId)) {
                    return -1;
                } else if (!a.students.includes(studentId) && b.students.includes(studentId)) {
                    return 1;
                } else {
                    return 0;
                }
            },
            defaultSortOrder: 'ascend',
            width: '10%',
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
        },
    ];

    const getDataSource = () => {
        return courses
            .filter((item) =>
                item.semesters?.some(
                    (semester) =>
                        removeDiacritics(semester.name)
                            ?.toLowerCase()
                            .indexOf(removeDiacritics(searchValue?.nameSemester).toLowerCase()) >= 0,
                ),
            )
            .filter(
                (item) =>
                    removeDiacritics(item.name)
                        ?.toLowerCase()
                        .indexOf(removeDiacritics(searchValue?.nameCourse).toLowerCase()) >= 0,
            );
    };

    return (
        <Spin spinning={pageLoading}>
            <Row className="row-wrapper">
                <Col span={12}>
                    <Select
                        showSearch
                        allowClear
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
                        placeholder="Chọn học kỳ"
                        className="select-semester"
                    />
                    <Search
                        allowClear
                        placeholder="Tìm kiếm theo tên môn học"
                        // onSearch={handleSearch}
                        onChange={(e) => setSearchValue(e.target.value)}
                        enterButton
                        className="search-course"
                    />
                </Col>
            </Row>
            <Table columns={columns} dataSource={getDataSource()} size="small" pagination={pagination} rowKey="_id" />
        </Spin>
    );
}
