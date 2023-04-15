import React from 'react';
import HomePage from '../Home/Home';
import CoursePage from './Course';
import PageLayout from '~/components/Layout/LayoutPage';

export default function UserPage() {
    const menuItems = [
        { key: '/', label: 'Trang chủ', content: <HomePage /> },
        { key: 'course', label: 'Môn học', content: <CoursePage /> },
    ];
    return <PageLayout menuItems={menuItems} />;
}
