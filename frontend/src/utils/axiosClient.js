import axios from "axios";

export const axiosClient = axios.create({
    baseURL : 'http://localhost:4000'
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('Token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (err) => {
    return Promise.reject(err);
});
