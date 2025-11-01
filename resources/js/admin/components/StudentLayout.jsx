import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './layout.css';

const studentNavLinks = [
    { to: '/student', label: 'Mission Brief', icon: 'dashboard', end: true },
    { to: '/student/my-courses', label: 'Training Deck', icon: 'courses' },
    { to: '/student/progress', label: 'Readiness', icon: 'progress' },
];

const icons = {
    dashboard: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 4h7v7H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 13h7v7H4z" strokeLinejoin="round" />
        </svg>
    ),
    courses: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path
                d="M4.5 5.75l7.5-3 7.5 3V18a1 1 0 0 1-1.4.92L12 16l-6.1 2.92A1 1 0 0 1 4.5 18z"
                strokeLinejoin="round"
            />
            <path d="M19.5 6l-7.5 3-7.5-3" strokeLinejoin="round" />
        </svg>
    ),
    progress: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 4v16h16" strokeLinecap="round" />
            <path d="M8 14l3-3 3 3 4-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    menu: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
    ),
    close: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
        </svg>
    ),
};

function Icon({ name }) {
    return <span className="icon">{icons[name]}</span>;
}

export default function StudentLayout() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const pageTitle = useMemo(() => {
        const current = studentNavLinks.find((item) => location.pathname === item.to);
        return current?.label ?? 'Operative Portal';
    }, [location.pathname]);

    return (
        <div className={`admin-shell student-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <aside className="admin-sidebar student-sidebar">
                <div className="sidebar-header">
                    <div className="brand">
                        <div className="brand-badge">IX</div>
                        Operative Hub
                    </div>
                    <button
                        type="button"
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen((prev) => !prev)}
                        aria-label="Toggle sidebar"
                    >
                        {icons.close}
                    </button>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        {studentNavLinks.map((link) => (
                            <li key={link.to}>
                                <NavLink
                                    to={link.to}
                                    end={link.end}
                                    className={({ isActive }) =>
                                        `sidebar-link${isActive ? ' active' : ''}`
                                    }
                                >
                                    <Icon name={link.icon} />
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    <strong>Field Brief</strong>
                    <p>Tetapkan target operasi mingguan dan pantau progres intel secara real-time.</p>
                </div>
            </aside>
            <div
                role="presentation"
                className="sidebar-overlay"
                onClick={() => setSidebarOpen(false)}
            />
            <div className="admin-main student-main">
                <header className="admin-topbar student-topbar">
                    <div className="topbar-left">
                        <button
                            type="button"
                            className="sidebar-toggle"
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            aria-label="Toggle sidebar"
                        >
                            {icons.menu}
                        </button>
                        <div className="page-title">{pageTitle}</div>
                    </div>
                    <div className="topbar-right">
                        <div className="user-pill">
                            <div className="user-avatar">{user?.initials ?? 'TO'}</div>
                            <div>
                                <div style={{ fontWeight: 600, color: '#0f172a' }}>
                                    {user?.name ?? 'Operative'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    {user?.email ?? 'operative@intelix.local'}
                                </div>
                            </div>
                        </div>
                        <button type="button" className="logout-button" onClick={logout}>
                            Sign out
                        </button>
                    </div>
                </header>
                <section className="admin-content">
                    <Outlet />
                </section>
            </div>
        </div>
    );
}
