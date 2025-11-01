import axios from 'axios';

const storageKey = 'intelix:portal:auth';

const instructorClient = axios.create({
    baseURL: '/api/instructor',
    headers: {
        Accept: 'application/json',
    },
});

instructorClient.interceptors.request.use((config) => {
    if (typeof window === 'undefined') {
        return config;
    }

    try {
        const saved = localStorage.getItem(storageKey);
        if (!saved) {
            return config;
        }

        const parsed = JSON.parse(saved);
        const token = parsed?.token;

        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }
    } catch (error) {
        console.warn('Failed to attach auth token:', error);
    }

    return config;
});

instructorClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem(storageKey);
            window.location.href = '/login';
        }

        return Promise.reject(error);
    },
);

export default instructorClient;
