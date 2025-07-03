"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import RequireAuth from "../../Components/RequireAuth";
import Header from "../../Components/FormLogin_yen/Header";
import Footer from "../../Components/FormLogin_yen/Footer";
import {
    Users, Package, TrendingUp, MapPin, ChevronDown
} from "lucide-react";
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
        chartData: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const username = Cookies.get("username");

    useEffect(() => {
        const fetchData = async () => {
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

                const [overviewRes, issueRes, operatorRes, chartRes] = await Promise.all([
                    axiosInstance.get("/api/dashboard/overview", config),
                    axiosInstance.get("/api/dashboard/recent-issues?limit=5", config),
                    axiosInstance.post("/api/dashboard/top-operators", { limit: 5 }, config),
                    axiosInstance.post("/api/dashboard/chart", {
                        type: "revenue",
                        range: "month"
                    }, config)
                ]);

                setDashboardData({
                    overview: overviewRes.data,
                    recentIssues: issueRes.data,
                    topOperators: operatorRes.data,
                    chartData: chartRes.data
                });
                setLoading(false);
            } catch (err) {
                setError("Không thể tải dữ liệu dashboard");
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    const { overview, chartData, topOperators, recentIssues } = dashboardData;

    return (
        <RequireAuth>
            <div className="min-h-screen bg-blue-300 flex flex-col">
                <Header />

                <div className="flex flex-1 pt-24 px-6 gap-6">
                    {/* Sidebar trái */}
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

                        {/* Nút người dùng + dropdown */}
                        <div className="mt-auto relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center justify-between w-full px-4 py-3 bg-blue-500 rounded-lg hover:bg-blue-150"
                            >
                                <span className="truncate text-white">{username || "Tài khoản"}</span>
                                <ChevronDown className="w-4 h-4 ml-2" />
                            </button>

                            {menuOpen && (
                                <div className="absolute bottom-full left-0 w-full mb-2 bg-gray-100 border rounded-lg shadow-md z-50">
                                    <button
                                        onClick={() => navigate("/profile")}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                                    >
                                        Xem hồ sơ
                                    </button>
                                    <button
                                        onClick={() => {
                                            Cookies.remove("authToken");
                                            Cookies.remove("managerId");
                                            Cookies.remove("username");
                                            navigate("/login");
                                        }}
                                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nội dung dashboard */}
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

                        {/* Biểu đồ doanh thu */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h4 className="text-xl font-bold mb-4">Biểu đồ doanh thu</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 20, right: 20, left: 20, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis tickFormatter={(v) => v.toLocaleString('vi-VN')} />
                                    <Tooltip formatter={(v) => `${v.toLocaleString('vi-VN')} VND`} />
                                    <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Grid ngang: Top 5 và Recent Issues */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Top 5 Operators */}
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

                            {/* Vấn đề gần đây */}
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

                <div className="mt-10">
                    <Footer />
                </div>
            </div>
        </RequireAuth>
    );
};

export default Dashboard;
