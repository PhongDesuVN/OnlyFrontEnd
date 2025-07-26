import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, CreditCard, Search, List, BarChart,
    Truck, Home, Users, Shield, Phone, Mail, MapPin, Star, CheckCircle,
    Plus, Edit2, Trash2, Save, X, ArrowLeft
} from 'lucide-react';
import ManageOrderApi from '../../utils/ManageOrder_phongApi.js';

// Header
const Header = () => {
    return (
        <header className="fixed w-full top-0 bg-[#0d47a1] shadow-lg z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Truck className="w-8 h-8 text-white" />
                        <h1 className="text-xl font-bold text-white">Vận Chuyển Nhà</h1>
                    </div>
                    <nav className="hidden md:flex space-x-8">
                    </nav>
                    <div className="flex space-x-3">
                        <button className="px-4 py-2 border border-white text-white rounded-lg hover:bg-blue-700 hover:text-white transition-all">
                            <Link to="/" className="text-white hover:text-blue-200 transition-colors">Trang Chủ</Link>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

// Sidebar
const Sidebar = ({ currentPage, setCurrentPage }) => {
    const pageLabels = {
        overview: 'Tổng Quan',
        view: 'Danh Sách',
        search: 'Tìm Kiếm',
        back: 'Quay Lại'
    };

    return (
        <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-64 bg-gradient-to-b from-[#0d47a1] to-[#1976d2] text-white p-6 min-h-screen flex flex-col justify-between shadow-2xl"
        >
            <div>
                <h1 className="text-2xl font-extrabold mb-8 flex items-center tracking-tight">
                    <Package className="mr-2" /> Quản Lý Đơn Hàng
                </h1>
                <nav>
                    {['back', 'overview', 'view', 'search'].map(page => (
                        <motion.button
                            key={page}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center w-full text-left py-3 px-4 mb-3 rounded-lg transition-all duration-300 ${currentPage === page ? 'bg-blue-300 text-blue-900 shadow-lg' : 'hover:bg-blue-500 hover:text-white'} `}
                            onClick={() => {
                                if (page === 'back') {
                                    window.history.back();
                                } else {
                                    setCurrentPage(page);
                                }
                            }}
                        >
                            {page === 'overview' && <BarChart className="mr-2" size={20} />}
                            {page === 'view' && <List className="mr-2" size={20} />}
                            {page === 'search' && <Search className="mr-2" size={20} />}
                            {page === 'back' && <ArrowLeft className="mr-2" size={20} />}
                            {pageLabels[page]}
                        </motion.button>
                    ))}
                </nav>
            </div>
            <div className="mt-auto"></div>
        </motion.div>
    );
};

// Modal Component
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
                onClick={e => e.stopPropagation()}
            >
                {children}
            </motion.div>
        </motion.div>
    );
};

// Order Form Component
const OrderForm = ({ order, onSave, onCancel, isEditing }) => {
    const [formData, setFormData] = useState({
        id: order?.id || '',
        customer: order?.customer || '',
        customerId: order?.customerId || '',
        total: order?.total || 0,
        status: order?.status || 'Đang xử lý',
        payment: order?.payment || 'Chưa thanh toán',
        deliveryDate: order?.deliveryDate || new Date().toISOString().split('T')[0],
        storageUnitId: order?.storageUnitId || '',
        transportUnitId: order?.transportUnitId || '',
        operatorStaffId: order?.operatorStaffId || '',
        note: order?.note || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.customer || !formData.total || !formData.customerId || !formData.storageUnitId || !formData.transportUnitId || !formData.operatorStaffId || !formData.deliveryDate) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        if (!isEditing) {
            formData.id = `ORD${String(Date.now()).slice(-3).padStart(3, '0')}`;
        }

        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold mb-4">
                {isEditing ? 'Sửa Đơn Hàng' : 'Thêm Đơn Hàng Mới'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isEditing && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã Đơn</label>
                        <input
                            type="text"
                            value={formData.id}
                            disabled
                            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Khách Hàng *</label>
                    <input
                        type="text"
                        value={formData.customer}
                        onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Khách Hàng *</label>
                    <input
                        type="number"
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: parseInt(e.target.value) || '' })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tổng Tiền (VNĐ) *</label>
                    <input
                        type="number"
                        value={formData.total}
                        onChange={(e) => setFormData({ ...formData, total: parseInt(e.target.value) || 0 })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Đang xử lý">Đang xử lý</option>
                        <option value="Đang giao">Đang giao</option>
                        <option value="Hoàn thành">Hoàn thành</option>
                        <option value="Hủy">Hủy</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thanh Toán</label>
                    <select
                        value={formData.payment}
                        onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Đã thanh toán">Đã thanh toán</option>
                        <option value="Chưa thanh toán">Chưa thanh toán</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày Giao Hàng *</label>
                    <input
                        type="date"
                        value={formData.deliveryDate}
                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Kho Lưu Trữ *</label>
                    <input
                        type="number"
                        value={formData.storageUnitId}
                        onChange={(e) => setFormData({ ...formData, storageUnitId: parseInt(e.target.value) || '' })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Phương Tiện Vận Chuyển *</label>
                    <input
                        type="number"
                        value={formData.transportUnitId}
                        onChange={(e) => setFormData({ ...formData, transportUnitId: parseInt(e.target.value) || '' })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Nhân Viên Điều Hành *</label>
                    <input
                        type="number"
                        value={formData.operatorStaffId}
                        onChange={(e) => setFormData({ ...formData, operatorStaffId: parseInt(e.target.value) || '' })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi Chú</label>
                    <textarea
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="flex space-x-3 pt-4">
                <button
                    type="submit"
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Save className="mr-2" size={16} />
                    {isEditing ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                    <X className="mr-2" size={16} />
                    Hủy
                </button>
            </div>
        </form>
    );
};

// OverviewOrders Enhanced
const OverviewOrders = ({ orders }) => {
    // Tính toán các thống kê
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const paidOrders = orders.filter(o => o.payment === 'Đã thanh toán');
    const unpaidOrders = orders.filter(o => o.payment === 'Chưa thanh toán');
    const completedOrders = orders.filter(o => o.status === 'Hoàn thành');
    const deliveryStats = orders.reduce((acc, order) => {
        acc[order.deliveryProgress] = (acc[order.deliveryProgress] || 0) + 1;
        return acc;
    }, {});

    // Tính tỷ lệ hoàn thành
    const completionRate = orders.length > 0 ? Math.round((completedOrders.length / orders.length) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
                <BarChart className="mr-2" /> Tổng Quan Đơn Hàng
            </h2>

            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Tổng Đơn Hàng</p>
                            <p className="text-3xl font-bold">{orders.length}</p>
                        </div>
                        <Package className="w-10 h-10 text-blue-200" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Tổng Doanh Thu</p>
                            <p className="text-2xl font-bold">{totalRevenue.toLocaleString()} VNĐ</p>
                        </div>
                        <CreditCard className="w-10 h-10 text-green-200" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Đã Hoàn Thành</p>
                            <p className="text-3xl font-bold">{completedOrders.length}</p>
                            <p className="text-purple-200 text-xs">({completionRate}%)</p>
                        </div>
                        <CheckCircle className="w-10 h-10 text-purple-200" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm">Đang Giao</p>
                            <p className="text-3xl font-bold">{orders.filter(o => o.status === 'Đang giao').length}</p>
                        </div>
                        <Truck className="w-10 h-10 text-orange-200" />
                    </div>
                </motion.div>
            </div>

            {/* Biểu đồ và thống kê chi tiết */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Thống kê thanh toán */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                >
                    <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                        <CreditCard className="mr-2 text-green-600" />
                        Tình Trạng Thanh Toán
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Đã thanh toán</span>
                            <div className="flex items-center">
                                <div className="w-32 bg-gray-200 rounded-full h-3 mr-3">
                                    <div
                                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${orders.length > 0 ? (paidOrders.length / orders.length) * 100 : 0}%` }}
                                    ></div>
                                </div>
                                <span className="font-semibold text-green-600">{paidOrders.length}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Chưa thanh toán</span>
                            <div className="flex items-center">
                                <div className="w-32 bg-gray-200 rounded-full h-3 mr-3">
                                    <div
                                        className="bg-red-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${orders.length > 0 ? (unpaidOrders.length / orders.length) * 100 : 0}%` }}
                                    ></div>
                                </div>
                                <span className="font-semibold text-red-600">{unpaidOrders.length}</span>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Doanh thu đã thu:</p>
                            <p className="text-xl font-bold text-green-600">
                                {paidOrders.reduce((sum, order) => sum + order.total, 0).toLocaleString()} VNĐ
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Tiến trình giao hàng nhỏ gọn */}
                <div className="bg-white rounded-xl shadow-md border border-blue-100 p-5">
                    <h2 className="text-base font-bold mb-5 flex items-center gap-2 text-blue-700">
                        <Truck className="w-5 h-5 text-blue-500" /> Tiến Trình Giao Hàng
                    </h2>
                    <div className="space-y-4">
                        {Object.entries(deliveryStats)
                            .filter(([progress]) => progress && progress !== 'null' && progress !== undefined && progress !== '')
                            .map(([status, count], index) => {
                                // Icon, màu, và nền cho từng trạng thái
                                const statusMap = {
                                    'Đã hủy': { icon: <div className="w-6 h-6 flex items-center justify-center rounded-full bg-red-50"><X className="w-4 h-4 text-red-400" /></div>, bar: 'bg-red-200', fill: 'bg-red-400', text: 'text-red-600' },
                                    'Đã giao': { icon: <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-50"><CheckCircle className="w-4 h-4 text-green-400" /></div>, bar: 'bg-green-100', fill: 'bg-green-400', text: 'text-green-700' },
                                    'Đang giao': { icon: <div className="w-6 h-6 flex items-center justify-center rounded-full bg-yellow-50"><Truck className="w-4 h-4 text-yellow-400" /></div>, bar: 'bg-yellow-100', fill: 'bg-yellow-400', text: 'text-yellow-700' },
                                    'Chuẩn bị hàng': { icon: <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100"><Package className="w-4 h-4 text-gray-400" /></div>, bar: 'bg-gray-200', fill: 'bg-gray-400', text: 'text-gray-700' },
                                };
                                const { icon, bar, fill, text } = statusMap[status] || statusMap['Chuẩn bị hàng'];
                                const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                                return (
                                    <div key={status} className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 w-36 min-w-[90px]">
                                            {icon}
                                            <span className={`font-medium text-xs ${text}`}>{status}</span>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className={`relative w-full h-2 ${bar} rounded-full overflow-hidden`}>
                                                <div
                                                    className={`absolute left-0 top-0 h-2 rounded-full transition-all duration-700 ${fill}`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className={`font-bold text-base min-w-[28px] text-right ${text}`}>{count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>

            {/* Đơn hàng gần đây */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
                <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                    <List className="mr-2 text-purple-600" />
                    Đơn Hàng Gần Đây
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-2 text-gray-600 font-medium">Mã Đơn</th>
                            <th className="text-left py-2 text-gray-600 font-medium">Khách Hàng</th>
                            <th className="text-left py-2 text-gray-600 font-medium">Giá Trị</th>
                            <th className="text-left py-2 text-gray-600 font-medium">Trạng Thái</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.slice(0, 5).map((order, index) => (
                            <motion.tr
                                key={order.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                <td className="py-3 font-medium text-blue-600">{order.id}</td>
                                <td className="py-3 text-gray-800">{order.customer}</td>
                                <td className="py-3 font-semibold text-green-600">
                                    {order.total.toLocaleString()} VNĐ
                                </td>
                                <td className="py-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Đang giao' ? 'bg-yellow-100 text-yellow-700' :
                                                order.status === 'Hủy' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                </td>
                            </motion.tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                {orders.length > 5 && (
                    <div className="mt-4 text-center">
                        <p className="text-gray-500 text-sm">Và {orders.length - 5} đơn hàng khác...</p>
                    </div>
                )}
            </motion.div>

            {/* Insights nhanh */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center mb-3">
                        <Star className="w-6 h-6 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-blue-800">Hiệu Suất</h4>
                    </div>
                    <p className="text-2xl font-bold text-blue-700 mb-2">{completionRate}%</p>
                    <p className="text-blue-600 text-sm">Tỷ lệ hoàn thành đơn hàng</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center mb-3">
                        <CreditCard className="w-6 h-6 text-green-600 mr-2" />
                        <h4 className="font-semibold text-green-800">Thu Nhập</h4>
                    </div>
                    <p className="text-xl font-bold text-green-700 mb-2">
                        {orders.length > 0 ? Math.round(totalRevenue / orders.length).toLocaleString() : 0} VNĐ
                    </p>
                    <p className="text-green-600 text-sm">Giá trị trung bình/đơn</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center mb-3">
                        <Truck className="w-6 h-6 text-purple-600 mr-2" />
                        <h4 className="font-semibold text-purple-800">Giao Hàng</h4>
                    </div>
                    <p className="text-2xl font-bold text-purple-700 mb-2">
                        {orders.filter(o => o.deliveryProgress === 'Đang giao').length}
                    </p>
                    <p className="text-purple-600 text-sm">Đơn hàng đang trên đường</p>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ViewOrders with filters
const ViewOrders = ({ orders }) => {
    const [filterStatus, setFilterStatus] = useState('Tất cả');
    const [filterPayment, setFilterPayment] = useState('Tất cả');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Số đơn hàng mỗi trang

    // Áp dụng bộ lọc
    const filteredOrders = orders.filter(order => {
        const statusMatch = filterStatus === 'Tất cả' || order.status === filterStatus;
        const paymentMatch = filterPayment === 'Tất cả' || order.payment === filterPayment;
        return statusMatch && paymentMatch;
    });

    // Tính toán phân trang
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset bộ lọc
    const resetFilters = () => {
        setFilterStatus('Tất cả');
        setFilterPayment('Tất cả');
        setCurrentPage(1); // Reset về trang 1 khi reset bộ lọc
    };

    // Điều hướng trang
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-4xl font-bold flex items-center text-gray-800">
                    <List className="mr-2" /> Xem Thông Tin Đơn Hàng
                </h2>
            </div>

            {/* Bộ lọc */}
            <div className="mb-6 flex space-x-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái Đơn Hàng</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Tất cả">Tất cả</option>
                        <option value="Đang xử lý">Đang xử lý</option>
                        <option value="Đang giao">Đang giao</option>
                        <option value="Hoàn thành">Hoàn thành</option>
                        <option value="Hủy">Hủy</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái Thanh Toán</label>
                    <select
                        value={filterPayment}
                        onChange={(e) => {
                            setFilterPayment(e.target.value);
                            setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Tất cả">Tất cả</option>
                        <option value="Đã thanh toán">Đã thanh toán</option>
                        <option value="Chưa thanh toán">Chưa thanh toán</option>
                    </select>
                </div>
                <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors mt-auto"
                >
                    Đặt Lại Bộ Lọc
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto border border-gray-100">
                <table className="w-full border-collapse">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-3 text-left text-gray-700">Mã Đơn</th>
                        <th className="border p-3 text-left text-gray-700">Khách Hàng</th>
                        <th className="border p-3 text-left text-gray-700">Tổng Tiền</th>
                        <th className="border p-3 text-left text-gray-700">Trạng Thái</th>
                        <th className="border p-3 text-left text-gray-700">Thanh Toán</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedOrders.map(order => (
                        <motion.tr
                            key={order.id}
                            whileHover={{ backgroundColor: '#f3f4f6' }}
                            transition={{ duration: 0.2 }}
                        >
                            <td className="border p-3">{order.id}</td>
                            <td className="border p-3">{order.customer}</td>
                            <td className="border p-3">{order.total.toLocaleString()} VNĐ</td>
                            <td className="border p-3">
                                    <span className={`px-2 py-1 rounded-full text-sm ${order.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' :
                                        order.status === 'Đang giao' ? 'bg-yellow-100 text-yellow-700' :
                                            order.status === 'Hủy' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                    }`}>
                                        {order.status}
                                    </span>
                            </td>
                            <td className="border p-3">{order.payment}</td>
                        </motion.tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center items-center space-x-2">
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        Trang trước
                    </button>
                    <div className="flex space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`px-3 py-1 rounded-lg ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        Trang sau
                    </button>
                </div>
            )}
        </motion.div>
    );
};

// SearchOrders
const SearchOrders = ({ orders, searchTerm, setSearchTerm }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Số đơn hàng mỗi trang

    const filteredOrders = orders.filter(order =>
        order.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Tính toán phân trang
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Điều hướng trang
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
                <Search className="mr-2" /> Tìm Kiếm Đơn Hàng
            </h2>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center mb-6"
                >
                    <Search className="mr-3 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Nhập mã đơn hoặc tên khách hàng..."
                        className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
                        }}
                    />
                </motion.div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-3 text-left text-gray-700">Mã Đơn</th>
                            <th className="border p-3 text-left text-gray-700">Khách Hàng</th>
                            <th className="border p-3 text-left text-gray-700">Tổng Tiền</th>
                            <th className="border p-3 text-left text-gray-700">Trạng Thái</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedOrders.map(order => (
                            <motion.tr
                                key={order.id}
                                whileHover={{ backgroundColor: '#f3f4f6' }}
                                transition={{ duration: 0.2 }}
                            >
                                <td className="border p-3">{order.id}</td>
                                <td className="border p-3">{order.customer}</td>
                                <td className="border p-3">{order.total.toLocaleString()} VNĐ</td>
                                <td className="border p-3">
                                        <span className={`px-2 py-1 rounded-full text-sm ${order.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Đang giao' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                </td>
                            </motion.tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                {/* Phân trang */}
                {totalPages > 1 && (
                    <div className="mt-4 flex justify-center items-center space-x-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            Trang trước
                        </button>
                        <div className="flex space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`px-3 py-1 rounded-lg ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            Trang sau
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Footer
const Footer = () => (
    <footer className="bg-gray-800 text-white py-8">
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 Hệ Thống Quản Lý Vận Chuyển Nhà. Mọi quyền được bảo lưu.</p>
        </div>
    </footer>
);

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState('view');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Lấy và kiểm tra token
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        console.log('Token trong localStorage:', token); // Debug
        // if (!token) {
        //     setError('Không tìm thấy token. Vui lòng đăng nhập!');
        //     console.error('Token không tồn tại. Chuyển hướng đến trang đăng nhập nếu cần.');
        //     window.location.href = '/login';
        //     return;
        // }
    }, []);

    // Hàm ánh xạ BookingResponse sang cấu trúc đơn hàng
    const mapBookingToOrder = (booking) => ({
        id: booking.bookingId,
        customer: booking.customerFullName || 'Không xác định',
        customerId: booking.customerId || '',
        total: booking.total || 0,
        status: booking.status || 'Đang xử lý',
        payment: booking.paymentStatus === 'COMPLETED' ? 'Đã thanh toán' : 'Chưa thanh toán',
        deliveryProgress: mapStatusToDeliveryProgress(booking.status),
        deliveryDate: booking.deliveryDate || '',
        note: booking.note || ''
    });

    // Hàm ánh xạ status sang deliveryProgress (đồng bộ với backend)
    const mapStatusToDeliveryProgress = (status) => {
        switch (status) {
            case 'PENDING':
            case 'Đang xử lý':
                return 'Chuẩn bị hàng';
            case 'SHIPPING':
            case 'Đang giao':
                return 'Đang giao';
            case 'COMPLETED':
            case 'Hoàn thành':
                return 'Đã giao';
            case 'CANCELED':
            case 'Hủy':
                return 'Đã hủy';
            default:
                return null; // Không tính các status khác
        }
    };

    // Lấy danh sách đơn hàng khi component mount
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const data = await ManageOrderApi.getOrders();
                const mappedOrders = Array.isArray(data) ? data.map(mapBookingToOrder) : [];
                setOrders(mappedOrders);
                setError(null);
            } catch (err) {
                setError(`Không thể tải danh sách đơn hàng: ${err.message}`);
                console.error('Lỗi chi tiết:', err.response ? err.response.data : err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Cập nhật trạng thái thanh toán
    const updatePaymentStatus = async (orderId, newStatus) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Token không tồn tại. Vui lòng đăng nhập!');
            return;
        }
        setLoading(true);
        try {
            const responseData = await ManageOrderApi.updatePaymentStatus(orderId, newStatus);
            console.log('Phản hồi từ server:', responseData);
            // Reload danh sách đơn hàng thay vì chỉ cập nhật cục bộ
            const updatedOrders = await ManageOrderApi.getOrders();
            setOrders(updatedOrders.map(mapBookingToOrder));
            alert(responseData.message || 'Cập nhật trạng thái thanh toán thành công!');
        } catch (err) {
            setError(`Lỗi khi cập nhật trạng thái thanh toán: ${err.message}`);
            console.error('Lỗi chi tiết:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message,
            });
        } finally {
            setLoading(false);
        }
    };

    // Lấy thông tin tổng quan
    const fetchOverview = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Token không tồn tại. Vui lòng đăng nhập!');
            return;
        }
        setLoading(true);
        try {
            const overview = await ManageOrderApi.getOverview();
            console.log('Thông tin tổng quan:', overview);
            setError(null);
        } catch (err) {
            setError(`Lỗi khi lấy thông tin tổng quan: ${err.message}`);
            console.error('Lỗi chi tiết:', err.response ? err.response.data : err);
        } finally {
            setLoading(false);
        }
    };

    // Gọi fetchOverview khi vào trang tổng quan
    useEffect(() => {
        if (currentPage === 'overview') {
            fetchOverview();
        }
    }, [currentPage]);

    return (
        <div className="min-h-screen bg-gray-50">
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 1s ease-out; }
                .animate-fade-in-delay { animation: fade-in 1s ease-out 0.3s both; }
                .animate-fade-in-delay-2 { animation: fade-in 1s ease-out 0.6s both; }
            `}</style>
            <Header />
            <div className="flex pt-20">
                <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
                <div className="flex-1 p-8 overflow-auto">
                    {loading && <p className="text-center text-gray-600">Đang tải...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    <AnimatePresence mode="wait">
                        {currentPage === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <OverviewOrders orders={orders} />
                            </motion.div>
                        )}
                        {currentPage === 'view' && (
                            <motion.div
                                key="view"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ViewOrders orders={orders} />
                            </motion.div>
                        )}
                        {currentPage === 'payment' && (
                            <motion.div
                                key="payment"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                            </motion.div>
                        )}
                        {currentPage === 'search' && (
                            <motion.div
                                key="search"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                 exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <SearchOrders orders={orders} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Dashboard;