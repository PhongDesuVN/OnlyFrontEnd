import React, { useState, useEffect } from 'react';
import { Star, X, Package, AlertCircle } from 'lucide-react';
import { apiCall } from '../../utils/api';
import Cookies from 'js-cookie';

const FeedbackModal = ({ isOpen, onClose, bookingId, storageId, transportId }) => {
    const [feedbackType, setFeedbackType] = useState('');
    const [content, setContent] = useState('');
    const [star, setStar] = useState(0);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [existingFeedbacks, setExistingFeedbacks] = useState([]);
    const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

    // Reset state khi đóng hoặc mở modal
    const resetForm = () => {
        setFeedbackType('');
        setContent('');
        setStar(0);
        setError('');
        setSubmitting(false);
    };

    // Fetch existing feedbacks when modal opens
    useEffect(() => {
        if (isOpen && bookingId) {
            fetchExistingFeedbacks();
        }
    }, [isOpen, bookingId]);
    
    // Function to fetch existing feedbacks
    const fetchExistingFeedbacks = async () => {
        setLoadingFeedbacks(true);
        try {
            const response = await apiCall('/api/customer/feedback/myfeedbacks', { auth: true });
            if (response.ok) {
                const data = await response.json();
                setExistingFeedbacks(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
        } finally {
            setLoadingFeedbacks(false);
        }
    };
    
    // Check if customer already submitted feedback for this booking by type
    const hasStorageFeedback = existingFeedbacks.some(
        feedback => feedback.bookingId === parseInt(bookingId) && feedback.type === 'STORAGE'
    );
    
    const hasTransportFeedback = existingFeedbacks.some(
        feedback => feedback.bookingId === parseInt(bookingId) && 
        (feedback.type === 'TRANSPORT' || feedback.type === 'TRANSPORTATION')
    );
    
    // Check if there are any available feedback options
    const hasFeedbackOptions = (storageId && !hasStorageFeedback) || (transportId && !hasTransportFeedback);

    // Xử lý khi đóng modal
    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Xử lý chọn số sao
    const handleStarClick = (rating) => {
        setStar(rating);
    };

    // Xử lý gửi feedback
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        // Kiểm tra token
        const token = Cookies.get('authToken') || localStorage.getItem('authToken');
        console.log('🔑 Token from Cookies:', Cookies.get('authToken'));
        console.log('🔑 Token from localStorage:', localStorage.getItem('authToken'));
        console.log('🔑 Final token used:', token);
        if (!token) {
            setError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            setSubmitting(false);
            return;
        }

        // Kiểm tra các trường bắt buộc
        if (!feedbackType) {
            setError('Vui lòng chọn loại đánh giá (Kho hàng hoặc Vận chuyển)');
            setSubmitting(false);
            return;
        }
        if (!bookingId) {
            setError('Không tìm thấy mã đơn hàng');
            setSubmitting(false);
            return;
        }
        if (!content.trim()) {
            setError('Vui lòng nhập nội dung đánh giá');
            setSubmitting(false);
            return;
        }
        if (star === 0) {
            setError('Vui lòng chọn số sao đánh giá');
            setSubmitting(false);
            return;
        }
        if (feedbackType === 'STORAGE' && !storageId) {
            setError('Không tìm thấy mã kho hàng');
            setSubmitting(false);
            return;
        }
        if (feedbackType === 'TRANSPORTATION' && !transportId) {
            setError('Không tìm thấy mã vận chuyển');
            setSubmitting(false);
            return;
        }

        // Kiểm tra feedback đã tồn tại
        if (feedbackType === 'STORAGE' && hasStorageFeedback) {
            setError('Bạn đã đánh giá kho hàng cho đơn hàng này rồi');
            setSubmitting(false);
            return;
        }
        if (feedbackType === 'TRANSPORTATION' && hasTransportFeedback) {
            setError('Bạn đã đánh giá vận chuyển cho đơn hàng này rồi');
            setSubmitting(false);
            return;
        }

        // Chuẩn bị dữ liệu feedback
        let feedbackData = {
            bookingId: parseInt(bookingId),
            content: content.trim(),
        };
        if (star) feedbackData.star = star;
        let endpoint = '';
        if (feedbackType === 'STORAGE') {
            feedbackData.storageId = parseInt(storageId);
            feedbackData.isStorage = true;
            endpoint = '/api/customer/feedback/storage';
        } else if (feedbackType === 'TRANSPORTATION') {
            feedbackData.transportId = parseInt(transportId);
            feedbackData.isTransport = true;
            endpoint = '/api/customer/feedback/transport';
        }

        try {
            console.log('Submitting feedback:', feedbackData);
            const response = await apiCall(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(feedbackData),
                auth: true
            });

            if (response.ok) {
                alert('Gửi đánh giá thành công!');
                handleClose();
            } else {
                const errorData = await response.text();
                setError(errorData || `Không thể gửi đánh giá (Status: ${response.status})`);
            }
        } catch (error) {
            setError('Có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
                {/* Nút đóng */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                {/* Tiêu đề */}
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Gửi đánh giá</h2>
                        <p className="text-sm text-gray-600">Đánh giá đơn hàng #{bookingId}</p>
                    </div>
                </div>

                {loadingFeedbacks ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
                    </div>
                ) : !hasFeedbackOptions ? (
                    <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Đã đánh giá đầy đủ</h3>
                        <p className="text-gray-600">
                            Bạn đã đánh giá tất cả các dịch vụ cho đơn hàng này.
                        </p>
                        <button
                            onClick={handleClose}
                            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Đóng
                        </button>
                    </div>
                ) : (
                    /* Form đánh giá */
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Dropdown chọn loại đánh giá */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loại đánh giá
                            </label>
                            <div className="relative">
                                <select
                                    value={feedbackType}
                                    onChange={(e) => setFeedbackType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 appearance-none"
                                >
                                    <option value="">Chọn loại đánh giá</option>
                                    {storageId && !hasStorageFeedback && (
                                        <option value="STORAGE">Kho hàng</option>
                                    )}
                                    {transportId && !hasTransportFeedback && (
                                        <option value="TRANSPORTATION">Vận chuyển</option>
                                    )}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                        </div>

                        {/* Nội dung đánh giá */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nội dung đánh giá
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Nhập nội dung đánh giá của bạn"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 resize-none"
                                rows="4"
                            />
                        </div>

                        {/* Đánh giá sao */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Đánh giá sao
                            </label>
                            <div className="flex items-center space-x-2">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        type="button"
                                        onClick={() => handleStarClick(rating)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            className={`w-8 h-8 ${star >= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                } transition-colors`}
                                        />
                                    </button>
                                ))}
                                <span className="text-sm text-gray-600 ml-2">
                                    {star > 0 ? `${star}/5` : "Chọn số sao"}
                                </span>
                            </div>
                        </div>

                        {/* Hiển thị lỗi */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Nút gửi */}
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${submitting ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;