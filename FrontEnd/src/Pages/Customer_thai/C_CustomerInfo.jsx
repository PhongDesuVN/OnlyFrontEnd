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
        cancelledOrders: 0,
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
            const response = await fetch('http://localhost:8083/api/customer/profile', {
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
            const profileResponse = await fetch('http://localhost:8083/api/customer/profile', {
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
            const bookingsResponse = await fetch('http://localhost:8083/api/customer/bookings', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (bookingsResponse.ok) {
                const bookingsData = await bookingsResponse.json();
                setOrderHistory(bookingsData);
                
                // Calculate statistics
                const stats = {
                    totalOrders: bookingsData.length,
                    completedOrders: bookingsData.filter(order => order.status === 'COMPLETED').length,
                    pendingOrders: bookingsData.filter(order => order.status === 'PENDING').length,
                    cancelledOrders: bookingsData.filter(order => order.status === 'CANCELLED').length,
                    totalSpent: bookingsData.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
                    averageRating: bookingsData.length > 0 ? 
                        bookingsData.reduce((sum, order) => sum + (order.rating || 0), 0) / bookingsData.length : 0
                };
                setCustomerStats(stats);
            }

            // Fetch complaints (if endpoint exists) - TẠM THỜI VÔ HIỆU HÓA VÌ ENDPOINT CHƯA TỒN TẠI
            // const complaintsResponse = await fetch('http://localhost:8083/api/customer/complaints', {
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
                const response = await fetch(`http://localhost:8083/api/customer/bookings/${bookingId}`, {
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
                const response = await fetch(`http://localhost:8083/api/customer/bookings/${bookingId}/feedback`, {
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
            case 'IN_PROGRESS': return 'Đang xử lý';
            default: return 'Không xác định';
        }
    };

    const renderDashboard = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Thống Kê Khách Hàng</h2>
            
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
                            <p className="text-gray-600 text-sm">Đơn đã hủy</p>
                            <p className="text-3xl font-bold text-red-600">{customerStats.cancelledOrders}</p>
                        </div>
                        <XCircle className="w-8 h-8 text-red-600" />
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
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                </div>
            ) : orderHistory.length > 0 ? (
                orderHistory.map((order) => {
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
                                    <span className="text-lg font-bold text-blue-600">{order.totalAmount?.toLocaleString()} VNĐ</span>
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
                            <p className="text-gray-600">Khách hàng</p>
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Khiếu Nại</h2>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Tạo Khiếu Nại Mới</span>
                </button>
            </div>

            <div className="space-y-4">
                {complaints.map((complaint) => (
                    <div key={complaint.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">{complaint.subject}</h3>
                                <p className="text-gray-600">{complaint.date}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                                {getStatusText(complaint.status)}
                            </span>
                        </div>
                        <p className="text-gray-700">{complaint.description}</p>
                    </div>
                ))}
            </div>

            {complaints.length === 0 && (
                <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Chưa có khiếu nại nào</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
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
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng Xuất</span>
                    </button>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar - 1/5 of screen */}
                <div className="w-1/5 bg-white shadow-lg min-h-screen">
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
                            <p className="text-gray-600 text-sm">Khách hàng</p>
                        </div>

                        {/* Navigation Tabs */}
                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                                    activeTab === 'dashboard' 
                                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <BarChart3 className="w-5 h-5" />
                                <span>Thống kê</span>
                            </button>
                            
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                                    activeTab === 'history' 
                                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <History className="w-5 h-5" />
                                <span>Lịch sử đơn hàng</span>
                            </button>
                            
                            <button
                                onClick={() => setActiveTab('edit')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                                    activeTab === 'edit' 
                                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <Edit className="w-5 h-5" />
                                <span>Chỉnh sửa thông tin</span>
                            </button>
                            
                            <button
                                onClick={() => setActiveTab('complaints')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                                    activeTab === 'complaints' 
                                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <MessageSquare className="w-5 h-5" />
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

export default C_CustomerInfo;
