/* eslint-disable jsx-a11y/anchor-is-valid */
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
    Button,
    Col,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Spin,
    Table,
    Upload,
} from 'antd';
import Search from 'antd/es/input/Search';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import removeDiacritics from 'remove-diacritics';
import { STORE } from '~/contants';
import { pageLoadingState } from '~/recoil/store/app';
import { showNotification } from '~/utils';
import callApi from '~/utils/api';
import './Course.scss';

export default function CoursePage() {
    const [searchValue, setSearchValue] = useState({ nameCourse: '', nameSemester: '' });

    const [isEdit, setIsEdit] = useState(false);

    const [isOpenModal, setIsOpenModal] = useState(false);

    const [pagination, setPagination] = useState({
        current: STORE.current,
        pageSize: STORE.pageSize,
        onChange: (e) => setPagination({ ...pagination, current: e }),
    });

    const [selectedCourse, setSelectedCourse] = useState({});

    const [courses, setCourses] = useState([]);

    const [semesters, setSemesters] = useState([]);

    const [pageLoading, setPageLoading] = useRecoilState(pageLoadingState);

    const getCourses = async () => {
        setPageLoading(true);
        try {
            const res = await callApi({ method: 'get', url: '/courses' });
            setCourses(res.data);
            setPageLoading(false);
        } catch (error) {
            showNotification('error', error.message);
            setPageLoading(false);
        }
    };

    const getSemesters = async () => {
        try {
            setPageLoading(true);

            const res = await callApi({ method: 'get', url: '/semesters' });
            setSemesters(res.data);
            setPageLoading(false);
        } catch (error) {
            showNotification('error', error.message);
            setPageLoading(false);
        }
    };
    useEffect(() => {
        getCourses();
        getSemesters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showModalUpSert = (type, item) => {
        if (type === 'add') {
            setIsEdit(false);
            setSelectedCourse({});
        } else {
            setIsEdit(true);
            setSelectedCourse(item);
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
            if (isEdit) {
                // if id is passed in, it means update course
                selectedCourse.semesters = selectedCourse.semesters.map((semester) => semester._id);
                res = await callApi({ method: 'put', url: `/courses/${selectedCourse._id}`, data: selectedCourse });

                setCourses((prevCourses) => {
                    const index = prevCourses.findIndex((course) => course._id === selectedCourse._id);
                    prevCourses[index] = { ...prevCourses[index], ...res.data };
                    return prevCourses;
                });
            } else {
                res = await callApi({ method: 'post', url: '/courses', data: selectedCourse });

                setCourses([...courses, ...res.data]);
            }

            showNotification('success', res.message);
            setIsOpenModal(false);
        } catch (error) {
            showNotification('error', error.message);
        } finally {
            setPageLoading(false);
        }
    };

    const handleDelete = async (idDelete) => {
        setPageLoading(true);
        try {
            const res = await callApi({ method: 'delete', url: `/courses/${idDelete}` });
            setCourses((prevCourses) => prevCourses.filter((course) => course._id !== idDelete));
            showNotification('success', res.message);
        } catch (error) {
            showNotification('error', error.message);
        } finally {
            setPageLoading(false);
        }
    };

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
            sorter: (a, b) => a.credits.localeCompare(b.credits),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Học kỳ',
            dataIndex: ['semesters'],
            render: (semesters) => (
                <span>
                    {semesters.map((semester) => (
                        <span key={semester._id}>
                            {semester.name}
                            <br />
                        </span>
                    ))}
                </span>
            ),
            sorter: (a, b) => a.semester.localeCompare(b.semester),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            render: (_, item) => (
                <Space size="middle">
                    <a style={{ color: 'blue' }} onClick={() => showModalUpSert('edit', item)}>
                        <EditOutlined />
                    </a>
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
                        <a style={{ color: 'red' }}>
                            <DeleteOutlined />
                        </a>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const getDataSource = () => {
        return courses
            .filter((item) =>
                item.semesters.length > 0
                    ? item.semesters?.some(
                          (semester) =>
                              removeDiacritics(semester.name)
                                  ?.toLowerCase()
                                  .indexOf(removeDiacritics(searchValue?.nameSemester).toLowerCase()) >= 0,
                      )
                    : true,
            )
            .filter(
                (item) =>
                    removeDiacritics(item?.name)
                        ?.toLowerCase()
                        .indexOf(removeDiacritics(searchValue?.nameCourse).toLowerCase()) >= 0,
            );
    };

    const handleUploadExcel = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        setPageLoading(true);
        try {
            const res = await callApi({ method: 'post', url: `courses/uploadExcel`, data: formData });
            setCourses([...courses, ...res.data]);
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
                <Col span={14}>
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
                        onChange={(e) => setSearchValue({ ...searchValue, nameCourse: e.target.value })}
                        className="search-course"
                        enterButton
                    />
                </Col>
                <Col span={10} className="col-wrapper">
                    <Button type="primary" onClick={() => showModalUpSert('add')}>
                        Thêm môn học
                    </Button>
                    <Upload
                        showUploadList={false}
                        accept=".xls, .xlsx"
                        customRequest={({ file }) => {
                            handleUploadExcel(file);
                        }}>
                        <Button type="primary" style={{ marginLeft: '10px' }}>
                            Nhập Excel
                        </Button>
                    </Upload>
                </Col>
            </Row>

            <Table columns={columns} dataSource={getDataSource()} size="small" pagination={pagination} rowKey="_id" />

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
                                    value={selectedCourse.semesters?.map((item) => item._id)}
                                    options={semesters?.map((semester) => ({
                                        key: semester._id,
                                        value: semester._id,
                                        label: semester.name,
                                    }))}
                                    style={{ width: '100%' }}
                                    onChange={(key) => {
                                        const semester = semesters.filter((s) => {
                                            return key.includes(s._id);
                                        });
                                        setSelectedCourse({
                                            ...selectedCourse,
                                            semesters: semester,
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
