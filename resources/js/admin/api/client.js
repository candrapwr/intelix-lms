import axios from 'axios';

/**
 * Axios instance for admin API calls.
 * Use route prefix /api/admin defined in routes/api.php.
 */
const client = axios.create({
    baseURL: '/api/admin',
    headers: {
        Accept: 'application/json',
    },
    withCredentials: true,
});

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export default client;

