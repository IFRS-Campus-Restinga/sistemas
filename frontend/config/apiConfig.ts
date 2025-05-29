import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // tenta renovar com o cookie
                const res = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
                    null,
                    { withCredentials: true }
                );

                const newAccessToken = res.data.access;
                sessionStorage.setItem("access_token", newAccessToken);

                // atualiza header e refaz a requisição original (ex: validate-token)
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                console.error("Erro ao renovar token", refreshError);
                // logout ou redirecionamento
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);



export default api;
