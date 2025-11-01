import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './layout.css';

const navigation = [
    { type: 'item', to: '.', label: 'Dashboard', icon: 'dashboard', end: true },
    { type: 'item', to: 'courses', label: 'Courses', icon: 'courses' },
    { type: 'item', to: 'students', label: 'Students', icon: 'students' },
    { type: 'item', to: 'instructors', label: 'Instructors', icon: 'instructors' },
    {
        type: 'group',
        label: 'Master Data',
        icon: 'layers',
        children: [
            { to: 'course-classifications', label: 'Course Classifications', icon: 'classification' },
            { to: 'units', label: 'Units', icon: 'units' },
            { to: 'sub-units', label: 'Sub Units', icon: 'subUnits' },
        ],
    },
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
    students: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M16 18v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" strokeLinecap="round" />
            <circle cx="9.5" cy="8.5" r="3.5" />
            <path d="M21 18v-1a4 4 0 0 0-3-3.87" strokeLinecap="round" />
            <path d="M14 4.13a3.5 3.5 0 0 1 0 6.74" strokeLinecap="round" />
        </svg>
    ),
    instructors: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M12 4l9 4.5-9 4.5L3 8.5z" strokeLinejoin="round" />
            <path d="M7.5 11l-1.5.75V16" strokeLinecap="round" />
            <path d="M21 14.5v3.5l-9 4-9-4V14.5" strokeLinejoin="round" />
            <path d="M15.5 11l1.5.75" strokeLinecap="round" />
        </svg>
    ),
    units: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 7h16L12 3 4 7Z" strokeLinejoin="round" />
            <path d="M4 11h16l-8 4-8-4Z" strokeLinejoin="round" />
            <path d="M4 15h16l-8 4-8-4Z" strokeLinejoin="round" />
        </svg>
    ),
    subUnits: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 5h6v6H4z" />
            <path d="M14 5h6v6h-6z" />
            <path d="M4 15h6v6H4z" />
            <path d="M14 17h6" strokeLinecap="round" />
            <path d="M14 21h6" strokeLinecap="round" />
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
    layers: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="m12 3 9 5-9 5-9-5z" strokeLinejoin="round" />
            <path d="m21 13-9 5-9-5" strokeLinejoin="round" />
            <path d="m21 18-9 5-9-5" strokeLinejoin="round" />
        </svg>
    ),
    classification: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M5 4h14v4H5z" strokeLinejoin="round" />
            <path d="M5 10h14v10H5z" strokeLinejoin="round" />
            <path d="M9 14h6" strokeLinecap="round" />
        </svg>
    ),
    caret: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
};

function Icon({ name }) {
    return <span className="icon">{icons[name] ?? null}</span>;
}

export default function AdminLayout() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openGroup, setOpenGroup] = useState(null);

    const resolvePath = (target) => (target === '.' ? '/admin' : `/admin/${target}`);
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

    useEffect(() => {
        const activeGroup = navigation.find(
            (item) =>
                item.type === 'group' &&
                item.children?.some((child) => location.pathname.startsWith(resolvePath(child.to))),
        );

        if (activeGroup) {
            setOpenGroup(activeGroup.label);
        }
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

        return current?.label ?? 'Command Center';
    }, [flatNavigation, location.pathname]);

    return (
        <div className={`admin-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="brand">
                        <div className="brand-badge">IX</div>
                        INTELIX Command
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
                        {navigation.map((item) => {
                            if (item.type === 'group' && item.children) {
                                const routeExpanded = item.children.some((child) =>
                                    location.pathname.startsWith(resolvePath(child.to)),
                                );
                                const groupOpen = (openGroup === item.label) || routeExpanded;
                                const groupActive = routeExpanded;

                                return (
                                    <li key={item.label} className={`sidebar-group-item${groupActive ? ' active' : ''}`}>
                                        <button
                                            type="button"
                                            className={`sidebar-group${groupActive ? ' active' : ''}`}
                                            onClick={() =>
                                                setOpenGroup((prev) =>
                                                    prev === item.label ? null : item.label,
                                                )
                                            }
                                        >
                                            <Icon name={item.icon} />
                                            {item.label}
                                            <span className={`group-caret${groupOpen ? ' open' : ''}`}>
                                                {icons.caret}
                                            </span>
                                        </button>
                                        <ul
                                            className={`sidebar-subnav${groupOpen ? ' open' : ''}`}
                                            style={{ display: groupOpen ? 'grid' : 'none' }}
                                        >
                                            {item.children.map((child) => (
                                                <li key={child.to}>
                                                    <NavLink
                                                        to={child.to}
                                                        className={({ isActive }) => {
                                                            const active =
                                                                isActive ||
                                                                location.pathname === resolvePath(child.to);
                                                            return `sidebar-sublink${active ? ' active' : ''}`;
                                                        }}
                                                    >
                                                        <Icon name={child.icon} />
                                                        {child.label}
                                                    </NavLink>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                );
                            }

                            return (
                                <li key={item.to}>
                                    <NavLink
                                        to={item.to}
                                        end={item.end}
                                        className={({ isActive }) =>
                                            `sidebar-link${isRouteActive(item.to) || isActive ? ' active' : ''}`
                                        }
                                        onClick={() => setOpenGroup(null)}
                                    >
                                        <Icon name={item.icon} />
                                        {item.label}
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    <strong>Intel Brief</strong>
                    <p>Monitor perkembangan kurikulum, kesiapan agen, dan modul analitik dari pusat kendali ini.</p>
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
                            <span className="profile-avatar">{user?.initials ?? 'IX'}</span>
                            <span className="profile-meta">
                                <span className="profile-name">{user?.name ?? 'Command Lead'}</span>
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
