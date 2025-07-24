"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import Cookies from "js-cookie";
import RequireAuth from "../../Components/RequireAuth";
import Header from "../../Components/FormLogin_yen/Header";
import Footer from "../../Components/FormLogin_yen/Footer";
import {
    Users, Package, TrendingUp, List, Calendar, Filter, ChevronDown, XCircle, CheckCircle, DollarSign, Download, FileText, ArrowLeft
} from "lucide-react";
import { getPagedRevenues, exportExcelV2 } from '../../Services/revenueService';
import revenueService from '../../Services/revenueService';
import { jwtDecode } from 'jwt-decode';
import {
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line
} from "recharts";

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
    const [revenues, setRevenues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [filterExpanded, setFilterExpanded] = useState(false);
    const [filter, setFilter] = useState({
        startDate: '',
        endDate: '',
        sourceType: '',
        beneficiaryId: '',
        bookingId: '',
        minAmount: '',
        maxAmount: ''
    });
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [range, setRange] = useState("month");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const navigate = useNavigate();
    const username = Cookies.get("username");

    useEffect(() => {
        loadRevenues();
        // eslint-disable-next-line
    }, [filter, page, size]);

    const loadRevenues = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = Cookies.get('authToken');
            const params = {
                ...filter,
                page,
                size
            };
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) delete params[key];
            });
            const revenueData = await revenueService.getPagedRevenues(params, token);
            setRevenues(revenueData.content || []);
            setTotalPages(revenueData.totalPages || 1);
        } catch (err) {
            setError('Không thể tải danh sách doanh thu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            setLoading(true);
            const token = Cookies.get('authToken');
            const params = { ...filter };
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) delete params[key];
            });
            await exportExcelV2(params, token);
            setSuccess('Xuất Excel thành công!');
        } catch (err) {
            setError('Xuất Excel thất bại! Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcelByRange = async () => {
        try {
            setLoading(true);
            const token = Cookies.get('authToken');
            if (!fromDate || !toDate) {
                setError('Vui lòng chọn đủ khoảng ngày!');
                setLoading(false);
                return;
            }
            await exportExcelV2({ startDate: fromDate, endDate: toDate }, token);
            setSuccess('Xuất Excel theo khoảng ngày thành công!');
        } catch (err) {
            setError('Xuất Excel theo khoảng ngày thất bại! Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({ ...prev, [name]: value }));
        setPage(0);
    };

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

    // Format currency to VND
    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <RequireAuth>
            <div className="flex min-h-screen bg-gray-50">
                <Header />
                <div className="flex flex-1 pt-[70px] ">
                    {/* Sidebar */}
                    <aside className="w-80 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white pb-[336px] h-full shadow-2xl border-r border-blue-700/30 backdrop-blur-sm z-20 mr-4">
                        {/* Sidebar content (copy from ManagerDashboard.jsx, adjust active link) */}
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
                        <nav className="px-4 space-y-2">
                            <NavLink to="/managerevenue" className={({ isActive }) =>
                                `group flex items-center gap-3 p-3 rounded-xl text-xs font-medium transition-all duration-300 relative overflow-hidden ${isActive ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]" : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"}`
                            }>
                                <div className="p-2 rounded-lg transition-all duration-300 bg-blue-500/40 shadow-lg">
                                    <DollarSign size={18} className="text-blue-100" />
                                </div>
                                <div className="flex-1 relative z-10">
                                    <span className="font-semibold">Quản Lý Doanh Thu</span>
                                </div>
                            </NavLink>
                            {/* Add other NavLinks as needed, similar to ManagerDashboard.jsx */}
                        </nav>
                    </aside>
                    {/* Main Content */}
                    <div className="flex-1 pl-[16px] pt-6 pb-8 pr-4 min-w-0 flex flex-col gap-10">
                        {/* Back to Dashboard Button */}
                        <div className="mb-4">
                            <ActionBtn color="blue" onClick={() => navigate('/manager-dashboard')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay về Trang Tổng Quan
                            </ActionBtn>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mt-6">
                            QUẢN LÝ DOANH THU
                        </h1>
                        {/* Filter Section */}
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
                                                    <ActionBtn
                                                        color="green"
                                                        onClick={handleExportExcelByRange}
                                                        disabled={!fromDate || !toDate || loading}
                                                    >
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Xuất Excel theo khoảng ngày
                                                    </ActionBtn>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2 pt-3 border-t border-blue-200">
                                            <ActionBtn
                                                color="blue"
                                                onClick={() => {
                                                    setFilter({ ...filter, startDate: fromDate, endDate: toDate });
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
                        {/* Table Section */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-blue-100 overflow-hidden">
                            <div className="px-8 py-6 border-b-2 border-blue-100 bg-gradient-to-r from-blue-100 to-blue-50">
                                <h4 className="text-xl font-bold text-blue-900 flex items-center gap-3">
                                    <List className="w-6 h-6 text-blue-600" />
                                    DANH SÁCH DOANH THU
                                </h4>
                            </div>
                            <div className="p-8 overflow-x-auto">
                                <div className="mb-6 flex gap-3">
                                    <ActionBtn color="green" onClick={handleExportExcel}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Xuất Excel
                                    </ActionBtn>
                                    <ActionBtn color="blue" onClick={() => window.print()}>
                                        <FileText className="w-4 h-4 mr-2" />
                                        In Báo Cáo
                                    </ActionBtn>
                                </div>
                                <table className="w-full text-sm">
                                    <thead className="bg-gradient-to-r from-blue-100 to-blue-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-bold text-blue-800 border-b border-blue-200 text-xs">ID</th>
                                            <th className="px-4 py-2 text-left font-bold text-blue-800 border-b border-blue-200 text-xs">Loại Người Hưởng</th>
                                            <th className="px-4 py-2 text-left font-bold text-blue-800 border-b border-blue-200 text-xs">ID Người Hưởng</th>
                                            <th className="px-4 py-2 text-left font-bold text-blue-800 border-b border-blue-200 text-xs">Loại Nguồn</th>
                                            <th className="px-4 py-2 text-left font-bold text-blue-800 border-b border-blue-200 text-xs">ID Nguồn</th>
                                            <th className="px-4 py-2 text-left font-bold text-blue-800 border-b border-blue-200 text-xs">Số Tiền</th>
                                            <th className="px-4 py-2 text-left font-bold text-blue-800 border-b border-blue-200 text-xs">Ngày</th>
                                            <th className="px-4 py-2 text-left font-bold text-blue-800 border-b border-blue-200 text-xs">Mô Tả</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {revenues.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="text-center py-8 text-gray-500">Không có dữ liệu doanh thu để hiển thị</td>
                                            </tr>
                                        ) : (
                                            revenues.map((revenue, idx) => (
                                                <tr
                                                    key={revenue.revenueId}
                                                    className={`hover:bg-blue-50/50 border-b border-blue-200 transition-all duration-200 ${idx % 2 === 0 ? "bg-white/50" : "bg-blue-50/20"}`}
                                                >
                                                    <td className="px-4 py-2">{revenue.revenueId}</td>
                                                    <td className="px-4 py-2">{revenue.beneficiaryType}</td>
                                                    <td className="px-4 py-2">{revenue.beneficiaryId}</td>
                                                    <td className="px-4 py-2">{revenue.sourceType}</td>
                                                    <td className="px-4 py-2">{revenue.sourceId}</td>
                                                    <td className="px-4 py-2 text-green-600 font-medium">{formatVND(revenue.amount)}</td>
                                                    <td className="px-4 py-2">{revenue.date ? new Date(revenue.date).toLocaleDateString() : 'N/A'}</td>
                                                    <td className="px-4 py-2">{revenue.description}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                                <div className="flex justify-center items-center gap-2 mt-4">
                                    <ActionBtn color="gray" disabled={page === 0} onClick={() => setPage(page - 1)}>Trước</ActionBtn>
                                    <span>Trang {page + 1} / {totalPages}</span>
                                    <ActionBtn color="gray" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Sau</ActionBtn>
                                </div>
                            </div>
                        </div>
                        {/* Success & Error Message */}
                        {success && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                {success}
                                <button onClick={() => setSuccess(null)} className="ml-auto text-green-700 hover:text-green-900">
                                    <XCircle className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                                <XCircle className="w-5 h-5 mr-2" />
                                {error}
                                <button onClick={() => setError(null)} className="ml-auto text-red-700 hover:text-red-900">
                                    <XCircle className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {/* Loading Indicator */}
                        {loading && (
                            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <span className="text-gray-700">Đang xử lý...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </RequireAuth>
    );
};

export default Dashboard;
  
