import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
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
} from "lucide-react";
import { Link } from "react-router-dom";
import DashBoardApi from "../../utils/DashBoard_phongApi.js";
import Footer from "../../Components/FormLogin_yen/Footer.jsx";
import {
    BarChart as ReBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ReTooltip,
    Legend as ReLegend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Header Component
const Header = ({ onLogout }) => {
    return (
        <header className="fixed w-full top-0 bg-[#0d47a1] shadow-lg z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Truck className="w-8 h-8 text-white" />
                        <h1 className="text-xl font-bold text-white">Vận Chuyển Nhà</h1>
                    </div>
                    <div className="flex space-x-3">
                        <button className="px-4 py-2 border border-white text-white rounded-lg hover:bg-blue-700 hover:text-white transition-all">
                            <Link to="/" className="text-white hover:text-blue-200 transition-colors">Trang Chủ</Link>
                        </button>
                        <button
                            className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                            onClick={onLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("performance");
    const [selectedYear, setSelectedYear] = useState("2024");
    const [startMonth, setStartMonth] = useState("1");
    const [endMonth, setEndMonth] = useState("12");
    const [selectedUnit, setSelectedUnit] = useState("Tất cả");
    const [selectedPeriod, setSelectedPeriod] = useState("month");
    const [selectedMetric, setSelectedMetric] = useState("revenue");
    const [hoveredCard, setHoveredCard] = useState(null);
    const [pressedButton, setPressedButton] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Debounce các tham số
    const [debouncedYear] = useDebounce(selectedYear, 500);
    const [debouncedUnit] = useDebounce(selectedUnit, 500);
    const [debouncedStartMonth] = useDebounce(startMonth, 500);
    const [debouncedEndMonth] = useDebounce(endMonth, 500);

    // Lấy username từ cookies
    const username = Cookies.get("username") || "Staff User";

    // State để lưu dữ liệu từ API
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [performanceData, setPerformanceData] = useState([]);
    const [detailData, setDetailData] = useState([]);
    const [transportData, setTransportData] = useState({
        totalShipments: 0,
        revenue: "0 đ",
        deliveryRate: 0,
        totalVolume: 0,
        shipmentGrowth: 0,
        revenueGrowth: 0,
        deliveryRateGrowth: 0,
        volumeGrowth: 0,
    });
    const [rankingData, setRankingData] = useState([]);
    const [teamRanking, setTeamRanking] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({
        newReceipts: 0,
        pendingOrders: 0,
        newCustomers: 0,
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [achievements, setAchievements] = useState([]);

    // Thêm hook cho phân trang bảng chi tiết
    const ROWS_PER_PAGE = 10;
    // State cho phân trang bảng chi tiết
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(detailData.length / ROWS_PER_PAGE);
    const paginatedDetailData = detailData.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

    // Gọi API khi component mount hoặc khi bộ lọc thay đổi
    useEffect(() => {
        console.log('useEffect chạy lại với:', debouncedYear, debouncedUnit, debouncedStartMonth, debouncedEndMonth, selectedPeriod, selectedMetric);
        const token = Cookies.get("authToken");
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        const fetchDashboardData = async () => {
            try {
                setError(null);
                const statsResponse = await DashBoardApi.getDashboardStats();
                setDashboardStats({
                    newReceipts: statsResponse.newReceipts || 0,
                    pendingOrders: statsResponse.pendingOrders || 0,
                    newCustomers: statsResponse.newCustomers || 0,
                });

                const activitiesResponse = await DashBoardApi.getRecentActivities();
                setRecentActivities(Array.isArray(activitiesResponse) ? activitiesResponse : []);

                const revenueResponse = await DashBoardApi.getMonthlyRevenue(debouncedYear, debouncedUnit, debouncedStartMonth, debouncedEndMonth);
                setMonthlyRevenue(revenueResponse || []);

                const performanceResponse = await DashBoardApi.getPerformanceData(debouncedYear, debouncedUnit, debouncedStartMonth, debouncedEndMonth);
                setPerformanceData(performanceResponse || []);

                const detailResponse = await DashBoardApi.getDetailData(debouncedYear, debouncedUnit, debouncedStartMonth, debouncedEndMonth);
                setDetailData(detailResponse || []);

                const transportResponse = await DashBoardApi.getTransportData(debouncedYear, debouncedUnit, debouncedStartMonth, debouncedEndMonth);
                setTransportData({
                    totalShipments: transportResponse.totalShipments || 0,
                    revenue: transportResponse.revenue || "0 đ",
                    deliveryRate: transportResponse.deliveryRate || 0,
                    totalVolume: transportResponse.totalVolume || 0,
                    shipmentGrowth: transportResponse.shipmentGrowth || 0,
                    revenueGrowth: transportResponse.revenueGrowth || 0,
                    deliveryRateGrowth: transportResponse.deliveryRateGrowth || 0,
                    volumeGrowth: transportResponse.volumeGrowth || 0,
                });

                const rankingResponse = await DashBoardApi.getRankingData(selectedPeriod, selectedMetric);
                setRankingData(rankingResponse || []);

                const teamRankingResponse = await DashBoardApi.getTeamRanking(selectedPeriod, selectedMetric);
                setTeamRanking(teamRankingResponse || []);

                const achievementsResponse = await DashBoardApi.getAchievements();
                setAchievements(Array.isArray(achievementsResponse) ? achievementsResponse : []);
            } catch (error) {
                setError(error.message || "Lỗi khi lấy dữ liệu dashboard");
                console.error("Lỗi khi lấy dữ liệu dashboard:", error.message);
            }
        };

        fetchDashboardData();
    }, [navigate, debouncedYear, debouncedUnit, debouncedStartMonth, debouncedEndMonth, selectedPeriod, selectedMetric]);
    // Reset về trang 1 khi detailData thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [detailData]);

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Crown className="w-6 h-6 text-yellow-500" />;
            case 2:
                return <Medal className="w-6 h-6 text-gray-400" />;
            case 3:
                return <Award className="w-6 h-6 text-orange-500" />;
            default:
                return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</span>;
        }
    };

    const getRankBadgeClass = (rank) => {
        switch (rank) {
            case 1:
                return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
            case 2:
                return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
            case 3:
                return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
            default:
                return "bg-gradient-to-r from-blue-400 to-blue-600 text-white";
        }
    };

    const handleButtonPress = (buttonId) => {
        setPressedButton(buttonId);
        setTimeout(() => setPressedButton(null), 150);
    };

    const handleLogout = async () => {
        try {
            await DashBoardApi.logout();
            Cookies.remove("authToken");
            Cookies.remove("userRole");
            Cookies.remove("username");
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error.message);
            Cookies.remove("authToken");
            Cookies.remove("userRole");
            Cookies.remove("username");
            navigate("/login", { replace: true });
        }
    };

    // Hàm xuất Excel cho bảng chi tiết
    const exportToExcel = () => {
        if (!detailData || detailData.length === 0) return;
        // Chuyển đổi dữ liệu sang định dạng phù hợp
        const data = detailData.map(row => ({
            "Tháng/Năm": row.month,
            "Đơn vị": row.unit,
            "Số chuyến": row.trips,
            "Doanh thu (VNĐ)": row.revenue,
            "Đúng hạn": row.onTime,
            "Hủy": row.cancelled,
            "Trễ": row.late,
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Báo cáo");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, "baocao-hieu-suat-van-chuyen.xlsx");
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">
            <Header onLogout={handleLogout} />
            <div className="flex-1 p-8 pt-24">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Nút Quay lại */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center px-5 py-3 mb-6 bg-blue-100 text-blue-700 rounded-lg shadow hover:bg-blue-200 transition-colors"
                        style={{ fontWeight: 600, fontSize: '1.1rem', outline: 'none', border: 'none' }}
                    >
                        <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>←</span> Quay lại
                    </button>
                    {/* Kết thúc nút Quay lại */}
                    {/* Filter chọn năm và đơn vị */}
                    <div className="flex gap-4 justify-end mb-4">
                        <label className="flex items-center gap-2 text-gray-700 font-medium">
                            Năm:
                            <select
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={selectedYear}
                                onChange={e => {
                                    setSelectedYear(e.target.value);
                                    console.log('Chọn năm:', e.target.value);
                                }}
                            >
                                <option value="2022">2022</option>
                                <option value="2023">2023</option>
                                <option value="2024">2024</option>
                            </select>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 font-medium">
                            Từ tháng:
                            <select
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={startMonth}
                                onChange={e => {
                                    setStartMonth(e.target.value);
                                    // Nếu endMonth < startMonth thì cập nhật endMonth luôn
                                    if (parseInt(e.target.value) > parseInt(endMonth)) {
                                        setEndMonth(e.target.value);
                                    }
                                    console.log('Chọn từ tháng:', e.target.value);
                                }}
                            >
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                            </select>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 font-medium">
                            Đến tháng:
                            <select
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={endMonth}
                                onChange={e => {
                                    setEndMonth(e.target.value);
                                    console.log('Chọn đến tháng:', e.target.value);
                                }}
                            >
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1} disabled={parseInt(startMonth) > i + 1}>{i + 1}</option>
                                ))}
                            </select>
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 font-medium">
                            Đơn vị:
                            <select
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={selectedUnit}
                                onChange={e => {
                                    setSelectedUnit(e.target.value);
                                    console.log('Chọn đơn vị:', e.target.value);
                                }}
                            >
                                <option value="Tất cả">Tất cả</option>
                                <option value="Chuyển Nhà 24H">Chuyển Nhà 24H</option>
                                <option value="DV Chuyển Nhà SG">DV Chuyển Nhà SG</option>
                                <option value="Chuyển Nhà Minh Anh">Chuyển Nhà Minh Anh</option>
                            </select>
                        </label>
                    </div>
                    {/* Hiển thị thông báo lỗi */}
                    {error && (
                        <div className="bg-red-100 text-red-600 p-4 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white rounded-lg shadow-md p-1 flex transform transition-all duration-300 hover:shadow-lg hover:scale-105">
                            <button
                                onClick={() => {
                                    setActiveTab("performance");
                                    handleButtonPress("performance-tab");
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
                                    setActiveTab("ranking");
                                    handleButtonPress("ranking-tab");
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
                            {/* Header */}
                            <div className="text-center space-y-4 animate-in slide-in-from-top duration-700">
                                <h1 className="text-4xl font-bold text-gray-900 transform transition-all duration-300 hover:scale-105">
                                    Báo cáo Hiệu suất Vận chuyển
                                </h1>
                                <p className="text-lg text-gray-600">Tổng quan hoạt động vận chuyển </p>

                            </div>

                            {/* Stats Cards */}
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
                                        value: transportData.revenue,
                                        growth: transportData.revenueGrowth,
                                        icon: DollarSign,
                                        gradient: "from-pink-500 to-pink-600",
                                        iconColor: "text-pink-200",
                                    },
                                    {
                                        id: "delivery",
                                        title: "Tỷ lệ giao đúng hạn",
                                        value: transportData.deliveryRate === 0 ? "Chưa có dữ liệu" : `${transportData.deliveryRate}%`,
                                        growth: transportData.deliveryRateGrowth,
                                        icon: Target,
                                        gradient: "from-cyan-500 to-cyan-600",
                                        iconColor: "text-cyan-200",
                                    },
                                    {
                                        id: "volume",
                                        title: "Tổng khối lượng",
                                        value: transportData.totalVolume === 0 ? "Chưa có dữ liệu" : `${transportData.totalVolume} tấn`,
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
                                                    <p className="text-white text-opacity-90 text-sm mt-1">{card.growth}% so với năm trước</p>
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

                            {/* Charts Row 1 */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Monthly Revenue Chart - LineChart */}
                                <div className="bg-white rounded-2xl shadow-xl border-0 p-8">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                                        <BarChart3 className="w-5 h-5 text-blue-600" />
                                        Doanh thu theo tháng
                                    </h3>
                                    <ResponsiveContainer width="100%" height={380}>
                                        <LineChart data={monthlyRevenue} margin={{ top: 30, right: 40, left: 10, bottom: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" tick={{ fontSize: 14 }} height={40} />
                                            <YAxis tickFormatter={v => v?.toLocaleString?.('vi-VN') ?? v} tick={{ fontSize: 14 }} width={80} />
                                            <ReTooltip formatter={v => v?.toLocaleString?.('vi-VN') ?? v} contentStyle={{ fontSize: 15 }} />
                                            <ReLegend layout="horizontal" align="center" verticalAlign="bottom" iconSize={18} wrapperStyle={{ fontSize: 15, marginTop: 16 }} />
                                            <Line type="monotone" dataKey="chuyenNha24H" name="Chuyển Nhà 24H" stroke="#ef4444" strokeWidth={3} dot={{ r: 5 }} />
                                            <Line type="monotone" dataKey="dvChuyenNhaSaiGon" name="DV Chuyển Nhà SG" stroke="#22c55e" strokeWidth={3} dot={{ r: 5 }} />
                                            <Line type="monotone" dataKey="chuyenNhaMinhAnh" name="Chuyển Nhà Minh Anh" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                {/* Performance Chart - BarChart */}
                                <div className="bg-white rounded-2xl shadow-xl border-0 p-8">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                        Hiệu suất giao hàng
                                    </h3>
                                    <ResponsiveContainer width="100%" height={380}>
                                        <ReBarChart data={performanceData} margin={{ top: 30, right: 40, left: 10, bottom: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" tick={{ fontSize: 14 }} height={40} />
                                            <YAxis tick={{ fontSize: 14 }} width={60} />
                                            <ReTooltip contentStyle={{ fontSize: 15 }} />
                                            <ReLegend layout="horizontal" align="center" verticalAlign="bottom" iconSize={18} wrapperStyle={{ fontSize: 15, marginTop: 16 }} />
                                            <Bar dataKey="dungHan" name="Đúng hạn" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                                            <Bar dataKey="huy" name="Hủy" fill="#f472b6" radius={[8, 8, 0, 0]} />
                                            <Bar dataKey="tre" name="Trễ" fill="#fbbf24" radius={[8, 8, 0, 0]} />
                                        </ReBarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            {/* Charts Row 2 */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Revenue Comparison Chart - Grouped BarChart */}
                                <div className="bg-white rounded-2xl shadow-xl border-0 p-8">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                                        <BarChart3 className="w-5 h-5 text-purple-600" />
                                        So sánh doanh thu thực tế vs kế hoạch
                                    </h3>
                                    <ResponsiveContainer width="100%" height={380}>
                                        <ReBarChart data={monthlyRevenue} margin={{ top: 30, right: 40, left: 10, bottom: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" tick={{ fontSize: 14 }} height={40} />
                                            <YAxis tickFormatter={v => v?.toLocaleString?.('vi-VN') ?? v} tick={{ fontSize: 14 }} width={80} />
                                            <ReTooltip formatter={v => v?.toLocaleString?.('vi-VN') ?? v} contentStyle={{ fontSize: 15 }} />
                                            <ReLegend layout="horizontal" align="center" verticalAlign="bottom" iconSize={18} wrapperStyle={{ fontSize: 15, marginTop: 16 }} />
                                            <Bar dataKey="chuyenNha24H" name="Doanh thu thực tế" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                                            <Bar dataKey="dvChuyenNhaSaiGon" name="Doanh thu kế hoạch" fill="#f59e42" radius={[8, 8, 0, 0]} />
                                        </ReBarChart>
                                    </ResponsiveContainer>
                                </div>
                                {/* Pie Chart - Phân bố trạng thái giao hàng giữ nguyên */}
                                <div className="bg-white rounded-2xl shadow-xl border-0 p-8 flex flex-col items-center justify-center">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                                        Phân bố trạng thái giao hàng
                                    </h3>
                                    <ResponsiveContainer width="100%" height={380}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: "Đúng hạn", value: performanceData.reduce((sum, d) => sum + (d.dungHan || 0), 0), color: "#14b8a6" },
                                                    { name: "Hủy", value: performanceData.reduce((sum, d) => sum + (d.huy || 0), 0), color: "#f472b6" },
                                                    { name: "Trễ", value: performanceData.reduce((sum, d) => sum + (d.tre || 0), 0), color: "#fbbf24" },
                                                ]}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={120}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                labelLine={false}
                                            >
                                                {[
                                                    "#14b8a6",
                                                    "#f472b6",
                                                    "#fbbf24"
                                                ].map((color, idx) => (
                                                    <Cell key={color} fill={color} />
                                                ))}
                                            </Pie>
                                            <ReTooltip formatter={(value, name) => [`${value}`, name]} contentStyle={{ fontSize: 15 }} />
                                            <ReLegend layout="horizontal" align="center" verticalAlign="bottom" iconSize={18} wrapperStyle={{ fontSize: 15, marginTop: 16 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Detail Table */}
                            <div className="bg-white rounded-2xl shadow-2xl border-0 transform transition-all duration-500 hover:shadow-3xl">
                                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-gray-600 transform transition-transform duration-300 hover:rotate-12" />
                                        Chi tiết báo cáo theo tháng
                                    </h3>
                                    <button
                                        onClick={exportToExcel}
                                        className={`border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-md active:scale-95 ${pressedButton === "export" ? "scale-95 bg-gray-100" : ""}`}
                                    >
                                        <TrendingUp
                                            className={`w-4 h-4 transition-transform duration-300 ${pressedButton === "export" ? "translate-y-1" : ""}`}
                                        />
                                        Xuất Excel
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                                        <table className="w-full border-collapse text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200 bg-blue-50">
                                                    {["Tháng/Năm", "Đơn vị", "Số chuyến", "Doanh thu (VNĐ)", "Đúng hạn", "Hủy", "Trễ"].map(
                                                        (header, index) => (
                                                            <th
                                                                key={index}
                                                                className="text-left py-3 px-4 font-semibold text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                                                            >
                                                                {header}
                                                            </th>
                                                        ),
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedDetailData.map((row, index) => (
                                                    <tr
                                                        key={index}
                                                        className="border-b border-gray-100 hover:bg-blue-50 transition-all duration-200"
                                                    >
                                                        <td className="py-3 px-4 text-gray-800">{row.month}</td>
                                                        <td className="py-3 px-4 text-gray-800">{row.unit}</td>
                                                        <td className="py-3 px-4 text-gray-800">{row.trips}</td>
                                                        <td className="py-3 px-4 text-green-700 font-semibold">{row.revenue}</td>
                                                        <td className="py-3 px-4 text-green-600 font-medium">{row.onTime}</td>
                                                        <td className="py-3 px-4 text-red-600 font-medium">{row.cancelled}</td>
                                                        <td className="py-3 px-4 text-orange-600 font-medium">{row.late}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Pagination controls */}
                                    <div className="flex justify-center items-center gap-2 mt-4">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-100 disabled:opacity-50"
                                        >
                                            Trước
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`px-3 py-1 rounded-lg border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-blue-100'} transition`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-100 disabled:opacity-50"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Header */}
                            <div className="text-center space-y-4 animate-in slide-in-from-top duration-700">
                                <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3 transform transition-all duration-300 hover:scale-105">
                                    <Crown className="w-10 h-10 text-yellow-500 transform transition-all duration-500 hover:rotate-12 hover:scale-125" />
                                    Xếp Hạng Hiệu Suất
                                </h1>
                                <p className="text-lg text-gray-600">Bảng xếp hạng nhân viên và đội nhóm xuất sắc</p>

                            </div>

                            {/* Top Performers Cards */}
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
                                                        className={`transform transition-all duration-500 ${hoveredCard === `performer-${index}` ? "scale-125 rotate-12" : ""
                                                            }`}
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

                            {/* Individual Ranking Table */}
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
                                                                    className={`transform transition-all duration-300 ${hoveredCard === `table-row-${index}` ? "scale-125" : ""
                                                                        }`}
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

                            {/* Team Ranking */}
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
                                                                className={`transform transition-all duration-500 ${hoveredCard === `team-${index}` ? "scale-125 rotate-12" : ""
                                                                    }`}
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

                            {/* Achievement Section */}
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-xl border-0 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="p-8 relative z-10">
                                    <div className="text-center space-y-4">
                                        <DollarSign className="w-16 h-16 text-yellow-300 mx-auto transform transition-all duration-500 hover:scale-125 hover:rotate-12" />
                                        <h2 className="text-3xl font-bold transform transition-all duration-300 hover:scale-105">
                                            Thành Tích Nổi Bật Tháng Này
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                            {achievements.length > 0 ? (
                                                achievements.map((achievement, index) => (
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
                                                ))
                                            ) : (
                                                <div className="text-center col-span-3 text-purple-100">
                                                    Không có dữ liệu thành tích để hiển thị
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Dashboard;