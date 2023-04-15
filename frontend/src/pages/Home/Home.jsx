import { Button, Col, DatePicker, Form, Input, Row, Select, Spin } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { pageLoadingState } from '~/recoil/store/app';
import { studentAvatarState, studentIdState, studentNameState } from '~/recoil/store/student';
import { showNotification } from '~/utils';
import callApi from '~/utils/api';
import './Home.scss';

export default function HomePage() {
    const [userInfo, setUserInfo] = useState({});

    const [previewImg, setPreviewImg] = useState();

    const [avatar, setAvatar] = useState(null);

    const studentId = useRecoilValue(studentIdState);

    const setStudentName = useSetRecoilState(studentNameState);

    const setStudentAvatar = useSetRecoilState(studentAvatarState);

    const [pageLoading, setPageLoading] = useRecoilState(pageLoadingState);

    const getStudentInfo = async () => {
        setPageLoading(true);
        try {
            const res = await callApi({ method: 'GET', url: `/students/${studentId}` });
            setUserInfo(res.data);
            setStudentName(res.data.name);
        } catch (error) {
            showNotification('error', error.message);
        } finally {
            setPageLoading(false);
        }
    };
    useEffect(() => {
        document.title = 'Trang chủ'
        getStudentInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChangeInput = (e) => {
        const { name, value } = e.target;
        setUserInfo((preStudent) => ({
            ...preStudent,
            [name]: value,
        }));
    };

    const hanldeUpdate = async () => {
        setPageLoading(true);
        try {
            const data = new FormData();
            if (avatar) {
                data.append('avatar', avatar);
            }
            const { courses, ...updatedUserInfo } = userInfo;
            Object.keys(updatedUserInfo).forEach((key) => {
                data.append(key, updatedUserInfo[key]);
            });
            const res = await callApi({ method: 'PUT', url: `/students/${userInfo._id}`, data });
            setStudentName(res.data.name);
            setStudentAvatar(res.data.avatar);
            showNotification('success', res.message);
        } catch (error) {
            showNotification('error', error.message);
        } finally {
            setPageLoading(false);
        }
    };

    const handlePreview = (file) => {
        setAvatar(file);
        setPreviewImg(URL.createObjectURL(file));
    };

    return (
        <Spin spinning={pageLoading}>
            <Row>
                <Col xs={12} sm={6} md={6}>
                    <div className="avatar-container">
                        <input
                            className="avatar-input"
                            type="file"
                            onChange={(e) => handlePreview(e.target.files[0])}
                            accept="image/*"
                        />
                        <img src={previewImg ? previewImg : userInfo.avatar} alt="User avatar" className="avatar-img" />
                    </div>
                </Col>
                <Col xs={12} sm={18} md={18}>
                    <Form layout="vertical">
                        <Row gutter={32}>
                            <Col span={8}>
                                <Form.Item label="Mã sinh viên:">
                                    <Input value={userInfo?.code} name="code" onChange={handleChangeInput} disabled />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Họ và tên:">
                                    <Input value={userInfo?.name} name="name" onChange={handleChangeInput} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Email:">
                                    <Input value={userInfo?.email} name="email" onChange={handleChangeInput} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={32}>
                            <Col span={8}>
                                <Form.Item label="Giới tính:">
                                    <Select
                                        value={userInfo?.gender}
                                        options={[
                                            { value: 'Nam', label: 'Nam' },
                                            { value: 'Nữ', label: 'Nữ' },
                                        ]}
                                        onChange={(value) => setUserInfo({ ...userInfo, gender: value })}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Phone:">
                                    <Input value={userInfo?.phone} name="phone" onChange={handleChangeInput} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Địa chỉ hiện tại:">
                                    <Input value={userInfo?.address} name="address" onChange={handleChangeInput} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={32}>
                            <Col span={8}>
                                <Form.Item label="Ngày sinh:">
                                    <DatePicker
                                        placeholder="Ngày sinh"
                                        style={{ width: '100%' }}
                                        format='DD-MM-YYYY'
                                        name="dateOfBirth"
                                        value={dayjs(userInfo?.dateOfBirth)}
                                        onChange={(_, dateString) => {
                                            setUserInfo({ ...userInfo, dateOfBirth: dateString });
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Nơi sinh:">
                                    <Input
                                        value={userInfo?.placeOfBirth}
                                        name="placeOfBirth"
                                        onChange={handleChangeInput}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item>
                            <Button type="primary" onClick={hanldeUpdate}>
                                Cập nhật
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </Spin>
    );
}
