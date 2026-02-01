import axios from 'axios';
import { store } from '../src/store/store';
import { clearUser } from '../src/store/userSlice';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const logoutAndRedirect = () => {
    store.dispatch(clearUser());
    if (window.location.pathname !== '/session') {
        window.location.replace('/session');
    }
};

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        const isUserInactive =
            error.response?.status === 401 &&
            (error.response?.data?.message === 'Usuário Inativo' ||
                error.response?.data?.message?.includes?.('Usuário Inativo'));

        if (isUserInactive) {
            logoutAndRedirect();
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && originalRequest?._retry) {
            logoutAndRedirect();
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch(err => Promise.reject(err));
            }

            isRefreshing = true;

            try {
                await api.get('session/token/refresh/');
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                logoutAndRedirect();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
