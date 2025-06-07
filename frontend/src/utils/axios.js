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
        if (method === "post") {
            toast.success("Thêm mới thành công");
        } else if (method === "put") {
            toast.success("Cập nhật thành công");
        } else if (method === "delete") {
            toast.success("Xóa thành công");
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            toast.error("Phiên đăng nhập đã hết hạn");
        } else {
            const errorMessage =
                error.response?.data?.message || "Có lỗi xảy ra";
            toast.error(errorMessage);
        }
        return Promise.reject(error);
    }
);

export default instance;
