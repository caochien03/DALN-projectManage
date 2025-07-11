import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, forgotPassword } from "../services/auth";
import { toast } from "react-toastify";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {showForgotPassword
                            ? "Reset your password"
                            : "Sign in to your account"}
                    </h2>
                </div>

                {error && (
                    <div
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                        role="alert"
                    >
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form
                    className="mt-8 space-y-6"
                    onSubmit={
                        showForgotPassword ? handleForgotPassword : handleLogin
                    }
                >
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {!showForgotPassword && (
                            <div>
                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <button
                                type="button"
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                                onClick={() =>
                                    setShowForgotPassword(!showForgotPassword)
                                }
                            >
                                {showForgotPassword
                                    ? "Back to login"
                                    : "Forgot your password?"}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {isLoading
                                ? "Processing..."
                                : showForgotPassword
                                ? "Reset Password"
                                : "Sign in"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
