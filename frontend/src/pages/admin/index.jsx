import {
    AppstoreOutlined,
    BookOutlined,
    CalendarOutlined,
    IdcardOutlined,
    SolutionOutlined,
    UserOutlined,
} from '@ant-design/icons';

import PageLayout from '~/components/layout/PageLayout';
import HomePage from '../home';
import AccountPage from './account';
import CoursePage from './course';
import SemesterPage from './semester';
import StudentPage from './student';
import TeacherPage from './teacher';

export default function AdminPage() {
    const menuItems = [
        { key: '/', label: 'Trang chủ', content: <HomePage />, icon: <AppstoreOutlined /> },
        { key: '/user', label: 'Tài khoản', content: <AccountPage />, icon: <UserOutlined /> },
        { key: '/student', label: 'Sinh viên', content: <StudentPage />, icon: <SolutionOutlined /> },
        { key: '/teacher', label: 'Giảng viên', content: <TeacherPage />, icon: <IdcardOutlined /> },
        { key: '/course', label: 'Môn học', content: <CoursePage />, icon: <BookOutlined /> },
        { key: '/semester', label: 'Học kỳ', content: <SemesterPage />, icon: <CalendarOutlined /> },
    ];
    return <PageLayout menuItems={menuItems} />;
}
