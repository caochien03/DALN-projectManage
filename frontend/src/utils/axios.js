import axios from "axios";
import { toast } from "react-toastify";

const instance = axios.create({
    baseURL: "http://localhost:8080", // Thay đổi URL tùy theo backend của bạn
    timeout: 10000, // Timeout 10 giây
    headers: {
        "Content-Type": "application/json",
    },
});

// Thêm token vào header nếu có
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        toast.error("Có lỗi xảy ra khi gửi yêu cầu");
        return Promise.reject(error);
    }
);

// Xử lý lỗi từ response
instance.interceptors.response.use(
    (response) => {
        // Hiển thị thông báo thành công cho các request POST, PUT, DELETE
        const method = response.config.method;
        const message = response.data?.message;
        if (method === "post" && message) {
            toast.success(message);
        } else if (method === "put" && message) {
            toast.success(message);
        } else if (method === "delete" && message) {
            toast.success(message);
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            const errorMessage = error.response?.data?.message || "";
            // Nếu là lỗi xác thực token thì mới logout
            if (
                errorMessage === "Please authenticate" ||
                errorMessage === "No authorization header" ||
                errorMessage === "No token provided" ||
                errorMessage === "jwt expired" ||
                errorMessage === "invalid token" ||
                errorMessage === "User not found"
            ) {
                localStorage.removeItem("token");
                window.location.href = "/login";
                toast.error("Phiên đăng nhập đã hết hạn");
            } else {
                // Các lỗi 401 khác (ví dụ: sai mật khẩu) chỉ toast lỗi
                toast.error(errorMessage || "Có lỗi xảy ra");
            }
        } else {
            const errorMessage =
                error.response?.data?.message || "Có lỗi xảy ra";
            toast.error(errorMessage);
        }
        return Promise.reject(error);
    }
);

export default instance;
