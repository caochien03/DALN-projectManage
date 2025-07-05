import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { toast } from "react-toastify";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = searchParams.get("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!password || !confirmPassword) {
            setError("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }
        if (!token) {
            setError("Token không hợp lệ hoặc đã hết hạn");
            return;
        }
        setLoading(true);
        try {
            await axiosInstance.post("/api/auth/reset-password", {
                token,
                password,
            });
            setSuccess("Đặt lại mật khẩu thành công! Đang chuyển hướng...");
            toast.success(
                "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại."
            );
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Đặt lại mật khẩu thất bại hoặc token đã hết hạn"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Đặt lại mật khẩu
                </h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 mb-2"
                            htmlFor="password"
                        >
                            Mật khẩu mới
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label
                            className="block text-gray-700 mb-2"
                            htmlFor="confirmPassword"
                        >
                            Xác nhận mật khẩu mới
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                    </button>
                </form>
            </div>
        </div>
    );
}
