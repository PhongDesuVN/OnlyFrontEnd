import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
    XCircle
} from 'lucide-react';
import NotificationBell from '../../components/NotificationBell';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const C_CustomerInfo = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
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
    const [loading, setLoading] = useState(true);
    const [editFormData, setEditFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        img: ''
    });
    const [forceUpdate, setForceUpdate] = useState(0);
    const intervalRef = useRef();
    const [filter, setFilter] = useState({
        from: '',
        to: '',
        exclude: {
            COMPLETED: false,
            CANCELLED: false,
            PENDING: false
        }
    });

    useEffect(() => {
        fetchCustomerData();
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
    }, [userInfo, activeTab]);

    useEffect(() => {
        // Cập nhật countdown mỗi phút
        intervalRef.current = setInterval(() => {
            setForceUpdate(f => f + 1);
        }, 60 * 1000); // mỗi phút
        return () => clearInterval(intervalRef.current);
    }, []);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await apiCall('/api/customer/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
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
        setLoading(true);
        try {
            // Fetch customer profile
            const profileResponse = await apiCall('/api/customer/profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
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

            // Fetch bookings
            const bookingsResponse = await apiCall('/api/customer/bookings', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (bookingsResponse.ok) {
                const bookingsData = await bookingsResponse.json();
                console.log('Bookings data:', bookingsData); // Debug log
                setOrderHistory(bookingsData);
                
                // Calculate statistics
                const completedPayments = bookingsData.filter(order => order.paymentStatus === 'COMPLETED');
                console.log('Completed payments:', completedPayments); // Debug log
                
                const stats = {
                    totalOrders: bookingsData.length,
                    completedOrders: bookingsData.filter(order => order.status === 'COMPLETED').length,
                    pendingOrders: bookingsData.filter(order => order.status === 'PENDING').length,
                    shippingOrders: bookingsData.filter(order => order.status === 'SHIPPING').length,
                    totalSpent: completedPayments.reduce((sum, order) => {
                        console.log('Order total:', order.total, 'Order:', order); // Debug log
                        return sum + (parseFloat(order.total) || 0);
                    }, 0),
                    averageRating: bookingsData.length > 0 ? 
                        bookingsData.reduce((sum, order) => sum + (order.rating || 0), 0) / bookingsData.length : 0
                };
                console.log('Calculated stats:', stats); // Debug log
                setCustomerStats(stats);
            }

            // Fetch complaints (if endpoint exists) - TẠM THỜI VÔ HIỆU HÓA VÌ ENDPOINT CHƯA TỒN TẠI
            // const complaintsResponse = await apiCall('/api/customer/complaints', {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('token')}`
            //     }
            // });
            // if (complaintsResponse.ok) {
            //     const complaintsData = await complaintsResponse.json();
            //     setComplaints(complaintsData);
            // }
        } catch (error) {
            console.error('Error fetching customer data:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteBooking = async (bookingId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
            try {
                const response = await apiCall(`/api/customer/bookings/${bookingId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    alert('Đã xóa đơn hàng thành công!');
                    fetchCustomerData(); // Refresh data
                } else {
                    alert('Không thể xóa đơn hàng!');
                }
            } catch (error) {
                console.error('Error deleting booking:', error);
                alert('Có lỗi xảy ra khi xóa đơn hàng!');
            }
        }
    };

    const submitFeedback = async (bookingId) => {
        const rating = prompt('Nhập đánh giá của bạn (1-5 sao):');
        const comment = prompt('Nhập nhận xét của bạn:');
        
        if (rating && comment) {
            try {
                const response = await apiCall(`/api/customer/bookings/${bookingId}/feedback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        rating: parseInt(rating),
                        comment: comment
                    })
                });
                if (response.ok) {
                    alert('Cảm ơn bạn đã đánh giá!');
                    fetchCustomerData(); // Refresh data
                } else {
                    alert('Không thể gửi đánh giá!');
                }
            } catch (error) {
                console.error('Error submitting feedback:', error);
                alert('Có lỗi xảy ra khi gửi đánh giá!');
            }
        }
    };

    const handleLogout = () => {
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.removeItem('token');
        window.location.href = '/c_homepage';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'COMPLETED': return 'Hoàn thành';
            case 'PENDING': return 'Chờ xử lý';
            case 'CANCELLED': return 'Đã hủy';
            case 'SHIPPING': return 'Đang giao';
            default: return 'Không xác định';
        }
    };

    const getCustomerLevel = (totalOrders) => {
        if (totalOrders >= 20) return { level: 'VIP', color: 'text-purple-600', bgColor: 'bg-purple-100' };
        if (totalOrders >= 10) return { level: 'Thân thiết', color: 'text-orange-600', bgColor: 'bg-orange-100' };
        if (totalOrders >= 5) return { level: 'Thành viên', color: 'text-blue-600', bgColor: 'bg-blue-100' };
        return { level: 'Khách hàng', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    };

    const getBarChartData = () => {
        // Group by date (yyyy-mm-dd) and sum total for completed payments only
        const dateMap = {};
        const completedOrders = orderHistory.filter(order => order.paymentStatus === 'COMPLETED');
        console.log('Orders for bar chart:', completedOrders); // Debug log
        
        completedOrders.forEach(order => {
            const date = new Date(order.createdAt).toLocaleDateString('vi-VN');
            if (!dateMap[date]) dateMap[date] = 0;
            const orderTotal = parseFloat(order.total) || 0;
            dateMap[date] += orderTotal;
            console.log(`Date: ${date}, Order total: ${orderTotal}, Running total: ${dateMap[date]}`); // Debug log
        });
        
        const labels = Object.keys(dateMap);
        const data = Object.values(dateMap);
        console.log('Bar chart data:', { labels, data }); // Debug log
        
        return {
            labels,
            datasets: [
                {
                    label: 'Tổng chi tiêu (VNĐ)',
                    data,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                },
            ],
        };
    };

    const getPieChartData = () => {
        return {
            labels: ['Hoàn thành', 'Đang xử lý', 'Đang giao'],
            datasets: [
                {
                    data: [
                        customerStats.completedOrders,
                        customerStats.pendingOrders,
                        customerStats.shippingOrders
                    ],
                    backgroundColor: [
                        'rgba(34,197,94,0.7)', // green
                        'rgba(253,224,71,0.7)', // yellow
                        'rgba(249,115,22,0.7)' // orange
                    ],
                    borderColor: [
                        'rgba(34,197,94,1)',
                        'rgba(253,224,71,1)',
                        'rgba(249,115,22,1)'
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name in filter.exclude) {
            setFilter(prev => ({
                ...prev,
                exclude: { ...prev.exclude, [name]: checked }
            }));
        } else {
            setFilter(prev => ({ ...prev, [name]: value }));
        }
    };

    const filteredOrderHistory = orderHistory.filter(order => {
        // Lọc theo ngày
        let passDate = true;
        if (filter.from) {
            passDate = passDate && new Date(order.createdAt) >= new Date(filter.from);
        }
        if (filter.to) {
            passDate = passDate && new Date(order.createdAt) <= new Date(filter.to);
        }
        // Lọc loại trừ trạng thái
        let passStatus = true;
        if (filter.exclude.COMPLETED && order.status === 'COMPLETED') passStatus = false;
        if (filter.exclude.CANCELLED && order.status === 'CANCELLED') passStatus = false;
        if (filter.exclude.PENDING && order.status === 'PENDING') passStatus = false;
        return passDate && passStatus;
    });

    const renderDashboard = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Thống Kê Khách Hàng</h2>
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 flex flex-col items-center">
                    <h4 className="text-lg font-semibold mb-2">Tổng chi tiêu theo thời gian</h4>
                    <Bar data={getBarChartData()} options={{
                        responsive: true,
                        plugins: {
                            legend: { display: false },
                            title: { display: false },
                        },
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }} height={220} />
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 flex flex-col items-center">
                    <h4 className="text-lg font-semibold mb-2">Tỉ lệ trạng thái đơn hàng</h4>
                    <Pie data={getPieChartData()} options={{
                        responsive: true,
                        plugins: {
                            legend: { position: 'bottom' },
                            title: { display: false },
                        },
                    }} height={220} />
                </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Tổng đơn hàng</p>
                            <p className="text-3xl font-bold text-blue-600">{customerStats.totalOrders}</p>
                        </div>
                        <Package className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Đơn hoàn thành</p>
                            <p className="text-3xl font-bold text-green-600">{customerStats.completedOrders}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Đơn đang xử lý</p>
                            <p className="text-3xl font-bold text-yellow-600">{customerStats.pendingOrders}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Đơn đang giao</p>
                            <p className="text-3xl font-bold text-orange-600">{customerStats.shippingOrders}</p>
                        </div>
                        <Truck className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Tổng chi tiêu</p>
                            <p className="text-3xl font-bold text-purple-600">{customerStats.totalSpent.toLocaleString()} VNĐ</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Đánh giá trung bình</p>
                            <p className="text-3xl font-bold text-orange-600">{customerStats.averageRating.toFixed(1)} ⭐</p>
                        </div>
                        <Star className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Thông Tin Cá Nhân</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm text-gray-600">Họ và tên</p>
                            <p className="font-medium">{userInfo.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{userInfo.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm text-gray-600">Số điện thoại</p>
                            <p className="font-medium">{userInfo.phone}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm text-gray-600">Địa chỉ</p>
                            <p className="font-medium">{userInfo.address}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderOrderHistory = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Lịch Sử Đơn Hàng</h2>
            {/* Bộ lọc */}
            <div className="flex flex-wrap gap-4 items-end mb-4 bg-white p-4 rounded-lg shadow border border-gray-200">
                <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Từ ngày</label>
                    <input type="date" name="from" value={filter.from} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Đến ngày</label>
                    <input type="date" name="to" value={filter.to} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div className="flex items-center gap-3 ml-4">
                    <label className="flex items-center gap-1">
                        <input type="checkbox" name="COMPLETED" checked={filter.exclude.COMPLETED} onChange={handleFilterChange} className="accent-red-500" />
                        Loại trừ Đặt
                    </label>
                    <label className="flex items-center gap-1">
                        <input type="checkbox" name="CANCELLED" checked={filter.exclude.CANCELLED} onChange={handleFilterChange} className="accent-red-500" />
                        Loại trừ Hủy
                    </label>
                    <label className="flex items-center gap-1">
                        <input type="checkbox" name="PENDING" checked={filter.exclude.PENDING} onChange={handleFilterChange} className="accent-red-500" />
                        Loại trừ Chờ giao hàng
                    </label>
                </div>
            </div>
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                </div>
            ) : filteredOrderHistory.length > 0 ? (
                [...filteredOrderHistory].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((order) => {
                    // Tính toán thời gian còn lại để xóa
                    const createdAt = new Date(order.createdAt).getTime();
                    const now = Date.now();
                    const msLeft = 24 * 60 * 60 * 1000 - (now - createdAt);
                    const canDelete = msLeft > 0;

                    // Hiển thị đếm ngược
                    let countdown = '';
                    if (canDelete) {
                        const hours = Math.floor(msLeft / (1000 * 60 * 60));
                        const minutes = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
                        countdown = `Còn ${hours}h ${minutes}m để xóa`;
                    }

                    return (
                        <div key={order.bookingId} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Đơn hàng #{order.bookingId}</h3>
                                    <p className="text-gray-600">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </span>
                                    <span className="text-lg font-bold text-blue-600">{parseFloat(order.total || 0).toLocaleString()} VNĐ</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-start space-x-2">
                                    <MapPin className="w-5 h-5 text-green-600 mt-1" />
                                    <div>
                                        <p className="font-medium text-gray-700">Điểm nhận:</p>
                                        <p className="text-gray-600">{order.pickupLocation}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <MapPin className="w-5 h-5 text-red-600 mt-1" />
                                    <div>
                                        <p className="font-medium text-gray-700">Điểm đến:</p>
                                        <p className="text-gray-600">{order.deliveryLocation}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t pt-4">
                                <p className="text-gray-700 mb-4"><strong>Nội dung:</strong> {order.note}</p>
                                <div className="flex justify-between items-center">
                                    <div className="flex space-x-2">
                                        {order.status === 'COMPLETED' && !order.rating && (
                                            <button
                                                onClick={() => submitFeedback(order.bookingId)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center space-x-2"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                <span>Đánh giá</span>
                                            </button>
                                        )}
                                        {order.rating && (
                                            <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 rounded-lg">
                                                <Star className="w-4 h-4 text-yellow-600" />
                                                <span className="text-yellow-800">{order.rating}/5 sao</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex space-x-2 items-center">
                                        {order.status === 'PENDING' && (
                                            <button
                                                onClick={() => canDelete && deleteBooking(order.bookingId)}
                                                className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center space-x-2 ${!canDelete ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                disabled={!canDelete}
                                                title={!canDelete ? 'Bạn chỉ có thể xóa đơn trong vòng 24h sau khi tạo.' : ''}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>Xóa</span>
                                            </button>
                                        )}
                                        {order.status === 'PENDING' && canDelete && (
                                            <span className="text-xs text-gray-500 ml-2">{countdown}</span>
                                        )}
                                        {order.status === 'PENDING' && !canDelete && (
                                            <span className="text-xs text-gray-400 ml-2">Hết hạn xóa</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Chưa có đơn hàng nào</p>
                </div>
            )}
        </div>
    );

    const renderEditPersonalInfo = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Chỉnh Sửa Thông Tin Cá Nhân</h2>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <form className="space-y-6" onSubmit={handleProfileUpdate}>
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            {editFormData.img ? (
                                <img src={editFormData.img} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-white" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">{userInfo.name}</h3>

                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Họ và Tên</label>
                            <input
                                type="text"
                                name="fullName"
                                value={editFormData.fullName}
                                onChange={handleFormChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Ảnh đại diện (URL)</label>
                            <input
                                type="text"
                                name="img"
                                value={editFormData.img}
                                onChange={handleFormChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://example.com/avatar.jpg"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Số Điện Thoại</label>
                            <input
                                type="tel"
                                name="phone"
                                value={editFormData.phone}
                                onChange={handleFormChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Địa Chỉ</label>
                            <input
                                type="text"
                                name="address"
                                value={editFormData.address}
                                onChange={handleFormChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => setActiveTab('dashboard')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                        >
                            Lưu Thay Đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderComplaints = () => (
        <BookingHistory />
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
            `}</style>
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <Link to="/c_homepage">
                            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                                <span>Quay lại</span>
                            </button>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <Truck className="w-6 h-6 text-blue-600" />
                            <h1 className="text-xl font-bold text-gray-800">Thông Tin Khách Hàng</h1>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <NotificationBell />
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Đăng Xuất</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar - 1/5 of screen */}
                <div className="w-1/5 min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 shadow-lg">
                    <div className="p-6">
                        {/* User Info */}
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                {userInfo.avatar ? (
                                    <img src={userInfo.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-white" />
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">{userInfo.name}</h3>
                            <div className="flex justify-center">
                                {(() => {
                                    const customerLevel = getCustomerLevel(customerStats.totalOrders);
                                    return (
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${customerLevel.bgColor} ${customerLevel.color}`}>
                                            {customerLevel.level}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                                    activeTab === 'dashboard'
                                        ? 'bg-yellow-100 text-yellow-700 border-l-4 border-yellow-400 font-semibold'
                                        : 'text-white hover:bg-white/10'
                                }`}
                            >
                                <BarChart3 className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-yellow-500' : 'text-white'}`} />
                                <span>Thống kê</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                                    activeTab === 'history'
                                        ? 'bg-yellow-100 text-yellow-700 border-l-4 border-yellow-400 font-semibold'
                                        : 'text-white hover:bg-white/10'
                                }`}
                            >
                                <History className={`w-5 h-5 ${activeTab === 'history' ? 'text-yellow-500' : 'text-white'}`} />
                                <span>Lịch sử đơn hàng</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('edit')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                                    activeTab === 'edit'
                                        ? 'bg-yellow-100 text-yellow-700 border-l-4 border-yellow-400 font-semibold'
                                        : 'text-white hover:bg-white/10'
                                }`}
                            >
                                <Edit className={`w-5 h-5 ${activeTab === 'edit' ? 'text-yellow-500' : 'text-white'}`} />
                                <span>Chỉnh sửa thông tin</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('complaints')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                                    activeTab === 'complaints'
                                        ? 'bg-yellow-100 text-yellow-700 border-l-4 border-yellow-400 font-semibold'
                                        : 'text-white hover:bg-white/10'
                                }`}
                            >
                                <MessageSquare className={`w-5 h-5 ${activeTab === 'complaints' ? 'text-yellow-500' : 'text-white'}`} />
                                <span>Khiếu nại</span>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content - 4/5 of screen */}
                <div className="w-4/5 p-8">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'history' && renderOrderHistory()}
                    {activeTab === 'edit' && renderEditPersonalInfo()}
                    {activeTab === 'complaints' && renderComplaints()}
                </div>
            </div>
        </div>
    );
};

// FeedbackModal cho khiếu nại
const FeedbackModal = ({ isOpen, onClose, booking, onSubmit }) => {
    const [feedbackData, setFeedbackData] = useState({
        content: '',
        type: null
    });
    const [loading, setLoading] = useState(false);

    const feedbackTypes = [
        { value: 'TRANSPORTATION', label: 'Vận chuyển', icon: Truck },
        { value: 'STORAGE', label: 'Kho', icon: Package },
        { value: 'STAFF', label: 'Nhân viên hỗ trợ', icon: MessageSquare }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!feedbackData.content.trim() || !feedbackData.type) {
            alert('Vui lòng điền đầy đủ thông tin khiếu nại và chọn loại khiếu nại.');
            return;
        }
        setLoading(true);
        try {
            await onSubmit({
                bookingId: booking.bookingId,
                content: feedbackData.content,
                type: feedbackData.type
            });
            setFeedbackData({ content: '', type: null });
            onClose();
        } catch (error) {
            alert('Có lỗi xảy ra khi gửi khiếu nại: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !booking) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Tạo khiếu nại</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-gray-800 mb-2">Thông tin đơn hàng #{booking.bookingId}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Từ:</strong> {booking.pickupLocation}</p>
                            <p><strong>Đến:</strong> {booking.deliveryLocation}</p>
                            <p><strong>Ngày:</strong> {new Date(booking.deliveryDate).toLocaleDateString('vi-VN')}</p>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-3">
                                Loại khiếu nại <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                                {feedbackTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <label
                                            key={type.value}
                                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                                                feedbackData.type === type.value
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="type"
                                                value={type.value}
                                                checked={feedbackData.type === type.value}
                                                onChange={(e) => setFeedbackData(prev => ({ ...prev, type: e.target.value }))}
                                                className="sr-only"
                                            />
                                            <Icon className={`w-5 h-5 mr-3 ${
                                                feedbackData.type === type.value ? 'text-blue-500' : 'text-gray-400'
                                            }`} />
                                            <span className={`font-medium ${
                                                feedbackData.type === type.value ? 'text-blue-700' : 'text-gray-700'
                                            }`}>
                                                {type.label}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Thông tin khiếu nại <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={feedbackData.content}
                                onChange={(e) => setFeedbackData(prev => ({ ...prev, content: e.target.value }))}
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                                required
                            ></textarea>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold transition-all ${
                                    loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'
                                }`}
                            >
                                {loading ? 'Đang gửi...' : 'Gửi khiếu nại'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// BookingHistory cho khiếu nại
const BookingHistory = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbacks, setFeedbacks] = useState({});

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
            const response = await apiCall('/api/customer/bookings', { headers });
            if (response.ok) {
                const data = await response.json();
                setBookings(data);
                const feedbackPromises = data.map(booking => 
                    apiCall(`/api/customer/feedback/booking/${booking.bookingId}`, { headers })
                        .then(res => res.ok ? res.json() : [])
                        .catch(() => [])
                );
                const feedbackResults = await Promise.all(feedbackPromises);
                const feedbackMap = {};
                data.forEach((booking, index) => {
                    feedbackMap[booking.bookingId] = feedbackResults[index];
                });
                setFeedbacks(feedbackMap);
            }
        } catch (error) {
            console.error("Lỗi khi tải lịch sử đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFeedback = async (feedbackData) => {
        try {
            const headers = { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            };
            const response = await apiCall('api/customer/feedback', {
                method: 'POST',
                headers,
                body: JSON.stringify(feedbackData)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Gửi khiếu nại thất bại');
            }
            alert('Gửi khiếu nại thành công!');
            fetchBookings();
        } catch (error) {
            throw error;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
            case 'IN_PROGRESS': return 'bg-orange-100 text-orange-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getTypeLabel = (type) => {
        switch (type) {
            case 'TRANSPORTATION': return 'Vận chuyển';
            case 'STORAGE': return 'Kho';
            case 'STAFF': return 'Nhân viên hỗ trợ';
            default: return type;
        }
    };

    return (
        <section className="py-8">
            <div className="container mx-auto px-0">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                        Khiếu nại đơn hàng
                    </h2>
                    <p className="text-lg text-gray-600">
                        Xem lại các đơn hàng đã đặt và tạo khiếu nại nếu cần
                    </p>
                </div>
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có đơn hàng nào</h3>
                        <p className="text-gray-600">Bạn chưa có đơn hàng nào trong hệ thống.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 max-w-4xl mx-auto">
                        {[...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((booking) => {
                            const bookingFeedbacks = feedbacks[booking.bookingId] || [];
                            const hasFeedback = bookingFeedbacks.length > 0;
                            return (
                                <div key={booking.bookingId} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold mb-2">
                                                    Đơn hàng #{booking.bookingId}
                                                </h3>
                                                <p className="text-blue-100">
                                                    {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                                {hasFeedback && (
                                                    <div className="mt-2">
                                                        <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                                            Đã có khiếu nại
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-3">Thông tin vận chuyển</h4>
                                                <div className="space-y-2 text-sm text-gray-600">
                                                    <p><strong>Từ:</strong> {booking.pickupLocation}</p>
                                                    <p><strong>Đến:</strong> {booking.deliveryLocation}</p>
                                                    <p><strong>Ngày giao:</strong> {new Date(booking.deliveryDate).toLocaleDateString('vi-VN')}</p>
                                                    <p><strong>Phương tiện:</strong> {booking.transportName}</p>
                                                    <p><strong>Nhân viên:</strong> {booking.operatorName}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-3">Thông tin bổ sung</h4>
                                                <div className="space-y-2 text-sm text-gray-600">
                                                    <p><strong>Kho:</strong> {booking.storageName || 'Không thuê kho'}</p>
                                                    <p><strong>Tổng tiền:</strong> {booking.total?.toLocaleString('vi-VN')} VNĐ</p>
                                                    <p><strong>Ghi chú:</strong> {booking.note || 'Không có'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {hasFeedback && (
                                            <div className="mb-6">
                                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                                    <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                                                    Khiếu nại đã gửi
                                                </h4>
                                                <div className="space-y-3">
                                                    {bookingFeedbacks.map((feedback) => (
                                                        <div key={feedback.feedbackId} className="bg-gray-50 rounded-lg p-4">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                                                    feedback.type === 'TRANSPORTATION' ? 'bg-blue-100 text-blue-800' :
                                                                    feedback.type === 'STORAGE' ? 'bg-green-100 text-green-800' :
                                                                    'bg-purple-100 text-purple-800'
                                                                }`}>
                                                                    {getTypeLabel(feedback.type)}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {new Date(feedback.createdAt).toLocaleDateString('vi-VN')}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-700">{feedback.content}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="text-center">
                                            {!hasFeedback ? (
                                                <button
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setShowFeedbackModal(true);
                                                    }}
                                                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center mx-auto"
                                                >
                                                    <AlertCircle className="w-5 h-5 mr-2" />
                                                    Tạo khiếu nại
                                                </button>
                                            ) : (
                                                <div className="text-green-600 font-semibold">
                                                    ✓ Đã gửi khiếu nại cho đơn hàng này
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => {
                    setShowFeedbackModal(false);
                    setSelectedBooking(null);
                }}
                booking={selectedBooking}
                onSubmit={handleCreateFeedback}
            />
        </section>
    );
};

export default C_CustomerInfo;
