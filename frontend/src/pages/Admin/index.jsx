import {
    AppstoreOutlined,
    BookOutlined,
    CalendarOutlined,
    IdcardOutlined,
    SolutionOutlined,
    UserOutlined,
} from '@ant-design/icons';

import PageLayout from '~/components/layout';
import HomePage from '../Home';
import AccountPage from './Account';
import CoursePage from './Course';
import SemesterPage from './Semester';
import StudentPage from './Student';
import TeacherPage from './Teacher';

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
