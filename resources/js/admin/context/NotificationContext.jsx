import { createContext, useContext, useMemo, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

let idCounter = 0;

export function NotificationProvider({ children }) {
    const [items, setItems] = useState([]);

    const remove = useCallback((id) => {
        setItems((current) => current.filter((item) => item.id !== id));
    }, []);

    const push = useCallback((type, title, description = '') => {
        const id = ++idCounter;
        setItems((current) => [
            ...current,
            {
                id,
                type,
                title,
                description,
            },
        ]);

        setTimeout(() => remove(id), 4000);
    }, [remove]);

    const value = useMemo(
        () => ({
            pushSuccess: (title, description) => push('success', title, description),
            pushError: (title, description) => push('error', title, description),
            pushInfo: (title, description) => push('info', title, description),
        }),
        [push],
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <div className="toast-stack">
                {items.map((item) => (
                    <div key={item.id} className={`toast toast-${item.type}`}>
                        <div className="toast-headline">{item.title}</div>
                        {item.description ? (
                            <div className="toast-body">{item.description}</div>
                        ) : null}
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }

    return ctx;
}

