import { Button, Col, DatePicker, Form, Input, Row, Select, Spin } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useAppStore } from '~/state';
import { showNotification } from '~/lib/utils';
import api from '~/lib/utils/api';
import { getAccessTokenPayload } from '~/lib/utils/cookies';

export default function HomePage() {
    const [userInfo, setUserInfo] = useState({});
    const [avatar, setAvatar] = useState({});
    const [previewImg, setPreviewImg] = useState();

    const setStudentName = useAppStore((state) => state.setStudentName);
    const setStudentAvatar = useAppStore((state) => state.setStudentAvatar);
    const pageLoading = useAppStore((state) => state.loading);
    const setPageLoading = useAppStore((state) => state.setLoading);

    const getMyProfile = async () => {
        setPageLoading(true);
        try {
            const res = await api.get('/auth/me/profile');
            const data = res?.data ?? res ?? {};
            setUserInfo(typeof data === 'object' && data !== null ? data : {});
            setStudentName(data?.name);
            setStudentAvatar(data?.avatar);
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    };

    useEffect(() => {
        document.title = 'Trang chủ';
        getMyProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChangeInput = useCallback((e) => {
        const { name, value } = e.target;
        setUserInfo((prevUserInfo) => ({
            ...prevUserInfo,
            [name]: value,
        }));
    }, []);

    const handlePreview = useCallback((file) => {
        setAvatar(file);
        setPreviewImg(URL.createObjectURL(file));
    }, []);

    const hanldeUpdate = async () => {
        const tokenPayload = getAccessTokenPayload() || {};
        const role = userInfo?.role || tokenPayload?.role;
        const userId = userInfo?._id || userInfo?.userId || tokenPayload?.userId;
        if (!role || !userId) {
            showNotification('error', 'Không xác định được thông tin người dùng');
            return;
        }

        setPageLoading(true);
        const data = new FormData();
        if (avatar instanceof File) {
            data.append('avatar', avatar);
        }

        const updatedUserInfo = { ...userInfo };
        delete updatedUserInfo.courses;
        delete updatedUserInfo.accountId;
        delete updatedUserInfo.userId;
        delete updatedUserInfo.role;
        Object.entries(updatedUserInfo).forEach(([key, value]) => {
            if (value !== undefined && value !== null) data.append(key, value);
        });

        try {
            const res = await api.put(`/${role}s/${userId}`, data);
            const updated = res?.data ?? res ?? {};
            setStudentName(updated?.name);
            setStudentAvatar(updated?.avatar);
            setUserInfo((prev) => ({ ...prev, ...updated }));
            showNotification('success', res.message);
        } catch (error) {
            showNotification('error', error);
        } finally {
            setPageLoading(false);
        }
    };

    return (
        <Spin spinning={pageLoading}>
            <Row className="profile-grid" gutter={[32, 24]}>
                <Col xs={24} sm={8} md={7}>
                    <div className="profile-card profile-card--avatar">
                        <div className="avatar-container">
                            <div className="avatar-frame">
                                <input
                                    className="avatar-input"
                                    type="file"
                                    onChange={(e) => handlePreview(e.target.files[0])}
                                    accept="image/*"
                                />
                                <img
                                    src={previewImg ? previewImg : userInfo?.avatar}
                                    alt="User avatar"
                                    className="avatar-img"
                                />
                            </div>
                            <span className="avatar-label">Cập nhật ảnh đại diện</span>
                        </div>
                    </div>
                </Col>
                <Col xs={24} sm={16} md={17}>
                    <div className="profile-card">
                        <div className="profile-head">
                            <span className="profile-kicker">Hồ sơ</span>
                            <h3>Thông tin cá nhân</h3>
                            <p>Chỉnh sửa thông tin để cập nhật hồ sơ sinh viên.</p>
                        </div>
                        <Form layout="vertical" className="profile-form">
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item label="Mã sinh viên:">
                                        <Input value={userInfo?.code} name="code" onChange={handleChangeInput} disabled />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item label="Họ và tên:">
                                        <Input value={userInfo?.name} name="name" onChange={handleChangeInput} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item label="Email:">
                                        <Input value={userInfo?.email} name="email" onChange={handleChangeInput} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12} md={8}>
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
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item label="Phone:">
                                        <Input value={userInfo?.phone} name="phone" onChange={handleChangeInput} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item label="Địa chỉ hiện tại:">
                                        <Input value={userInfo?.address} name="address" onChange={handleChangeInput} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item label="Ngày sinh:">
                                        <DatePicker
                                            placeholder="Ngày sinh"
                                            style={{ width: '100%' }}
                                            // format="DD-MM-YYYY"
                                            name="dateOfBirth"
                                            value={userInfo?.dateOfBirth ? dayjs(userInfo.dateOfBirth) : null}
                                            onChange={(_, dateString) => {
                                                setUserInfo({ ...userInfo, dateOfBirth: dateString });
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
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
                                <Button type="primary" onClick={hanldeUpdate} block className="profile-save-btn">
                                    Cập nhật
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Spin>
    );
}
