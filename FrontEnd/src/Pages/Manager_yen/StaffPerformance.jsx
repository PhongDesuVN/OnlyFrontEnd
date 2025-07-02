
"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance.js";
import Cookies from "js-cookie";
import Footer from "../../Components/FormLogin_yen/Footer.jsx";
import {
    Loader2,
    Crown,
    MessageSquare,
    BarChart2,
    Users,
    Home,
    User,
    Zap,
    LogOut,
} from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

const MetricCard = ({ icon: Icon, label, value }) => (
    <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
        <div className="p-2 bg-purple-100 rounded-lg">
            <Icon className="w-6 h-6 text-purple-600" />
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const TopListCard = ({ title, icon: Icon, list, type }) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-3 mb-4">
            <Icon className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        </div>
        <ul className="space-y-2">
            {list.length === 0 ? (
                <p className="text-sm text-gray-500">Không có dữ liệu</p>
            ) : (
                list.map((staff, index) => (
                    <li key={staff.operatorId} className="flex justify-between items-center">
                        <span className="text-slate-700">{index + 1}. {staff.fullName} (@{staff.username})</span>
                        <span className="text-purple-600 font-semibold">{staff[type]} lượt</span>
                    </li>
                ))
            )}
        </ul>
    </div>
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
        window.history.back();
    };

    const handleStaffList = () => {
        navigate("/staffmanagement");
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
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-2" />
                    <p className="text-white text-lg font-medium">
                        {loading ? "Đang tải hiệu suất nhân viên..." : "Đang tải thông tin quản lý..."}
                    </p>
                    <p className="text-purple-200 text-sm mt-1">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-400 via-indigo-200 to-purple-300">
                <div className="flex flex-1">
                    <div className="w-64 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 text-white shadow-lg">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold mb-4">Menu</h2>
                            <ul className="space-y-2">
                                <li>
                                    <button
                                        onClick={handleBackToHome}
                                        className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-purple-800 hover:text-white"
                                    >
                                        <Home className="w-5 h-5" /> Về trang chủ
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={handleStaffList}
                                        className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-purple-800 hover:text-white"
                                    >
                                        <User className="w-5 h-5" /> Danh sách
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={handleOverview}
                                        className="flex items-center gap-2 w-full text-left p-2 rounded-lg bg-purple-800 text-white"
                                    >
                                        <Zap className="w-5 h-5" /> Tổng quan
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div className="mt-auto">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-red-400 hover:text-red-200 w-full text-left p-2 rounded-lg hover:bg-purple-800"
                            >
                                <LogOut className="w-5 h-5" /> Logout
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 p-4">
                        <div className="max-w-6xl mx-auto text-center">
                            <p className="text-lg font-bold text-red-600 mb-2">Không thể tải dữ liệu hiệu suất</p>
                            <p className="text-gray-500">Vui lòng thử lại sau hoặc liên hệ quản trị viên</p>
                        </div>
                    </div>
                </div>
                <Footer
                    className="w-full bg-gray-800 text-white p-4 fixed bottom-0 left-0 z-10"
                    style={{ width: "calc(100% - 256px)" }}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-400 via-indigo-200 to-purple-300">
            <div className="flex flex-1">
                <div className="w-64 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 text-white shadow-lg">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4">Menu</h2>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={handleBackToHome}
                                    className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-purple-800 hover:text-white"
                                >
                                    <Home className="w-5 h-5" /> Về trang chủ
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={handleStaffList}
                                    className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-purple-800 hover:text-white"
                                >
                                    <User className="w-5 h-5" /> Danh sách
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={handleOverview}
                                    className="flex items-center gap-2 w-full text-left p-2 rounded-lg bg-purple-800 text-white"
                                >
                                    <Zap className="w-5 h-5" /> Tổng quan
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="mt-auto">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-400 hover:text-red-200 w-full text-left p-2 rounded-lg hover:bg-purple-800"
                        >
                            <LogOut className="w-5 h-5" /> Logout
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-2 bg-purple-600 rounded-lg">
                                    <BarChart2 className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                                        Tổng Quan Hiệu Suất Nhân Viên
                                    </h1>
                                    <p className="text-slate-600 flex items-center gap-2 text-sm">
                                        <Zap className="w-4 h-4 text-yellow-500" />
                                        Theo dõi hiệu suất đội ngũ của bạn
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                            <MetricCard icon={Users} label="Tổng nhân viên" value={data?.totalStaffs || 0} />
                            <MetricCard icon={Crown} label="Top theo Booking" value={data?.topBookingStaffs?.length || 0} />
                            <MetricCard icon={MessageSquare} label="Top theo Phản hồi" value={data?.topFeedbackStaffs?.length || 0} />
                            <MetricCard icon={BarChart2} label="Thống kê theo tháng" value={`${data?.monthlyCreatedStats ? Object.keys(data.monthlyCreatedStats).length : 0} tháng`} />
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow mb-6">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Nhân viên mới theo tháng</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={Object.entries(data?.monthlyCreatedStats || {}).map(([month, count]) => ({ month, count }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#6366F1" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TopListCard title="Top 5 Nhân viên theo số lượng Booking" icon={Crown} list={data?.topBookingStaffs || []} type="totalBookings" />
                            <TopListCard title="Top 5 Nhân viên được phản hồi nhiều" icon={MessageSquare} list={data?.topFeedbackStaffs || []} type="totalFeedbacks" />
                        </div>
                    </div>
                </div>
            </div>
            <Footer
                className="w-full bg-gray-800 text-white p-4 fixed bottom-0 left-0 z-10"
                style={{ width: "calc(100% - 256px)" }}
            />
        </div>
    );
}
