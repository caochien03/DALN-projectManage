import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    HomeIcon,
    UsersIcon,
    BuildingOfficeIcon,
    ClipboardDocumentListIcon,
    ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { logout } from "../services/auth";
import { toast } from "react-toastify";

const navigation = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    { name: "Users", href: "/users", icon: UsersIcon },
    { name: "Departments", href: "/departments", icon: BuildingOfficeIcon },
    { name: "Projects", href: "/projects", icon: ClipboardDocumentListIcon },
    { name: "Profile", href: "/profile", icon: UsersIcon },
];

export default function MainLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        toast.success("Đăng xuất thành công");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
    {/* Header */}
    <div className="h-16 bg-gray-100 flex items-center justify-between px-4 shadow-md">
  {/* Bên trái: nút menu + tên công ty */}
  <div className="flex items-center space-x-3">
    <button className="text-gray-600 hover:text-gray-800 focus:outline-none">
      {/* Icon menu: 3 gạch ngang */}
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <h1 className="text-xl font-bold text-gray-800">NovaTech Solutions</h1>
  </div>

  {/* Giữa: ô tìm kiếm */}
  <div className="flex-1 max-w-lg mx-4">
    <input
      type="text"
      placeholder="Tìm kiếm..."
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>

  {/* Bên phải: ảnh đại diện + tên */}
  <div className="flex items-center space-x-3">
    <img
      src="https://i.pravatar.cc/40?img=3"
      alt="Avatar"
      className="w-8 h-8 rounded-full"
    />
    <span className="text-gray-800 font-medium">Admin</span>
  </div>
</div>

    {/* Nội dung chính chia làm 2 cột */}
    <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
            <div className="flex flex-col h-full">
                <nav className="flex-1 px-4 py-4 space-y-1">
                    {navigation.map((item) => {
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
        <div className="flex-1 p-8">
            <main>{children}</main>
        </div>
    </div>
</div>
    );
}
