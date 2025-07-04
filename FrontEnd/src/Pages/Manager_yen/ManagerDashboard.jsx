// Cleaned-up ManagerDashboard.jsx

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import RequireAuth from "../../Components/RequireAuth";
import Header from "../../Components/FormLogin_yen/Header";
import Footer from "../../Components/FormLogin_yen/Footer";
import {
    Users,
    Package,
    TrendingUp,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Clock,
    DollarSign,
} from "lucide-react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const performanceData = [
    { month: "T6/2023", staff: 85, efficiency: 88, satisfaction: 92 },
    { month: "T7/2023", staff: 90, efficiency: 85, satisfaction: 89 },
    { month: "T8/2023", staff: 88, efficiency: 92, satisfaction: 94 },
    { month: "T9/2023", staff: 92, efficiency: 89, satisfaction: 91 },
    { month: "T10/2023", staff: 87, efficiency: 94, satisfaction: 93 },
];

const operationalData = [
    { name: "Hoàn thành", value: 342, color: "#10B981" },
    { name: "Đang xử lý", value: 45, color: "#F59E0B" },
    { name: "Chậm trễ", value: 12, color: "#EF4444" },
    { name: "Tạm dừng", value: 8, color: "#6B7280" },
];

const Dashboard = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState("month");
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const cards = [
        {
            title: "Xu hướng hiệu suất",
            icon: "📈",
            content: (
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="staff" stroke="#3B82F6" strokeWidth={2} name="Nhân viên" />
                        <Line type="monotone" dataKey="efficiency" stroke="#10B981" strokeWidth={2} name="Hiệu suất" />
                        <Line type="monotone" dataKey="satisfaction" stroke="#8B5CF6" strokeWidth={2} name="Hài lòng KH" />
                    </LineChart>
                </ResponsiveContainer>
            ),
        },
        {
            title: "Tình trạng vận hành",
            icon: "🎯",
            content: (
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={operationalData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {operationalData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            ),
        },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        if (showMenu) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showMenu]);

    const handleLogout = () => {
        Cookies.remove("authToken");
        Cookies.remove("userRole");
        Cookies.remove("username");
        navigate("/login");
    };

    return (
        <RequireAuth>
            <div className="manager-dashboard-root min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                <Header dashboardHideHome />
                <div className="flex flex-row flex-1 overflow-hidden pt-20 gap-10">
                    <div className="w-80 min-w-[260px] max-w-xs px-8 py-10 flex flex-col gap-6 bg-white/80 rounded-2xl shadow-lg mt-4 ml-4">
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
                        <button onClick={() => navigate("/managerevenue")} className="flex items-center gap-3 w-full px-4 py-3 text-white bg-pink-600 rounded-lg shadow hover:opacity-90">
                            <DollarSign className="w-5 h-5" /> Quản lý doanh thu
                        </button>
                        <div className="mt-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Thời gian
                            </label>
                            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                <option value="week">Tuần này</option>
                                <option value="month">Tháng này</option>
                                <option value="quarter">Quý này</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
                        <div className="w-full max-w-4xl flex flex-col items-center">
                            <div className="flex items-center justify-between w-full mb-6">
                                <button onClick={() => setCurrentPage((prev) => (prev === 0 ? cards.length - 1 : prev - 1))} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <h3 className="text-3xl font-bold text-gray-800">{cards[currentPage].title}</h3>
                                <button onClick={() => setCurrentPage((prev) => (prev === cards.length - 1 ? 0 : prev + 1))} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="w-full bg-white rounded-3xl p-10 shadow-2xl flex items-center justify-center" style={{ minHeight: 350 }}>
                                {cards[currentPage].content}
                            </div>
                        </div>
                    </div>
                </div>

                {showMenu && (
                    <div ref={menuRef} className="absolute top-20 right-6 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50">
                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Thông tin cá nhân</button>
                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600" onClick={handleLogout}>
                            Đăng xuất
                        </button>
                    </div>
                )}

                <Footer />
            </div>
        </RequireAuth>
    );
};

export default Dashboard;
