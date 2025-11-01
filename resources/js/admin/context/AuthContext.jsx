import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext({
    user: null,
    token: null,
    isAuthenticated: false,
    isBootstrapping: false,
    login: async () => {},
    logout: async () => {},
});

const storageKey = 'intelix:portal:auth';

function generateInitials(nameOrEmail) {
    if (!nameOrEmail) {
        return 'IX';
    }

    const parts = String(nameOrEmail)
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) {
        const [first = 'I', second = 'X'] = nameOrEmail.slice(0, 2).toUpperCase();
        return `${first ?? 'I'}${second ?? 'X'}`;
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase().padEnd(2, 'I');
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function normalizeUser(user) {
    if (!user) return null;

    const name = user.name ?? user.email ?? 'Intelix User';

    return {
        id: user.id ?? null,
        name,
        email: user.email ?? '',
        role: user.role ?? 'student',
        initials: user.initials ?? generateInitials(name),
        title: user.title ?? null,
    };
}

function loadInitialAuthState() {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw);

        if (parsed?.token && parsed?.user) {
            return {
                token: parsed.token,
                user: normalizeUser(parsed.user),
            };
        }

        if (parsed?.role) {
            return {
                token: null,
                user: normalizeUser(parsed),
            };
        }

        return null;
    } catch (error) {
        console.warn('Failed to parse auth state:', error);
        return null;
    }
}

export function AuthProvider({ children }) {
    const [authState, setAuthState] = useState(() => loadInitialAuthState());
    const [isBootstrapping, setBootstrapping] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (authState?.user) {
            localStorage.setItem(
                storageKey,
                JSON.stringify({ token: authState.token, user: authState.user }),
            );
        } else {
            localStorage.removeItem(storageKey);
        }
    }, [authState]);

    useEffect(() => {
        const token = authState?.token;

        if (!token) {
            setBootstrapping(false);
            return;
        }

        const controller = new AbortController();

        (async () => {
            try {
                const { data } = await axios.get('/api/auth/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal: controller.signal,
                });

                setAuthState((current) => ({
                    token,
                    user: normalizeUser(data.user),
                }));
            } catch (error) {
                console.warn('Auth session verification failed:', error?.message ?? error);
                setAuthState(null);
            } finally {
                setBootstrapping(false);
            }
        })();

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = useCallback(async ({ email, password }) => {
        const { data } = await axios.post('/api/auth/login', {
            email,
            password,
        });

        const nextState = {
            token: data.token,
            user: normalizeUser(data.user),
        };

        setAuthState(nextState);

        return nextState.user;
    }, []);

    const logout = useCallback(async () => {
        const token = authState?.token;

        try {
            if (token) {
                await axios.post(
                    '/api/auth/logout',
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );
            }
        } catch (error) {
            console.warn('Logout request failed:', error?.message ?? error);
        } finally {
            setAuthState(null);
        }
    }, [authState?.token]);

    const value = useMemo(
        () => ({
            user: authState?.user ?? null,
            token: authState?.token ?? null,
            isAuthenticated: Boolean(authState?.user),
            isBootstrapping,
            login,
            logout,
        }),
        [authState, isBootstrapping, login, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
