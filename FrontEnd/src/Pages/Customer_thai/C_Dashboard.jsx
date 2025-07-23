import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    User,
    History,
    Edit,
    MessageSquare,
    LogOut,
    ArrowLeft,
    Package,
    Calendar,
    MapPin,
    Phone,
    Mail,
    Truck,
    Star,
    AlertCircle,
    BarChart3,
    Trash2,
    MessageCircle,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    Gift,
    Home
} from 'lucide-react';
import NotificationBell from '../../Components/NotificationBell';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    Title
} from 'chart.js';
import { apiCall } from '../../utils/api';
import C_Booking from './C_Booking';
import C_Feedback from './C_Feedback';
import C_BookingDetail from './C_BookingDetail.jsx';
import C_History from './C_History.jsx';
import ChatboxAI from '../ChatboxAI_TrungTran/ChatboxAI';
import RequireAuth from '../../Components/RequireAuth';
import FeedbackModal from './FeedbackModal.jsx';
import { getAllBookingsOfCustomer } from './feedbackDataService';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const C_Dashboard = () => {
    const location = useLocation();
    // Ưu tiên state.activeTab nếu có khi khởi tạo
    const [activeComponent, setActiveComponent] = useState(() => {
        if (location.state && location.state.activeTab) {
            return location.state.activeTab;
        }
        return 'dashboard';
    });

    // Nếu state.activeTab thay đổi (ví dụ: quay lại từ chi tiết đơn hàng), tự động chuyển tab
    useEffect(() => {
        if (location.state && location.state.activeTab && location.state.activeTab !== activeComponent) {
            setActiveComponent(location.state.activeTab);
        }
    }, [location.state]);
    const [userInfo, setUserInfo] = useState({
        name: 'Nguyễn Văn An',
        email: 'nguyenvanan@email.com',
        phone: '0901234567',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        avatar: null
    });
    const [orderHistory, setOrderHistory] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [customerStats, setCustomerStats] = useState({
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        shippingOrders: 0,
        totalSpent: 0,
        averageRating: 0
    });
    const [editFormData, setEditFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        img: ''
    });
    const [forceUpdate, setForceUpdate] = useState(0);
    const intervalRef = useRef();
    // Thay đổi state filter
    const [filter, setFilter] = useState({
        from: '',
        to: '',
        statuses: ['PENDING', 'SHIPPING', 'COMPLETED', 'CANCELLED'], // Mặc định chọn hết
    });
    const [promotions, setPromotions] = useState([]);
    const [isCustomer, setIsCustomer] = useState(false);
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [selectedBookingForFeedback, setSelectedBookingForFeedback] = useState(null);

    // Pagination state for order history
    const [orderPage, setOrderPage] = useState(1);
    const ORDERS_PER_PAGE = 4;
    const getOrderPaginatedData = (data, page) => {
        const start = (page - 1) * ORDERS_PER_PAGE;
        return data.slice(start, start + ORDERS_PER_PAGE);
    };
    const getOrderTotalPages = (data) => Math.ceil(data.length / ORDERS_PER_PAGE);

    // Luôn reset về trang 1 khi filter thay đổi
    useEffect(() => {
        setOrderPage(1);
    }, [filter]);

    const navigate = useNavigate();

    useEffect(() => {
        fetchCustomerData();
        fetchPromotions();
        // Kiểm tra role CUSTOMER
        const roles = sessionStorage.getItem('roles');
        if (roles && (roles.includes('CUSTOMER') || roles.includes('customer'))) {
            setIsCustomer(true);
        } else {
            setIsCustomer(false);
        }
    }, []);

    useEffect(() => {
        if (userInfo) {
            setEditFormData({
                fullName: userInfo.name || '',
                phone: userInfo.phone || '',
                address: userInfo.address || '',
                img: userInfo.avatar || ''
            });
        }
    }, [userInfo, activeComponent]);

    useEffect(() => {
        // Cập nhật countdown mỗi phút
        intervalRef.current = setInterval(() => {
            setForceUpdate(f => f + 1);
        }, 60 * 1000); // mỗi phút
        return () => clearInterval(intervalRef.current);
    }, []);

    const fetchPromotions = async () => {
        try {
            const response = await apiCall('/api/customer/promotions', { auth: true });
            if (response.ok) {
                const promotionsData = await response.json();
                setPromotions(promotionsData);
            }
        } catch (error) {
            console.error('Error fetching promotions:', error);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await apiCall('/api/customer/profile', {
                method: 'PUT',
                auth: true,
                body: JSON.stringify(editFormData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Cập nhật thất bại!');
            }

            alert('Cập nhật thông tin thành công!');
            await fetchCustomerData(); // Refresh all data on the page
        } catch (error) {
            alert(error.message);
            console.error('Error updating profile:', error);
        }
    };

    const fetchCustomerData = async () => {
        try {
            // Fetch customer profile
            const profileResponse = await apiCall('/api/customer/profile', { auth: true });
            if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                // Map backend data to frontend state
                const formattedUserInfo = {
                    name: profileData.fullName || 'N/A',
                    email: profileData.email,
                    phone: profileData.phone,
                    address: profileData.address,
                    avatar: profileData.img || null
                };
                setUserInfo(formattedUserInfo);
            }

            // Fetch bookings bằng API mới
            let bookings = await getAllBookingsOfCustomer();

            // --- BẮT ĐẦU: Kiểm tra và xóa các booking chưa thanh toán quá 2 ngày ---
            const now = new Date();
            const incompletedToDelete = bookings.filter(order => {
                if (order.paymentStatus !== 'INCOMPLETED') return false;
                const created = new Date(order.createdAt);
                const diffMs = now - created;
                const diffDays = diffMs / (1000 * 60 * 60 * 24);
                return diffDays > 2;
            });
            // Hủy các booking này (gọi API PATCH /cancel)
            for (const order of incompletedToDelete) {
                try {
                    await apiCall(`/api/customer/bookings/${order.bookingId}/cancel`, { method: 'PATCH', auth: true });
                } catch (e) {
                    // Có thể log lỗi nếu cần
                }
            }
            // Lọc lại danh sách booking sau khi xoá
            if (incompletedToDelete.length > 0) {
                bookings = await getAllBookingsOfCustomer();
            }
            // --- KẾT THÚC ---

            setOrderHistory(bookings);
            // Calculate statistics
            const completedPayments = bookings.filter(order => order.paymentStatus === 'COMPLETED');
            const stats = {
                totalOrders: bookings.length,
                completedOrders: bookings.filter(order => order.status === 'COMPLETED').length,
                pendingOrders: bookings.filter(order => order.status === 'PENDING').length,
                shippingOrders: bookings.filter(order => order.status === 'SHIPPING').length,
                totalSpent: completedPayments.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0),
                averageRating: bookings.length > 0 ? bookings.reduce((sum, order) => sum + (order.rating || 0), 0) / bookings.length : 0
            };
            setCustomerStats(stats);
        } catch (error) {
            console.error('Error fetching customer data:', error);
        } finally {
            // setLoading(false); // Xóa
        }
    };

    // Lấy tất cả booking của customer đang đăng nhập (API mới)
    const fetchAllCustomerBookings = async () => {
        try {
            const bookings = await getAllBookingsOfCustomer();
            setOrderHistory(bookings);
        } catch (error) {
            console.error('Lỗi lấy danh sách booking của customer:', error);
        }
    };

    const deleteBooking = async (bookingId) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
            return;
        }

        try {
            const response = await apiCall(`/api/customer/bookings/${bookingId}`, { method: 'DELETE', auth: true });

            if (response.ok) {
                alert('Hủy đơn hàng thành công!');
                await fetchCustomerData(); // Refresh data
            } else {
                const errorData = await response.json();
                alert(`Lỗi: ${errorData.message || 'Không thể hủy đơn hàng'}`);
            }
        } catch (error) {
            console.error('Error deleting booking:', error);
            alert('Có lỗi xảy ra khi hủy đơn hàng');
        }
    };

    const submitFeedback = async (bookingId) => {
        try {
            const feedbackData = {
                content: 'Feedback mẫu',
                star: 5,
                type: 'TRANSPORTATION'
            };

            const response = await apiCall('/api/customer/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData),
                auth: true
            });

            if (response.ok) {
                alert('Gửi feedback thành công!');
                await fetchCustomerData(); // Refresh data
            } else {
                const errorData = await response.json();
                alert(`Lỗi: ${errorData.message || 'Không thể gửi feedback'}`);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Có lỗi xảy ra khi gửi feedback');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = '/c_homepage';
    };

    const openFeedbackModal = (booking) => {
        setSelectedBookingForFeedback(booking);
        setFeedbackModalOpen(true);
    };

    const closeFeedbackModal = () => {
        setFeedbackModalOpen(false);
        setSelectedBookingForFeedback(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'SHIPPING': return 'bg-blue-100 text-blue-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'COMPLETED': return 'Hoàn thành';
            case 'PENDING': return 'Chờ xử lý';
            case 'SHIPPING': return 'Đang vận chuyển';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };

    const getCustomerLevel = (totalOrders) => {
        console.log('Calculating customer level for totalOrders:', totalOrders); // Debug log
        if (totalOrders >= 10) return { level: 'VIP', color: 'text-red-600' };
        if (totalOrders >= 5) return { level: 'Gold', color: 'text-yellow-600' };
        if (totalOrders >= 2) return { level: 'Silver', color: 'text-gray-600' };
        return { level: 'Bronze', color: 'text-orange-600' };
    };

    const getBarChartData = () => {
        const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        const data = new Array(12).fill(0);

        orderHistory.forEach(order => {
            if (order.createdAt) {
                const date = new Date(order.createdAt);
                const monthIndex = date.getMonth(); // 0-11
                data[monthIndex]++;
            }
        });

        return {
            labels: months,
            datasets: [
                {
                    label: 'Đơn hàng',
                    data: data,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                },
            ],
        };
    };

    const getPieChartData = () => {
        return {
            labels: ['Hoàn thành', 'Chờ xử lý', 'Đang vận chuyển'],
            datasets: [
                {
                    data: [
                        customerStats.completedOrders,
                        customerStats.pendingOrders,
                        customerStats.shippingOrders
                    ],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(234, 179, 8, 0.8)',
                        'rgba(59, 130, 246, 0.8)'
                    ],
                    borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(234, 179, 8, 1)',
                        'rgba(59, 130, 246, 1)'
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };

    // Thêm hàm lấy dữ liệu tổng chi tiêu theo tháng
    const getTotalSpentBarChartData = () => {
        const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        const data = new Array(12).fill(0);

        orderHistory.forEach(order => {
            const date = new Date(order.createdAt);
            const monthIndex = date.getMonth(); // 0-11
            data[monthIndex] += parseFloat(order.total) || 0;
        });

        return {
            labels: months,
            datasets: [
                {
                    label: 'Tổng chi tiêu (VNĐ)',
                    data: data,
                    backgroundColor: 'rgba(139, 92, 246, 0.5)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 1,
                },
            ],
        };
    };

    // Hàm lọc dữ liệu
    const getFilteredOrderHistory = () => {
        return orderHistory.filter(order => {
            // Lọc theo ngày tạo
            let passDate = true;
            if (filter.from) {
                passDate = passDate && new Date(order.createdAt) >= new Date(filter.from);
            }
            if (filter.to) {
                // Để bao gồm cả ngày to, cộng thêm 1 ngày
                const toDate = new Date(filter.to);
                toDate.setDate(toDate.getDate() + 1);
                passDate = passDate && new Date(order.createdAt) < toDate;
            }
            // Lọc theo trạng thái
            // Nếu không chọn trạng thái nào, hiển thị tất cả
            if (!filter.statuses || filter.statuses.length === 0) return passDate;
            let passStatus = filter.statuses.includes(order.status);
            return passDate && passStatus;
        });
    };

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'statuses') {
            setFilter(prev => {
                let newStatuses = [...prev.statuses];
                if (checked) {
                    if (!newStatuses.includes(value)) newStatuses.push(value);
                } else {
                    newStatuses = newStatuses.filter(s => s !== value);
                }
                return { ...prev, statuses: newStatuses };
            });
        } else {
            setFilter(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const renderDashboard = () => (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Chào mừng trở lại, {userInfo.name}!</h1>
                        <p className="opacity-90">Quản lý đơn hàng và thông tin cá nhân của bạn</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm opacity-75">Cấp độ khách hàng</div>
                        <div className={`text-xl font-bold ${getCustomerLevel(customerStats.totalOrders).color}`}>
                            {getCustomerLevel(customerStats.totalOrders).level}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                            <p className="text-2xl font-bold text-gray-800">{customerStats.totalOrders}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Đơn hoàn thành</p>
                            <p className="text-2xl font-bold text-green-600">{customerStats.completedOrders}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {customerStats.totalSpent.toLocaleString('vi-VN')}đ
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Đánh giá TB</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {customerStats.averageRating.toFixed(1)}/5
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Star className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Container chứa cả 2 biểu đồ cột */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-10">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Thống kê đơn hàng theo tháng</h3>
                        <Bar data={getBarChartData()} options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                            },
                        }} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tổng chi tiêu theo tháng</h3>
                        <Bar data={getTotalSpentBarChartData()} options={{
                            responsive: true,
                            plugins: {
                                legend: { position: 'top' },
                            },
                        }} />
                    </div>
                </div>
                {/* Pie chart giữ nguyên */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Phân bố trạng thái đơn hàng</h3>
                    <Pie data={getPieChartData()} options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom',
                            },
                        },
                    }} />
                </div>
            </div>
        </div>
    );

    const renderOrderHistory = () => (
        <div className="space-y-6">
            {/* Filter Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Lọc đơn hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                        <input
                            type="date"
                            name="from"
                            value={filter.from}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                        <input
                            type="date"
                            name="to"
                            value={filter.to}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="col-span-2 flex items-center space-x-6">
                        {['PENDING', 'SHIPPING', 'COMPLETED', 'CANCELLED'].map(status => (
                            <label key={status} className="flex items-center space-x-2 text-lg">
                                <input
                                    type="checkbox"
                                    name="statuses"
                                    value={status}
                                    checked={filter.statuses.includes(status)}
                                    onChange={handleFilterChange}
                                    className="w-5 h-5"
                                />
                                <span className="text-sm text-gray-700 font-semibold">{getStatusText(status)}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            {/* Orders List */}
            <div className="space-y-4">
                {getFilteredOrderHistory().length > 0 ? (
                    getOrderPaginatedData(getFilteredOrderHistory(), orderPage).map((order) => (
                        <div key={order.bookingId} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Package className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Đơn hàng #{order.bookingId}</h4>
                                        <p className="text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </span>
                                    <span className="text-lg font-bold text-gray-800">
                                        {parseFloat(order.total).toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                            </div>
                            {/* Hiển thị cảnh báo nếu đơn chưa thanh toán và chưa quá 2 ngày */}
                            {order.paymentStatus === 'INCOMPLETED' && (() => {
                                const created = new Date(order.createdAt);
                                const now = new Date();
                                const diffMs = now - created;
                                const diffDays = diffMs / (1000 * 60 * 60 * 24);
                                if (diffDays <= 2) {
                                    return (
                                        <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded flex items-center">
                                            <AlertCircle className="w-5 h-5 mr-2" />
                                            <span>Đơn hàng này chưa được thanh toán. Nếu không thanh toán trong 2 ngày kể từ khi tạo, đơn sẽ tự động bị hủy.</span>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-gray-600">Địa chỉ lấy hàng</p>
                                    <p className="font-medium text-gray-800">{order.pickupLocation}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                                    <p className="font-medium text-gray-800">{order.deliveryLocation}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    {order.status === 'COMPLETED' && !order.rating && (
                                        <button
                                            onClick={() => openFeedbackModal(order)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Đánh giá
                                        </button>
                                    )}
                                    {order.status === 'PENDING' && (
                                        <button
                                            onClick={() => deleteBooking(order.bookingId)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Hủy đơn
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate(`/customer/booking/${order.bookingId}`, { state: { fromOrderHistory: true } })}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Xem
                                    </button>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {order.rating && (
                                        <div className="flex items-center space-x-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span>{order.rating}/5</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Chưa có đơn hàng nào</p>
                    </div>
                )}
            </div>
            {/* Pagination controls */}
            {getOrderTotalPages(orderHistory) > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                    <button
                        className="px-3 py-1 rounded-lg border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                        disabled={orderPage === 1}
                    >
                        Trước
                    </button>
                    {Array.from({ length: getOrderTotalPages(orderHistory) }, (_, i) => (
                        <button
                            key={i}
                            className={`px-3 py-1 rounded-lg border ${orderPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                            onClick={() => setOrderPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        className="px-3 py-1 rounded-lg border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => setOrderPage((p) => Math.min(getOrderTotalPages(orderHistory), p + 1))}
                        disabled={orderPage === getOrderTotalPages(orderHistory)}
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );

    const renderEditPersonalInfo = () => (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Chỉnh sửa thông tin cá nhân</h3>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                        <input
                            type="text"
                            name="fullName"
                            value={editFormData.fullName}
                            onChange={handleFormChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                        <input
                            type="tel"
                            name="phone"
                            value={editFormData.phone}
                            onChange={handleFormChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                        <textarea
                            name="address"
                            value={editFormData.address}
                            onChange={handleFormChange}
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL ảnh đại diện</label>
                        <input
                            type="url"
                            name="img"
                            value={editFormData.img}
                            onChange={handleFormChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Cập nhật thông tin
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderComplaints = () => (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Khiếu nại và phản hồi</h3>
                <p className="text-gray-600 mb-6">
                    Nếu bạn có bất kỳ khiếu nại hoặc phản hồi nào, vui lòng liên hệ với chúng tôi.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3 mb-3">
                            <Phone className="w-6 h-6 text-blue-600" />
                            <h4 className="font-semibold text-gray-800">Hotline</h4>
                        </div>
                        <p className="text-gray-600">1900-1234</p>
                        <p className="text-sm text-gray-500">Hỗ trợ 24/7</p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3 mb-3">
                            <Mail className="w-6 h-6 text-green-600" />
                            <h4 className="font-semibold text-gray-800">Email</h4>
                        </div>
                        <p className="text-gray-600">support@vanchuyen.com</p>
                        <p className="text-sm text-gray-500">Phản hồi trong 24h</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPromotions = () => (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h1 className="text-4xl text-center font-semibold text-gray-800 mb-4">Khuyến mãi hiện tại</h1>

                {promotions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {promotions.map((promotion) => (
                            <div key={promotion.promotionId} className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                        <Gift className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">
                                        {promotion.discountPercentage}% OFF
                                    </span>
                                </div>

                                <h4 className="text-lg font-bold mb-2">{promotion.name}</h4>
                                <p className="text-sm opacity-90 mb-4">{promotion.description}</p>

                                <div className="flex items-center justify-between text-sm">
                                    <span>Mã: {promotion.code}</span>
                                    <span>Hết hạn: {new Date(promotion.endDate).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Hiện tại không có khuyến mãi nào</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderActiveComponent = () => {
        switch (activeComponent) {
            case 'dashboard':
                return renderDashboard();
            case 'orderHistory':
                return renderOrderHistory();
            case 'editInfo':
                return renderEditPersonalInfo();
            case 'complaints':
                return renderComplaints();
            case 'booking':
                return <C_Booking isLoggedIn={true} />;
            case 'feedback':
                return <C_Feedback />;
            case 'promotions':
                return renderPromotions();
            case 'historycmt':
                return <C_History />;
            default:
                return renderDashboard();
        }
    };

    return (
        <RequireAuth allowedRoles={["CUSTOMER"]}>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Truck className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-xl font-bold text-gray-800">Vận Chuyển Nhà</h1>
                            </div>

                            <div className="flex items-center space-x-4">
                                <NotificationBell />
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={userInfo.avatar || '/default-avatar.png'}
                                        alt={userInfo.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{userInfo.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex">
                    {/* Sidebar */}
                    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen sticky top-0 h-screen">
                        <nav className="p-4 space-y-2">
                            <button
                                onClick={() => setActiveComponent('dashboard')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeComponent === 'dashboard'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <BarChart3 className="w-5 h-5" />
                                <span>Tổng quan</span>
                            </button>

                            <button
                                onClick={() => setActiveComponent('booking')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeComponent === 'booking'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Plus className="w-5 h-5" />
                                <span>Tạo đơn hàng</span>
                            </button>

                            <button
                                onClick={() => setActiveComponent('promotions')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeComponent === 'promotions'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Gift className="w-5 h-5" />
                                <span>Khuyến mãi</span>
                            </button>

                            <button
                                onClick={() => setActiveComponent('feedback')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeComponent === 'feedback'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Package className="w-5 h-5" />
                                <span>Kho và vận chuyển</span>
                            </button>

                            {/* Thêm nút Nhật kí hoạt động */}
                            <button
                                onClick={() => setActiveComponent('historycmt')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeComponent === 'historycmt'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <History className="w-5 h-5" />
                                <span>Nhật kí hoạt động</span>
                            </button>

                            <button
                                onClick={() => setActiveComponent('orderHistory')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeComponent === 'orderHistory'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <History className="w-5 h-5" />
                                <span>Lịch sử đơn hàng</span>
                            </button>

                            <button
                                onClick={() => setActiveComponent('editInfo')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeComponent === 'editInfo'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Edit className="w-5 h-5" />
                                <span>Chỉnh sửa thông tin</span>
                            </button>

                            <button
                                onClick={() => setActiveComponent('complaints')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeComponent === 'complaints'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <MessageSquare className="w-5 h-5" />
                                <span>Khiếu nại</span>
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 p-6">
                        {renderActiveComponent()}
                        {isCustomer && <ChatboxAI />}
                        <FeedbackModal
                            isOpen={feedbackModalOpen}
                            onClose={closeFeedbackModal}
                            bookingId={selectedBookingForFeedback?.bookingId}
                            storageId={selectedBookingForFeedback?.storageId}
                            transportId={selectedBookingForFeedback?.transportId}
                        />
                    </main>
                </div>
            </div>
        </RequireAuth>
    );
};

export default C_Dashboard;
