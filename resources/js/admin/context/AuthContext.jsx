import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext({
    user: null,
    isAuthenticated: false,
    login: () => {},
    logout: () => {},
});

const storageKey = 'intelix:portal:auth';

const defaultProfiles = {
    admin: {
        name: 'Command Lead',
        title: 'Strategic Control',
        initials: 'IX',
    },
    instructor: {
        name: 'Field Coach',
        title: 'Operations Mentor',
        initials: 'FC',
    },
    student: {
        name: 'Trainee Operative',
        title: 'Intelligence Cadet',
        initials: 'TO',
    },
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            if (typeof window === 'undefined') {
                return null;
            }

            const saved = localStorage.getItem(storageKey);
            if (!saved) {
                return null;
            }

            const parsed = JSON.parse(saved);
            return parsed?.role ? parsed : null;
        } catch (error) {
            console.warn('Failed to parse auth state:', error);
            return null;
        }
    });

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (user) {
            localStorage.setItem(storageKey, JSON.stringify(user));
        } else {
            localStorage.removeItem(storageKey);
        }
    }, [user]);

    const value = useMemo(
        () => ({
            user,
            isAuthenticated: Boolean(user),
            login: ({ email, role }) => {
                if (!role) {
                    throw new Error('Role is required');
                }

                const profile = defaultProfiles[role] ?? defaultProfiles.admin;

                setUser({
                    email,
                    role,
                    ...profile,
                });
            },
            logout: () => setUser(null),
        }),
        [user],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
