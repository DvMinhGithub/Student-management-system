import { Button, Col, DatePicker, Form, Input, Row, Select, Spin } from 'antd';
import dayjs from 'dayjs';
import jwtDecodeb from 'jwt-decode';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { accountState, appState, studentState } from '~/recoil/store';
import { showNotification } from '~/utils';
import api from '~/utils/api';
import './Home.scss';

export default function HomePage() {
    const [userInfo, setUserInfo] = useState({});
    const [avatar, setAvatar] = useState({});
    const [previewImg, setPreviewImg] = useState();
    const setStudentName = useSetRecoilState(studentState.name);
    const setStudentAvatar = useSetRecoilState(studentState.avatar);
    const [pageLoading, setPageLoading] = useRecoilState(appState.loading);
    const [accessToken, setAccessToken] = useRecoilState(accountState.accessToken);

    const getStudentInfo = useCallback(async () => {
        let { role, userId } = jwtDecodeb(accessToken);
        setPageLoading(true);
        try {
            const { data } = await api.get(`/${role}s/detail/${userId}`, accessToken);
            setUserInfo(data);
            setStudentName(data.name);
        } catch (error) {
            if (error.status === 401) setAccessToken('');
            if (error.status === 401) setAccessToken('');
            showNotification('error', error.data.message);
        } finally {
            setPageLoading(false);
        }
    }, [accessToken, setPageLoading, setStudentName, setAccessToken]);

    useEffect(() => {
        document.title = 'Trang chủ';
        getStudentInfo();
    }, [getStudentInfo]);

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
        let { role } = jwtDecodeb(accessToken);

        setPageLoading(true);
        const data = new FormData();
        if (avatar) {
            data.append('avatar', avatar);
        }

        const updatedUserInfo = { ...userInfo };
        delete updatedUserInfo.courses;
        Object.entries(updatedUserInfo).forEach(([key, value]) => {
            data.append(key, value);
        });

        try {
            const res = await api.put(`/${role}s/${userInfo._id}`, data, accessToken);
            setStudentName(res.data.name);
            setStudentAvatar(res.data.avatar);
            showNotification('success', res.message);
        } catch (error) {
            if (error.status === 401) setAccessToken('');
            showNotification('error', error.data.message);
        } finally {
            setPageLoading(false);
        }
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
                                        // format="DD-MM-YYYY"
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
