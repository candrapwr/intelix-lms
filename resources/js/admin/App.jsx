import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CourseListPage from './pages/CourseListPage';
import CourseSectionsPage from './pages/CourseSectionsPage';
import CourseClassificationPage from './pages/CourseClassificationPage';
import StudentListPage from './pages/StudentListPage';
import InstructorListPage from './pages/InstructorListPage';
import UnitListPage from './pages/UnitListPage';
import SubUnitListPage from './pages/SubUnitListPage';
import NotFoundPage from './pages/NotFoundPage';
import StudentHomePage from './pages/student/StudentHomePage';
import StudentCoursesPage from './pages/student/StudentCoursesPage';
import StudentProgressPage from './pages/student/StudentProgressPage';
import InstructorHomePage from './pages/instructor/InstructorHomePage';
import InstructorCoursesPage from './pages/instructor/InstructorCoursesPage';
import InstructorStudentsPage from './pages/instructor/InstructorStudentsPage';
import StudentLayout from './components/StudentLayout';
import InstructorLayout from './components/InstructorLayout';

export default function App() {
    return (
        <Routes>
            <Route path="login" element={<LoginPage />} />

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/" element={<AdminLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="courses" element={<CourseListPage />} />
                    <Route path="courses/:slug/sections" element={<CourseSectionsPage />} />
                    <Route path="course-classifications" element={<CourseClassificationPage />} />
                    <Route path="students" element={<StudentListPage />} />
                    <Route path="instructors" element={<InstructorListPage />} />
                    <Route path="units" element={<UnitListPage />} />
                    <Route path="sub-units" element={<SubUnitListPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="student" element={<StudentLayout />}>
                    <Route index element={<StudentHomePage />} />
                    <Route path="my-courses" element={<StudentCoursesPage />} />
                    <Route path="progress" element={<StudentProgressPage />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
                <Route path="instructor" element={<InstructorLayout />}>
                    <Route index element={<InstructorHomePage />} />
                    <Route path="courses" element={<InstructorCoursesPage />} />
                    <Route path="students" element={<InstructorStudentsPage />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="login" replace />} />
        </Routes>
    );
}
