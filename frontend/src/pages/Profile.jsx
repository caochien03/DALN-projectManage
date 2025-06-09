import { useState, useEffect } from "react";
import { getCurrentUser, updateProfile } from "../services/auth";
import { toast } from "react-toastify";

export default function Profile() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        position: "",
        phone: "",
        address: "",
        avatarUrl: "",
        linkedin: "",
        twitter: "",
        github: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const user = await getCurrentUser();
            setFormData({
                name: user.name || "",
                email: user.email || "",
                position: user.position || "",
                phone: user.phone || "",
                address: user.address || "",
                avatarUrl: user.avatarUrl || "",
                linkedin: user.linkedin || "",
                twitter: user.twitter || "",
                github: user.github || "",
            });
        } catch (err) {
            setError("Không thể tải thông tin cá nhân");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");
        try {
            await updateProfile(formData);
            setSuccess("Cập nhật thông tin thành công!");
            toast.success("Cập nhật thông tin thành công!");
        } catch (err) {
            setError(err.response?.data?.message || "Cập nhật thất bại");
            toast.error(err.response?.data?.message || "Cập nhật thất bại");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-md">
            <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
                Thông tin cá nhân
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                    <img
                        src={
                            formData.avatarUrl ||
                            "https://www.rainforest-alliance.org/wp-content/uploads/2021/06/capybara-square-1.jpg.optimal.jpg"
                        }
                        alt="Avatar"
                        className="w-32 h-32 rounded-full border-4 border-indigo-500 shadow-md object-cover"
                    />
                    <span className="mt-4 text-sm text-gray-500 text-center">
                        Nhập URL ảnh đại diện nếu muốn thay đổi
                    </span>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {error && (
                        <div className="md:col-span-2 text-red-500 text-sm">{error}</div>
                    )}
                    {success && (
                        <div className="md:col-span-2 text-green-500 text-sm">
                            {success}
                        </div>
                    )}

                    {/* Thông tin cá nhân */}
                    {[
                        { label: "Họ tên", key: "name", type: "text", required: true },
                        { label: "Email", key: "email", type: "email", required: true },
                        { label: "Vị trí", key: "position", type: "text" },
                        { label: "Số điện thoại", key: "phone", type: "text" },
                        { label: "Địa chỉ", key: "address", type: "text" },
                        {
                            label: "URL ảnh đại diện (tùy chọn)",
                            key: "avatarUrl",
                            type: "url",
                        },
                    ].map(({ label, key, type, required }) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {label}
                            </label>
                            <input
                                type={type}
                                value={formData[key]}
                                onChange={(e) =>
                                    setFormData({ ...formData, [key]: e.target.value })
                                }
                                required={required}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                    ))}

                    {/* Liên kết mạng xã hội */}
                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border mt-4">
                        <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span>🖋️</span> Liên kết mạng xã hội
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: "LinkedIn", key: "linkedin", placeholder: "https://linkedin.com/in/username" },
                                { label: "Twitter", key: "twitter", placeholder: "https://twitter.com/username" },
                                { label: "GitHub", key: "github", placeholder: "https://github.com/username" },
                            ].map(({ label, key, placeholder }) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {label}
                                    </label>
                                    <input
                                        type="url"
                                        value={formData[key]}
                                        placeholder={placeholder}
                                        onChange={(e) =>
                                            setFormData({ ...formData, [key]: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Nút lưu */}
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 px-4 mt-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 text-sm font-medium"
                        >
                            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
