"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import Cookies from "js-cookie";
import RequireAuth from "../../Components/RequireAuth";
import Header from "../../Components/FormLogin_yen/Header";
import Footer from "../../Components/FormLogin_yen/Footer";
import {
    Users, Package, TrendingUp, MapPin, ChevronDown, Calendar, Filter
} from "lucide-react";
import { Settings, User, Circle } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance.js";
import {
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line
} from "recharts";

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        overview: {},
        recentIssues: [],
        topOperators: [],
    });
    const [chartDataRevenue, setChartDataRevenue] = useState([]);
    const [chartDataOrders, setChartDataOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [filterExpanded, setFilterExpanded] = useState(false);
    const [currentPage, setCurrentPage] = useState('main');

    const [range, setRange] = useState("month");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const navigate = useNavigate();
    const username = Cookies.get("username");

    const fetchDashboardData = async () => {
        try {
            const managerId = Cookies.get("managerId");
            const token = Cookies.get("authToken");

            if (!managerId || !token) {
                navigate("/login");
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            };

            let startDate, endDate;
            const today = new Date();
            switch (range) {
                case "week":
                    const monday = new Date(today);
                    monday.setDate(today.getDate() - today.getDay() + 1);
                    startDate = monday.toISOString().split("T")[0];
                    endDate = today.toISOString().split("T")[0];
                    break;
                case "month":
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
                    endDate = today.toISOString().split("T")[0];
                    break;
                case "year":
                    startDate = new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0];
                    endDate = today.toISOString().split("T")[0];
                    break;
                case "range":
                    startDate = fromDate;
                    endDate = toDate;
                    break;
                case "today":
                default:
                    startDate = today.toISOString().split("T")[0];
                    endDate = startDate;
            }

            const operatorFilter = {
                fromDate: startDate,
                toDate: endDate,
                limit: 5
            };

            const revenueFilter = {
                range,
                fromDate: startDate,
                toDate: endDate
            };

            const orderFilter = {
                range,
                fromDate: startDate,
                toDate: endDate
            };

            const [overviewRes, issueRes, operatorRes, chartRevenueRes, chartOrdersRes] = await Promise.all([
                axiosInstance.get("/api/dashboard/overview", config),
                axiosInstance.get("/api/dashboard/recent-issues", {
                    ...config,
                    params: {
                        fromDate: startDate,
                        toDate: endDate,
                        limit: 5
                    }
                }),
                axiosInstance.post("/api/dashboard/top-operators", operatorFilter, config),
                axiosInstance.post("/api/dashboard/chart/revenue", revenueFilter, config),
                axiosInstance.post("/api/dashboard/chart/orders", orderFilter, config)
            ]);

            setDashboardData({
                overview: overviewRes.data,
                recentIssues: issueRes.data,
                topOperators: operatorRes.data
            });

            setChartDataRevenue(chartRevenueRes.data);
            setChartDataOrders(chartOrdersRes.data);
            setLoading(false);
        } catch (err) {
            setError("Không thể tải dữ liệu dashboard");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [range, fromDate, toDate]);

    const getFilterLabel = () => {
        switch (range) {
            case "today": return "Hôm nay";
            case "week": return "Tuần này";
            case "month": return "Tháng này";
            case "year": return "Năm nay";
            case "range": return fromDate && toDate ? `${fromDate} - ${toDate}` : "Khoảng ngày";
            default: return "Chọn khoảng thời gian";
        }
    };

    const handleLogout = () => {
        Cookies.remove("authToken");
        Cookies.remove("managerId");
        Cookies.remove("username");
        navigate("/login");
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    const { overview, topOperators, recentIssues } = dashboardData;

    return (
        <RequireAuth>
            <div className="min-h-screen bg-blue-200 flex flex-col">
                <Header />
                <div className="flex flex-1 pt-24 px-6 gap-6">
                    {/* Sidebar */}
                    <div className="w-80 min-w-[260px] max-w-xs px-6 py-8 flex flex-col gap-6 bg-white rounded-2xl shadow-lg">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Hành động nhanh</h3>
                        <button onClick={() => navigate("/managerstaff")} className="flex items-center gap-3 w-full px-4 py-3 text-white bg-blue-600 rounded-lg shadow hover:opacity-90">
                            <Users className="w-5 h-5" /> Quản lý nhân viên
                        </button>
                        <button onClick={() => navigate("/promotions")} className="flex items-center gap-3 w-full px-4 py-3 text-white bg-green-600 rounded-lg shadow hover:opacity-90">
                            <Package className="w-5 h-5" /> Quản lý khuyến mãi
                        </button>
                        <button className="flex items-center gap-3 w-full px-4 py-3 text-white bg-purple-600 rounded-lg shadow hover:opacity-90">
                            <TrendingUp className="w-5 h-5" /> Báo cáo hiệu suất
                        </button>
                        <button onClick={() => navigate("/transport-units/overview")} className="flex items-center gap-3 w-full px-4 py-3 text-white bg-orange-600 rounded-lg shadow hover:opacity-90">
                            <MapPin className="w-5 h-5" /> Quản lý vận chuyển
                        </button>
                        <button onClick={() => navigate("/manager/pending-staff")} className="flex items-center gap-3 w-full px-4 py-3 text-white bg-pink-600 rounded-lg shadow hover:opacity-90">
                            <Users className="w-5 h-5" /> Duyệt nhân viên mới
                        </button>
                        {/* User Profile */}
                        <div className="p-2 border-t border-blue-200">
                            <div className="userinfo-card bg-blue-100 rounded-lg p-3 flex flex-col gap-2 border border-gray-200">
                                {currentPage === 'main' ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-800">{username || "Tài khoản"}</p>
                                                <div className="flex items-center gap-1">
                                                    <p className="text-xs text-gray-500">Nhân viên</p>
                                                    <Circle className="w-2 h-2 text-green-500" /> {/* Trạng thái online */}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className="p-1 rounded-full hover:bg-gray-100 transition"
                                            onClick={() => setCurrentPage('settings')}
                                            aria-label="Cài đặt"
                                        >
                                            <Settings className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-800">{username || "Tài khoản"}</p>
                                                <div className="flex items-center gap-1">
                                                    <p className="text-xs text-gray-500">Nhân viên</p>
                                                    <Circle className="w-2 h-2 text-green-500" /> {/* Trạng thái online */}
                                                </div>
                                            </div>
                                        </div>
                                        <NavLink
                                            to="/profile/main"
                                            className={({ isActive }) =>
                                                `block px-3 py-1.5 rounded text-sm font-medium transition ${
                                                    isActive ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                }`
                                            }
                                        >
                                            Thông tin cá nhân
                                        </NavLink>
                                        <NavLink to="/logout">
                                        <button className="w-full px-4 py-2 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition">
                                            Đăng xuất
                                        </button>
                                        </NavLink>
                                        <button
                                            className="text-xs text-gray-400 hover:underline mt-1 text-center"
                                            onClick={() => setCurrentPage('main')}
                                        >
                                            Quay lại
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col gap-6 pb-10">

                        {/* Thống kê tổng quan */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h4 className="text-lg font-bold">Tổng số đơn hàng hôm nay</h4>
                                <p className="text-2xl mt-2">{overview?.totalOrders || 0}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h4 className="text-lg font-bold">Doanh thu hôm nay</h4>
                                <p className="text-2xl mt-2">{(overview?.revenueToday || 0).toLocaleString()} VND</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h4 className="text-lg font-bold">Khuyến mãi đang chạy</h4>
                                <p className="text-2xl mt-2">{overview?.activePromotions || 0}</p>
                            </div>
                        </div>

                        {/* Improved Filter Section */}
                        <div className="relative">
                            <button
                                onClick={() => setFilterExpanded(!filterExpanded)}
                                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200"
                            >
                                <Calendar className="w-4 h-4 text-gray-600" />
                                <span className="text-gray-700 font-medium">{getFilterLabel()}</span>
                                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${filterExpanded ? 'rotate-180' : ''}`} />
                            </button>

                            {filterExpanded && (
                                <div className="absolute left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[320px] z-10">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Filter className="w-4 h-4 text-gray-600" />
                                            <h3 className="font-semibold text-gray-800">Bộ lọc thời gian</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { value: "today", label: "Hôm nay" },
                                                { value: "week", label: "Tuần này" },
                                                { value: "month", label: "Tháng này" },
                                                { value: "year", label: "Năm nay" },
                                            ].map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setRange(option.value)}
                                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                                        range === option.value
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="border-t pt-3">
                                            <button
                                                onClick={() => setRange("range")}
                                                className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 mb-3 ${
                                                    range === "range"
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                Khoảng ngày tùy chọn
                                            </button>

                                            {range === "range" && (
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-sm text-gray-600 w-16">Từ:</label>
                                                        <input
                                                            type="date"
                                                            value={fromDate}
                                                            onChange={(e) => setFromDate(e.target.value)}
                                                            className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-sm text-gray-600 w-16">Đến:</label>
                                                        <input
                                                            type="date"
                                                            value={toDate}
                                                            onChange={(e) => setToDate(e.target.value)}
                                                            className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 pt-3 border-t">
                                            <button
                                                onClick={() => {
                                                    fetchDashboardData();
                                                    setFilterExpanded(false);
                                                }}
                                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                                            >
                                                Áp dụng
                                            </button>
                                            <button
                                                onClick={() => setFilterExpanded(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 text-gray-700"
                                            >
                                                Đóng
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Biểu đồ doanh thu */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h4 className="text-xl font-bold mb-4">Biểu đồ doanh thu</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartDataRevenue} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis tickFormatter={(v) => v.toLocaleString('vi-VN')} />
                                    <Tooltip formatter={(v) => `${v.toLocaleString('vi-VN')} VND`} />
                                    <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Biểu đồ đơn hàng */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h4 className="text-xl font-bold mb-4">Biểu đồ số đơn hàng</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartDataOrders} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis tickFormatter={(v) => v.toLocaleString('vi-VN')} />
                                    <Tooltip formatter={(v) => `${v.toLocaleString('vi-VN')} đơn`} />
                                    <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Top 5 & Issue */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h4 className="text-xl font-bold mb-4">Top 5 nhân viên có nhiều đơn hàng nhất</h4>
                                <ul className="divide-y">
                                    {topOperators.map((op, idx) => (
                                        <li key={idx} className="flex justify-between py-2 font-medium">
                                            <span className="w-1/2 truncate">{op.operatorName}</span>
                                            <span className="w-1/4 text-right">{op.successOrders} đơn</span>
                                            <span className="w-1/4 text-right">{op.onTimeRate?.toFixed(1)}%</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h4 className="text-xl font-bold mb-4">Vấn đề gần đây</h4>
                                <ul className="divide-y">
                                    {recentIssues.map((i, idx) => (
                                        <li key={idx} className="flex justify-between py-2">
                                            <span className="w-3/4 truncate">{i.description}</span>
                                            <span className="w-1/4 text-right">{i.status}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </RequireAuth>
    );
};

export default Dashboard;