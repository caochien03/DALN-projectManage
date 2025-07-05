import { useState } from "react";
import { forgotPassword } from "../services/auth";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");
        setError("");
        setLoading(true);
        try {
            await forgotPassword(email);
            setSuccess(
                "Đã gửi email hướng dẫn đặt lại mật khẩu (nếu email tồn tại trong hệ thống)"
            );
        } catch (err) {
            setError(err.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Quên mật khẩu
                </h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 mb-2"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        disabled={loading}
                    >
                        {loading ? "Đang gửi..." : "Gửi hướng dẫn"}
                    </button>
                </form>
            </div>
        </div>
    );
}
