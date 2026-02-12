import HomePage from '../home';
import CoursePage from './course';
import PageLayout from '~/components/layout/PageLayout';

export default function UserPage() {
    const menuItems = [
        { key: '/', label: 'Trang chủ', content: <HomePage /> },
        { key: 'course', label: 'Môn học', content: <CoursePage /> },
    ];
    return <PageLayout menuItems={menuItems} />;
}
