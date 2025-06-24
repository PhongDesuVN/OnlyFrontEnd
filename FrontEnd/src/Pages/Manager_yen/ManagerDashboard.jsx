"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import React, { useState } from 'react';
import React, { useState, useRef, useEffect } from 'react';
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
} from "recharts"
import {
    Users, Package, TrendingUp, AlertTriangle,
    CheckCircle, Clock, Star, MapPin
    Users, Package, TrendingUp, MapPin, ChevronLeft, ChevronRight, Clock, Settings
} from 'lucide-react';
import Header from '../../Components/FormLogin_yen/Header';
import Footer from '../../Components/FormLogin_yen/Footer';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    const [selectedPeriod, setSelectedPeriod] = useState('month');
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import RequireAuth from '../../Components/RequireAuth';
    Users,
    Package,
    TrendingUp,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Clock,
    Settings,
} from "lucide-react"
import Cookies from "js-cookie"

const Dashboard = () => {
    const [currentPage, setCurrentPage] = useState(0)
    const [selectedPeriod, setSelectedPeriod] = useState("month")
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef(null)
    const navigate = useNavigate()

const performanceData = [
    { month: 'T6/2023', staff: 85, efficiency: 88, satisfaction: 92 },
    { month: 'T7/2023', staff: 90, efficiency: 85, satisfaction: 89 },
    { month: 'T8/2023', staff: 88, efficiency: 92, satisfaction: 94 },
    { month: 'T9/2023', staff: 92, efficiency: 89, satisfaction: 91 },
    { month: 'T10/2023', staff: 87, efficiency: 94, satisfaction: 93 },
];

    const operationalData = [
        { name: "Hoàn thành", value: 342, color: "#10B981" },
        { name: "Đang xử lý", value: 45, color: "#F59E0B" },
        { name: "Chậm trễ", value: 12, color: "#EF4444" },
        { name: "Tạm dừng", value: 8, color: "#6B7280" },
    ]

    const cards = [
        {
            title: "Xu hướng hiệu suất",
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
    ]

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false)
            }
        }
        if (showMenu) document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [showMenu])

    const handleLogout = () => {
        Cookies.remove("authToken")
        Cookies.remove("username")
        Cookies.remove("userRole")
        Cookies.remove("managerId")
        navigate("/login")
    }

    const handleNavigateStaffList = () => {
        const managerId = Cookies.get("managerId")
        if (managerId) navigate("/managerstaff")
    }

    const handleNavigatePromotion = () => {
        navigate("/promotions")
    }

    return (
        <div className="manager-dashboard-root min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-40 h-20 bg-gradient-to-r from-indigo-900 to-purple-700">
                <div className="flex items-center justify-between h-full px-6">
                    <h1 className="text-2xl font-bold text-white">Dashboard Quản lý</h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowMenu((v) => !v)}
                            className="p-2 rounded-full bg-white shadow hover:bg-gray-100"
                        >
                            <Settings className="w-6 h-6 text-gray-700" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Layout */}
            <div className="flex flex-row flex-1 overflow-hidden pt-20 gap-10" style={{ minHeight: 0 }}>
                {/* Sidebar */}
                <div className="w-80 min-w-[260px] max-w-xs px-8 py-10 flex flex-col gap-6 bg-white/80 rounded-2xl shadow-lg mt-4 ml-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Hành động nhanh</h3>
                    <button
                        onClick={handleNavigateStaffList}
                        className="flex items-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow hover:opacity-90"
                    >
                        <Users className="w-5 h-5" /> Quản lý nhân viên
                    </button>
                    <button
                        onClick={handleNavigatePromotion}
                        className="flex items-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow hover:opacity-90"
                    >
                        <Package className="w-5 h-5" /> Quản lý khuyến mãi
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow hover:opacity-90">
                        <TrendingUp className="w-5 h-5" /> Báo cáo hiệu suất
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow hover:opacity-90">
                        <MapPin className="w-5 h-5" /> Quản lý vận chuyển
                    </button>
                    <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Thời gian
                        </label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                        >
                            <option value="week">Tuần này</option>
                            <option value="month">Tháng này</option>
                            <option value="quarter">Quý này</option>
                        </select>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
                    <div className="w-full max-w-4xl flex flex-col items-center">
                        <div className="flex items-center justify-between w-full mb-6">
                            <button
                                onClick={() => setCurrentPage((prev) => (prev === 0 ? cards.length - 1 : prev - 1))}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <h3 className="text-3xl font-bold text-gray-800">{cards[currentPage].title}</h3>
                            <button
                                onClick={() => setCurrentPage((prev) => (prev === cards.length - 1 ? 0 : prev + 1))}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="w-full bg-white rounded-3xl p-10 shadow-2xl flex items-center justify-center" style={{ minHeight: 350 }}>
                            {cards[currentPage].content}
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Menu */}
            {showMenu && (
                <div ref={menuRef} className="absolute top-20 right-6 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50">
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Thông tin cá nhân</button>
                    <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                        onClick={handleLogout}
                    >
                        Đăng xuất
                    </button>
                </div>
            )}

            {/* Footer */}
            <div className="h-16 bg-gray-800 flex items-center justify-center">
                <p className="text-white text-sm">© 2024 Dashboard Quản lý. All rights reserved.</p>
            </div>
        </div>
    )
}
const operationalData = [
    { name: 'Hoàn thành', value: 342, color: '#10B981' },
    { name: 'Đang xử lý', value: 45, color: '#F59E0B' },
    { name: 'Chậm trễ', value: 12, color: '#EF4444' },
    { name: 'Tạm dừng', value: 8, color: '#6B7280' },
];

const Dashboard = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();
    const staffPerformance = [
        { name: 'Operations Staff', rating: 4.2, tasks: 145, efficiency: 89 },
        { name: 'Transport Unit', rating: 4.5, tasks: 98, efficiency: 94 },
        { name: 'Storage Unit', rating: 4.1, tasks: 87, efficiency: 86 },
        { name: 'Customer Service', rating: 4.3, tasks: 156, efficiency: 91 },
    ];

    const recentAlerts = [
        { type: 'warning', message: 'Hệ thống chatbot cần được training thêm', time: '2 giờ trước' },
        { type: 'info', message: 'Nhận phản hồi từ khách hàng về chất lượng dịch vụ', time: '4 giờ trước' },
        { type: 'success', message: 'Hoàn thành đánh giá hiệu suất nhân viên tháng này', time: '1 ngày trước' },
    ];
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Header />

            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
                {/* Sidebar hành động nhanh */}
                <div className="w-full lg:w-1/4 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Hành động nhanh</h3>
                    <button onClick={() => navigate('/managestaff')} className="flex items-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow hover:opacity-90">
                        <Users className="w-5 h-5" /> Quản lý nhân viên
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow hover:opacity-90">
                        <Package className="w-5 h-5" /> Theo dõi đơn hàng
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow hover:opacity-90">
                        <TrendingUp className="w-5 h-5" /> Báo cáo hiệu suất
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow hover:opacity-90">
                        <MapPin className="w-5 h-5" /> Quản lý vận chuyển
                    </button>
                    <select
                        className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                        <option value="week">Tuần này</option>
                        <option value="month">Tháng này</option>
                        <option value="quarter">Quý này</option>
                    </select>
                </div>

                {/* Main content with charts */}
                <div className="w-full lg:w-3/4 space-y-8">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Xu hướng hiệu suất</h3>
                        <ResponsiveContainer width="100%" height={300}>
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
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Tình trạng vận hành</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={operationalData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={120}
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
                        <div className="flex flex-wrap justify-center mt-4 gap-4">
                            {operationalData.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
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
            )
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
            )
        }
    ];

    // Chiều cao header/footer (px)
    const HEADER_HEIGHT = 80;
    const FOOTER_HEIGHT = 64;

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

    const handleViewDetails = async (transportUnitId) => {
        try {
            // Gọi API lấy approval theo transportUnitId (cần backend hỗ trợ)
            const approvalRes = await fetch(`http://localhost:8083/api/transport-unit-approvals/by-transport-unit/${transportUnitId}`, {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('authToken')}`,
                },
            });
            if (approvalRes.ok) {
                const approval = await approvalRes.json();
                if (approval.status === "APPROVED") {
                    setSelectedUnit(approval); // approval chứa email, address, ...
                    setShowModal(true);
                } else {
                    alert("Đơn vị vận chuyển này chưa được duyệt!");
                }
            } else {
                alert("Không tìm thấy thông tin phê duyệt!");
            }
        } catch (err) {
            alert("Lỗi khi lấy thông tin phê duyệt!");
        }
    };

    return (
        <RequireAuth>
            <div className="manager-dashboard-root min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                {/* Nền đậm cho header */}
                <div className="fixed top-0 left-0 right-0 z-40 h-20 bg-gradient-to-r from-indigo-900 to-purple-700"></div>
                <Header dashboardHideHome />
                <style>
                    {`
                        .manager-dashboard-root header a[href="/"]:not(:has(.flex-col)) {
                            display: none !important;
                        }
                    `}
                </style>
                <div
                    className="flex flex-row flex-1 overflow-hidden pt-20 gap-10"
                    style={{
                        height: `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`,
                        minHeight: 0
                    }}
                >
                    {/* Sidebar */}
                    <div className="w-80 min-w-[260px] max-w-xs px-8 py-10 flex flex-col gap-6 bg-white/80 rounded-2xl shadow-lg mt-4 ml-4">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Hành động nhanh</h3>
                        <button className="flex items-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow hover:opacity-90">
                            <Users className="w-5 h-5" /> Quản lý nhân viên
                        </button>
                        <button className="flex items-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow hover:opacity-90">
                            <Package className="w-5 h-5" /> Theo dõi đơn hàng
                        </button>
                        <button className="flex items-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow hover:opacity-90">
                            <TrendingUp className="w-5 h-5" /> Báo cáo hiệu suất
                        </button>
                        <button
                            onClick={() => navigate('/transport-units')}
                            className="flex items-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow hover:opacity-90"
                        >
                        <button className="flex items-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow hover:opacity-90">
                            <MapPin className="w-5 h-5" /> Quản lý vận chuyển
                        </button>
                        <div className="mt-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Thời gian
                            </label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                            >
                                <option value="week">Tuần này</option>
                                <option value="month">Tháng này</option>
                                <option value="quarter">Quý này</option>
                            </select>
                        </div>
                    </div>
                    {/* Paging card bên phải */}
                    <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
                        <div className="w-full max-w-4xl flex flex-col items-center">
                            <div className="flex items-center justify-between w-full mb-6">
                                <button
                                    onClick={() => setCurrentPage((prev) => (prev === 0 ? cards.length - 1 : prev - 1))}
                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <h3 className="text-3xl font-bold text-gray-800">{cards[currentPage].title}</h3>
                                <button
                                    onClick={() => setCurrentPage((prev) => (prev === cards.length - 1 ? 0 : prev + 1))}
                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="w-full bg-white rounded-3xl p-10 shadow-2xl flex items-center justify-center" style={{ minHeight: 350 }}>
                                {cards[currentPage].content}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Footer phủ toàn bộ chiều ngang, luôn ở dưới */}
                <div style={{ height: FOOTER_HEIGHT }}>
                    <Footer />
                </div>
                <div
                    style={{
                        position: "absolute",
                        top: 20,
                        right: 40,
                        zIndex: 50,
                    }}
                >
                    <button
                        onClick={() => setShowMenu((v) => !v)}
                        className="p-2 rounded-full bg-white shadow hover:bg-gray-100"
                    >
                        <Settings className="w-6 h-6 text-gray-700" />
                    </button>
                    {showMenu && (
                        <div
                            ref={menuRef}
                            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50"
                        >
                            <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                onClick={() => {
                                    setShowMenu(false);
                                    // Hiện modal hoặc navigate tới trang profile
                                }}
                            >
                                Thông tin cá nhân
                            </button>
                            <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                                onClick={handleLogout}
                            >
                                Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </RequireAuth>
    );
};

export default Dashboard;