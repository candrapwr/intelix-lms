import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './layout.css';

const navigation = [
    { type: 'item', to: '.', label: 'Dashboard', icon: 'dashboard', end: true },
    { type: 'item', to: 'my-courses', label: 'My Courses', icon: 'courses' },
    { type: 'item', to: 'progress', label: 'Progress', icon: 'progress' },
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
    search: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="11" cy="11" r="6" />
            <path d="m20 20-3.35-3.35" strokeLinecap="round" />
        </svg>
    ),
    close: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
        </svg>
    ),
};

function Icon({ name }) {
    return <span className="icon">{icons[name] ?? null}</span>;
}

export default function StudentLayout() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const resolvePath = (target) => (target === '.' ? '/student' : `/student/${target}`);
    const isRouteActive = (target) => {
        const resolved = resolvePath(target);

        if (target === '.') {
            return location.pathname === resolved || location.pathname === `${resolved}/`;
        }

        return location.pathname === resolved;
    };

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const flatNavigation = useMemo(() => {
        const items = [];
        navigation.forEach((item) => {
            if (item.type === 'item') {
                items.push(item);
            } else if (item.children) {
                items.push(...item.children);
            }
        });
        return items;
    }, []);

    const pageTitle = useMemo(() => {
        const current = flatNavigation.find((item) => isRouteActive(item.to));

        return current?.label ?? 'Operative Portal';
    }, [flatNavigation, location.pathname]);

    return (
        <div className={`admin-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <aside className="admin-sidebar">
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
                        {navigation.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `sidebar-link${isRouteActive(item.to) || isActive ? ' active' : ''}`
                                    }
                                >
                                    <Icon name={item.icon} />
                                    {item.label}
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
            <div className="admin-main">
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <button
                            type="button"
                            className="sidebar-toggle"
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            aria-label="Toggle sidebar"
                        >
                            {icons.menu}
                        </button>
                        <span className="page-title">{pageTitle}</span>
                    </div>
                    <div className="topbar-profile">
                        <button type="button" className="profile-button" onClick={logout}>
                            <span className="profile-avatar">{user?.initials ?? 'TO'}</span>
                            <span className="profile-meta">
                                <span className="profile-name">{user?.name ?? 'Operative'}</span>
                                <span className="profile-action">Sign out</span>
                            </span>
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
