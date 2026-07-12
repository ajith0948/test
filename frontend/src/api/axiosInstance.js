import axios from 'axios';

const api = axios.create({
    // In production (Render), set VITE_API_URL to the backend service's URL,
    // e.g. https://assetflow-backend.onrender.com/api
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // THIS IS CRITICAL for HTTP-Only cookies to work
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;