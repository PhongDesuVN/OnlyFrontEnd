import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, CreditCard, Search, List, BarChart,
    Truck, Home, Users, Shield, Phone, Mail, MapPin, Star, CheckCircle
} from 'lucide-react';

// Dữ liệu đơn hàng mẫu
const initialOrders = [
    { id: 'ORD001', customer: 'Nguyễn Văn A', total: 1500000, status: 'Đang giao', payment: 'Chưa thanh toán', deliveryProgress: 'Đã rời kho' },
    { id: 'ORD002', customer: 'Trần Thị B', total: 2500000, status: 'Hoàn thành', payment: 'Đã thanh toán', deliveryProgress: 'Đã giao' },
    { id: 'ORD003', customer: 'Lê Văn C', total: 800000, status: 'Đang xử lý', payment: 'Chưa thanh toán', deliveryProgress: 'Chuẩn bị hàng' },

];

// Header
const Header = () => {
    return (
        <header className="fixed w-full top-0 bg-white shadow-lg">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Truck className="w-8 h-8 text-blue-600" />
                        <h1 className="text-xl font-bold text-black">Vận Chuyển Nhà</h1>
                    </div>
                    <nav className="hidden md:flex space-x-8">


                    </nav>
                    <div className="flex space-x-3">

                        <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                            <Link to="/" className="text-black hover:text-blue-600 transition-colors">Trang Chủ</Link>
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
        track: 'Theo Dõi',
        payment: 'Thanh Toán',
        search: 'Tìm Kiếm',
    };

    return (
        <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-64 bg-gradient-to-b from-blue-900 to-purple-600 text-white p-6 h-screen shadow-2xl"
        >
            <h1 className="text-2xl font-extrabold mb-8 flex items-center tracking-tight">
                <Package className="mr-2" /> Quản Lý Đơn Hàng
            </h1>
            <nav>
                {['overview', 'view', 'track', 'payment', 'search'].map(page => (
                    <motion.button
                        key={page}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center w-full text-left py-3 px-4 mb-3 rounded-lg transition-all duration-300 ${currentPage === page ? 'bg-blue-500 shadow-lg' : 'hover:bg-blue-600'
                            }`}
                        onClick={() => setCurrentPage(page)}
                    >
                        {page === 'overview' && <BarChart className="mr-2" size={20} />}
                        {page === 'view' && <List className="mr-2" size={20} />}
                        {page === 'track' && <Package className="mr-2" size={20} />}
                        {page === 'payment' && <CreditCard className="mr-2" size={20} />}
                        {page === 'search' && <Search className="mr-2" size={20} />}
                        {pageLabels[page]}
                    </motion.button>
                ))}
            </nav>
        </motion.div>
    );
};
// OverviewOrders
const OverviewOrders = ({ orders }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
            <BarChart className="mr-2" /> Tổng Quan Đơn Hàng
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { label: 'Tổng số đơn hàng', value: orders.length },
                { label: 'Đơn hàng đang giao', value: orders.filter(o => o.status === 'Đang giao').length },
                { label: 'Đơn hàng hoàn thành', value: orders.filter(o => o.status === 'Hoàn thành').length }
            ].map((item, idx) => (
                <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
                >
                    <p className="text-sm font-medium text-gray-600">{item.label}</p>
                    <p className="text-2xl font-bold text-blue-600">{item.value}</p>
                </motion.div>
            ))}
        </div>
    </motion.div>
);

// ViewOrders
const ViewOrders = ({ orders }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
            <List className="mr-2" /> Xem Thông Tin Đơn Hàng
        </h2>
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
                    {orders.map(order => (
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
                            <td className="border p-3">{order.payment}</td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    </motion.div>
);

// TrackDelivery
const TrackDelivery = ({ orders, updateDeliveryProgress }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
            <Package className="mr-2" /> Theo Dõi Giao Hàng
        </h2>
        <div className="space-y-4">
            {orders.map(order => (
                <motion.div
                    key={order.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                >
                    <p className="font-bold text-lg">Mã Đơn: {order.id}</p>
                    <p>Khách Hàng: {order.customer}</p>
                    <p>Tiến Trình: <span className="font-medium text-blue-600">{order.deliveryProgress}</span></p>
                    <motion.select
                        whileHover={{ scale: 1.05 }}
                        className="mt-3 p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
                        value={order.deliveryProgress}
                        onChange={(e) => updateDeliveryProgress(order.id, e.target.value)}
                    >
                        <option>Chuẩn bị hàng</option>
                        <option>Đã rời kho</option>
                        <option>Đang giao</option>
                        <option>Đã giao</option>
                    </motion.select>
                </motion.div>
            ))}
        </div>
    </motion.div>
);

// UpdatePayment
const UpdatePayment = ({ orders, updatePaymentStatus }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
            <CreditCard className="mr-2" /> Cập Nhật Thanh Toán
        </h2>
        <div className="space-y-4">
            {orders.map(order => (
                <motion.div
                    key={order.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                >
                    <p className="font-bold text-lg">Mã Đơn: {order.id}</p>
                    <p>Khách Hàng: {order.customer}</p>
                    <p>Trạng Thái Thanh Toán: <span className="font-medium text-blue-600">{order.payment}</span></p>
                    <motion.select
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-3 p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
                        value={order.payment}
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                    >
                        <option>Chưa thanh toán</option>
                        <option>Đã thanh toán</option>
                    </motion.select>
                </motion.div>
            ))}
        </div>
    </motion.div>
);

// SearchOrders
const SearchOrders = ({ orders, searchTerm, setSearchTerm }) => {
    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                            {filteredOrders.map(order => (
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

// Dashboard Component
const Dashboard = () => {
    const [orders, setOrders] = useState(initialOrders);
    const [currentPage, setCurrentPage] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');

    const updatePaymentStatus = (orderId, newStatus) => {
        setOrders(orders.map(order =>
            order.id === orderId ? { ...order, payment: newStatus } : order
        ));
    };

    const updateDeliveryProgress = (orderId, newProgress) => {
        setOrders(orders.map(order =>
            order.id === orderId ? { ...order, deliveryProgress: newProgress } : order
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 1s ease-out;
                }
                .animate-fade-in-delay {
                    animation: fade-in 1s ease-out 0.3s both;
                }
                .animate-fade-in-delay-2 {
                    animation: fade-in 1s ease-out 0.6s both;
                }
            `}</style>
            <Header />
            <div className="flex pt-20">
                <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
                <div className="flex-1 p-8 overflow-auto">
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
                        {currentPage === 'track' && (
                            <motion.div
                                key="track"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <TrackDelivery orders={orders} updateDeliveryProgress={updateDeliveryProgress} />
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
                                <UpdatePayment orders={orders} updatePaymentStatus={updatePaymentStatus} />
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