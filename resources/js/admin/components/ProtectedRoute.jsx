import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const fallback =
            user.role === 'student'
                ? '/student'
                : user.role === 'instructor'
                ? '/instructor'
                : '/';

        return <Navigate to={fallback} replace />;
    }

    return <Outlet />;
}
