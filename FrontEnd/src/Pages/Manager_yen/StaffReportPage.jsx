import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
    Mail, TrendingUp, Users, Award, AlertTriangle, Package, MapPin, User, Circle, Settings, Home, Truck
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from "../../utils/axiosInstance.js";
import Cookies from 'js-cookie';
import Header from '../../Components/FormLogin_yen/Header.jsx';
import Footer from '../../Components/FormLogin_yen/Footer.jsx';

// Component Sidebar
const LeftMenu = ({ onBackToHome, onOverview, onApproveNewStaff, onProfile, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false); // State cho dropdown

    return (
        <aside
            className="w-72 pt-20 min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl border-r border-blue-700/30 backdrop-blur-sm"
        >
            <div className="p-6 relative">
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
                    className="group flex items-center gap-4 p-4 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"
                >
                    <div className="p-2.5 rounded-xl transition-all duration-300 group-hover:bg-blue-700/50">
                        <Home className="w-5 h-5 text-blue-300 group-hover:text-blue-100" />
                    </div>
                    <div className="flex-1 relative z-10">
                        <span className="font-semibold">Về trang chủ</span>
                    </div>
                </button>
                <button
                    onClick={onOverview}
                    className="group flex items-center gap-4 p-4 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow46-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                    <div className="p-2.5 rounded-xl bg-blue-500/40 shadow-lg">
                        <TrendingUp className="w-5 h-5 text-blue-100" />
                    </div>
                    <div className="flex-1 relative z-10">
                        <span className="font-semibold">Báo cáo hiệu suất</span>
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                </button>
                <div className="mt-6 pt-4 border-t border-blue-700/30">
                    <div className="p-2">
                        <div className="relative">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="w-full p-3 rounded-xl bg-blue-800/50 text-white flex items-center justify-between border border-blue-700/30"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-medium text-blue-100">{Cookies.get('username') || 'Tài khoản'}</p>
                                        <div className="flex items-center gap-1">
                                            <p className="text-xs text-blue-300">Nhân viên</p>
                                            <Circle className="w-2 h-2 text-green-400" />
                                        </div>
                                    </div>
                                </div>
                                <Settings className="w-4 h-4 text-blue-300" />
                            </button>
                            {isOpen && (
                                <div className="absolute z-50 mt-2 w-full bg-blue-800/90 rounded-xl shadow-lg p-2 border border-blue-700/30">
                                    <button
                                        onClick={onProfile}
                                        className="w-full px-4 py-2 text-left text-sm text-blue-100 hover:bg-blue-700/50 rounded"
                                    >
                                        Thông tin cá nhân
                                    </button>
                                    <button
                                        onClick={onLogout}
                                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-600/30 rounded"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </aside>
    );
};
const EmailButton = ({ staff, status, onSend }) => {
    const buttonStatus = {
        sending: { text: 'Đang gửi...', disabled: true, className: 'bg-gradient-to-r from-yellow-600 to-yellow-700' },
        sent: { text: 'Đã gửi ✓', disabled: true, className: 'bg-gradient-to-r from-green-600 to-green-700' },
        error: { text: 'Lỗi ✗', disabled: false, className: 'bg-gradient-to-r from-red-600 to-red-700' },
        default: { text: 'Gửi Email', disabled: false, className: 'bg-gradient-to-r from-blue-600 to-blue-700' },
    }[status || 'default'];


    return (
        <button
            onClick={() => onSend(staff)}
            disabled={buttonStatus.disabled}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md ${buttonStatus.className}`}
            title={`Gửi email đến ${staff.fullName || 'nhân viên'}`}
        >
            <Mail className="h-4 w-4 mr-1" />
            {buttonStatus.text}
        </button>
    );
};

const StaffPerformancePage = () => {
    const [performanceData, setPerformanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingEmails, setSendingEmails] = useState(false);
    const [emailStatus, setEmailStatus] = useState({});
    const [currentTablePage, setCurrentTablePage] = useState(1);
    const [itemsPerPage] = useState(5);
    const navigate = useNavigate();
    const username = Cookies.get('username') || 'Tài khoản';

    // Fetch performance data
    useEffect(() => {
        fetchPerformanceData();
    }, []);

    const fetchPerformanceData = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("authToken");
            if (!token) {
                throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
            }
            const response = await axios.get('/api/report-performance/report');
            setPerformanceData(response.data || []);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu hiệu suất:', error);
            if (error.message === "Không tìm thấy token. Vui lòng đăng nhập lại.") {
                alert(error.message);
                navigate('/login');
            } else if (error.response?.status === 403) {
                alert('Truy cập bị từ chối: Vui lòng kiểm tra quyền hoặc token của bạn.');
            } else {
                alert('Không thể lấy dữ liệu hiệu suất. Vui lòng thử lại sau.');
            }
            setPerformanceData([]);
        } finally {
            setLoading(false);
        }
    };

    // Send emails to all staff
    const sendAllEmails = async () => {
        try {
            setSendingEmails(true);
            await axios.post('/api/report-performance/send-emails');
            alert('Đã gửi email thành công đến tất cả nhân viên!');
        } catch (error) {
            console.error('Lỗi khi gửi email:', error);
            if (error.response?.status === 403) {
                alert('Truy cập bị từ chối: Bạn không có quyền gửi email.');
            } else {
                alert('Không thể gửi email. Vui lòng thử lại.');
            }
        } finally {
            setSendingEmails(false);
        }
    };

    // Send email to individual staff
    const sendIndividualEmail = async (staff) => {
        const key = staff.email;
        try {
            setEmailStatus(prev => ({ ...prev, [key]: 'sending' }));
            await axios.post('/api/report-performance/send-selected-emails', [staff]);
            setEmailStatus(prev => ({ ...prev, [key]: 'sent' }));
            setTimeout(() => {
                setEmailStatus(prev => ({ ...prev, [key]: null }));
            }, 3000);
        } catch (error) {
            console.error('Lỗi khi gửi email:', error);
            setEmailStatus(prev => ({ ...prev, [key]: 'error' }));
            setTimeout(() => {
                setEmailStatus(prev => ({ ...prev, [key]: null }));
            }, 3000);
            if (error.response?.status === 403) {
                alert(`Không thể gửi email đến ${staff.fullName}`);
            }
        }
    };


    // Handle navigation
    const handleBackToHome = () => {
        navigate('/manager-dashboard');
    };

    const handleApproveNewStaff = () => {
        navigate('/manager/pending-staff');
    };

    // Get performance level color
    const getPerformanceColor = (level) => {
        switch (level) {
            case 'Xuất sắc': return 'text-green-600 bg-green-100';
            case 'Tốt': return 'text-blue-600 bg-blue-100';
            case 'Trung bình': return 'text-yellow-600 bg-yellow-100';
            case 'Kém': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };


    // Prepare chart data
    const chartData = performanceData.map(staff => ({
        name: staff.fullName?.split(' ').slice(-1)[0] || 'Không xác định',
        score: staff.performanceScore || 0,
        level: staff.performanceLevel === 'EXCELLENT' ? 'Xuất sắc' :
            staff.performanceLevel === 'GOOD' ? 'Tốt' :
                staff.performanceLevel === 'AVERAGE' ? 'Trung bình' :
                    staff.performanceLevel === 'POOR' ? 'Kém' : 'Không xác định',
    }));

    // Prepare pie chart data
    const performanceLevels = performanceData.reduce((acc, staff) => {
        const level = staff.performanceLevel === 'EXCELLENT' ? 'Xuất sắc' :
            staff.performanceLevel === 'GOOD' ? 'Tốt' :
                staff.performanceLevel === 'AVERAGE' ? 'Trung bình' :
                    staff.performanceLevel === 'POOR' ? 'Kém' : 'Không xác định';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.entries(performanceLevels).map(([level, count]) => ({
        name: level,
        value: count,
    }));

    const COLORS = {
        'Xuất sắc': '#10B981',
        'Tốt': '#3B82F6',
        'Trung bình': '#F59E0B',
        'Kém': '#EF4444',
        'Không xác định': '#6B7280',
    };

    // Statistics
    const stats = {
        total: performanceData.length,
        excellent: performanceData.filter(s => s.performanceLevel === 'EXCELLENT').length,
        poor: performanceData.filter(s => s.performanceLevel === 'POOR').length,
        averageScore: performanceData.length > 0
            ? (performanceData.reduce((sum, s) => sum + (s.performanceScore || 0), 0) / performanceData.length).toFixed(1)
            : 0,
    };

    // Pagination logic
    const totalPages = Math.ceil(performanceData.length / itemsPerPage);
    const startIndex = (currentTablePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = performanceData.slice(startIndex, endIndex);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentTablePage(pageNumber);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-200 mx-auto mb-4"></div>
                    <p className="text-blue-100 text-lg font-medium">Đang tải dữ liệu hiệu suất...</p>
                    <p className="text-blue-300 text-sm mt-1">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    if (performanceData.length === 0) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex flex-1">
                    <LeftMenu
                        onBackToHome={handleBackToHome}
                        onOverview={() => navigate('/report')}
                        onApproveNewStaff={handleApproveNewStaff}
                        onProfile={() => navigate('/profile/main')}
                        onLogout={() => navigate('/logout')}
                    />
                    <main className="flex-1 ml-64 px-4 pt-20 pb-24 overflow-auto">
                        <div className="max-w-7xl mx-auto text-center">
                            <p className="text-lg font-bold text-red-600 mb-2">Không có dữ liệu hiệu suất nào</p>
                            <p className="text-gray-500">Vui lòng thử lại sau hoặc liên hệ quản trị viên</p>
                        </div>
                    </main>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <LeftMenu
                    onBackToHome={handleBackToHome}
                    onOverview={() => navigate('/report')}
                    onApproveNewStaff={handleApproveNewStaff}
                    onProfile={() => navigate('/profile/main')}
                    onLogout={() => navigate('/logout')}
                />
                <main className="flex-1 px-4 pt-20 pb-24 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-2">Báo cáo hiệu suất nhân viên</h1>
                            <p className="text-gray-600 flex items-center gap-2 text-sm">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                Theo dõi và quản lý hiệu suất nhân viên trong các phòng ban
                            </p>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Users className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Tổng nhân viên</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Award className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Xuất sắc</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.excellent}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <AlertTriangle className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Kém</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.poor}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <TrendingUp className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Điểm trung bình</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.averageScore}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 p-6">
                                <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-4">Điểm hiệu suất</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="score" fill="#3B82F6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 p-6">
                                <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-4">Phân bố hiệu suất</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS['Không xác định']} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 p-6 mb-8">
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">Hành động Email</h3>
                                <button
                                    onClick={sendAllEmails}
                                    disabled={sendingEmails}
                                    className={`px-6 py-2.5 rounded-lg text-white font-medium transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 ${
                                        sendingEmails
                                            ? 'bg-gradient-to-r from-gray-500 to-gray-600 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                                    }`}
                                    title="Gửi email đến tất cả nhân viên"
                                >
                                    {sendingEmails ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Mail className="h-4 w-4" />}
                                    {sendingEmails ? 'Đang gửi...' : 'Gửi tất cả email'}
                                </button>
                            </div>
                        </div>

                        {/* Staff List */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-blue-200">
                                <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">Danh sách hiệu suất nhân viên</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Nhân viên</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Điểm</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Cấp độ</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Hành động</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-blue-200">
                                    {paginatedData.map((staff) => {
                                        const level = staff.performanceLevel === 'EXCELLENT' ? 'Xuất sắc' :
                                            staff.performanceLevel === 'GOOD' ? 'Tốt' :
                                                staff.performanceLevel === 'AVERAGE' ? 'Trung bình' :
                                                    staff.performanceLevel === 'POOR' ? 'Kém' : 'Không xác định';
                                        return (
                                            <tr key={staff.email} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{staff.fullName || 'N/A'}</div>
                                                        <div className="text-sm text-gray-500">{staff.email || 'N/A'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{staff.performanceScore || '0'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(level)}`}>
                                                            {level}
                                                        </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <EmailButton
                                                        staff={staff}
                                                        status={emailStatus[staff.email]}
                                                        onSend={sendIndividualEmail}
                                                    />


                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-4 flex items-center justify-between border-t border-blue-200 mt-12">
                                <div className="text-sm text-gray-600">
                                    Hiển thị {startIndex + 1} - {Math.min(endIndex, performanceData.length)} trong số {performanceData.length} nhân viên
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentTablePage - 1)}
                                        disabled={currentTablePage === 1}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                                            currentTablePage === 1
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                                        }`}
                                        title="Trang trước"
                                    >
                                        Trước
                                    </button>
                                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                                                currentTablePage === page
                                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                            }`}
                                            title={`Trang ${page}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handlePageChange(currentTablePage + 1)}
                                        disabled={currentTablePage === totalPages}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                                            currentTablePage === totalPages
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                                        }`}
                                        title="Trang sau"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default StaffPerformancePage;