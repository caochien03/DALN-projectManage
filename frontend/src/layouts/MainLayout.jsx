import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    HomeIcon,
    UsersIcon,
    BuildingOfficeIcon,
    ClipboardDocumentListIcon,
    ArrowLeftOnRectangleIcon,
    BellIcon,
} from "@heroicons/react/24/outline";
import { logout } from "../services/auth";
import { toast } from "react-toastify";
import NotificationBell from "../components/NotificationBell";
import { useState, useRef, useEffect } from "react";

const navigation = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    { name: "Users", href: "/users", icon: UsersIcon },
    { name: "Departments", href: "/departments", icon: BuildingOfficeIcon },
    { name: "Projects", href: "/projects", icon: ClipboardDocumentListIcon },
    { name: "Profile", href: "/profile", icon: UsersIcon },
    { name: "Notifications", href: "/notifications", icon: BellIcon },
];

// Hàm helper để lấy màu role
const getRoleColor = (role) => {
    switch (role) {
        case "admin":
            return "bg-red-100 text-red-800";
        case "manager":
            return "bg-blue-100 text-blue-800";
        case "member":
            return "bg-green-100 text-green-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

// Hàm helper để lấy tên role tiếng Việt
const getRoleName = (role) => {
    switch (role) {
        case "admin":
            return "Quản trị viên";
        case "manager":
            return "Quản lý";
        case "member":
            return "Thành viên";
        default:
            return role;
    }
};

const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    return avatar.startsWith("http")
        ? avatar
        : `http://localhost:8080${avatar}`;
};

export default function MainLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const userDropdownRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                userDropdownRef.current &&
                !userDropdownRef.current.contains(event.target)
            ) {
                setShowUserDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Lọc menu cho member
    const filteredNavigation =
        currentUser?.role === "member"
            ? navigation.filter(
                  (item) => item.name !== "Users" && item.name !== "Departments"
              )
            : navigation;

    const handleLogout = async () => {
        await logout();
        toast.success("Đăng xuất thành công");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
                        <h1 className="text-xl font-bold text-white">
                            Project Management
                        </h1>
                    </div>

                    {/* User Info */}
                    {currentUser && (
                        <div className="px-4 py-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    {currentUser.avatar ? (
                                        <img
                                            src={getAvatarUrl(
                                                currentUser.avatar
                                            )}
                                            alt="Avatar"
                                            className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-semibold text-lg">
                                                {currentUser.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase() ||
                                                    currentUser.email
                                                        ?.charAt(0)
                                                        ?.toUpperCase() ||
                                                    "U"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {currentUser.name || currentUser.email}
                                    </p>
                                    <p
                                        className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getRoleColor(
                                            currentUser.role
                                        )}`}
                                    >
                                        {getRoleName(currentUser.role)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {filteredNavigation.map((item) => {
                            // Kiểm tra active state cho cả route chính và route con
                            const isActive =
                                item.href === "/"
                                    ? location.pathname === "/"
                                    : location.pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                        isActive
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                    }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="pl-64">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between px-8 py-4">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {filteredNavigation.find((item) =>
                                    item.href === "/"
                                        ? location.pathname === "/"
                                        : location.pathname.startsWith(
                                              item.href
                                          )
                                )?.name || "Dashboard"}
                            </h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            {currentUser && <NotificationBell />}
                            {/* User Dropdown */}
                            {currentUser && (
                                <div className="relative" ref={userDropdownRef}>
                                    <button
                                        className="flex items-center focus:outline-none"
                                        onClick={() =>
                                            setShowUserDropdown((v) => !v)
                                        }
                                    >
                                        {currentUser.avatar ? (
                                            <img
                                                src={getAvatarUrl(
                                                    currentUser.avatar
                                                )}
                                                alt="Avatar"
                                                className="w-9 h-9 rounded-full object-cover border-2 border-blue-400"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold text-lg">
                                                    {currentUser.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase() ||
                                                        currentUser.email
                                                            ?.charAt(0)
                                                            ?.toUpperCase() ||
                                                        "U"}
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                    {showUserDropdown && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <div className="font-medium text-gray-900 truncate">
                                                    {currentUser.name}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate">
                                                    {currentUser.email}
                                                </div>
                                            </div>
                                            <Link
                                                to="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() =>
                                                    setShowUserDropdown(false)
                                                }
                                            >
                                                Thông tin cá nhân
                                            </Link>
                                            <Link
                                                to="/change-password"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() =>
                                                    setShowUserDropdown(false)
                                                }
                                            >
                                                Đổi mật khẩu
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                            >
                                                Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="p-8">{children}</main>
            </div>
        </div>
    );
}
