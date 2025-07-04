import { useState, useEffect, useRef } from "react";
import { getCurrentUser, updateProfile } from "../services/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../components/Loading";
import { uploadProfileAvatar } from "../services/user";
import { getAllDepartments } from "../services/department";

export default function Profile() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        position: "",
        phone: "",
        address: "",
        avatar: "",
        department: "",
        linkedin: "",
        twitter: "",
        github: "",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const fileInputRef = useRef();
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchProfile();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await getAllDepartments();
            setDepartments(data);
        } catch {
            setDepartments([]);
        }
    };

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const user = await getCurrentUser();
            setFormData({
                name: user.name || "",
                email: user.email || "",
                position: user.position || "",
                phone: user.phone || "",
                address: user.address || "",
                avatar: user.avatar || "",
                department: user.department?._id || user.department || "",
                linkedin: user.linkedin || "",
                twitter: user.twitter || "",
                github: user.github || "",
            });
        } catch {
            setError("Không thể tải thông tin cá nhân");
        } finally {
            setIsLoading(false);
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

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsLoading(true);
        try {
            const data = await uploadProfileAvatar(file);
            if (data.success && data.avatar) {
                setFormData((prev) => ({ ...prev, avatar: data.avatar }));
                // Cập nhật localStorage user
                const user = JSON.parse(localStorage.getItem("user"));
                if (user) {
                    user.avatar = data.avatar;
                    localStorage.setItem("user", JSON.stringify(user));
                }
                setSuccess("Cập nhật ảnh đại diện thành công!");
            } else {
                setError(data.message || "Upload thất bại");
            }
        } catch {
            setError("Upload thất bại");
        } finally {
            setIsLoading(false);
        }
    };

    const getAvatarUrl = (avatar) => {
        if (!avatar)
            return "https://www.rainforest-alliance.org/wp-content/uploads/2021/06/capybara-square-1.jpg.optimal.jpg";
        return avatar.startsWith("http")
            ? avatar
            : `http://localhost:8080${avatar}`;
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="max-w-5xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-md">
            <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
                Thông tin cá nhân
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                    <img
                        src={getAvatarUrl(formData.avatar)}
                        alt="Avatar"
                        className="w-32 h-32 rounded-full border-4 border-indigo-500 shadow-md object-cover cursor-pointer"
                        onClick={handleAvatarClick}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                    />
                    <span className="mt-4 text-sm text-gray-500 text-center">
                        Nhấn vào ảnh để thay đổi ảnh đại diện
                    </span>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {error && (
                        <div className="md:col-span-2 text-red-500 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="md:col-span-2 text-green-500 text-sm">
                            {success}
                        </div>
                    )}

                    {/* Thông tin cá nhân */}
                    {[
                        {
                            label: "Họ tên",
                            key: "name",
                            type: "text",
                            required: true,
                        },
                        {
                            label: "Email",
                            key: "email",
                            type: "email",
                            required: true,
                        },
                        { label: "Vị trí", key: "position", type: "text" },
                        {
                            label: "Số điện thoại",
                            key: "phone",
                            type: "text",
                        },
                        { label: "Địa chỉ", key: "address", type: "text" },
                    ].map(({ label, key, type, required }) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {label}
                            </label>
                            <input
                                type={type}
                                value={formData[key]}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        [key]: e.target.value,
                                    })
                                }
                                required={required}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>
                    ))}

                    {/* Department select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phòng ban
                        </label>
                        <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm">
                            {departments.find(
                                (dep) => dep._id === formData.department
                            )?.name || "Chưa có"}
                        </div>
                    </div>

                    {/* Liên kết mạng xã hội */}
                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border mt-4">
                        <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span>🖋️</span> Liên kết mạng xã hội
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                {
                                    label: "LinkedIn",
                                    key: "linkedin",
                                    placeholder:
                                        "https://linkedin.com/in/username",
                                },
                                {
                                    label: "Twitter",
                                    key: "twitter",
                                    placeholder: "https://twitter.com/username",
                                },
                                {
                                    label: "GitHub",
                                    key: "github",
                                    placeholder: "https://github.com/username",
                                },
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
                                            setFormData({
                                                ...formData,
                                                [key]: e.target.value,
                                            })
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
