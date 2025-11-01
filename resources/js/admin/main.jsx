import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';

const container = document.getElementById('admin-root');

if (container) {
    createRoot(container).render(
        <React.StrictMode>
            <BrowserRouter basename="/admin">
                <NotificationProvider>
                    <AuthProvider>
                        <App />
                    </AuthProvider>
                </NotificationProvider>
            </BrowserRouter>
        </React.StrictMode>,
    );
}
