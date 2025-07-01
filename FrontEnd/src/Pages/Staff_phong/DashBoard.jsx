"use client"

import { useState } from "react"
import Cookies from "js-cookie"
import { useNavigate } from "react-router-dom"
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    Target,
    BarChart3,
    RefreshCw,
    Medal,
    Award,
    Crown,
    Truck
} from "lucide-react"
import { Link } from "react-router-dom"

// Header Component
const Header = () => {
    return (
        <header className="fixed w-full top-0 bg-white shadow-lg z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Truck className="w-8 h-8 text-blue-600" />
                        <h1 className="text-xl font-bold text-black">Vận Chuyển Nhà</h1>
                    </div>

                    <div className="flex space-x-3">
                        <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                            <Link to="/" className="text-black hover:text-blue-600 transition-colors">Trang Chủ</Link>
                        </button>

                    </div>
                </div>
            </div>
        </header>
    );
};

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("performance")
    const [selectedYear, setSelectedYear] = useState("2024")
    const [selectedUnit, setSelectedUnit] = useState("Tất cả")
    const [selectedPeriod, setSelectedPeriod] = useState("month")
    const [selectedMetric, setSelectedMetric] = useState("revenue")

    const [hoveredCard, setHoveredCard] = useState(null)
    const [pressedButton, setPressedButton] = useState(null)
    const [showMenu, setShowMenu] = useState(false)
    const navigate = useNavigate()

    // Lấy username từ cookies
    const username = Cookies.get("username") || "Staff User"

    // Dữ liệu mẫu cho biểu đồ hiệu suất
    const monthlyRevenue = [
        { month: "6/2023", chuyenNha24H: 152300001, dvChuyenNhaSaiGon: 127800000, chuyenNhaMinhAnh: 189200001 },
        { month: "7/2023", chuyenNha24H: 168400001, dvChuyenNhaSaiGon: 139600001, chuyenNhaMinhAnh: 197800001 },
        { month: "8/2023", chuyenNha24H: 174500000, dvChuyenNhaSaiGon: 128900001, chuyenNhaMinhAnh: 203100000 },
        { month: "1/2024", chuyenNha24H: 180000000, dvChuyenNhaSaiGon: 135000000, chuyenNhaMinhAnh: 210000000 },
        { month: "1/2025", chuyenNha24H: 185000000, dvChuyenNhaSaiGon: 140000000, chuyenNhaMinhAnh: 215000000 },
    ]

    const performanceData = [
        { month: "6/2023", dungHan: 328, huy: 18, tre: 23 },
        { month: "7/2023", dungHan: 355, huy: 16, tre: 29 },
        { month: "8/2023", dungHan: 367, huy: 18, tre: 30 },
        { month: "1/2024", dungHan: 370, huy: 15, tre: 25 },
        { month: "1/2025", dungHan: 380, huy: 12, tre: 28 },
    ]

    const detailData = [
        {
            month: "6/2023",
            unit: "Chuyển Nhà 24H",
            trips: 120,
            revenue: "152.300.001 đ",
            onTime: 108,
            cancelled: 5,
            late: 7,
        },
        {
            month: "6/2023",
            unit: "DV Chuyển Nhà Sài Gòn",
            trips: 95,
            revenue: "127.800.000 đ",
            onTime: 85,
            cancelled: 3,
            late: 7,
        },
        {
            month: "6/2023",
            unit: "Chuyển Nhà Minh Anh",
            trips: 150,
            revenue: "189.200.001 đ",
            onTime: 135,
            cancelled: 6,
            late: 9,
        },
        {
            month: "7/2023",
            unit: "Chuyển Nhà 24H",
            trips: 130,
            revenue: "168.400.001 đ",
            onTime: 115,
            cancelled: 4,
            late: 11,
        },
        {
            month: "7/2023",
            unit: "DV Chuyển Nhà Sài Gòn",
            trips: 110,
            revenue: "139.600.001 đ",
            onTime: 98,
            cancelled: 5,
            late: 7,
        },
        {
            month: "7/2023",
            unit: "Chuyển Nhà Minh Anh",
            trips: 160,
            revenue: "197.800.001 đ",
            onTime: 142,
            cancelled: 7,
            late: 11,
        },
    ]

    // Dữ liệu xếp hạng mẫu
    const rankingData = [
        {
            rank: 1,
            name: username,
            unit: "Chuyển Nhà Minh Anh",
            revenue: "245.800.000 đ",
            trips: 156,
            successRate: 94.2,
            change: "+12%",
            trend: "up",
            avatar: username
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
        },
        {
            rank: 2,
            name: "Trần Thị Bình",
            unit: "Chuyển Nhà 24H",
            revenue: "238.500.000 đ",
            trips: 142,
            successRate: 91.8,
            change: "+8%",
            trend: "up",
            avatar: "TB",
        },
        {
            rank: 3,
            name: "Lê Văn Cường",
            unit: "DV Chuyển Nhà Sài Gòn",
            revenue: "225.300.000 đ",
            trips: 138,
            successRate: 89.5,
            change: "+5%",
            trend: "up",
            avatar: "LC",
        },
        {
            rank: 4,
            name: "Phạm Thị Dung",
            unit: "Chuyển Nhà Minh Anh",
            revenue: "218.700.000 đ",
            trips: 134,
            successRate: 87.3,
            change: "-2%",
            trend: "down",
            avatar: "PD",
        },
        {
            rank: 5,
            name: "Hoàng Văn Em",
            unit: "Chuyển Nhà 24H",
            revenue: "212.400.000 đ",
            trips: 129,
            successRate: 85.7,
            change: "+3%",
            trend: "up",
            avatar: "HE",
        },
    ]

    const teamRanking = [
        {
            rank: 1,
            name: "Chuyển Nhà Minh Anh",
            totalRevenue: "1.245.800.000 đ",
            totalTrips: 456,
            avgSuccessRate: 91.2,
            members: 12,
            change: "+15%",
            trend: "up",
        },
        {
            rank: 2,
            name: "Chuyển Nhà 24H",
            totalRevenue: "1.138.500.000 đ",
            totalTrips: 398,
            avgSuccessRate: 88.8,
            members: 10,
            change: "+8%",
            trend: "up",
        },
        {
            rank: 3,
            name: "DV Chuyển Nhà Sài Gòn",
            totalRevenue: "925.300.000 đ",
            totalTrips: 342,
            avgSuccessRate: 86.5,
            members: 8,
            change: "+2%",
            trend: "up",
        },
    ]

    // Dữ liệu tổng hợp
    const transportData = {
        totalShipments: 2025,
        revenue: 2513800009,
        deliveryRate: 88.6,
        totalVolume: 127107.3,
        shipmentGrowth: 15,
        revenueGrowth: 8,
        deliveryRateGrowth: 2,
        volumeGrowth: 12,
    }

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Crown className="w-6 h-6 text-yellow-500" />
            case 2:
                return <Medal className="w-6 h-6 text-gray-400" />
            case 3:
                return <Award className="w-6 h-6 text-orange-500" />
            default:
                return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</span>
        }
    }

    const getRankBadgeClass = (rank) => {
        switch (rank) {
            case 1:
                return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
            case 2:
                return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
            case 3:
                return "bg-gradient-to-r from-orange-400 to-orange-600 text-white"
            default:
                return "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
        }
    }

    const handleButtonPress = (buttonId) => {
        setPressedButton(buttonId)
        setTimeout(() => setPressedButton(null), 150)
    }


    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 p-8 pt-24">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Tabs with enhanced animations */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white rounded-lg shadow-md p-1 flex transform transition-all duration-300 hover:shadow-lg hover:scale-105">
                            <button
                                onClick={() => {
                                    setActiveTab("performance")
                                    handleButtonPress("performance-tab")
                                }}
                                className={`px-6 py-2 rounded-md transition-all duration-300 transform ${activeTab === "performance"
                                    ? "bg-blue-600 text-white shadow-lg scale-105"
                                    : "bg-transparent text-gray-600 hover:bg-gray-100 hover:scale-102"
                                    } ${pressedButton === "performance-tab" ? "scale-95" : ""}`}
                            >
                                Hiệu suất Vận chuyển
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab("ranking")
                                    handleButtonPress("ranking-tab")
                                }}
                                className={`px-6 py-2 rounded-md transition-all duration-300 transform ${activeTab === "ranking"
                                    ? "bg-blue-600 text-white shadow-lg scale-105"
                                    : "bg-transparent text-gray-600 hover:bg-gray-100 hover:scale-102"
                                    } ${pressedButton === "ranking-tab" ? "scale-95" : ""}`}
                            >
                                Xếp Hạng Hiệu Suất
                            </button>
                        </div>
                    </div>

                    {activeTab === "performance" ? (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Header with animation */}
                            <div className="text-center space-y-4 animate-in slide-in-from-top duration-700">
                                <h1 className="text-4xl font-bold text-gray-900 transform transition-all duration-300 hover:scale-105">
                                    Báo cáo Hiệu suất Vận chuyển
                                </h1>
                                <p className="text-lg text-gray-600">Tổng quan hoạt động vận chuyển từ 2023 - 2025</p>

                                {/* Filters with enhanced animations */}
                                <div className="flex items-center justify-center gap-4 mt-6">
                                    <div className="flex items-center gap-2 transform transition-all duration-300 hover:scale-105">
                                        <span className="text-sm font-medium text-gray-700">Năm:</span>
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-md focus:scale-105"
                                        >
                                            <option value="2023">2023</option>
                                            <option value="2024">2024</option>
                                            <option value="2025">2025</option>
                                            <option value="Tất cả">Tất cả</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2 transform transition-all duration-300 hover:scale-105">
                                        <span className="text-sm font-medium text-gray-700">Đơn vị:</span>
                                        <select
                                            value={selectedUnit}
                                            onChange={(e) => setSelectedUnit(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-md focus:scale-105"
                                        >
                                            <option value="Tất cả">Tất cả</option>
                                            <option value="Chuyển Nhà 24H">Chuyển Nhà 24H</option>
                                            <option value="DV Chuyển Nhà Sài Gòn">DV Chuyển Nhà Sài Gòn</option>
                                            <option value="Chuyển Nhà Minh Anh">Chuyển Nhà Minh Anh</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => handleButtonPress("refresh")}
                                        className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 ${pressedButton === "refresh" ? "scale-95 bg-blue-800" : ""
                                            }`}
                                    >
                                        <RefreshCw
                                            className={`w-4 h-4 transition-transform duration-300 ${pressedButton === "refresh" ? "rotate-180" : ""}`}
                                        />
                                        Cập nhật
                                    </button>
                                </div>
                            </div>

                            {/* Stats Cards with enhanced hover effects */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    {
                                        id: "shipments",
                                        title: "Tổng số chuyến hàng",
                                        value: transportData.totalShipments,
                                        growth: transportData.shipmentGrowth,
                                        icon: Package,
                                        gradient: "from-purple-500 to-purple-600",
                                        iconColor: "text-purple-200",
                                    },
                                    {
                                        id: "revenue",
                                        title: "Tổng doanh thu",
                                        value: "2.513.800.009 đ",
                                        growth: transportData.revenueGrowth,
                                        icon: DollarSign,
                                        gradient: "from-pink-500 to-pink-600",
                                        iconColor: "text-pink-200",
                                    },
                                    {
                                        id: "delivery",
                                        title: "Tỷ lệ giao đúng hạn",
                                        value: `${transportData.deliveryRate}%`,
                                        growth: transportData.deliveryRateGrowth,
                                        icon: Target,
                                        gradient: "from-cyan-500 to-cyan-600",
                                        iconColor: "text-cyan-200",
                                    },
                                    {
                                        id: "volume",
                                        title: "Tổng khối lượng",
                                        value: `${transportData.totalVolume} tấn`,
                                        growth: transportData.volumeGrowth,
                                        icon: TrendingUp,
                                        gradient: "from-emerald-500 to-emerald-600",
                                        iconColor: "text-emerald-200",
                                    },
                                ].map((card) => (
                                    <div
                                        key={card.id}
                                        onMouseEnter={() => setHoveredCard(card.id)}
                                        onMouseLeave={() => setHoveredCard(null)}
                                        className={`bg-gradient-to-br ${card.gradient} text-white border-0 shadow-xl rounded-lg transform transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:-translate-y-2 cursor-pointer ${hoveredCard === card.id ? "animate-pulse" : ""
                                            }`}
                                    >
                                        <div className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="transform transition-all duration-300">
                                                    <p className="text-white text-opacity-90 text-sm font-medium">{card.title}</p>
                                                    <p
                                                        className={`text-3xl font-bold mt-2 transition-all duration-300 ${hoveredCard === card.id ? "scale-110" : ""
                                                            }`}
                                                    >
                                                        {card.value}
                                                    </p>
                                                    <p className="text-white text-opacity-90 text-sm mt-1">+{card.growth}% so với tháng trước</p>
                                                </div>
                                                <card.icon
                                                    className={`w-12 h-12 ${card.iconColor} transform transition-all duration-500 ${hoveredCard === card.id ? "scale-125 rotate-12" : ""
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Charts Row 1 with enhanced animations */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Monthly Revenue Chart */}
                                <div className="bg-white rounded-lg shadow-xl border-0 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                                    <div className="p-6 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-blue-600 transform transition-transform duration-300 hover:rotate-12" />
                                            Doanh thu theo tháng
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {/* Legend with hover effects */}
                                            <div className="flex flex-wrap gap-4 text-sm">
                                                {[
                                                    { color: "bg-red-500", label: "Chuyển Nhà 24H" },
                                                    { color: "bg-green-500", label: "DV Chuyển Nhà Sài Gòn" },
                                                    { color: "bg-blue-500", label: "Chuyển Nhà Minh Anh" },
                                                ].map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2 transform transition-all duration-300 hover:scale-110 cursor-pointer"
                                                    >
                                                        <div className={`w-4 h-1 ${item.color} rounded transition-all duration-300 hover:w-6`}></div>
                                                        <span className="hover:font-semibold transition-all duration-300">{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Enhanced Line Chart */}
                                            <div className="h-64 bg-gray-50 rounded-lg relative p-4 overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-50"></div>
                                                <svg className="w-full h-full relative z-10" viewBox="0 0 400 200">
                                                    {/* Animated grid lines */}
                                                    <defs>
                                                        <pattern id="animated-grid" width="40" height="20" patternUnits="userSpaceOnUse">
                                                            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" opacity="0.5" />
                                                        </pattern>
                                                        <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                                                            <stop offset="100%" stopColor="#dc2626" stopOpacity="1" />
                                                        </linearGradient>
                                                        <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                                                            <stop offset="100%" stopColor="#16a34a" stopOpacity="1" />
                                                        </linearGradient>
                                                        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                                                            <stop offset="100%" stopColor="#2563eb" stopOpacity="1" />
                                                        </linearGradient>
                                                    </defs>
                                                    <rect width="100%" height="100%" fill="url(#animated-grid)" />

                                                    {/* Enhanced lines with gradients */}
                                                    <polyline
                                                        fill="none"
                                                        stroke="url(#redGradient)"
                                                        strokeWidth="3"
                                                        points="40,120 120,100 200,95 280,85 360,80"
                                                        className="animate-in draw-in duration-1000"
                                                    />
                                                    <polyline
                                                        fill="none"
                                                        stroke="url(#greenGradient)"
                                                        strokeWidth="3"
                                                        points="40,140 120,125 200,135 280,130 360,125"
                                                        className="animate-in draw-in duration-1000 delay-300"
                                                    />
                                                    <polyline
                                                        fill="none"
                                                        stroke="url(#blueGradient)"
                                                        strokeWidth="3"
                                                        points="40,90 120,85 200,80 280,75 360,70"
                                                        className="animate-in draw-in duration-1000 delay-600"
                                                    />

                                                    {/* Animated data points */}
                                                    {[40, 120, 200, 280, 360].map((x, i) => (
                                                        <g key={i}>
                                                            <circle
                                                                cx={x}
                                                                cy={120 - i * 10}
                                                                r="4"
                                                                fill="#ef4444"
                                                                className="animate-in zoom-in duration-500"
                                                                style={{ animationDelay: `${i * 200 + 1000}ms` }}
                                                            />
                                                            <circle
                                                                cx={x}
                                                                cy={140 - i * 3}
                                                                r="4"
                                                                fill="#22c55e"
                                                                className="animate-in zoom-in duration-500"
                                                                style={{ animationDelay: `${i * 200 + 1300}ms` }}
                                                            />
                                                            <circle
                                                                cx={x}
                                                                cy={90 - i * 5}
                                                                r="4"
                                                                fill="#3b82f6"
                                                                className="animate-in zoom-in duration-500"
                                                                style={{ animationDelay: `${i * 200 + 1600}ms` }}
                                                            />
                                                        </g>
                                                    ))}
                                                </svg>

                                                {/* X-axis labels */}
                                                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-gray-600">
                                                    {monthlyRevenue.map((data, index) => (
                                                        <span
                                                            key={index}
                                                            className="transform transition-all duration-300 hover:scale-110 hover:font-semibold cursor-pointer"
                                                        >
                                                            {data.month}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Chart with enhanced animations */}
                                <div className="bg-white rounded-lg shadow-xl border-0 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                                    <div className="p-6 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-green-600 transform transition-transform duration-300 hover:rotate-12" />
                                            Hiệu suất giao hàng
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {/* Legend with enhanced hover effects */}
                                            <div className="flex flex-wrap gap-4 text-sm">
                                                {[
                                                    { color: "bg-teal-400", label: "Đúng hạn" },
                                                    { color: "bg-pink-400", label: "Hủy" },
                                                    { color: "bg-yellow-400", label: "Trễ" },
                                                ].map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2 transform transition-all duration-300 hover:scale-110 cursor-pointer"
                                                    >
                                                        <div
                                                            className={`w-4 h-3 ${item.color} rounded transition-all duration-300 hover:w-6 hover:shadow-lg`}
                                                        ></div>
                                                        <span className="hover:font-semibold transition-all duration-300">{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Enhanced Bar Chart */}
                                            <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-around p-4 overflow-hidden relative">
                                                <div className="absolute inset-0 bg-gradient-to-t from-gray-100 to-transparent opacity-50"></div>
                                                {performanceData.map((data, index) => (
                                                    <div key={index} className="flex flex-col items-center gap-2 relative z-10">
                                                        <div className="flex items-end gap-1">
                                                            <div
                                                                className="w-8 bg-teal-400 rounded-t transform transition-all duration-700 hover:scale-110 hover:bg-teal-500 cursor-pointer animate-in slide-in-from-bottom"
                                                                style={{
                                                                    height: `${(data.dungHan / 400) * 180}px`,
                                                                    animationDelay: `${index * 200}ms`,
                                                                }}
                                                            ></div>
                                                            <div
                                                                className="w-8 bg-pink-400 rounded-t transform transition-all duration-700 hover:scale-110 hover:bg-pink-500 cursor-pointer animate-in slide-in-from-bottom"
                                                                style={{
                                                                    height: `${(data.huy / 400) * 180}px`,
                                                                    animationDelay: `${index * 200 + 100}ms`,
                                                                }}
                                                            ></div>
                                                            <div
                                                                className="w-8 bg-yellow-400 rounded-t transform transition-all duration-700 hover:scale-110 hover:bg-yellow-500 cursor-pointer animate-in slide-in-from-bottom"
                                                                style={{
                                                                    height: `${(data.tre / 400) * 180}px`,
                                                                    animationDelay: `${index * 200 + 200}ms`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs text-gray-600 transform transition-all duration-300 hover:scale-110 hover:font-semibold cursor-pointer">
                                                            {data.month}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Row 2 with enhanced animations */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Revenue Comparison Chart */}
                                <div className="bg-white rounded-lg shadow-xl border-0 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                                    <div className="p-6 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-purple-600 transform transition-transform duration-300 hover:rotate-12" />
                                            So sánh doanh thu thực tế vs kế hoạch
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {/* Legend */}
                                            <div className="flex flex-wrap gap-4 text-sm">
                                                {[
                                                    { color: "bg-sky-400", label: "Doanh thu thực tế" },
                                                    { color: "bg-orange-400", label: "Doanh thu kế hoạch" },
                                                ].map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2 transform transition-all duration-300 hover:scale-110 cursor-pointer"
                                                    >
                                                        <div
                                                            className={`w-4 h-3 ${item.color} rounded transition-all duration-300 hover:w-6 hover:shadow-lg`}
                                                        ></div>
                                                        <span className="hover:font-semibold transition-all duration-300">{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Enhanced Bar Chart */}
                                            <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-around p-4 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-t from-purple-50 to-transparent opacity-50"></div>
                                                {monthlyRevenue.map((data, index) => (
                                                    <div key={index} className="flex flex-col items-center gap-2 relative z-10">
                                                        <div className="flex items-end gap-2">
                                                            <div
                                                                className="w-12 bg-sky-400 rounded-t transform transition-all duration-700 hover:scale-110 hover:bg-sky-500 cursor-pointer animate-in slide-in-from-bottom"
                                                                style={{
                                                                    height: `${Math.random() * 150 + 50}px`,
                                                                    animationDelay: `${index * 200}ms`,
                                                                }}
                                                            ></div>
                                                            <div
                                                                className="w-12 bg-orange-400 rounded-t transform transition-all duration-700 hover:scale-110 hover:bg-orange-500 cursor-pointer animate-in slide-in-from-bottom"
                                                                style={{
                                                                    height: `${Math.random() * 150 + 50}px`,
                                                                    animationDelay: `${index * 200 + 100}ms`,
                                                                }}
                                                            ></div>
                                                        </div>

                                                        <span className="text-xs text-gray-600 transform transition-all duration-300 hover:scale-110 hover:font-semibold cursor-pointer">
                                                            {data.month}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Pie Chart */}
                                <div className="bg-white rounded-lg shadow-xl border-0 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                                    <div className="p-6 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-indigo-600 transform transition-transform duration-300 hover:rotate-12" />
                                            Phân bố trạng thái giao hàng
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center justify-center h-64">
                                            <div className="relative">
                                                {/* Enhanced Donut Chart */}
                                                <svg
                                                    className="w-48 h-48 transform transition-transform duration-500 hover:scale-110"
                                                    viewBox="0 0 200 200"
                                                >
                                                    <circle
                                                        cx="100"
                                                        cy="100"
                                                        r="80"
                                                        fill="none"
                                                        stroke="#14b8a6"
                                                        strokeWidth="40"
                                                        strokeDasharray="377 377"
                                                        strokeDashoffset="75"
                                                        transform="rotate(-90 100 100)"
                                                        className="animate-in draw-in duration-1000 hover:stroke-teal-600 transition-colors"
                                                    />
                                                    <circle
                                                        cx="100"
                                                        cy="100"
                                                        r="80"
                                                        fill="none"
                                                        stroke="#f472b6"
                                                        strokeWidth="40"
                                                        strokeDasharray="50 377"
                                                        strokeDashoffset="0"
                                                        transform="rotate(180 100 100)"
                                                        className="animate-in draw-in duration-1000 delay-300 hover:stroke-pink-600 transition-colors"
                                                    />
                                                    <circle
                                                        cx="100"
                                                        cy="100"
                                                        r="80"
                                                        fill="none"
                                                        stroke="#fbbf24"
                                                        strokeWidth="40"
                                                        strokeDasharray="75 377"
                                                        strokeDashoffset="-50"
                                                        transform="rotate(230 100 100)"
                                                        className="animate-in draw-in duration-1000 delay-600 hover:stroke-yellow-600 transition-colors"
                                                    />
                                                </svg>

                                                {/* Enhanced Legend */}
                                                <div className="absolute -right-24 top-1/2 transform -translate-y-1/2 space-y-2">
                                                    {[
                                                        { color: "bg-teal-400", label: "Đúng hạn" },
                                                        { color: "bg-pink-400", label: "Hủy" },
                                                        { color: "bg-yellow-400", label: "Trễ" },
                                                    ].map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-2 text-sm transform transition-all duration-300 hover:scale-110 cursor-pointer"
                                                        >
                                                            <div
                                                                className={`w-4 h-3 ${item.color} rounded transition-all duration-300 hover:w-6 hover:shadow-lg`}
                                                            ></div>
                                                            <span className="hover:font-semibold transition-all duration-300">{item.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Detail Table */}
                            <div className="bg-white rounded-lg shadow-xl border-0 transform transition-all duration-500 hover:shadow-2xl">
                                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-gray-600 transform transition-transform duration-300 hover:rotate-12" />
                                        Chi tiết báo cáo theo tháng
                                    </h3>
                                    <button
                                        onClick={() => handleButtonPress("export")}
                                        className={`border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-md active:scale-95 ${pressedButton === "export" ? "scale-95 bg-gray-100" : ""
                                            }`}
                                    >
                                        <TrendingUp
                                            className={`w-4 h-4 transition-transform duration-300 ${pressedButton === "export" ? "translate-y-1" : ""}`}
                                        />
                                        Xuất Excel
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    {["Tháng/Năm", "Đơn vị", "Số chuyến", "Doanh thu (VNĐ)", "Đúng hạn", "Hủy", "Trễ"].map(
                                                        (header, index) => (
                                                            <th
                                                                key={index}
                                                                className="text-left py-3 px-4 font-semibold text-gray-700 transform transition-all duration-300 hover:scale-105 cursor-pointer hover:text-blue-600"
                                                            >
                                                                {header}
                                                            </th>
                                                        ),
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detailData.map((row, index) => (
                                                    <tr
                                                        key={index}
                                                        className="border-b border-gray-100 hover:bg-gray-50 transform transition-all duration-300 hover:scale-102 hover:shadow-sm"
                                                    >
                                                        <td className="py-3 px-4 text-gray-800 hover:font-semibold transition-all duration-300">
                                                            {row.month}
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-800 hover:font-semibold transition-all duration-300">
                                                            {row.unit}
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-800 hover:font-semibold transition-all duration-300">
                                                            {row.trips}
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-800 font-medium hover:text-green-600 transition-all duration-300">
                                                            {row.revenue}
                                                        </td>
                                                        <td className="py-3 px-4 text-green-600 font-medium hover:scale-110 transition-all duration-300">
                                                            {row.onTime}
                                                        </td>
                                                        <td className="py-3 px-4 text-red-600 font-medium hover:scale-110 transition-all duration-300">
                                                            {row.cancelled}
                                                        </td>
                                                        <td className="py-3 px-4 text-orange-600 font-medium hover:scale-110 transition-all duration-300">
                                                            {row.late}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Enhanced Header */}
                            <div className="text-center space-y-4 animate-in slide-in-from-top duration-700">
                                <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3 transform transition-all duration-300 hover:scale-105">
                                    <Crown className="w-10 h-10 text-yellow-500 transform transition-all duration-500 hover:rotate-12 hover:scale-125" />
                                    Xếp Hạng Hiệu Suất
                                </h1>
                                <p className="text-lg text-gray-600">Bảng xếp hạng nhân viên và đội nhóm xuất sắc</p>

                                {/* Enhanced Filters */}
                                <div className="flex items-center justify-center gap-4 mt-6">
                                    <div className="flex items-center gap-2 transform transition-all duration-300 hover:scale-105">
                                        <span className="text-sm font-medium text-gray-700">Thời gian:</span>
                                        <select
                                            value={selectedPeriod}
                                            onChange={(e) => setSelectedPeriod(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-md focus:scale-105"
                                        >
                                            <option value="week">Tuần này</option>
                                            <option value="month">Tháng này</option>
                                            <option value="quarter">Quý này</option>
                                            <option value="year">Năm này</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2 transform transition-all duration-300 hover:scale-105">
                                        <span className="text-sm font-medium text-gray-700">Tiêu chí:</span>
                                        <select
                                            value={selectedMetric}
                                            onChange={(e) => setSelectedMetric(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-md focus:scale-105"
                                        >
                                            <option value="revenue">Doanh thu</option>
                                            <option value="trips">Số chuyến</option>
                                            <option value="success_rate">Tỷ lệ thành công</option>
                                            <option value="customer_rating">Đánh giá khách hàng</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Top Performers Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {rankingData.slice(0, 3).map((performer, index) => (
                                    <div
                                        key={index}
                                        onMouseEnter={() => setHoveredCard(`performer-${index}`)}
                                        onMouseLeave={() => setHoveredCard(null)}
                                        className={`shadow-xl border-0 rounded-lg ${getRankBadgeClass(performer.rank)} transform transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:-translate-y-2 cursor-pointer animate-in slide-in-from-bottom`}
                                        style={{ animationDelay: `${index * 200}ms` }}
                                    >
                                        <div className="p-6 text-white">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`transform transition-all duration-500 ${hoveredCard === `performer-${index}` ? "scale-125 rotate-12" : ""}`}
                                                    >
                                                        {getRankIcon(performer.rank)}
                                                    </div>
                                                    <div
                                                        className={`w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-lg transform transition-all duration-500 ${hoveredCard === `performer-${index}` ? "scale-110 rotate-6" : ""
                                                            }`}
                                                    >
                                                        {performer.avatar}
                                                    </div>
                                                </div>
                                                <div
                                                    className={`flex items-center gap-1 transform transition-all duration-300 ${hoveredCard === `performer-${index}` ? "scale-110" : ""
                                                        }`}
                                                >
                                                    {performer.trend === "up" ? (
                                                        <TrendingUp className="w-4 h-4" />
                                                    ) : (
                                                        <TrendingDown className="w-4 h-4" />
                                                    )}
                                                    <span className="text-sm">{performer.change}</span>
                                                </div>
                                            </div>
                                            <h3
                                                className={`font-bold text-lg mb-1 transform transition-all duration-300 ${hoveredCard === `performer-${index}` ? "scale-105" : ""
                                                    }`}
                                            >
                                                {performer.name}
                                            </h3>
                                            <p className="text-sm opacity-90 mb-3">{performer.unit}</p>
                                            <div className="space-y-2">
                                                {[
                                                    { label: "Doanh thu:", value: performer.revenue },
                                                    { label: "Số chuyến:", value: performer.trips },
                                                    { label: "Tỷ lệ thành công:", value: `${performer.successRate}%` },
                                                ].map((item, itemIndex) => (
                                                    <div
                                                        key={itemIndex}
                                                        className="flex justify-between transform transition-all duration-300 hover:scale-105"
                                                    >
                                                        <span className="text-sm opacity-90">{item.label}</span>
                                                        <span className="font-semibold">{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Enhanced Individual Ranking Table */}
                            <div className="bg-white rounded-lg shadow-xl border-0 transform transition-all duration-500 hover:shadow-2xl">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-blue-600 transform transition-transform duration-300 hover:rotate-12" />
                                        Xếp Hạng Cá Nhân
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    {["Hạng", "Nhân viên", "Đơn vị", "Doanh thu", "Số chuyến", "Tỷ lệ thành công", "Thay đổi"].map(
                                                        (header, index) => (
                                                            <th
                                                                key={index}
                                                                className="text-left py-4 px-4 font-semibold text-gray-700 transform transition-all duration-300 hover:scale-105 cursor-pointer hover:text-blue-600"
                                                            >
                                                                {header}
                                                            </th>
                                                        ),
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rankingData.map((performer, index) => (
                                                    <tr
                                                        key={index}
                                                        onMouseEnter={() => setHoveredCard(`table-row-${index}`)}
                                                        onMouseLeave={() => setHoveredCard(null)}
                                                        className={`border-b border-gray-100 hover:bg-gray-50 transition-all duration-300 transform hover:scale-102 hover:shadow-sm cursor-pointer animate-in slide-in-from-left ${hoveredCard === `table-row-${index}` ? "bg-blue-50" : ""
                                                            }`}
                                                        style={{ animationDelay: `${index * 100}ms` }}
                                                    >
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className={`transform transition-all duration-300 ${hoveredCard === `table-row-${index}` ? "scale-125" : ""}`}
                                                                >
                                                                    {getRankIcon(performer.rank)}
                                                                </div>
                                                                <span className="font-bold text-lg">{performer.rank}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className={`w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold transform transition-all duration-300 ${hoveredCard === `table-row-${index}` ? "scale-110 rotate-6" : ""
                                                                        }`}
                                                                >
                                                                    {performer.avatar}
                                                                </div>
                                                                <span
                                                                    className={`font-semibold text-gray-800 transform transition-all duration-300 ${hoveredCard === `table-row-${index}` ? "scale-105" : ""
                                                                        }`}
                                                                >
                                                                    {performer.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-gray-600 hover:font-semibold transition-all duration-300">
                                                            {performer.unit}
                                                        </td>
                                                        <td className="py-4 px-4 font-semibold text-green-600 hover:scale-105 transition-all duration-300">
                                                            {performer.revenue}
                                                        </td>
                                                        <td className="py-4 px-4 text-gray-800 hover:font-semibold transition-all duration-300">
                                                            {performer.trips}
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                    <div
                                                                        className={`bg-blue-500 h-2 rounded-full transition-all duration-700 ${hoveredCard === `table-row-${index}` ? "animate-pulse" : ""
                                                                            }`}
                                                                        style={{ width: `${performer.successRate}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-sm font-medium">{performer.successRate}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <div
                                                                className={`flex items-center gap-1 transform transition-all duration-300 hover:scale-110 ${performer.trend === "up" ? "text-green-600" : "text-red-600"
                                                                    }`}
                                                            >
                                                                {performer.trend === "up" ? (
                                                                    <TrendingUp className="w-4 h-4" />
                                                                ) : (
                                                                    <TrendingDown className="w-4 h-4" />
                                                                )}
                                                                <span className="font-medium">{performer.change}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Team Ranking */}
                            <div className="bg-white rounded-lg shadow-xl border-0 transform transition-all duration-500 hover:shadow-2xl">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Target className="w-5 h-5 text-purple-600 transform transition-transform duration-300 hover:rotate-12" />
                                        Xếp Hạng Đội Nhóm
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {teamRanking.map((team, index) => (
                                            <div
                                                key={index}
                                                onMouseEnter={() => setHoveredCard(`team-${index}`)}
                                                onMouseLeave={() => setHoveredCard(null)}
                                                className={`border-2 rounded-lg transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:-translate-y-1 cursor-pointer animate-in slide-in-from-bottom ${index === 0
                                                    ? "border-yellow-400 bg-yellow-50 hover:bg-yellow-100"
                                                    : index === 1
                                                        ? "border-gray-400 bg-gray-50 hover:bg-gray-100"
                                                        : "border-orange-400 bg-orange-50 hover:bg-orange-100"
                                                    }`}
                                                style={{ animationDelay: `${index * 200}ms` }}
                                            >
                                                <div className="p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className={`transform transition-all duration-500 ${hoveredCard === `team-${index}` ? "scale-125 rotate-12" : ""}`}
                                                            >
                                                                {getRankIcon(team.rank)}
                                                            </div>
                                                            <span
                                                                className={`text-2xl font-bold text-gray-800 transform transition-all duration-300 ${hoveredCard === `team-${index}` ? "scale-110" : ""
                                                                    }`}
                                                            >
                                                                #{team.rank}
                                                            </span>
                                                        </div>
                                                        <div
                                                            className={`flex items-center gap-1 transform transition-all duration-300 hover:scale-110 ${team.trend === "up" ? "text-green-600" : "text-red-600"
                                                                }`}
                                                        >
                                                            {team.trend === "up" ? (
                                                                <TrendingUp className="w-4 h-4" />
                                                            ) : (
                                                                <TrendingDown className="w-4 h-4" />
                                                            )}
                                                            <span className="font-medium">{team.change}</span>
                                                        </div>
                                                    </div>

                                                    <h3
                                                        className={`font-bold text-lg text-gray-800 mb-4 transform transition-all duration-300 ${hoveredCard === `team-${index}` ? "scale-105" : ""
                                                            }`}
                                                    >
                                                        {team.name}
                                                    </h3>

                                                    <div className="space-y-3">
                                                        {[
                                                            { label: "Tổng doanh thu:", value: team.totalRevenue, color: "text-green-600" },
                                                            { label: "Tổng số chuyến:", value: team.totalTrips, color: "text-gray-800" },
                                                            { label: "Tỷ lệ TB thành công:", value: `${team.avgSuccessRate}%`, color: "text-blue-600" },
                                                            { label: "Số thành viên:", value: `${team.members} người`, color: "text-gray-800" },
                                                        ].map((item, itemIndex) => (
                                                            <div
                                                                key={itemIndex}
                                                                className="flex justify-between transform transition-all duration-300 hover:scale-105"
                                                            >
                                                                <span className="text-gray-600">{item.label}</span>
                                                                <span className={`font-semibold ${item.color}`}>{item.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Achievement Section */}
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-xl border-0 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="p-8 relative z-10">
                                    <div className="text-center space-y-4">
                                        <DollarSign className="w-16 h-16 text-yellow-300 mx-auto transform transition-all duration-500 hover:scale-125 hover:rotate-12" />
                                        <h2 className="text-3xl font-bold transform transition-all duration-300 hover:scale-105">
                                            Thành Tích Nổi Bật Tháng Này
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                            {[
                                                { value: "156", label: "Chuyến giao thành công cao nhất", name: "Nguyễn Văn An" },
                                                { value: "94.2%", label: "Tỷ lệ thành công cao nhất", name: "Nguyễn Văn An" },
                                                { value: "+15%", label: "Tăng trưởng cao nhất", name: "Chuyển Nhà Minh Anh" },
                                            ].map((achievement, index) => (
                                                <div
                                                    key={index}
                                                    className="text-center transform transition-all duration-500 hover:scale-110 cursor-pointer animate-in slide-in-from-bottom"
                                                    style={{ animationDelay: `${index * 200}ms` }}
                                                >
                                                    <div className="text-4xl font-bold text-yellow-300 transform transition-all duration-300 hover:scale-125">
                                                        {achievement.value}
                                                    </div>
                                                    <div className="text-purple-100">{achievement.label}</div>
                                                    <div className="text-sm text-purple-200 mt-1">{achievement.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col items-center gap-2 mt-8 p-4 bg-blue-50 rounded-xl">
                <button
                    className="w-full px-4 py-2 rounded-lg bg-white text-blue-600 font-semibold hover:bg-blue-100 transition"
                    onClick={() => navigate("/profile")}
                >
                    View Profile
                </button>
                <button
                    className="w-full px-4 py-2 rounded-lg bg-white text-red-600 font-semibold hover:bg-red-100 transition"
                    onClick={() => {
                        Cookies.remove("authToken")
                        Cookies.remove("userRole")
                        Cookies.remove("username")
                        navigate("/login")
                    }}
                >
                    Logout
                </button>

            </div>
        </div>
    )
}

export default Dashboard