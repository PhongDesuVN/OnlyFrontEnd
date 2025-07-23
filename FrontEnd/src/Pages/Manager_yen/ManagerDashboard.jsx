"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import Cookies from "js-cookie";
import RequireAuth from "../../Components/RequireAuth";
import Header from "../../Components/FormLogin_yen/Header";
import Footer from "../../Components/FormLogin_yen/Footer";
import {
    Users, Package, TrendingUp, MapPin, ChevronDown, Calendar, Filter, XCircle,
    Truck, LayoutDashboard, Settings, User, Circle, LogOut
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance.js";
import {
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line
} from "recharts";
import LogoutButton from "../../Pages/Login_Register_trung/Logout";

const ActionBtn = ({ color, children, onClick, disabled = false }) => {
    const base = "px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
    const map = {
        blue: "bg-blue-300 text-white hover:bg-blue-400 shadow-blue-100",
        green: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-green-200",
        purple: "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-purple-200",
        orange: "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-orange-200",
        pink: "bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 shadow-pink-200",
        gray: "bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 shadow-gray-200",
        red: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-red-200",
    };
    return (
        <button onClick={onClick} disabled={disabled} className={`${base} ${map[color]}`}>
            {children}
        </button>
    );
};

const Label = ({ children }) => (
    <label className="text-xs font-semibold text-blue-700 uppercase tracking-wider">{children}</label>
);

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

    const isActive = (path) => window.location.pathname === path || window.location.pathname.startsWith(`${path}/`);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-2xl border border-blue-200">
                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-6 text-blue-700 text-xl font-semibold">Đang tải dữ liệu dashboard...</p>
                    <p className="mt-2 text-blue-500">Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md shadow-2xl">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-bold text-red-800">Lỗi tải dữ liệu</h3>
                            <div className="mt-2 text-sm text-red-700">{error}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const { overview, topOperators, recentIssues } = dashboardData;

    return (
        <RequireAuth>
            <div className="flex min-h-screen bg-gray-50">
                <Header/>
                <div className="flex flex-1 pt-[70px]">
                    {/* Sidebar */}
                    <aside className="w-80 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white pb-[336px] h-full shadow-2xl border-r border-blue-700/30 backdrop-blur-sm z-20 mr-4">
                        {/* Enhanced Header */}
                        <div className="mb-10 p-6 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-blue-300/5 to-transparent blur-2xl rounded-2xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">

                                    <div>
                                        <h2 className="text-2xl font-bold text-blue-50 tracking-wide">Hệ Thống Quản Lý</h2>
                                    </div>
                                </div>
                                <div className="w-16 h-1 bg-gradient-to-r from-blue-400 via-blue-300 to-transparent rounded-full"></div>
                            </div>
                        </div>

                        <nav className="px-4 space-y-2"> {/* Giảm space-y từ 3 xuống 2 để giảm khoảng cách giữa các mục */}
                            <NavLink
                                to="/manager-dashboard"
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 p-3 rounded-xl text-xs font-medium transition-all duration-300 relative overflow-hidden ${isActive ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]" : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"}` // Giảm p-4 xuống p-3, gap-4 xuống gap-3, text-sm xuống text-xs, rounded-2xl xuống rounded-xl
                                }
                            >
                                {isActive("/manager-dashboard") && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                                )}
                                <div
                                    className={`p-2 rounded-lg transition-all duration-300 ${isActive("/manager-dashboard") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"}`} // Giảm p-2.5 xuống p-2, rounded-xl xuống rounded-lg
                                >
                                    <LayoutDashboard
                                        size={18} // Giảm size từ 22 xuống 18
                                        className={`transition-all duration-300 ${isActive("/manager-dashboard") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"}`}
                                    />
                                </div>
                                <div className="flex-1 relative z-10">
                                    <span className="font-semibold">Dashboard Quản Lý</span>
                                </div>
                                {isActive("/manager-dashboard") && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div> // Giảm w-1.5 h-12 xuống w-1 h-8
                                )}
                            </NavLink>
                            <NavLink
                                to="/managerstaff"
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 p-3 rounded-xl text-xs font-medium transition-all duration-300 relative overflow-hidden ${isActive ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]" : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"}`
                                }
                            >
                                {isActive("/managerstaff") && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                                )}
                                <div
                                    className={`p-2 rounded-lg transition-all duration-300 ${isActive("/managerstaff") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"}`}
                                >
                                    <Users
                                        size={18}
                                        className={`transition-all duration-300 ${isActive("/managerstaff") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"}`}
                                    />
                                </div>
                                <div className="flex-1 relative z-10">
                                    <span className="font-semibold">Quản Lý Nhân Viên</span>
                                </div>
                                {isActive("/managerstaff") && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                                )}
                            </NavLink>
                            <NavLink
                                to="/promotions"
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 p-3 rounded-xl text-xs font-medium transition-all duration-300 relative overflow-hidden ${isActive ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]" : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"}`
                                }
                            >
                                {isActive("/promotions") && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                                )}
                                <div
                                    className={`p-2 rounded-lg transition-all duration-300 ${isActive("/promotions") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"}`}
                                >
                                    <Package
                                        size={18}
                                        className={`transition-all duration-300 ${isActive("/promotions") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"}`}
                                    />
                                </div>
                                <div className="flex-1 relative z-10">
                                    <span className="font-semibold">Quản Lý Khuyến Mãi</span>
                                </div>
                                {isActive("/promotions") && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                                )}
                            </NavLink>
                            <NavLink
                                to="/report"
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 p-3 rounded-xl text-xs font-medium transition-all duration-300 relative overflow-hidden ${isActive ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]" : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"}`
                                }
                            >
                                {isActive("/report") && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                                )}
                                <div
                                    className={`p-2 rounded-lg transition-all duration-300 ${isActive("/report") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"}`}
                                >
                                    <TrendingUp
                                        size={18}
                                        className={`transition-all duration-300 ${isActive("/report") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"}`}
                                    />
                                </div>
                                <div className="flex-1 relative z-10">
                                    <span className="font-semibold">Báo Cáo Hiệu Suất</span>
                                </div>
                                {isActive("/report") && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                                )}
                            </NavLink>
                            <NavLink
                                to="/transport-units/overview"
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 p-3 rounded-xl text-xs font-medium transition-all duration-300 relative overflow-hidden ${isActive ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]" : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"}`
                                }
                            >
                                {isActive("/transport-units/overview") && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                                )}
                                <div
                                    className={`p-2 rounded-lg transition-all duration-300 ${isActive("/transport-units/overview") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"}`}
                                >
                                    <MapPin
                                        size={18}
                                        className={`transition-all duration-300 ${isActive("/transport-units/overview") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"}`}
                                    />
                                </div>
                                <div className="flex-1 relative z-10">
                                    <span className="font-semibold">Quản Lý Vận Chuyển</span>
                                </div>
                                {isActive("/transport-units/overview") && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                                )}
                            </NavLink>
                            <NavLink
                                to="/manager/pending-staff"
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 p-3 rounded-xl text-xs font-medium transition-all duration-300 relative overflow-hidden ${isActive ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]" : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"}`
                                }
                            >
                                {isActive("/manager/pending-staff") && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                                )}
                                <div
                                    className={`p-2 rounded-lg transition-all duration-300 ${isActive("/manager/pending-staff") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"}`}
                                >
                                    <Users
                                        size={18}
                                        className={`transition-all duration-300 ${isActive("/manager/pending-staff") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"}`}
                                    />
                                </div>
                                <div className="flex-1 relative z-10">
                                    <span className="font-semibold">Duyệt Nhân Viên Mới</span>
                                </div>
                                {isActive("/manager/pending-staff") && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                                )}
                            </NavLink>
                      <NavLink
                                                      to="/manager/pending-storage-units"
                                                      className={({ isActive }) =>
                                                          `group flex items-center gap-3 p-3 rounded-xl text-xs font-medium transition-all duration-300 relative overflow-hidden ${isActive ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]" : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"}`
                                                      }
                                                  >
                                                      {isActive("/manager/pending-storage-units") && (
                                                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                                                      )}
                                                      <div
                                                          className={`p-2 rounded-lg transition-all duration-300 ${isActive("/manager/pending-storage-units") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"}`}
                                                      >
                                                          <Truck
                                                              size={18}
                                                              className={`transition-all duration-300 ${isActive("/manager/pending-storage-units") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"}`}
                                                          />
                                                      </div>
                                                      <div className="flex-1 relative z-10">
                                                          <span className="font-semibold">Duyệt Kho Mới</span>
                                                      </div>
                                                      {isActive("/manager/pending-storage-units") && (
                                                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                                                      )}
                                                  </NavLink>
                            <NavLink
                                to="/managerevenue"
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 p-3 rounded-xl text-xs font-medium transition-all duration-300 relative overflow-hidden ${isActive ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]" : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"}`
                                }
                            >
                                {isActive("/managerevenue") && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                                )}
                                <div
                                    className={`p-2 rounded-lg transition-all duration-300 ${isActive("/managerevenue") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"}`}
                                >
                                    <Package
                                        size={18}
                                        className={`transition-all duration-300 ${isActive("/managerevenue") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"}`}
                                    />
                                </div>
                                <div className="flex-1 relative z-10">
                                    <span className="font-semibold">Quản Lý Doanh Thu</span>
                                </div>

                                {isActive("/managerevenue") && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                                )}
                            </NavLink>
                            <NavLink
                                to="/schedule/calendar"
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 p-3 rounded-xl text-xs font-medium transition-all duration-300 relative overflow-hidden ${isActive ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]" : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"}`
                                }
                            >
                                {isActive("/schedule/calendar") && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                                )}
                                <div
                                    className={`p-2 rounded-lg transition-all duration-300 ${isActive("/schedule/calendar") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"}`}
                                >
                                    <Users
                                        size={18}
                                        className={`transition-all duration-300 ${isActive("/schedule/calendar") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"}`}
                                    />
                                </div>
                                <div className="flex-1 relative z-10">
                                    <span className="font-semibold">Lịch Làm Việc</span>
                                </div>
                                {isActive("/schedule/calendar") && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                                )}
                            </NavLink>
                            <NavLink
                                to="/schedule/shifts"
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 p-3 rounded-xl text-xs font-medium transition-all duration-300 relative overflow-hidden ${isActive ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]" : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"}`
                                }
                            >
                                {isActive("/schedule/shifts") && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                                )}
                                <div
                                    className={`p-2 rounded-lg transition-all duration-300 ${isActive("/schedule/shifts") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"}`}
                                >
                                    <Users
                                        size={18}
                                        className={`transition-all duration-300 ${isActive("/schedule/shifts") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"}`}
                                    />
                                </div>
                                <div className="flex-1 relative z-10">
                                    <span className="font-semibold">Quản Lý Ca Làm</span>
                                </div>
                                {isActive("/schedule/shifts") && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                                )}
                            </NavLink>
                            <NavLink
                                to="/schedule/timeoff"
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 p-3 rounded-xl text-xs font-medium transition-all duration-300 relative overflow-hidden ${isActive ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]" : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"}`
                                }
                            >
                                {isActive("/schedule/timeoff") && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                                )}
                                <div
                                    className={`p-2 rounded-lg transition-all duration-300 ${isActive("/schedule/timeoff") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"}`}
                                >
                                    <Users
                                        size={18}
                                        className={`transition-all duration-300 ${isActive("/schedule/timeoff") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"}`}
                                    />
                                </div>
                                <div className="flex-1 relative z-10">
                                    <span className="font-semibold">Yêu cầu nghỉ phép</span>
                                </div>
                                {isActive("/schedule/timeoff") && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                                )}
                            </NavLink>
                        </nav>

                        {/* User Profile Section */}
                        <div className="absolute bottom-8 left-6 right-6">
                            <div className="relative">
                                <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                                <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent blur-sm"></div>
                            </div>
                            {currentPage === 'main' ? (
                                <div className="flex items-center justify-between p-4 hover:bg-blue-800/60 transition-all duration-150 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-semibold text-blue-50">{username || "Tài khoản"}</p>
                                            <div className="flex items-center gap-1">
                                                <p className="text-xs text-blue-300">Nhân viên</p>
                                                <Circle className="w-2 h-2 text-green-400" />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="p-2 rounded-xl hover:bg-blue-700/50 transition-all duration-150 pointer-events-auto"
                                        onClick={() => setCurrentPage('settings')}
                                        aria-label="Cài đặt"
                                    >
                                        <Settings className="w-5 h-5 text-blue-300 hover:text-blue-100" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 p-4">
                                    <div className="flex items-center gap-3 hover:bg-blue-800/60 transition-all duration-150 rounded-2xl">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-semibold text-blue-50">{username || "Tài khoản"}</p>
                                            <div className="flex items-center gap-1">
                                                <p className="text-xs text-blue-300">Nhân viên</p>
                                                <Circle className="w-2 h-2 text-green-400" />
                                            </div>
                                        </div>
                                    </div>
                                    <NavLink
                                        to="/profile/main"
                                        className={({ isActive }) =>
                                            `group flex items-center gap-4 p-4 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden pointer-events-auto ${isActive ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]" : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"}`
                                        }
                                    >
                                        {isActive("/profile/main") && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                                        )}
                                        <div
                                            className={`p-2.5 rounded-xl transition-all duration-300 ${isActive("/profile/main") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"}`}
                                        >
                                            <User
                                                size={22}
                                                className={`transition-all duration-300 ${isActive("/profile/main") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"}`}
                                            />
                                        </div>
                                        <div className="flex-1 relative z-10">
                                            <span className="font-semibold">Thông Tin Cá Nhân</span>
                                        </div>
                                        {isActive("/profile/main") && (
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                                        )}
                                    </NavLink>
                                    <LogoutButton to="/logout">
                                        <button
                                            className="group flex items-center gap-4 p-4 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01] pointer-events-auto"
                                            onClick={handleLogout}
                                        >
                                            <div className="p-2.5 rounded-xl transition-all duration-300 group-hover:bg-blue-700/50">
                                                <LogOut
                                                    size={22}
                                                    className="transition-all duration-300 text-blue-300 group-hover:text-blue-100"
                                                />
                                            </div>
                                            <div className="flex-1 relative z-10">
                                                <span className="font-semibold">Đăng Xuất</span>
                                            </div>
                                        </button>
                                    </LogoutButton>
                                    <button
                                        className="text-xs text-blue-300 hover:text-blue-100 hover:bg-blue-800/60 p-4 rounded-2xl transition-all duration-150 pointer-events-auto"
                                        onClick={() => setCurrentPage('main')}
                                    >
                                        QUAY LẠI
                                    </button>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 pl-[16px] pt-6 pr-4 min-w-0 flex flex-col gap-10">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mt-6">
                            DASHBOARD QUẢN LÝ
                        </h1>

                        {/* Thống kê tổng quan */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                            <Package className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="ml-5">
                                        <Label>TỔNG SỐ ĐƠN HÀNG HÔM NAY</Label>
                                        <p className="text-3xl font-bold text-blue-900">{overview?.totalOrders || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                                            <TrendingUp className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="ml-5">
                                        <Label>DOANH THU HÔM NAY</Label>
                                        <p className="text-3xl font-bold text-blue-900">{(overview?.revenueToday || 0).toLocaleString('vi-VN')} VND</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                            <Package className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="ml-5">
                                        <Label>KHUYẾN MÃI ĐANG CHẠY</Label>
                                        <p className="text-3xl font-bold text-blue-900">{overview?.activePromotions || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Improved Filter Section */}
                        <div className="relative">
                            <ActionBtn color="blue" onClick={() => setFilterExpanded(!filterExpanded)}>
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">{getFilterLabel()}</span>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${filterExpanded ? 'rotate-180' : ''}`} />
                            </ActionBtn>

                            {filterExpanded && (
                                <div className="absolute left-0 mt-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-blue-200 p-4 min-w-[320px] z-10">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Filter className="w-4 h-4 text-blue-600" />
                                            <h3 className="text-xl font-bold text-blue-900">BỘ LỌC THỜI GIAN</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { value: "today", label: "HÔM NAY" },
                                                { value: "week", label: "TUẦN NÀY" },
                                                { value: "month", label: "THÁNG NÀY" },
                                                { value: "year", label: "NĂM NAY" },
                                            ].map((option) => (
                                                <ActionBtn
                                                    key={option.value}
                                                    color={range === option.value ? "blue" : "gray"}
                                                    onClick={() => setRange(option.value)}
                                                >
                                                    {option.label}
                                                </ActionBtn>
                                            ))}
                                        </div>

                                        <div className="border-t border-blue-200 pt-3">
                                            <ActionBtn
                                                color={range === "range" ? "blue" : "gray"}
                                                onClick={() => setRange("range")}
                                            >
                                                KHOẢNG NGÀY TÙY CHỌN
                                            </ActionBtn>

                                            {range === "range" && (
                                                <div className="flex flex-col gap-2 mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <Label>TỪ:</Label>
                                                        <input
                                                            type="date"
                                                            value={fromDate}
                                                            onChange={(e) => setFromDate(e.target.value)}
                                                            className="flex-1 border-2 border-blue-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white/80 backdrop-blur-sm shadow-sm"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Label>ĐẾN:</Label>
                                                        <input
                                                            type="date"
                                                            value={toDate}
                                                            onChange={(e) => setToDate(e.target.value)}
                                                            className="flex-1 border-2 border-blue-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white/80 backdrop-blur-sm shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 pt-3 border-t border-blue-200">
                                            <ActionBtn
                                                color="blue"
                                                onClick={() => {
                                                    fetchDashboardData();
                                                    setFilterExpanded(false);
                                                }}
                                            >
                                                ÁP DỤNG
                                            </ActionBtn>
                                            <ActionBtn
                                                color="gray"
                                                onClick={() => setFilterExpanded(false)}
                                            >
                                                ĐÓNG
                                            </ActionBtn>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Biểu đồ doanh thu */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-blue-100">
                            <h4 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                                BIỂU ĐỒ DOANH THU
                            </h4>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={chartDataRevenue} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="date" stroke="#374151" />
                                    <YAxis tickFormatter={(v) => v.toLocaleString('vi-VN')} stroke="#374151" />
                                    <Tooltip formatter={(v) => `${v.toLocaleString('vi-VN')} VND`} />
                                    <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Biểu đồ đơn hàng */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-blue-100">
                            <h4 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                                <Package className="w-6 h-6 text-blue-600" />
                                BIỂU ĐỒ SỐ ĐƠN HÀNG
                            </h4>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={chartDataOrders} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="date" stroke="#374151" />
                                    <YAxis tickFormatter={(v) => v.toLocaleString('vi-VN')} stroke="#374151" />
                                    <Tooltip formatter={(v) => `${v.toLocaleString('vi-VN')} đơn`} />
                                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Top 5 & Issue */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-blue-100 overflow-hidden">
                                <div className="px-8 py-6 border-b-2 border-blue-100 bg-gradient-to-r from-blue-100 to-blue-50">
                                    <h4 className="text-xl font-bold text-blue-900 flex items-center gap-3">
                                        <Users className="w-6 h-6 text-blue-600" />
                                        TOP 5 NHÂN VIÊN CÓ NHIỀU ĐƠN HÀNG NHẤT
                                    </h4>
                                </div>
                                <div className="p-8">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gradient-to-r from-blue-100 to-blue-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-bold text-blue-800 border-b border-blue-200 text-xs">TÊN NHÂN VIÊN</th>
                                            <th className="px-4 py-2 text-right font-bold text-blue-800 border-b border-blue-200 text-xs">SỐ ĐƠN</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {topOperators.map((op, idx) => (
                                            <tr
                                                key={idx}
                                                className={`hover:bg-blue-50/50 border-b border-blue-200 transition-all duration-200 ${idx % 2 === 0 ? "bg-white/50" : "bg-blue-50/20"}`}
                                            >
                                                <td className="px-4 py-2 font-semibold text-blue-900 text-sm truncate">{op.operatorName}</td>
                                                <td className="px-4 py-2 text-blue-700 text-sm text-right">{op.successOrders} đơn</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-blue-100 overflow-hidden">
                                <div className="px-8 py-6 border-b-2 border-blue-100 bg-gradient-to-r from-blue-100 to-blue-50">
                                    <h4 className="text-xl font-bold text-blue-900 flex items-center gap-3">
                                        <XCircle className="w-6 h-6 text-red-600" />
                                        VẤN ĐỀ GẦN ĐÂY
                                    </h4>
                                </div>
                                <div className="p-8">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gradient-to-r from-blue-100 to-blue-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-bold text-blue-800 border-b border-blue-200 text-xs">MÔ TẢ</th>
                                            <th className="px-4 py-2 text-right font-bold text-blue-800 border-b border-blue-200 text-xs">TRẠNG THÁI</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {recentIssues.map((i, idx) => (
                                            <tr
                                                key={idx}
                                                className={`hover:bg-blue-50/50 border-b border-blue-200 transition-all duration-200 ${idx % 2 === 0 ? "bg-white/50" : "bg-blue-50/20"}`}
                                            >
                                                <td className="px-4 py-2 text-blue-700 text-sm truncate">{i.description}</td>
                                                <td className="px-4 py-2 text-right">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-bold shadow-sm ${i.status === "PENDING" ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300" : i.status === "RESOLVED" ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300" : "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300"}`}
                                            >
                                                {i.status === "PENDING" ? "ĐANG CHỜ" : i.status === "RESOLVED" ? "ĐÃ GIẢI QUYẾT" : "LỖI"}
                                            </span>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <Footer />
            </div>
        </RequireAuth>
    );
};

export default Dashboard;