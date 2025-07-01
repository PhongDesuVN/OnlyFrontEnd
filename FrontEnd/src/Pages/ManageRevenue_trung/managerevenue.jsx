import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart2, Search, Download, Edit, Trash2, Eye,
    DollarSign, Calendar, Filter, AlertCircle, X, Save,
    TrendingUp, FileText, List, Settings, CheckCircle
} from 'lucide-react';
import revenueService from '../../Services/revenueService';
import { Card, Row, Col } from 'antd';
import { Bar, Pie, Line } from '@ant-design/charts';

// Add this at the top of the file (after imports)
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

// Header Component
const Header = () => {
    return (
        <header className="fixed w-full top-0 bg-white shadow-lg z-40">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <DollarSign className="w-8 h-8 text-blue-600" />
                        <h1 className="text-xl font-bold text-black">Quản Lý Doanh Thu</h1>
                    </div>
                    <div className="flex space-x-3">
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
        search: 'Tìm Kiếm',
        export: 'Xuất Báo Cáo'
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
                        {page === 'export' && <Download className="mr-2" size={20} />}
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
            <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
                <BarChart2 className="mr-2" /> Tổng Quan Doanh Thu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { 
                        label: 'Tổng Doanh Thu', 
                        value: `$${totalRevenue.toFixed(2)}`,
                        color: 'green',
                        icon: DollarSign
                    },
                    { 
                        label: 'Doanh Thu Hôm Nay', 
                        value: `$${todayRevenue.toFixed(2)}`,
                        color: 'blue',
                        icon: TrendingUp
                    },
                    { 
                        label: 'Trung Bình/Đơn', 
                        value: `$${averageRevenue.toFixed(2)}`,
                        color: 'purple',
                        icon: BarChart2
                    },
                    { 
                        label: 'Tổng Số Đơn', 
                        value: safeRevenues.length,
                        color: 'blue',
                        icon: FileText
                    }
                ].map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{item.label}</p>
                                    <p className={`text-3xl font-bold text-${item.color}-600`}>{item.value}</p>
                                </div>
                                <IconComponent className={`w-10 h-10 text-${item.color}-500`} />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            {/* Biểu đồ tổng quan bằng antd charts */}
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <Card title="Doanh Thu Theo Ngày" bordered={false}>
                        <Line
                            data={lineData}
                            xField="date"
                            yField="amount"
                            point={{ size: 5, shape: 'diamond' }}
                            color="#1677ff"
                            height={260}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={6}>
                    <Card title="Tỉ Lệ Nguồn Thu" bordered={false}>
                        <Pie
                            data={pieData}
                            angleField="value"
                            colorField="type"
                            radius={0.9}
                            label={{ type: 'outer', content: '{name} {percentage}' }}
                            height={260}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={6}>
                    <Card title="Doanh Thu Theo Loại Người Hưởng" bordered={false}>
                        <Bar
                            data={barData}
                            xField="type"
                            yField="value"
                            color="#52c41a"
                            height={260}
                        />
                    </Card>
                </Col>
            </Row>
        </motion.div>
    );
};

// Revenue List Component
const RevenueList = ({ revenues, onExport }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
            <List className="mr-2" /> Danh Sách Doanh Thu
        </h2>
        <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto border border-gray-100">
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
                    {revenues.map(revenue => (
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
                                ${revenue.amount.toFixed(2)}
                            </td>
                            <td className="border p-3">
                                {new Date(revenue.date).toLocaleDateString()}
                            </td>
                            <td className="border p-3">{revenue.description}</td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    </motion.div>
);

// Search Revenue Component
const SearchRevenue = ({ revenues, searchParams, setSearchParams }) => {
    const [filteredRevenues, setFilteredRevenues] = useState(revenues);

    useEffect(() => {
        const filtered = revenues.filter(revenue => {
            return (
                (!searchParams.startDate || new Date(revenue.date) >= new Date(searchParams.startDate)) &&
                (!searchParams.endDate || new Date(revenue.date) <= new Date(searchParams.endDate)) &&
                (!searchParams.beneficiaryType || revenue.beneficiaryType === searchParams.beneficiaryType) &&
                (!searchParams.sourceType || revenue.sourceType === searchParams.sourceType) &&
                (!searchParams.minAmount || revenue.amount >= searchParams.minAmount) &&
                (!searchParams.maxAmount || revenue.amount <= searchParams.maxAmount)
            );
        });
        setFilteredRevenues(filtered);
    }, [revenues, searchParams]);

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
                                            ${revenue.amount.toFixed(2)}
                                        </td>
                                        <td className="border p-3">
                                            {new Date(revenue.date).toLocaleDateString()}
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

// Export Revenue Component
const ExportRevenue = ({ onExport }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
            <Download className="mr-2" /> Xuất Báo Cáo Doanh Thu
        </h2>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xl font-semibold mb-4">Xuất Báo Cáo Excel</h3>
                    <p className="text-gray-600 mb-4">
                        Xuất báo cáo doanh thu theo khoảng thời gian được chọn. Báo cáo sẽ bao gồm tất cả các thông tin chi tiết về doanh thu trong khoảng thời gian đó.
                    </p>
                    <button
                        onClick={onExport}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Xuất Báo Cáo Excel
                    </button>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold mb-2">Hướng Dẫn</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                        <li>Chọn khoảng thời gian cần xuất báo cáo</li>
                        <li>Nhấn nút "Xuất Báo Cáo Excel"</li>
                        <li>File Excel sẽ được tải về máy của bạn</li>
                        <li>Báo cáo bao gồm tất cả thông tin chi tiết về doanh thu</li>
                    </ul>
                </div>
            </div>
        </div>
    </motion.div>
);

// Main Dashboard Component
const Dashboard = () => {
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

    useEffect(() => {
        loadRevenues();
    }, []);

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
            const revenueData = await revenueService.getAllRevenues(token);
            setRevenues(revenueData);
        } catch (err) {
            setError('Không thể tải danh sách doanh thu. Vui lòng thử lại sau.');
            console.error('Error loading revenues:', err);
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

    const renderPage = () => {
        switch (currentPage) {
            case 'overview':
                return <RevenueOverview revenues={revenues} />;
            case 'list':
                return <RevenueList revenues={revenues} onExport={handleExport} />;
            case 'search':
                return (
                    <SearchRevenue
                        revenues={revenues}
                        searchParams={searchParams}
                        setSearchParams={setSearchParams}
                    />
                );
            case 'export':
                return <ExportRevenue onExport={handleExport} />;
            default:
                return <RevenueOverview revenues={revenues} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <main className="flex-1 ml-64 pt-20 p-8">
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
            </main>
        </div>
    );
};

export default Dashboard;
  
