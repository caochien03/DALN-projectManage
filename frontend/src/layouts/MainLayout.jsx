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

const navigation = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    { name: "Users", href: "/users", icon: UsersIcon },
    { name: "Departments", href: "/departments", icon: BuildingOfficeIcon },
    { name: "Projects", href: "/projects", icon: ClipboardDocumentListIcon },
    { name: "Profile", href: "/profile", icon: UsersIcon },
    { name: "Notifications", href: "/notifications", icon: BellIcon },
];

export default function MainLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = JSON.parse(localStorage.getItem("user"));

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
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-center h-16 px-4 bg-gray-900">
                        <h1 className="text-xl font-bold text-white">
                            Project Management
                        </h1>
                    </div>

                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {filteredNavigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                                        isActive
                                            ? "bg-gray-900 text-white"
                                            : "text-gray-600 hover:bg-gray-700 hover:text-white"
                                    }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-700 hover:text-white"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
                            Logout
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
                                {filteredNavigation.find(
                                    (item) => item.href === location.pathname
                                )?.name || "Dashboard"}
                            </h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            {currentUser && <NotificationBell />}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700">
                                    {currentUser?.name || currentUser?.email}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-8">{children}</main>
            </div>
        </div>
    );
}
