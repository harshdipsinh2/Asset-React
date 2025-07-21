import axios from "axios";

const API_BASE_URL = "https://asseiapi-k53b.onrender.com";
const getToken = () => localStorage.getItem("token");

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {"Content-Type": "application/json"},
});

api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
            config.headers.Authorization = `Bearer ${token}` ;
    }
    return config;
});

// Handles error globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default api;