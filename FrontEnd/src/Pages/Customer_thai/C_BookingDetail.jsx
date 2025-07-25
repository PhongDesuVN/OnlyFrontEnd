import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
    ArrowLeft, 
    Package, 
    MapPin, 
    Calendar, 
    DollarSign, 
    Truck, 
    User, 
    Phone, 
    Mail, 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    Star,
    Home,
    Box,
    Car,
    FileText,
    Warehouse,
    Gift,
    Building,
    Hash
} from 'lucide-react';
import { apiCall } from '../../utils/api';
import FeedbackModal from './FeedbackModal.jsx';
import RequireAuth from '../../Components/RequireAuth';
const C_BookingDetail = ({ booking: bookingProp }) => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [booking, setBooking] = useState(bookingProp || null);
    const [customerInfo, setCustomerInfo] = useState(null);
    const [loading, setLoading] = useState(!bookingProp);
    const [error, setError] = useState(null);
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        if (!booking && bookingId) {
            fetchBookingDetail(); // Gọi API để lấy thông tin đơn hàng
        } else {
            setLoading(false);
        }
        fetchCustomerInfo();
        fetchCustomerFeedbacks();
    }, [bookingId]);

    const fetchBookingDetail = async () => {
        try {
            setLoading(true);
            const response = await apiCall(`/api/customer/bookings/${bookingId}`, { auth: true });
            
            if (response.ok) {
                const bookingData = await response.json();
                setBooking(bookingData);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Không thể tải thông tin đơn hàng');
            }
        } catch (error) {
            console.error('Error fetching booking detail:', error);
            setError('Có lỗi xảy ra khi tải thông tin đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerInfo = async () => {
        try {
            const response = await apiCall('/api/customer/profile', { auth: true });
            if (response.ok) {
                const customerData = await response.json();
                setCustomerInfo(customerData);
            }
        } catch (error) {
            console.error('Error fetching customer info:', error);
        }
    };

    const deleteBooking = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
            return;
        }

        try {
            const response = await apiCall(`/api/customer/bookings/${bookingId}/cancel`, { method: 'PATCH', auth: true });

            if (response.ok) {
                alert('Hủy đơn hàng thành công!');
                navigate('/c_dashboard');
            } else {
                const errorData = await response.json();
                alert(`Lỗi: ${errorData.message || 'Không thể hủy đơn hàng'}`);
            }
        } catch (error) {
            console.error('Error deleting booking:', error);
            alert('Có lỗi xảy ra khi hủy đơn hàng');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'SHIPPING': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPaymentStatusText = (status) => {
        switch (status) {
            case 'COMPLETED': return 'Đã thanh toán';
            case 'PENDING': return 'Chờ thanh toán';
            case 'FAILED': return 'Thanh toán thất bại';
            default: return status;
        }
    };

    const getHomeTypeText = (homeType) => {
        switch (homeType) {
            case 'APARTMENT': return 'Căn hộ';
            case 'HOUSE': return 'Nhà riêng';
            case 'VILLA': return 'Biệt thự';
            case 'OFFICE': return 'Văn phòng';
            default: return homeType;
        }
    };

    const getRoomText = (room) => {
        switch (room) {
            case 'LIVING_ROOM': return 'Phòng khách';
            case 'BEDROOM': return 'Phòng ngủ';
            case 'KITCHEN': return 'Nhà bếp';
            case 'BATHROOM': return 'Nhà tắm';
            case 'DINING_ROOM': return 'Phòng ăn';
            case 'STUDY': return 'Phòng học';
            case 'GARAGE': return 'Nhà để xe';
            default: return room;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return parseFloat(amount).toLocaleString('vi-VN') + '₫';
    };

    const openFeedbackModal = () => {
        setFeedbackModalOpen(true);
    };

    const closeFeedbackModal = () => {
        setFeedbackModalOpen(false);
    };

    // Gọi API lấy feedback của customer
    const fetchCustomerFeedbacks = async () => {
        try {
            const response = await apiCall('/api/customer/feedback/myfeedbacks', { auth: true });
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Feedback data:', data);
            console.log('Is data an array?', Array.isArray(data));
            setFeedbacks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            setFeedbacks([]);
        }
    };

    // Log state feedbacks ngay trước return
    console.log('Render feedbacks:', feedbacks, Array.isArray(feedbacks), feedbacks.length);

    const handleBack = () => {
        if (location.state?.fromOrderHistory) {
            navigate('/c_dashboard', { state: { activeTab: 'orderHistory' } });
        } else {
            navigate(-1);
        }
    };

    if (loading) {
        return (
            <RequireAuth allowedRoles={["CUSTOMER"]}>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
                    </div>
                </div>
            </RequireAuth>
        );
    }

    if (error) {
        return (
            <RequireAuth allowedRoles={["CUSTOMER"]}>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Lỗi</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/c_dashboard')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Quay lại Dashboard
                        </button>
                    </div>
                </div>
            </RequireAuth>
        );
    }

    if (!booking) {
        return (
            <RequireAuth allowedRoles={["CUSTOMER"]}>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy đơn hàng</h2>
                        <p className="text-gray-600 mb-4">Đơn hàng với ID {bookingId} không tồn tại</p>
                        <button
                            onClick={() => navigate('/c_dashboard')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Quay lại Dashboard
                        </button>
                    </div>
                </div>
            </RequireAuth>
        );
    }

    return (
        <RequireAuth allowedRoles={["CUSTOMER"]}>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleBack}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng #{booking.bookingId}</h1>
                                    <p className="text-sm text-gray-600">Thông tin chi tiết về đơn hàng của bạn</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                                    {getStatusText(booking.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Summary */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Package className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">Thông tin đơn hàng</h2>
                                        <p className="text-sm text-gray-600">Mã đơn hàng: #{booking.bookingId}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Ngày tạo</p>
                                                <p className="font-medium text-gray-800">{formatDate(booking.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Clock className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Ngày vận chuyển</p>
                                                <p className="font-medium text-gray-800">{formatDate(booking.deliveryDate)}</p>
                                            </div>
                                        </div>
                                        {booking.rating && (
                                            <div className="flex items-center space-x-3">
                                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Đánh giá</p>
                                                    <p className="font-medium text-gray-800">{booking.rating}/5 sao</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <DollarSign className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Tổng tiền</p>
                                                <p className="text-xl font-bold text-green-600">{formatCurrency(booking.total)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Trạng thái thanh toán</p>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                                    {getPaymentStatusText(booking.paymentStatus)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Storage and Transport Info */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6">Thông tin kho và vận chuyển</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <Warehouse className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Kho</p>
                                                <p className="font-medium text-gray-800">{booking.storageName || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Hash className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Slot kho</p>
                                                <p className="font-medium text-gray-800">Slot #{booking.newSlot || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Building className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Loại phòng</p>
                                                <p className="font-medium text-gray-800">{getHomeTypeText(booking.homeType)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <Truck className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Đơn vị vận chuyển</p>
                                                <p className="font-medium text-gray-800">{booking.transportName || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Car className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-600">Số lượng xe</p>
                                                <p className="font-medium text-gray-800">{booking.newVehicle || 0} xe</p>
                                            </div>
                                        </div>
                                        {booking.operatorName && (
                                            <div className="flex items-center space-x-3">
                                                <User className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Nhân viên phụ trách</p>
                                                    <p className="font-medium text-gray-800">{booking.operatorName}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Promotion Info */}
                            {booking.promotionName && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Khuyến mãi</h3>
                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                                <Gift className="w-6 h-6" />
                                            </div>
                                            <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">
                                                Khuyến mãi
                                            </span>
                                        </div>
                                        
                                        <h4 className="text-lg font-bold mb-2">{booking.promotionName}</h4>
                                        <p className="text-sm opacity-90 mb-4">{booking.promotionDescription}</p>
                                        
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Mã: {booking.promotionId}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Addresses */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6">Địa chỉ</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                                                <MapPin className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-2">Địa chỉ lấy hàng</h4>
                                                <p className="text-gray-700">{booking.pickupLocation}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mt-1">
                                                <Home className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800 mb-2">Địa chỉ giao hàng</h4>
                                                <p className="text-gray-700">{booking.deliveryLocation}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            {booking.items && booking.items.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Danh sách đồ đạc</h3>
                                    <div className="space-y-4">
                                        {booking.items.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <Box className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{item.name}</p>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                            <span>Số lượng: {item.quantity}</span>
                                                            <span>Phòng: {getRoomText(item.room)}</span>
                                                            {item.modular && <span className="text-blue-600">Modular</span>}
                                                            {item.bulky && <span className="text-orange-600">Cồng kềnh</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-800">{formatCurrency(item.price || 0)}</p>
                                                    <div className="text-sm text-gray-600">
                                                        <p>Thể tích: {item.volume} m³</p>
                                                        <p>Cân nặng: {item.weight} kg</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Note */}
                            {booking.note && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Ghi chú</h3>
                                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{booking.note}</p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Customer Info */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6">Thông tin khách hàng</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <User className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Họ tên</p>
                                            <p className="font-medium text-gray-800">{customerInfo?.fullName || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Số điện thoại</p>
                                            <p className="font-medium text-gray-800">{customerInfo?.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-medium text-gray-800">{customerInfo?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-600">Địa chỉ</p>
                                            <p className="font-medium text-gray-800">{customerInfo?.address || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Timeline */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6">Lịch trình đơn hàng</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                                            <CheckCircle className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">Đơn hàng được tạo</p>
                                            <p className="text-sm text-gray-600">{formatDate(booking.createdAt)}</p>
                                        </div>
                                    </div>
                                    {booking.status === 'PENDING' && (
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mt-1">
                                                <Clock className="w-4 h-4 text-yellow-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Đang chờ xử lý</p>
                                                <p className="text-sm text-gray-600">Chờ xác nhận từ hệ thống</p>
                                            </div>
                                        </div>
                                    )}
                                    {booking.status === 'SHIPPING' && (
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                                                <Truck className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Đang vận chuyển</p>
                                                <p className="text-sm text-gray-600">Đơn hàng đang được vận chuyển</p>
                                            </div>
                                        </div>
                                    )}
                                    {booking.status === 'COMPLETED' && (
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Hoàn thành</p>
                                                <p className="text-sm text-gray-600">Đơn hàng đã được giao thành công</p>
                                            </div>
                                        </div>
                                    )}
                                    {booking.status === 'CANCELLED' && (
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-1">
                                                <XCircle className="w-4 h-4 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Đã hủy</p>
                                                <p className="text-sm text-gray-600">Đơn hàng đã bị hủy</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6">Thao tác</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate('/c_dashboard')}
                                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Quay lại Dashboard
                                    </button>
                                    {booking.status === 'COMPLETED' && !booking.rating && (
                                        <button
                                            onClick={openFeedbackModal}
                                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Đánh giá dịch vụ
                                        </button>
                                    )}
                                    {booking.status === 'PENDING' && (
                                        <button
                                            onClick={deleteBooking}
                                            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Hủy đơn hàng
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {booking && (
                <FeedbackModal
                    isOpen={feedbackModalOpen}
                    onClose={closeFeedbackModal}
                    bookingId={booking.bookingId}
                    storageId={booking.storageId}
                    transportId={booking.transportId}
                />
            )}
        </RequireAuth>
    );
};

export default C_BookingDetail;
