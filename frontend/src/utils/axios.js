import axios from "axios";
import store from "../store";
import { logout } from "../store/slices/authSlice";
import { redirectToLogin } from "./navigation";

const instance = axios.create({
    baseURL: "http://localhost:8080/api",
});

// Add a request interceptor
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            store.dispatch(logout());
            redirectToLogin();
        }
        return Promise.reject(error);
    }
);

export default instance;
