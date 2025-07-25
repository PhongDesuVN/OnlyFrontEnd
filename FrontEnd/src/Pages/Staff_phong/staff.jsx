"use client";
import RequireAuth from "../../Components/RequireAuth";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
    Truck,
    Home,
    Users,
    Star,
    CheckCircle,
    BarChart3,
    Package,
    ShoppingCart,
    UserPlus,
    MessageCircle,
    TrendingUp,
    Settings,
    Bell,
    ArrowLeft,
    ArrowRight,
    ChevronLeft,
    DollarSign,
    Activity,
    Loader2,
    AlertCircle,
    User,
    Briefcase,
    Receipt,
    Headphones,
    PieChart,
    Plus,
    ChevronDown,
    ChevronRight,
    Calendar,
    Clock,
    UserCheck,
    Crown,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import Cookies from "js-cookie"
import { jwtDecode } from 'jwt-decode'
import DashBoardApi from "../../utils/DashBoard_phongApi";

// Add this at the top of the file (after imports)
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

// Component chính quản lý thông tin chức vụ
const Staff = () => {
    // ==================== STATES ====================
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState("")
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [dashboardExpanded, setDashboardExpanded] = useState(true)
    const [currentPage, setCurrentPage] = useState('main')
    const [stats, setStats] = useState({
        newReceipts: 0,
        pendingOrders: 0,
        newCustomers: 0,
    });
    const [activities, setActivities] = useState([]);

    const [userRole, setUserRole] = useState('');
    const [username, setUsername] = useState(Cookies.get("username") || "Staff User");

    const navigate = useNavigate()
    useEffect(() => {
        const token = Cookies.get("authToken");
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }
    }, [navigate]);
    // Lấy dữ liệu thống kê và hoạt động gần đây
    useEffect(() => {
        const token = getCookie('authToken');
        if (token) {
            const decoded = jwtDecode(token);
            setUserRole(decoded.role || getCookie('userRole'));
            setUsername(decoded.username || 'User');
        }
    }, []);

    useEffect(() => {
        const token = Cookies.get("authToken");
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const statsData = await DashBoardApi.getDashboardStats();
                setStats({
                    newReceipts: statsData.newReceipts || 0,
                    pendingOrders: statsData.pendingOrders || 0,
                    newCustomers: statsData.newCustomers || 0,

                });

                const activitiesData = await DashBoardApi.getRecentActivities();
                setActivities(Array.isArray(activitiesData) ? activitiesData : []);
            } catch (error) {
                setMessage(error.message || "Lỗi khi tải dữ liệu thống kê hoặc hoạt động");
                setMessageType("error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // ==================== FUNCTIONS ====================
    const handleLogout = async () => {
        Cookies.remove("authToken");
        Cookies.remove("userRole");
        Cookies.remove("username");
        try {
            await fetch("/api/dashboard/staff", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${Cookies.get("authToken")}`,
                },
                credentials: "include",
            });
        } catch (e) { }
        window.location.href = "/login";
    };









    // Dữ liệu menu
    const menuItems = [
        { name: "Trang Chủ", icon: Home, path: "/", hasLink: true },
        {
            name: "Bảng Điều Khiển",
            icon: BarChart3,
            active: true,
            hasLink: false,
            hasSubmenu: true,
            submenu: [
                { name: "Hiệu suất bán hàng", icon: TrendingUp, path: "/dashboard", hasLink: true },
            ],
        },
        {
            name: "Quản Lý Lịch Làm Việc",
            icon: Calendar,
            hasLink: false,
            hasSubmenu: true,
            submenu: [
                { name: "Lịch Làm Việc", icon: Calendar, path: "/schedule/calendar", hasLink: true },
                { name: "Yêu Cầu Nghỉ Phép", icon: UserCheck, path: "/schedule/timeoff", hasLink: true },
            ],
        },
        { name: 'Quản Lý Biên Lai', icon: Receipt, path: '/receipts', hasLink: true },
        { name: "Quản Lý Đơn Hàng", icon: ShoppingCart, path: "/manageorder", hasLink: true },
        { name: "Quản Lý Khách Hàng", icon: Users, path: "/manageuser", hasLink: true },
        // Only show revenue management for MANAGER role
        ...(userRole === 'MANAGER' ? [{
            name: "Quản Lý Doanh Thu",
            icon: TrendingUp,
            path: "/managerevenue",
            hasLink: true,
            managerOnly: true
        }] : []),

    ]

    // ==================== RENDER ====================
    return (
        <RequireAuth>
            <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                {/* ==================== SIDEBAR ==================== */}
                <aside
                    className={`${sidebarCollapsed ? "w-20" : "w-72"} bg-gradient-to-b from-[#0d47a1] to-[#1976d2] text-white shadow-2xl transition-all duration-300 ease-in-out border-r border-gray-200`}
                >
                    <div className="h-full flex flex-col">
                        {/* Logo Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <Truck className="w-8 h-8 text-white" />
                                    </div>
                                    {!sidebarCollapsed && (
                                        <div>
                                            <h2 className="text-1.5xl font-bold text-white">
                                                Vận Chuyển Nhà
                                            </h2>
                                            <p className="text-1xl text-blue-100">Staff Management</p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                    className="p-2 rounded-lg hover:bg-blue-900 transition-colors"
                                >
                                    {sidebarCollapsed ? (
                                        <ArrowRight className="w-4 h-4 text-white" />
                                    ) : (
                                        <ArrowLeft className="w-4 h-4 text-white" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <nav className="flex-1 p-4 overflow-y-auto">
                            <ul className="space-y-2">
                                {menuItems.map((item, index) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <li key={index}>
                                            {item.hasSubmenu ? (
                                                <div>
                                                    <div
                                                        onClick={() => !sidebarCollapsed && setDashboardExpanded(!dashboardExpanded)}
                                                        className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer hover:shadow-md ${item.active
                                                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                                                            : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                                            }`}
                                                    >
                                                        <div className="flex items-center">
                                                            <IconComponent className="w-5 h-5 mr-4" />
                                                            {!sidebarCollapsed && (
                                                                <span className="font-medium group-hover:translate-x-1 transition-transform">
                                                                    {item.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {!sidebarCollapsed && (
                                                            <div className="flex items-center space-x-2">
                                                                {item.active && <span className="w-2 h-2 bg-white rounded-full"></span>}
                                                                {dashboardExpanded ? (
                                                                    <ChevronDown className="w-4 h-4" />
                                                                ) : (
                                                                    <ChevronRight className="w-4 h-4" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {!sidebarCollapsed && dashboardExpanded && item.submenu && (
                                                        <div className="ml-6 mt-2 space-y-1">
                                                            {item.submenu.map((subItem, subIndex) => {
                                                                const SubIconComponent = subItem.icon;
                                                                return subItem.hasLink ? (
                                                                    <Link
                                                                        key={subIndex}
                                                                        to={subItem.path}
                                                                        className="group flex items-center px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white hover:shadow-sm"
                                                                    >
                                                                        <SubIconComponent className="w-4 h-4 mr-3 text-blue-100 group-hover:text-white" />
                                                                        <span className="font-medium text-sm group-hover:translate-x-1 transition-transform">
                                                                            {subItem.name}
                                                                        </span>
                                                                    </Link>
                                                                ) : (
                                                                    <div
                                                                        key={subIndex}
                                                                        className="group flex items-center px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm"
                                                                    >
                                                                        <SubIconComponent className="w-4 h-4 mr-3" />
                                                                        <span className="font-medium text-sm group-hover:translate-x-1 transition-transform">
                                                                            {subItem.name}
                                                                        </span>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : item.hasLink ? (
                                                <Link
                                                    to={item.path}
                                                    className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-md ${item.active
                                                        ? "bg-gradient-to-r from-blue-600 to-purple-500 text-white shadow-lg"
                                                        : "text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white"
                                                        }`}
                                                >
                                                    <IconComponent className={`w-5 h-5 mr-4 ${item.active ? 'text-white' : 'text-blue-100 group-hover:text-white'}`} />
                                                    {!sidebarCollapsed && (
                                                        <span className="font-medium group-hover:translate-x-1 transition-transform">
                                                            {item.name}
                                                        </span>
                                                    )}
                                                    {item.active && !sidebarCollapsed && (
                                                        <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
                                                    )}
                                                </Link>
                                            ) : (
                                                <div
                                                    className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer hover:shadow-md ${item.active
                                                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                                                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                                        }`}
                                                >
                                                    <IconComponent className="w-5 h-5 mr-4" />
                                                    {!sidebarCollapsed && (
                                                        <span className="font-medium group-hover:translate-x-1 transition-transform">
                                                            {item.name}
                                                        </span>
                                                    )}
                                                    {item.active && !sidebarCollapsed && (
                                                        <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>

                        {!sidebarCollapsed && (
                            <div className="p-4 border-t border-gray-100">
                                <div className="userinfo-card bg-white rounded-xl shadow-xl p-4 flex flex-col gap-3" style={{ width: 250 }}>
                                    {currentPage === "main" ? (
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="user-details">
                                                    <p className="font-semibold text-gray-800 leading-tight">{username}</p>
                                                    <p className="text-sm text-gray-500 leading-tight">
                                                        {userRole === 'MANAGER' ? 'Quản lý' : 'Nhân viên'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                className="p-2 rounded-full hover:bg-blue-100 transition text-blue-700"
                                                onClick={() => setCurrentPage("settings")}
                                                aria-label="Cài đặt"
                                            >
                                                <Settings className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3 w-full">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="user-details">
                                                    <p className="font-semibold text-gray-800 leading-tight">{username}</p>
                                                    <p className="text-sm text-gray-500 leading-tight">
                                                        {userRole === 'MANAGER' ? 'Quản lý' : 'Nhân viên'}
                                                    </p>
                                                </div>
                                            </div>
                                            <NavLink
                                                to="/profile/main"
                                                className={({ isActive }) =>
                                                    `w-full block text-center px-4 py-2 rounded-lg font-semibold transition mt-2 ${isActive
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                    }`
                                                }
                                            >
                                                Thông tin cá nhân
                                            </NavLink>
                                            <button
                                                className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transition"
                                                onClick={handleLogout}
                                            >
                                                Đăng xuất
                                            </button>
                                            <button
                                                className="mt-2 text-xs text-blue-600 hover:underline font-semibold"
                                                onClick={() => setCurrentPage("main")}
                                            >
                                                Quay lại
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Header */}
                    <header className="bg-[#0d47a1] shadow-sm border-b border-blue-900 px-8 py-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Thông Tin Nhân Viên</h1>
                                <nav className="flex items-center space-x-2 text-sm">
                                    <Link to="/" className="text-blue-200 hover:text-white font-medium transition-colors">
                                        Trang Chủ
                                    </Link>
                                </nav>
                            </div>
                            <div className="flex items-center space-x-6">
                                <div className="text-right">
                                    <p className="text-sm text-blue-100">Ngày hôm nay</p>
                                    <p className="font-semibold text-white">
                                        {new Date().toLocaleDateString("vi-VN", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div className="w-px h-8 bg-blue-200"></div>
                                <button className="p-2 rounded-lg bg-blue-800 text-white hover:bg-blue-700 transition-colors">
                                    <Bell className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </header>
                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-8">
                        {/* Alert Messages */}
                        {message && (
                            <div
                                className={`mb-8 p-4 rounded-xl border-l-4 shadow-sm animate-pulse ${messageType === "success"
                                    ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                                    : "bg-red-50 border-red-400 text-red-800"
                                    }`}
                            >
                                <div className="flex items-center">
                                    <div className="mr-3">
                                        {messageType === "success" ? (
                                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                                        ) : (
                                            <AlertCircle className="w-6 h-6 text-red-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{messageType === "success" ? "Thành công!" : "Có lỗi xảy ra!"}</h4>
                                        <p className="mt-1">{message}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-10">
                            {/* Thống kê Staff */}
                            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 flex flex-col items-center justify-center min-h-[320px]">
                                <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                                    <PieChart className="w-10 h-10 text-blue-600" />
                                    Thống Kê Staff
                                </h3>
                                <div className="flex flex-col md:flex-row gap-8 w-full justify-center items-center">
                                    {[
                                        { label: "Đơn Hoàn Tất", value: stats.newReceipts, color: "blue", icon: Receipt },
                                        { label: "Đơn Hàng Chờ", value: stats.pendingOrders, color: "amber", icon: ShoppingCart },
                                        { label: "Khách Hàng Mới", value: stats.newCustomers, color: "emerald", icon: UserPlus },
                                    ].map((stat, index) => {
                                        const IconComponent = stat.icon;
                                        return (
                                            <div
                                                key={index}
                                                className={`flex flex-col items-center justify-center p-8 rounded-2xl shadow-lg min-w-[180px] min-h-[140px] transition-all duration-300 cursor-pointer select-none
                                    ${stat.color === "blue" ? "bg-blue-50 border border-blue-200" : stat.color === "amber" ? "bg-amber-50 border border-amber-200" : stat.color === "emerald" ? "bg-emerald-50 border border-emerald-200" : "bg-purple-50 border border-purple-200"}
                                hover:scale-105 hover:shadow-2xl active:scale-95`}
                                                tabIndex={0}
                                                aria-label={stat.label}
                                            >
                                                <IconComponent className={`w-12 h-12 mb-3 ${stat.color === "blue" ? "text-blue-600" : stat.color === "amber" ? "text-amber-600" : stat.color === "emerald" ? "text-emerald-600" : "text-purple-600"}`} />
                                                <p className="text-lg font-semibold mb-1">{stat.label}</p>
                                                <p className="text-3xl font-extrabold">{stat.value}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            {/* Hoạt động gần đây */}
                            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 flex flex-col min-h-[320px]">
                                <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                                    <Activity className="w-10 h-10 text-green-600" />
                                    Hoạt Động Gần Đây
                                </h3>
                                <div className="space-y-6">
                                    {activities.length > 0 ? (
                                        activities.map((activity, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between border-b border-gray-100 pb-4 transition-all duration-300 cursor-pointer select-none hover:scale-105 hover:shadow-lg active:scale-95"
                                                tabIndex={0}
                                                aria-label={activity.action}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                                    <p className="text-lg text-gray-700 font-medium">{activity.action}</p>
                                                </div>
                                                <p className="text-base text-gray-500 font-semibold">{activity.timeAgo}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-lg">Không có hoạt động gần đây</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Banner chào mừng chuyên nghiệp */}
                        <div className="w-full bg-gradient-to-r from-blue-700 via-blue-500 to-emerald-400 rounded-3xl shadow-2xl flex flex-col items-center justify-center py-16 px-8 mb-10 animate-in fade-in duration-700">
                            <div className="flex flex-col items-center">
                                <span className="text-7xl mb-4 animate-bounce">🌞</span>
                                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg text-center">Chào mừng bạn đến với hệ thống quản lý nhân viên</h2>
                                <p className="text-xl md:text-2xl text-white font-medium mb-2 drop-shadow text-center max-w-2xl">Chúc bạn một ngày làm việc hiệu quả, nhiều năng lượng tích cực và luôn đạt thành công mới trong công việc! Hãy cùng nhau tạo nên giá trị và phát triển bền vững. </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </RequireAuth>
    )
}

export default Staff