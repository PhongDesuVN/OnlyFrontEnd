import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance.js";
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer
} from "recharts";
import { Link } from "react-router-dom";
import {
    Home,
    Gift,
    TrendingUp,
    Zap,
    LogOut,
} from "lucide-react";

const API = "/api/promotions";
const COLORS = ["#4caf50", "#2196f3", "#f44336"];

// LeftMenu Component
const LeftMenu = ({ onLogout }) => {
    return (
        <div className="w-64 bg-gradient-to-br from-blue-600 to-blue-800 min-h-screen p-6 text-white shadow-lg">
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Menu</h2>
                <ul className="space-y-2">
                    <li>
                        <Link to="/manager-dashboard" className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-blue-500">
                            <Home className="w-5 h-5" /> Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/promotions" className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-blue-500">
                            <Gift className="w-5 h-5" /> Promotions List
                        </Link>
                    </li>
                    <li>
                        <Link to="/stats" className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-blue-500">
                            <TrendingUp className="w-5 h-5" /> Statistics
                        </Link>
                    </li>
                    <li>
                        <Link to="/settings" className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-blue-500">
                            <Zap className="w-5 h-5" /> Settings
                        </Link>
                    </li>
                </ul>
            </div>
            <div className="mt-auto">
                <button onClick={onLogout} className="flex items-center gap-2 text-red-400 hover:text-red-200 w-full text-left p-2 rounded-lg hover:bg-blue-500">
                    <LogOut className="w-5 h-5" /> Logout
                </button>
            </div>
        </div>
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
            .catch(err => setError("Lỗi khi lấy overview: " + (err.response?.status || err.message)));

        axios
            .get(`${API}/statistics/chart/revenue`, { params: { rangeType, from, to } })
            .then(res => {
                const formattedData = res.data.map(item => ({
                    date: item.date ? item.date.toString() : item.date,
                    value: item.value
                }));
                setRevenueData(formattedData);
            })
            .catch(err => setError("Lỗi khi lấy doanh thu: " + (err.response?.status || err.message)));

        axios
            .get(`${API}/statistics/chart/bookings`, { params: { rangeType, from, to } })
            .then(res => {
                const formattedData = res.data.map(item => ({
                    date: item.date ? item.date.toString() : item.date,
                    value: item.value
                }));
                setBookingData(formattedData);
            })
            .catch(err => setError("Lỗi khi lấy bookings: " + (err.response?.status || err.message)));

        axios
            .get(`${API}/statistics/chart/status-ratio`)
            .then(res => setStatusRatio(res.data))
            .catch(err => setError("Lỗi khi lấy status ratio: " + (err.response?.status || err.message)));

        axios
            .get(`${API}/statistics/chart/feedback`)
            .then(res => setFeedbackData(res.data))
            .catch(err => setError("Lỗi khi lấy feedback: " + (err.response?.status || err.message)));
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchData();
    };

    const handleLogout = () => {
        window.location.href = "/login";
    };

    return (
        <div className="flex min-h-screen">
            <LeftMenu onLogout={handleLogout} />
            <div className="flex-1 p-6 bg-white">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">Thống kê Khuyến mãi</h1>
                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Lọc dữ liệu</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Loại thời gian</label>
                            <select
                                value={rangeType}
                                onChange={(e) => setRangeType(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="day">Ngày</option>
                                <option value="month">Tháng</option>
                                <option value="year">Năm</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Từ ngày</label>
                            <input
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Đến ngày</label>
                            <input
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleFilterSubmit}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition duration-200"
                            >
                                Lọc
                            </button>
                        </div>
                    </div>
                </div>

                {overview && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <Card title="Tổng khuyến mãi" value={overview.totalPromotions} />
                        <Card title="Đang hoạt động" value={overview.activePromotions} color="green" />
                        <Card title="Sắp diễn ra" value={overview.upcomingPromotions} color="blue" />
                        <Card title="Đã kết thúc" value={overview.expiredPromotions} color="red" />
                        <Card title="Booking áp dụng KM" value={overview.totalPromotionBookings} />
                        <Card title="Doanh thu từ KM" value={overview.totalPromotionRevenue.toLocaleString()} />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Doanh thu từ khuyến mãi">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Số booking có khuyến mãi">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={bookingData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Tỷ lệ trạng thái khuyến mãi">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={statusRatio} dataKey="value" nameKey="label" outerRadius={100}>
                                    {statusRatio.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Đánh giá tích cực theo khuyến mãi">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={feedbackData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#ffc658" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        </div>
    );
}

function Card({ title, value, color = "gray" }) {
    return (
        <div className={`bg-${color}-100 p-4 rounded-lg shadow-md text-center`}>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
    );
}

function ChartCard({ title, children }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
            {children}
        </div>
    );
}