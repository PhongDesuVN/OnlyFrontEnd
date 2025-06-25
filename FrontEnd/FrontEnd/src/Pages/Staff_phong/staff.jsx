"use client"
import RequireAuth from "../../Components/RequireAuth";
import { useState, useRef, useEffect } from "react"
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
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import Cookies from "js-cookie"

// Component chính quản lý thông tin chức vụ
const Staff = () => {
    // ==================== STATES ====================
    // State lưu thông tin chức vụ
    const [staff, setStaff] = useState({
        tenChucVu: "",
        tenChucVuPhu: "",
        moTa: "",
        luongCoBan: "",
        trangThai: "active",
    })

    // State quản lý trạng thái loading và thông báo
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState("")
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [dashboardExpanded, setDashboardExpanded] = useState(true)
    const [currentPage, setCurrentPage] = useState('main')
    const username = Cookies.get("username") || "Staff User"
    const navigate = useNavigate()

    useEffect(() => {
        const token = Cookies.get("authToken");
        if (!token) {
            // Nếu không có token thì chuyển về trang login
            navigate("/login", { replace: true });
        }
    }, [navigate]);

    // ==================== FUNCTIONS ====================
    // Hàm xử lý thay đổi giá trị input
    const handleChange = (e) => {
        const { name, value } = e.target
        setStaff((prevState) => ({
            ...prevState,
            [name]: value,
        }))
        // Xóa thông báo khi user bắt đầu nhập lại
        if (message) {
            setMessage("")
            setMessageType("")
        }
    }

    // Hàm validate dữ liệu form
    const validateForm = () => {
        if (!staff.tenChucVu.trim()) {
            setMessage("Vui lòng nhập tên chức vụ")
            setMessageType("error")
            return false
        }
        if (!staff.luongCoBan.trim()) {
            setMessage("Vui lòng nhập lương cơ bản")
            setMessageType("error")
            return false
        }
        if (isNaN(staff.luongCoBan) || Number.parseFloat(staff.luongCoBan) <= 0) {
            setMessage("Lương cơ bản phải là số dương")
            setMessageType("error")
            return false
        }
        return true
    }

    // Hàm xử lý submit form
    const handleSubmit = async () => {
        if (!validateForm()) return

        setIsLoading(true)

        try {
            // Giả lập gửi dữ liệu lên server
            await new Promise((resolve) => setTimeout(resolve, 2000))

            console.log("Thông tin chức vụ:", staff)

            setMessage("Thêm chức vụ thành công!")
            setMessageType("success")

            // Reset form
            setStaff({
                tenChucVu: "",
                tenChucVuPhu: "",
                moTa: "",
                luongCoBan: "",
                trangThai: "active",
            })
        } catch (error) {
            setMessage("Có lỗi xảy ra. Vui lòng thử lại!")
            setMessageType("error")
        } finally {
            setIsLoading(false)
        }
    }

    // Hàm xử lý quay lại
    const handleGoBack = () => {
        if (window.confirm("Bạn có chắc muốn quay lại? Dữ liệu chưa lưu sẽ bị mất.")) {
            window.history.back()
        }
    }

    // Hàm format số tiền
    const formatCurrency = (value) => {
        if (!value) return ""
        const number = Number.parseFloat(value)
        if (isNaN(number)) return ""
        return new Intl.NumberFormat("vi-VN").format(number) + " VNĐ"
    }

    // Dữ liệu menu - cập nhật với icon Lucide React
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
        { name: 'Quản Lý Biên Lai', icon: Receipt, path: '/receipts', hasLink: true },
        { name: 'Quản Lý Đơn Vị Lưu Trữ', icon: Package, hasLink: true, path: '/storage-units' },
        { name: "Quản Lý Đơn Vị Vận Chuyển", icon: Truck, hasLink: false },
        { name: "Quản Lý Đơn Hàng", icon: ShoppingCart, path: "/manageorder", hasLink: true },
        { name: "Quản Lý Khách Hàng", icon: Users, hasLink: false },
        { name: "Hỗ Trợ Khách Hàng", icon: Headphones, hasLink: false },
        { name: "Báo Cáo", icon: TrendingUp, hasLink: false },
        { name: "Cài Đặt", icon: Settings, hasLink: false },
    ]

    const handleLogout = async () => {
        // Xóa cookies trước
        Cookies.remove("authToken");
        Cookies.remove("userRole");
        Cookies.remove("username");
        try {
            await fetch("http://localhost:8083/api/auth/logout", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${Cookies.get("authToken")}`,
                },
                credentials: "include",
            });
        } catch (e) {}
        window.location.href = "/login";
    };

    // ==================== RENDER ====================
    return (
        <RequireAuth>
            <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                {/* ==================== SIDEBAR ==================== */}
                <aside
                    className={`${sidebarCollapsed ? "w-20" : "w-72"} bg-white shadow-2xl transition-all duration-300 ease-in-out border-r border-gray-200`}
                >
                    <div className="h-full flex flex-col">
                        {/* Logo Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <Truck className="w-8 h-8 text-blue-600" />
                                    </div>
                                    {!sidebarCollapsed && (
                                        <div>
                                            <h2 className="text-1.5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                Vận Chuyển Nhà
                                            </h2>
                                            <p className="text-1xl text-gray-500">Staff Management</p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    {sidebarCollapsed ? (
                                        <ArrowRight className="w-4 h-4 text-gray-600" />
                                    ) : (
                                        <ArrowLeft className="w-4 h-4 text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="flex-1 p-4 overflow-y-auto">
                            <ul className="space-y-2">
                                {menuItems.map((item, index) => {
                                    const IconComponent = item.icon
                                    return (
                                        <li key={index}>
                                            {/* Menu chính */}
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

                                                    {/* Submenu */}
                                                    {!sidebarCollapsed && dashboardExpanded && item.submenu && (
                                                        <div className="ml-6 mt-2 space-y-1">
                                                            {item.submenu.map((subItem, subIndex) => {
                                                                const SubIconComponent = subItem.icon
                                                                return subItem.hasLink ? (
                                                                    <Link
                                                                        key={subIndex}
                                                                        to={subItem.path}
                                                                        className="group flex items-center px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm"
                                                                    >
                                                                        <SubIconComponent className="w-4 h-4 mr-3" />
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
                                            ) : // Menu thường
                                                item.hasLink ? (
                                                    <Link
                                                        to={item.path}
                                                        className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-md ${item.active
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
                                    )
                                })}
                            </ul>
                        </nav>

                        {/* User Profile */}
                        {!sidebarCollapsed && (
                            <div className="p-4 border-t border-gray-100">
                                <div className="userinfo-card bg-white rounded-xl shadow-xl p-4 flex flex-col gap-3" style={{ width: 250 }}>
                                    {currentPage === 'main' ? (
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="user-details">
                                                    <p className="font-semibold text-gray-800 leading-tight">{username}</p>
                                                    <p className="text-sm text-gray-500 leading-tight">Nhân viên</p>
                                                </div>
                                            </div>
                                            <button
                                                className="p-2 rounded-full hover:bg-gray-100 transition"
                                                onClick={() => setCurrentPage('settings')}
                                                aria-label="Cài đặt"
                                            >
                                                <Settings className="w-5 h-5 text-gray-400" />
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
                                                    <p className="text-sm text-gray-500 leading-tight">Nhân viên</p>
                                                </div>
                                            </div>
                                            <button
                                                className="w-full px-4 py-2 rounded-lg bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100 transition mt-2"
                                                onClick={() => { setCurrentPage('main'); navigate('/profile') }}
                                            >
                                                Xem thông tin cá nhân
                                            </button>
                                            <button
                                                className="w-full px-4 py-2 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition"
                                                onClick={handleLogout}
                                            >
                                                Đăng xuất
                                            </button>
                                            <button
                                                className="mt-2 text-xs text-gray-400 hover:underline"
                                                onClick={() => setCurrentPage('main')}
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

                {/* ==================== MAIN CONTENT ==================== */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Header */}
                    <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Bảng Điều Khiển Staff</h1>
                                <nav className="flex items-center space-x-2 text-sm">
                                    <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                                        Trang Chủ
                                    </Link>
                                </nav>
                            </div>

                            <div className="flex items-center space-x-6">
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Ngày hôm nay</p>
                                    <p className="font-semibold text-gray-800">
                                        {new Date().toLocaleDateString("vi-VN", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div className="w-px h-8 bg-gray-300"></div>
                                <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
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

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            {/* Main Form */}
                            <div className="xl:col-span-2">
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                    {/* Form Header */}
                                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-8">
                                        <div className="flex items-center">
                                            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mr-6 backdrop-blur-sm">
                                                <Briefcase className="w-8 h-8 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold mb-2">Thêm Chức Vụ Mới</h2>
                                                <p className="text-blue-100">Điền thông tin chi tiết để thêm chức vụ mới vào hệ thống</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Body */}
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Tên Chức Vụ */}
                                            <div className="space-y-3">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Tên Chức Vụ <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="tenChucVu"
                                                    value={staff.tenChucVu}
                                                    onChange={handleChange}
                                                    placeholder="Ví dụ: Trưởng phòng, Nhân viên..."
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                                                    disabled={isLoading}
                                                />
                                            </div>

                                            {/* Tên chức vụ phụ */}
                                            <div className="space-y-3">
                                                <label className="block text-sm font-semibold text-gray-700">Tên Chức Vụ Phụ</label>
                                                <input
                                                    type="text"
                                                    name="tenChucVuPhu"
                                                    value={staff.tenChucVuPhu}
                                                    onChange={handleChange}
                                                    placeholder="Tên gọi khác (tùy chọn)"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                                                    disabled={isLoading}
                                                />
                                            </div>

                                            {/* Lương cơ bản */}
                                            <div className="space-y-3">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Lương Cơ Bản <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        name="luongCoBan"
                                                        value={staff.luongCoBan}
                                                        onChange={handleChange}
                                                        placeholder="0"
                                                        min="0"
                                                        className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                                                        disabled={isLoading}
                                                    />
                                                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold bg-gray-100 px-2 py-1 rounded-md text-xs">
                                                        VNĐ
                                                    </span>
                                                </div>
                                                {staff.luongCoBan && (
                                                    <p className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg flex items-center">
                                                        <DollarSign className="w-4 h-4 mr-2" />
                                                        {formatCurrency(staff.luongCoBan)}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Trạng thái */}
                                            <div className="space-y-3">
                                                <label className="block text-sm font-semibold text-gray-700">Trạng Thái</label>
                                                <select
                                                    name="trangThai"
                                                    value={staff.trangThai}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 bg-gray-50 focus:bg-white"
                                                    disabled={isLoading}
                                                >
                                                    <option value="active">🟢 Đang hoạt động</option>
                                                    <option value="inactive">🔴 Tạm ngưng</option>
                                                </select>
                                            </div>

                                            {/* Mô tả */}
                                            <div className="md:col-span-2 space-y-3">
                                                <label className="block text-sm font-semibold text-gray-700">Mô Tả Công Việc</label>
                                                <textarea
                                                    name="moTa"
                                                    value={staff.moTa}
                                                    onChange={handleChange}
                                                    placeholder="Mô tả chi tiết về nhiệm vụ, trách nhiệm của chức vụ này..."
                                                    rows="4"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 resize-none bg-gray-50 focus:bg-white"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>

                                        {/* Form Actions */}
                                        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={handleGoBack}
                                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center"
                                                disabled={isLoading}
                                            >
                                                <ChevronLeft className="w-4 h-4 mr-2" />
                                                Quay Lại
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleSubmit}
                                                className={`px-8 py-3 font-semibold rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 ${isLoading
                                                    ? "bg-gray-400 cursor-not-allowed"
                                                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg"
                                                    } text-white flex items-center`}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-5 h-5 mr-2" />
                                                        Thêm Chức Vụ
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Stats */}
                            <div className="space-y-6">
                                {/* Quick Stats */}
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                        <PieChart className="w-5 h-5 mr-2" />
                                        Thống Kê Staff
                                    </h3>

                                    <div className="space-y-4">
                                        {[
                                            { label: "Biên Lai Mới", value: "12", color: "blue", icon: Receipt },
                                            { label: "Đơn Hàng Chờ", value: "8", color: "amber", icon: ShoppingCart },
                                            { label: "Khách Hàng Mới", value: "24", color: "emerald", icon: UserPlus },
                                            { label: "Hỗ Trợ Chờ", value: "3", color: "purple", icon: MessageCircle },
                                        ].map((stat, index) => {
                                            const IconComponent = stat.icon
                                            return (
                                                <div
                                                    key={index}
                                                    className={`p-4 rounded-xl hover:shadow-md transition-shadow ${stat.color === "blue"
                                                        ? "bg-blue-50 border border-blue-100"
                                                        : stat.color === "amber"
                                                            ? "bg-amber-50 border border-amber-100"
                                                            : stat.color === "emerald"
                                                                ? "bg-emerald-50 border border-emerald-100"
                                                                : "bg-purple-50 border border-purple-100"
                                                            }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p
                                                                className={`text-sm font-medium ${stat.color === "blue"
                                                                    ? "text-blue-600"
                                                                    : stat.color === "amber"
                                                                        ? "text-amber-600"
                                                                        : stat.color === "emerald"
                                                                            ? "text-emerald-600"
                                                                            : "text-purple-600"
                                                                    }`}
                                                            >
                                                                {stat.label}
                                                            </p>
                                                            <p
                                                                className={`text-2xl font-bold ${stat.color === "blue"
                                                                    ? "text-blue-700"
                                                                    : stat.color === "amber"
                                                                        ? "text-amber-700"
                                                                        : stat.color === "emerald"
                                                                            ? "text-emerald-700"
                                                                            : "text-purple-700"
                                                                    }`}
                                                            >
                                                                {stat.value}
                                                            </p>
                                                        </div>
                                                        <div
                                                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color === "blue"
                                                                ? "bg-blue-100"
                                                                : stat.color === "amber"
                                                                    ? "bg-amber-100"
                                                                    : stat.color === "emerald"
                                                                        ? "bg-emerald-100"
                                                                        : "bg-purple-100"
                                                                }`}
                                                        >
                                                            <IconComponent
                                                                className={`w-6 h-6 ${stat.color === "blue"
                                                                    ? "text-blue-600"
                                                                    : stat.color === "amber"
                                                                        ? "text-amber-600"
                                                                        : stat.color === "emerald"
                                                                            ? "text-emerald-600"
                                                                            : "text-purple-600"
                                                                    }`}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                        <Activity className="w-5 h-5 mr-2" />
                                        Hoạt Động Gần Đây
                                    </h3>

                                    <div className="space-y-4">
                                        {[
                                            { action: "Xử lý biên lai #1234", time: "2 phút trước" },
                                            { action: "Cập nhật đơn hàng KH001", time: "15 phút trước" },
                                            { action: "Phản hồi hỗ trợ khách hàng", time: "30 phút trước" },
                                            { action: "Thêm khách hàng mới", time: "1 giờ trước" },
                                        ].map((activity, index) => (
                                            <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3">
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                                    <p className="text-gray-700">{activity.action}</p>
                                                </div>
                                                <p className="text-xs text-gray-500">{activity.time}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </RequireAuth>
    )
}

export default Staff

