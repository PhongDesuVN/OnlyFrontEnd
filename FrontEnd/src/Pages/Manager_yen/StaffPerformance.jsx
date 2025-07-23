"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance.js";
import Cookies from "js-cookie";
import Header from '../../Components/FormLogin_yen/Header.jsx';
import Footer from "../../Components/FormLogin_yen/Footer.jsx";
import {
    Loader2, Crown, MessageSquare, BarChart2, Users, Home, User, Zap, LogOut, Truck
} from "lucide-react";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

const MetricCard = ({ icon: Icon, label, value }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 p-4 flex items-center gap-4">
        <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const TopListCard = ({ title, icon: Icon, list, type }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 p-6">
        <div className="flex items-center gap-3 mb-4">
            <Icon className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">{title}</h2>
        </div>
        <ul className="space-y-4">
            {list.length === 0 ? (
                <p className="text-sm text-gray-500">Không có dữ liệu</p>
            ) : (
                list.map((staff, index) => (
                    <li key={staff.operatorId} className="flex justify-between items-center">
                        <span className="text-slate-700">{index + 1}. {staff.fullName}</span>
                        <span className="text-gray-600 font-medium">
  ({staff[type] || 0} {type === "totalBookings" ? "lượt đặt" : "phản hồi"})
</span>

                    </li>
                ))
            )}
        </ul>
    </div>
);

// Component Sidebar
const LeftMenu = ({ onBackToHome, onStaffList, onOverview, onLogout }) => (
    <aside className="w-72 fixed top-0 left-0 pt-[96px] h-screen z-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl border-r border-blue-700/30 backdrop-blur-sm">
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
            <button
                onClick={onBackToHome}
                className="w-full flex items-center justify-start gap-4 p-3 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:bg-blue-700/60"
            >
                <div className="min-w-[40px] h-[40px] flex items-center justify-center rounded-xl bg-blue-500/40">
                    <Home className="w-5 h-5 text-blue-100" />
                </div>
                <span className="flex-1 font-semibold text-left">Về trang chủ</span>
            </button>
            <button
                onClick={onStaffList}
                className="w-full flex items-center justify-start gap-4 p-3 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:bg-blue-700/60"
            >
                <div className="min-w-[40px] h-[40px] flex items-center justify-center rounded-xl bg-blue-500/40">
                    <User className="w-5 h-5 text-blue-100" />
                </div>
                <span className="flex-1 font-semibold text-left">Danh sách</span>
            </button>
            <button
                onClick={onOverview}
                className="w-full flex items-center justify-start gap-4 p-3 rounded-xl text-sm font-medium text-white transition-all duration-300 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 shadow-xl shadow-blue-900/40 scale-[1.02]"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                <div className="min-w-[40px] h-[40px] flex items-center justify-center rounded-xl bg-blue-500/40 shadow-lg">
                    <Zap className="w-5 h-5 text-blue-100" />
                </div>
                <span className="flex-1 font-semibold text-left">Tổng quan</span>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
            </button>
            <button
                onClick={onLogout}
                className="w-full flex items-center justify-start gap-4 p-3 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:bg-blue-700/60"
            >
                <div className="min-w-[40px] h-[40px] flex items-center justify-center rounded-xl bg-blue-500/40">
                    <LogOut className="w-5 h-5 text-blue-100" />
                </div>
                <span className="flex-1 font-semibold text-left">Đăng Xuất</span>
            </button>
        </nav>
        <div className="absolute bottom-8 left-6 right-6">
            <div className="relative">
                <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent blur-sm"></div>
            </div>
        </div>
    </aside>
);

export default function StaffPerformance() {
    const [managerId, setManagerId] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get("authToken");
        if (token) {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setManagerId(payload.managerId);
        }
    }, []);

    useEffect(() => {
        if (managerId) fetchData();
    }, [managerId]);

    const fetchData = async () => {
        if (!managerId) return;
        setLoading(true);
        try {
            const res = await axios.get(`/api/v1/manager/${managerId}/staff/performance`);
            if (res.data && res.data.data) {
                setData(res.data.data);
            } else {
                console.error("Unexpected response format", res);
                setData(null);
            }
        } catch (error) {
            console.error("Error fetching staff performance:", error);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToHome = () => {
        navigate("/manager-dashboard");
    };

    const handleStaffList = () => {
        navigate("/managerstaff");
    };

    const handleOverview = () => {
        navigate("/staffperformance");
    };

    const handleLogout = () => {
        Cookies.remove("authToken");
        window.location.href = "/login";
    };

    if (loading || !managerId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-2" />
                    <p className="text-white text-lg font-medium">
                        {loading ? "Đang tải hiệu suất nhân viên..." : "Đang tải thông tin quản lý..."}
                    </p>
                    <p className="text-blue-200 text-sm mt-1">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <div className="flex-grow flex">
                    <LeftMenu
                        onBackToHome={handleBackToHome}
                        onStaffList={handleStaffList}
                        onOverview={handleOverview}
                        onLogout={handleLogout}
                    />
                    <div className="flex-1 ml-72 pt-20 pb-16 px-6">
                        <main>
                            <div className="max-w-7xl mx-auto text-center">
                                <p className="text-lg font-bold text-red-600 mb-2">Không thể tải dữ liệu hiệu suất</p>
                                <p className="text-gray-500">Vui lòng thử lại sau hoặc liên hệ quản trị viên</p>
                            </div>
                        </main>
                        <Footer />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <LeftMenu
                    onBackToHome={handleBackToHome}
                    onStaffList={handleStaffList}
                    onOverview={handleOverview}
                    onLogout={handleLogout}
                />
                <main className="flex-1 ml-72 pt-20 pb-16 px-6">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-8">
                        Tổng Quan Hiệu Suất Nhân Viên
                    </h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        <MetricCard icon={Users} label="Tổng nhân viên" value={data?.totalStaffs || 0} />
                        <MetricCard icon={Crown} label="Top theo Booking" value={data?.topBookingStaffs?.length || 0} />
                        <MetricCard icon={MessageSquare} label="Top theo Phản hồi" value={data?.topFeedbackStaffs?.length || 0} />
                        <MetricCard icon={BarChart2} label="Thống kê theo tháng" value={`${data?.monthlyCreatedStats ? Object.keys(data.monthlyCreatedStats).length : 0} tháng`} />
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 p-6 mb-8">
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-4">Nhân viên mới theo tháng</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={Object.entries(data?.monthlyCreatedStats || {}).map(([month, count]) => ({ month, count }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TopListCard title="Top 5 Nhân viên theo số lượng Booking" icon={Crown} list={data?.topBookingStaffs || []} type="totalBookings" />
                        <TopListCard title="Top 5 Nhân viên được phản hồi nhiều" icon={MessageSquare} list={data?.topFeedbackStaffs || []} type="totalFeedbacks" />
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}