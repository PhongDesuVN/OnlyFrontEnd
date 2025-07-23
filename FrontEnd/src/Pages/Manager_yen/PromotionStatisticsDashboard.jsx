import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance.js";
import Header from '../../Components/FormLogin_yen/Header.jsx'
import Footer from '../../Components/FormLogin_yen/Footer.jsx'
import {
    BarChart, Bar, PieChart, Pie, Cell, Legend,
    XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer
} from "recharts";
import { Link, useLocation } from "react-router-dom";
import {
    Home,
    Gift,
    TrendingUp,
    Zap,
    LogOut, Truck,
} from "lucide-react";

const API = "/api/promotions";
const COLORS = ["#4caf50", "#2196f3", "#f44336", "#ff9800", "#9e9e9e"];

// LeftMenu Component
const LeftMenu = ({ onLogout }) => {
    const { pathname } = useLocation();
    const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

    return (
        <aside className="w-[304px] min-h-screen pt-[5rem] bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl border-r border-blue-700/30 backdrop-blur-sm">

        <div className="mb-10 p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-blue-300/5 to-transparent blur-2xl rounded-2xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-blue-50 tracking-wide">Hệ thống quản lý</h2>
                        </div>
                    </div>
                    <div className="w-16 h-1 bg-gradient-to-r from-blue-400 via-blue-300 to-transparent rounded-full"></div>
                </div>
            </div>
            <nav className="px-4 space-y-3">
                <Link
                    to="/manager-dashboard"
                    className={`group flex items-center gap-4 p-4 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                        isActive("/manager-dashboard")
                            ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]"
                            : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"
                    }`}
                >
                    {isActive("/manager-dashboard") && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                    )}
                    <div
                        className={`p-2.5 rounded-xl transition-all duration-300 ${
                            isActive("/manager-dashboard") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"
                        }`}
                    >
                        <Home className={`w-5 h-5 transition-all duration-300 ${
                            isActive("/manager-dashboard") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"
                        }`} />
                    </div>
                    <div className="flex-1 relative z-10">
                        <span className="font-semibold">Dashboard Quản Lý</span>
                    </div>
                    {isActive("/manager-dashboard") && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                    )}
                </Link>
                <Link
                    to="/promotions"
                    className={`group flex items-center gap-4 p-4 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                        isActive("/promotions")
                            ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]"
                            : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"
                    }`}
                >
                    {isActive("/promotions") && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                    )}
                    <div
                        className={`p-2.5 rounded-xl transition-all duration-300 ${
                            isActive("/promotions") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"
                        }`}
                    >
                        <Gift className={`w-5 h-5 transition-all duration-300 ${
                            isActive("/promotions") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"
                        }`} />
                    </div>
                    <div className="flex-1 relative z-10">
                        <span className="font-semibold">Danh Sách</span>
                    </div>
                    {isActive("/promotions") && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                    )}
                </Link>
                <Link
                    to="/stats"
                    className={`group flex items-center gap-4 p-4 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                        isActive("/stats")
                            ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]"
                            : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"
                    }`}
                >
                    {isActive("/stats") && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                    )}
                    <div
                        className={`p-2.5 rounded-xl transition-all duration-300 ${
                            isActive("/stats") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"
                        }`}
                    >
                        <TrendingUp className={`w-5 h-5 transition-all duration-300 ${
                            isActive("/stats") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"
                        }`} />
                    </div>
                    <div className="flex-1 relative z-10">
                        <span className="font-semibold">Thống Kê</span>
                    </div>
                    {isActive("/stats") && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                    )}
                </Link>

                <button
                    onClick={onLogout}
                    className="group flex items-center gap-4 p-4 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"
                >
                    <div className="p-2.5 rounded-xl transition-all duration-300 group-hover:bg-blue-700/50">
                        <LogOut className="w-5 h-5 text-blue-300 group-hover:text-blue-100" />
                    </div>
                    <div className="flex-1 relative z-10">
                        <span className="font-semibold">Đăng Xuất</span>
                    </div>
                </button>
            </nav>

        </aside>
    );
};

export default function PromotionStatisticsDashboard() {
    const [overview, setOverview] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [bookingData, setBookingData] = useState([]);
    const [statusRatio, setStatusRatio] = useState([]);
    const [feedbackData, setFeedbackData] = useState([]);
    const [error, setError] = useState(null);

    const [rangeType, setRangeType] = useState("month");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    useEffect(() => {
        fetchData();
    }, [rangeType, from, to]);

    const fetchData = () => {
        axios
            .get(`${API}/statistics/overview`)
            .then(res => setOverview(res.data))
            .catch(err => setError(`Lỗi khi lấy overview: ${err.response?.status || err.message}`));

        axios
            .get(`${API}/statistics/chart/revenue`, { params: { rangeType, from, to } })
            .then(res => {
                const formattedData = res.data.map(item => ({
                    date: item.date ? item.date.toString() : item.date,
                    value: item.value / 1000 // Chia cho 1,000 để hiển thị số nhỏ hơn
                }));
                setRevenueData(formattedData);
            })
            .catch(err => setError(`Lỗi khi lấy doanh thu: ${err.response?.status || err.message}`));

        axios
            .get(`${API}/statistics/chart/bookings`, { params: { rangeType, from, to } })
            .then(res => {
                const formattedData = res.data.map(item => ({
                    date: item.date ? item.date.toString() : item.date,
                    value: item.value
                }));
                setBookingData(formattedData);
            })
            .catch(err => setError(`Lỗi khi lấy bookings: ${err.response?.status || err.message}`));

        axios
            .get(`${API}/statistics/chart/status-ratio`)
            .then(res => {
                console.log("Status ratio data:", res.data);
                setStatusRatio(res.data);
            })
            .catch(err => setError(`Lỗi khi lấy status ratio: ${err.response?.status || err.message}`));

        axios
            .get(`${API}/statistics/chart/feedback`)
            .then(res => setFeedbackData(res.data))
            .catch(err => setError(`Lỗi khi lấy feedback: ${err.response?.status || err.message}`));
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchData();
    };

    const handleLogout = () => {
        window.location.href = "/login";
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <div className="flex flex-1 pt-5 min-h-[calc(100vh-64px)]">

            <LeftMenu onLogout={handleLogout} />
               <div className="flex-1 pl-[50px]  pt-6 pr-4 min-w-0 flex flex-col gap-6 pb-10 ">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                    Thống Kê Khuyến Mãi
                </h1>
                {error && (
                    <div className="p-3 bg-red-100/80 backdrop-blur-sm text-red-700 rounded-lg shadow-md border border-red-200">
                        {error}
                    </div>
                )}

                {overview && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card title="Tổng khuyến mãi" value={overview.totalPromotions} />
                        <Card title="Đang hoạt động" value={overview.activePromotions} color="green" />
                        <Card title="Sắp diễn ra" value={overview.upcomingPromotions} color="blue" />
                        <Card title="Đã kết thúc" value={overview.expiredPromotions} color="red" />
                        <Card title="Booking áp dụng KM" value={overview.totalPromotionBookings} />
                        <Card title="Doanh thu từ KM" value={(overview.totalPromotionRevenue / 1000).toLocaleString() + " VNĐ"} />
                    </div>
                )}
                   <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-3 border border-blue-100">
                       <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-2">Lọc Dữ Liệu</h2>
                       <div className="flex flex-wrap gap-2 items-end">
                           <div className="min-w-[100px]">
                               <label className="block text-xs font-medium text-blue-700">Chọn Khoảng</label>
                               <select
                                   value={rangeType}
                                   onChange={(e) => setRangeType(e.target.value)}
                                   className="mt-1 w-full px-2 py-1.5 bg-white/80 border border-blue-200 rounded-md focus:ring-1 focus:ring-blue-100 focus:border-blue-400 text-gray-800 text-xs"
                               >
                                   <option value="day">Theo Ngày</option>
                                   <option value="month">Theo Tháng</option>
                                   <option value="year">Theo Năm</option>
                               </select>
                           </div>
                           <div className="min-w-[100px]">
                               <label className="block text-xs font-medium text-blue-700">Từ Ngày</label>
                               <input
                                   type="date"
                                   value={from}
                                   onChange={(e) => setFrom(e.target.value)}
                                   className="mt-1 w-full px-2 py-1.5 bg-white/80 border border-blue-200 rounded-md focus:ring-1 focus:ring-blue-100 focus:border-blue-400 text-gray-800 text-xs"
                               />
                           </div>
                           <div className="min-w-[100px]">
                               <label className="block text-xs font-medium text-blue-700">Đến Ngày</label>
                               <input
                                   type="date"
                                   value={to}
                                   onChange={(e) => setTo(e.target.value)}
                                   className="mt-1 w-full px-2 py-1.5 bg-white/80 border border-blue-200 rounded-md focus:ring-1 focus:ring-blue-100 focus:border-blue-400 text-gray-800 text-xs"
                               />
                           </div>
                           <button
                               onClick={handleFilterSubmit}
                               className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 focus:ring-1 focus:ring-blue-500 text-xs shadow-sm hover:shadow-md"
                           >
                               Lọc Dữ Liệu
                           </button>
                       </div>
                   </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ChartCard title="Doanh Thu Từ Khuyến Mãi">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="date" stroke="#4b5e82" />
                                <YAxis stroke="#4b5e82" />
                                <Tooltip formatter={(value) => `${value} VNĐ`} />
                                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                    <ChartCard title="Số Booking Có Khuyến Mãi">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={bookingData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="date" stroke="#4b5e82" />
                                <YAxis stroke="#4b5e82" />
                                <Tooltip />
                                <Bar dataKey="value" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                    <ChartCard title="Tỷ Lệ Trạng Thái Khuyến Mãi">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusRatio}
                                    dataKey="value"
                                    nameKey="label"
                                    outerRadius={100}
                                    label
                                >
                                    {statusRatio.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend
                                    formatter={(value) => {
                                        switch (value) {
                                            case "ACTIVE":
                                                return "Hoạt Động";
                                            case "UPCOMING":
                                                return "Sắp Diễn Ra";
                                            case "EXPIRED":
                                                return "Kết Thúc";
                                            case "PENDING":
                                                return "Chờ Duyệt";
                                            case "CANCELED":
                                                return "Đã Hủy";
                                            default:
                                                return value;
                                        }
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                    <ChartCard title="Đánh Giá Tích Cực Theo Khuyến Mãi">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={feedbackData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="label" stroke="#4b5e82" />
                                <YAxis stroke="#4b5e82" />
                                <Tooltip />
                                <Bar dataKey="value" fill="#ffc658" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
               </div>
            </div>

            <Footer/>

        </div>

    );
}

function Card({ title, value, color = "gray" }) {
    return (
        <div className={`bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-xl border-2 border-${color}-100 text-center transition-all duration-200 hover:shadow-2xl`}>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">{title}</h3>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mt-2">{value}</p>
        </div>
    );
}

function ChartCard({ title, children }) {
    return (
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-xl border-2 border-blue-100 transition-all duration-200 hover:shadow-2xl">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-4">{title}</h2>
            {children}
        </div>
    );
}