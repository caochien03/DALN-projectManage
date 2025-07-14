import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, forgotPassword } from "../services/auth";
import { toast } from "react-toastify";
import {
    EyeIcon,
    EyeSlashIcon,
    LockClosedIcon,
    EnvelopeIcon,
} from "@heroicons/react/24/outline";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await login(email, password);
            if (res.success && res.data?.token) {
                localStorage.setItem("token", res.data.token);
                const userWithId = { ...res.data.user, _id: res.data.user.id };
                localStorage.setItem("user", JSON.stringify(userWithId));
                toast.success(res.message || "Đăng nhập thành công");
                navigate("/");
            } else {
                toast.error(res.message || "Đăng nhập thất bại");
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || "Đăng nhập thất bại";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await forgotPassword(email);
            toast.success(
                "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn"
            );
            setShowForgotPassword(false);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Không thể xử lý yêu cầu đặt lại mật khẩu";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
                <div className="flex flex-col items-center">
                    <div className="bg-indigo-600 rounded-full p-3 mb-2">
                        <LockClosedIcon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
                        {showForgotPassword
                            ? "Quên mật khẩu"
                            : "Đăng nhập hệ thống"}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Quản lý dự án nội bộ
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-2 text-center text-sm">
                        {error}
                    </div>
                )}

                <form
                    className="space-y-6"
                    onSubmit={
                        showForgotPassword ? handleForgotPassword : handleLogin
                    }
                >
                    <div className="space-y-4">
                        <div className="relative">
                            <EnvelopeIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-900 placeholder-gray-400 shadow-sm"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {!showForgotPassword && (
                            <div className="relative">
                                <LockClosedIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    className="pl-10 pr-10 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-gray-900 placeholder-gray-400 shadow-sm"
                                    placeholder="Mật khẩu"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-indigo-600"
                                    onClick={() => setShowPassword((v) => !v)}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            className="text-sm text-indigo-600 hover:underline focus:outline-none"
                            onClick={() =>
                                setShowForgotPassword(!showForgotPassword)
                            }
                        >
                            {showForgotPassword
                                ? "Quay lại đăng nhập"
                                : "Quên mật khẩu?"}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 shadow-md transition"
                    >
                        {isLoading
                            ? "Đang xử lý..."
                            : showForgotPassword
                            ? "Gửi hướng dẫn"
                            : "Đăng nhập"}
                    </button>
                </form>

                <div className="text-xs text-gray-400 text-center pt-2">
                    © {new Date().getFullYear()} Project Management System
                </div>
            </div>
        </div>
    );
}
