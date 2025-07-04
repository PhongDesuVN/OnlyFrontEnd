import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart2, Search, Download, Edit, Trash2, Eye,
    DollarSign, Calendar, Filter, AlertCircle, X, Save,
    TrendingUp, FileText, List, Settings, CheckCircle, Crown
} from 'lucide-react';
import { getPagedRevenues, exportExcelV2 } from '../../Services/revenueService';
import revenueService from '../../Services/revenueService';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                    <div className="flex-1 flex items-center justify-center">
                        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
                            <div className="text-center">
                                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h2>
                                <p className="text-gray-600 mb-4">
                                    Có lỗi xảy ra khi tải trang. Vui lòng thử lại sau.
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Tải lại trang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Add this at the top of the file (after imports)
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

// Header Component with Manager Role Indicator
const Header = () => {
    const [userRole, setUserRole] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        try {
            const token = getCookie('authToken');
            if (token) {
                const decoded = jwtDecode(token);
                setUserRole(decoded.role || getCookie('userRole'));
                setUsername(decoded.username || 'Manager');
            }
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    }, []);

    return (
        <header className="fixed w-full top-0 bg-white shadow-lg z-40">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <DollarSign className="w-8 h-8 text-blue-600" />
                        <h1 className="text-xl font-bold text-black">Quản Lý Doanh Thu</h1>
                        {userRole === 'MANAGER' && (
                            <div className="flex items-center ml-4 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-sm">
                                <Crown className="w-4 h-4 mr-1" />
                                Manager
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-3">
                        {username && (
                            <span className="text-sm text-gray-600">
                                Xin chào, <span className="font-semibold">{username}</span>
                            </span>
                        )}
                        <Link to="/">
                            <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                                Trang Chủ
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

// Sidebar Component
const Sidebar = ({ currentPage, setCurrentPage }) => {
    const pageLabels = {
        overview: 'Tổng Quan',
        list: 'Danh Sách Doanh Thu',
        search: 'Tìm Kiếm'
    };

    return (
        <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-64 bg-gradient-to-b from-blue-900 to-purple-600 text-white p-6 h-screen shadow-2xl fixed z-30"
        >
            <h1 className="text-2xl font-extrabold mb-8 flex items-center tracking-tight">
                <DollarSign className="mr-2" /> Quản Lý Doanh Thu
            </h1>
            <nav>
                {['overview', 'list', 'search', 'export'].map(page => (
                    <motion.button
                        key={page}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center w-full text-left py-3 px-4 mb-3 rounded-lg transition-all duration-300 ${
                            currentPage === page ? 'bg-blue-500 shadow-lg' : 'hover:bg-blue-600'
                        }`}
                        onClick={() => setCurrentPage(page)}
                    >
                        {page === 'overview' && <BarChart2 className="mr-2" size={20} />}
                        {page === 'list' && <List className="mr-2" size={20} />}
                        {page === 'search' && <Search className="mr-2" size={20} />}
                        {pageLabels[page]}
                    </motion.button>
                ))}
            </nav>
        </motion.div>
    );
};

// Revenue Overview Component
const RevenueOverview = ({ revenues }) => {
    // Đảm bảo revenues là mảng
    const safeRevenues = Array.isArray(revenues) ? revenues : [];

    const totalRevenue = safeRevenues.reduce((sum, rev) => sum + (typeof rev.amount === 'number' ? rev.amount : 0), 0);
    const averageRevenue = safeRevenues.length > 0 ? totalRevenue / safeRevenues.length : 0;
    const todayRevenue = safeRevenues.filter(rev => 
        rev.date && new Date(rev.date).toDateString() === new Date().toDateString()
    ).reduce((sum, rev) => sum + (typeof rev.amount === 'number' ? rev.amount : 0), 0);

    // Format currency to VND
    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Chart: Revenue by Day (Line)
    const revenueByDay = safeRevenues.reduce((acc, rev) => {
        if (rev.date) {
            const date = new Date(rev.date).toLocaleDateString();
            acc[date] = (acc[date] || 0) + (typeof rev.amount === 'number' ? rev.amount : 0);
        }
        return acc;
    }, {});
    const lineData = Object.entries(revenueByDay)
        .filter(([date]) => date)
        .map(([date, amount]) => ({ date, amount }));

    // Chart: Revenue by Source Type (Pie)
    const revenueBySource = safeRevenues.reduce((acc, rev) => {
        if (rev.sourceType) {
            acc[rev.sourceType] = (acc[rev.sourceType] || 0) + (typeof rev.amount === 'number' ? rev.amount : 0);
        }
        return acc;
    }, {});
    const pieData = Object.entries(revenueBySource).map(([type, value]) => ({ type, value }));

    // Chart: Revenue by Beneficiary Type (Bar)
    const revenueByBeneficiary = safeRevenues.reduce((acc, rev) => {
        if (rev.beneficiaryType) {
            acc[rev.beneficiaryType] = (acc[rev.beneficiaryType] || 0) + (typeof rev.amount === 'number' ? rev.amount : 0);
        }
        return acc;
    }, {});
    const barData = Object.entries(revenueByBeneficiary).map(([type, value]) => ({ type, value }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Manager Welcome Section */}
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center">
                            <Crown className="w-8 h-8 mr-3" />
                            Chào mừng Quản lý
                        </h1>
                        <p className="text-purple-100 text-lg">
                            Đây là trang quản lý doanh thu dành riêng cho Quản lý. Bạn có thể xem tổng quan, 
                            quản lý danh sách và xuất báo cáo doanh thu.
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-purple-100">Quyền truy cập: Manager</p>
                        <p className="text-sm text-purple-200">Cập nhật lần cuối: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
                <BarChart2 className="mr-2" /> Tổng Quan Doanh Thu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { 
                        label: 'Tổng Doanh Thu', 
                        value: formatVND(totalRevenue),
                        color: 'green',
                        icon: DollarSign,
                        description: 'Tổng doanh thu từ tất cả nguồn'
                    },
                    { 
                        label: 'Doanh Thu Hôm Nay', 
                        value: formatVND(todayRevenue),
                        color: 'blue',
                        icon: TrendingUp,
                        description: 'Doanh thu trong ngày hôm nay'
                    },
                    { 
                        label: 'Trung Bình/Đơn', 
                        value: formatVND(averageRevenue),
                        color: 'purple',
                        icon: BarChart2,
                        description: 'Trung bình doanh thu mỗi đơn hàng'
                    },
                    { 
                        label: 'Tổng Số Đơn', 
                        value: safeRevenues.length,
                        color: 'blue',
                        icon: FileText,
                        description: 'Tổng số đơn hàng đã xử lý'
                    }
                ].map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{item.label}</p>
                                    <p className={`text-3xl font-bold text-${item.color}-600`}>{item.value}</p>
                                </div>
                                <IconComponent className={`w-10 h-10 text-${item.color}-500`} />
                            </div>
                            <p className="text-xs text-gray-500">{item.description}</p>
                        </motion.div>
                    );
                })}
            </div>
            {/* Simple HTML/CSS Charts instead of Ant Design Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue by Day Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Doanh Thu Theo Ngày</h3>
                    <div className="space-y-2">
                        {lineData.slice(0, 7).map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{item.date}</span>
                                <div className="flex items-center">
                                    <div 
                                        className="bg-blue-500 rounded h-2 mr-2" 
                                        style={{ width: `${Math.min((item.amount / Math.max(...lineData.map(d => d.amount))) * 200, 200)}px` }}
                                    ></div>
                                    <span className="text-sm font-medium">{formatVND(item.amount)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue by Source Type Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Tỉ Lệ Nguồn Thu</h3>
                    <div className="space-y-3">
                        {pieData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div 
                                        className="w-4 h-4 rounded-full mr-2"
                                        style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                                    ></div>
                                    <span className="text-sm text-gray-600">{item.type}</span>
                                </div>
                                <span className="text-sm font-medium">{formatVND(item.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue by Beneficiary Type Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Doanh Thu Theo Loại Người Hưởng</h3>
                    <div className="space-y-3">
                        {barData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{item.type}</span>
                                <div className="flex items-center">
                                    <div 
                                        className="bg-green-500 rounded h-2 mr-2" 
                                        style={{ width: `${Math.min((item.value / Math.max(...barData.map(d => d.value))) * 150, 150)}px` }}
                                    ></div>
                                    <span className="text-sm font-medium">{formatVND(item.value)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Revenue List Component
const RevenueList = ({ revenues, onExport, filter, handleFilterChange, handleExportExcel, page, setPage, totalPages }) => {
    // Safety check for revenues
    const safeRevenues = Array.isArray(revenues) ? revenues : [];
    
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-4xl font-bold flex items-center text-gray-800">
                    <List className="mr-2" /> Danh Sách Doanh Thu
                </h2>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-sm">
                        <Crown className="w-4 h-4 mr-1" />
                        Manager Access
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto border border-gray-100">
                {/* Manager Quick Actions */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        Quản lý Nhanh (Manager)
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={handleExportExcel} 
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Xuất Excel
                        </button>
                        <button 
                            onClick={() => window.print()} 
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            In Báo Cáo
                        </button>
                        <button 
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                        >
                            <BarChart2 className="w-4 h-4 mr-2" />
                            Phân Tích Chi Tiết
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-4">
                    <input type="date" name="startDate" value={filter.startDate} onChange={handleFilterChange} className="border p-2 rounded" />
                    <input type="date" name="endDate" value={filter.endDate} onChange={handleFilterChange} className="border p-2 rounded" />
                    <input type="text" name="sourceType" placeholder="Loại nguồn" value={filter.sourceType} onChange={handleFilterChange} className="border p-2 rounded" />
                    <input type="text" name="beneficiaryId" placeholder="Beneficiary ID" value={filter.beneficiaryId} onChange={handleFilterChange} className="border p-2 rounded" />
                    <input type="text" name="bookingId" placeholder="Booking ID" value={filter.bookingId} onChange={handleFilterChange} className="border p-2 rounded" />
                    <input type="number" name="minAmount" placeholder="Số tiền tối thiểu" value={filter.minAmount} onChange={handleFilterChange} className="border p-2 rounded" />
                    <input type="number" name="maxAmount" placeholder="Số tiền tối đa" value={filter.maxAmount} onChange={handleFilterChange} className="border p-2 rounded" />
                </div>
                {safeRevenues.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>Không có dữ liệu doanh thu để hiển thị</p>
                        <p className="text-sm text-gray-400 mt-2">Vui lòng kiểm tra lại bộ lọc hoặc thử lại sau</p>
                    </div>
                ) : (
                    <>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-3 text-left text-gray-700">ID</th>
                                    <th className="border p-3 text-left text-gray-700">Loại Người Hưởng</th>
                                    <th className="border p-3 text-left text-gray-700">ID Người Hưởng</th>
                                    <th className="border p-3 text-left text-gray-700">Loại Nguồn</th>
                                    <th className="border p-3 text-left text-gray-700">ID Nguồn</th>
                                    <th className="border p-3 text-left text-gray-700">Số Tiền</th>
                                    <th className="border p-3 text-left text-gray-700">Ngày</th>
                                    <th className="border p-3 text-left text-gray-700">Mô Tả</th>
                                    <th className="border p-3 text-left text-gray-700">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {safeRevenues.map(revenue => (
                                    <motion.tr
                                        key={revenue.revenueId}
                                        whileHover={{ backgroundColor: '#f3f4f6' }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <td className="border p-3">{revenue.revenueId}</td>
                                        <td className="border p-3">{revenue.beneficiaryType}</td>
                                        <td className="border p-3">{revenue.beneficiaryId}</td>
                                        <td className="border p-3">{revenue.sourceType}</td>
                                        <td className="border p-3">{revenue.sourceId}</td>
                                        <td className="border p-3 text-green-600 font-medium">
                                            {formatVND(revenue.amount)}
                                        </td>
                                        <td className="border p-3">
                                            {revenue.date ? new Date(revenue.date).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="border p-3">{revenue.description}</td>
                                        <td className="border p-3">
                                            <div className="flex space-x-2">
                                                <button className="p-1 text-blue-600 hover:text-blue-800" title="Xem chi tiết">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 text-green-600 hover:text-green-800" title="Xuất chi tiết">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex justify-center items-center gap-2 mt-4">
                            <button disabled={page === 0} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Trước</button>
                            <span>Trang {page + 1} / {totalPages}</span>
                            <button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Sau</button>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
};

// Search Revenue Component
const SearchRevenue = ({ revenues, searchParams, setSearchParams }) => {
    // Safety check for revenues
    const safeRevenues = Array.isArray(revenues) ? revenues : [];
    const [filteredRevenues, setFilteredRevenues] = useState(safeRevenues);
    
    // Format currency to VND
    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    useEffect(() => {
        const filtered = safeRevenues.filter(revenue => {
            return (
                (!searchParams.startDate || (revenue.date && new Date(revenue.date) >= new Date(searchParams.startDate))) &&
                (!searchParams.endDate || (revenue.date && new Date(revenue.date) <= new Date(searchParams.endDate))) &&
                (!searchParams.beneficiaryType || revenue.beneficiaryType === searchParams.beneficiaryType) &&
                (!searchParams.sourceType || revenue.sourceType === searchParams.sourceType) &&
                (!searchParams.minAmount || (revenue.amount && revenue.amount >= searchParams.minAmount)) &&
                (!searchParams.maxAmount || (revenue.amount && revenue.amount <= searchParams.maxAmount))
            );
        });
        setFilteredRevenues(filtered);
    }, [safeRevenues, searchParams]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
                <Search className="mr-2" /> Tìm Kiếm Doanh Thu
            </h2>
            
            {/* Search Form */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Từ Ngày</label>
                        <input
                            type="date"
                            value={searchParams.startDate || ''}
                            onChange={(e) => setSearchParams({...searchParams, startDate: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Đến Ngày</label>
                        <input
                            type="date"
                            value={searchParams.endDate || ''}
                            onChange={(e) => setSearchParams({...searchParams, endDate: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Loại Người Hưởng</label>
                        <select
                            value={searchParams.beneficiaryType || ''}
                            onChange={(e) => setSearchParams({...searchParams, beneficiaryType: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tất cả</option>
                            <option value="DRIVER">Tài xế</option>
                            <option value="CUSTOMER">Khách hàng</option>
                            <option value="SYSTEM">Hệ thống</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Loại Nguồn</label>
                        <select
                            value={searchParams.sourceType || ''}
                            onChange={(e) => setSearchParams({...searchParams, sourceType: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tất cả</option>
                            <option value="BOOKING">Đặt xe</option>
                            <option value="REFUND">Hoàn tiền</option>
                            <option value="SYSTEM">Hệ thống</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số Tiền Tối Thiểu</label>
                        <input
                            type="number"
                            value={searchParams.minAmount || ''}
                            onChange={(e) => setSearchParams({...searchParams, minAmount: parseFloat(e.target.value)})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số Tiền Tối Đa</label>
                        <input
                            type="number"
                            value={searchParams.maxAmount || ''}
                            onChange={(e) => setSearchParams({...searchParams, maxAmount: parseFloat(e.target.value)})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="999999"
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <button
                        onClick={() => setSearchParams({
                            startDate: '',
                            endDate: '',
                            beneficiaryType: '',
                            sourceType: '',
                            minAmount: '',
                            maxAmount: ''
                        })}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Xóa Bộ Lọc
                    </button>
                </div>
            </div>

            {/* Search Results */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold mb-4">Kết Quả Tìm Kiếm ({filteredRevenues.length} kết quả)</h3>
                {filteredRevenues.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-3 text-left text-gray-700">ID</th>
                                    <th className="border p-3 text-left text-gray-700">Loại Người Hưởng</th>
                                    <th className="border p-3 text-left text-gray-700">ID Người Hưởng</th>
                                    <th className="border p-3 text-left text-gray-700">Loại Nguồn</th>
                                    <th className="border p-3 text-left text-gray-700">ID Nguồn</th>
                                    <th className="border p-3 text-left text-gray-700">Số Tiền</th>
                                    <th className="border p-3 text-left text-gray-700">Ngày</th>
                                    <th className="border p-3 text-left text-gray-700">Mô Tả</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRevenues.map(revenue => (
                                    <tr key={revenue.revenueId} className="hover:bg-gray-50">
                                        <td className="border p-3">{revenue.revenueId}</td>
                                        <td className="border p-3">{revenue.beneficiaryType}</td>
                                        <td className="border p-3">{revenue.beneficiaryId}</td>
                                        <td className="border p-3">{revenue.sourceType}</td>
                                        <td className="border p-3">{revenue.sourceId}</td>
                                        <td className="border p-3 text-green-600 font-medium">
                                            {formatVND(revenue.amount)}
                                        </td>
                                        <td className="border p-3">
                                            {revenue.date ? new Date(revenue.date).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="border p-3">{revenue.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Không tìm thấy kết quả nào phù hợp với tiêu chí tìm kiếm.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Main Dashboard Component
const Dashboard = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState('overview');
    const [revenues, setRevenues] = useState([]);
    const [searchParams, setSearchParams] = useState({
        startDate: '',
        endDate: '',
        beneficiaryType: '',
        sourceType: '',
        minAmount: '',
        maxAmount: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
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
    const [userRole, setUserRole] = useState('');

    // Check user role on component mount
    useEffect(() => {
        const checkUserRole = () => {
            try {
                const token = getCookie('authToken');
                if (!token) {
                    navigate('/login', { replace: true });
                    return;
                }

                const decoded = jwtDecode(token);
                const role = decoded.role || getCookie('userRole');
                
                if (role !== 'MANAGER') {
                    console.log('❌ Access denied - User role is not MANAGER:', role);
                    navigate('/unauthorized', { replace: true });
                    return;
                }

                setUserRole(role);
                console.log('✅ Manager access granted');
            } catch (error) {
                console.error('Error checking user role:', error);
                navigate('/login', { replace: true });
            }
        };

        checkUserRole();
    }, [navigate]);

    useEffect(() => {
        if (userRole === 'MANAGER') {
            loadRevenues();
        }
    }, [userRole]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const loadRevenues = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getCookie('authToken');
            console.log('🔍 Loading revenues with token:', token ? 'Token exists' : 'No token');
            
            // Debug: Decode token to see what's in it
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    console.log('🔍 Decoded token:', decoded);
                    console.log('🔍 Role from token:', decoded.role);
                } catch (e) {
                    console.error('❌ Error decoding token:', e);
                }
            }
            
            const params = {
                ...filter,
                page,
                size
            };
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) delete params[key];
            });
            
            console.log('🔍 API params:', params);
            const revenueData = await revenueService.getPagedRevenues(params, token);
            console.log('✅ Revenue data received:', revenueData);
            setRevenues(revenueData.content || []);
            setTotalPages(revenueData.totalPages || 1);
        } catch (err) {
            console.error('❌ Error loading revenues:', err);
            setError('Không thể tải danh sách doanh thu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setLoading(true);
        try {
            await revenueService.exportToExcel(searchParams.startDate, searchParams.endDate);
            setSuccess('Xuất báo cáo thành công!');
        } catch (err) {
            setError('Không thể xuất báo cáo. Vui lòng thử lại sau.');
            console.error('Error exporting revenue:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRevenues = async () => {
        setLoading(true);
        setError('');
        try {
            const token = getCookie('authToken');
            const params = {
                ...filter,
                page,
                size
            };
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) delete params[key];
            });
            const res = await getPagedRevenues(params, token);
            setRevenues(res.content || []);
            setTotalPages(res.totalPages || 1);
        } catch (err) {
            setError('Không thể tải dữ liệu doanh thu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenues();
        // eslint-disable-next-line
    }, [filter, page, size]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({ ...prev, [name]: value }));
        setPage(0); // reset về trang đầu khi filter
    };

    const handleExportExcel = async () => {
        try {
            setLoading(true);
            const token = getCookie('authToken');
            const params = { ...filter };
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) delete params[key];
            });
            await exportExcelV2(params, token);
            setSuccess('Xuất Excel thành công!');
        } catch (err) {
            setError('Xuất Excel thất bại! Vui lòng thử lại.');
            console.error('Error exporting Excel:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'overview':
                return <RevenueOverview revenues={revenues} />;
            case 'list':
                return (
                    <RevenueList
                        revenues={revenues}
                        onExport={handleExport}
                        filter={filter}
                        handleFilterChange={handleFilterChange}
                        handleExportExcel={handleExportExcel}
                        page={page}
                        setPage={setPage}
                        totalPages={totalPages}
                    />
                );
            case 'search':
                return (
                    <SearchRevenue
                        revenues={revenues}
                        searchParams={searchParams}
                        setSearchParams={setSearchParams}
                    />
                );
            default:
                return <RevenueOverview revenues={revenues} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <main className="flex-1 ml-64 pt-20 p-8">
                <ErrorBoundary>
                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center"
                        >
                            <AlertCircle className="w-5 h-5 mr-2" />
                            {error}
                            <button 
                                onClick={() => setError(null)}
                                className="ml-auto text-red-700 hover:text-red-900"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                    
                    {/* Loading Indicator */}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
                        >
                            <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="text-gray-700">Đang xử lý...</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center"
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            {success}
                            <button 
                                onClick={() => setSuccess(null)}
                                className="ml-auto text-green-700 hover:text-green-900"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {renderPage()}
                    </AnimatePresence>
                </ErrorBoundary>
            </main>
        </div>
    );
};

export default Dashboard;
  
