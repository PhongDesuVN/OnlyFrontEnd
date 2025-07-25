import React, { useState } from 'react';
import { Star, X, Package, AlertCircle } from 'lucide-react';
import { apiCall } from '../../utils/api';
import Cookies from 'js-cookie';

const FeedbackModal = ({ isOpen, onClose, bookingId, storageId, transportId }) => {
    const [feedbackType, setFeedbackType] = useState('');
    const [content, setContent] = useState('');
    const [star, setStar] = useState(0);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Reset state khi đóng hoặc mở modal
    const resetForm = () => {
        setFeedbackType('');
        setContent('');
        setStar(0);
        setError('');
        setSubmitting(false);
    };

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

        // Chuẩn bị dữ liệu feedback
        let feedbackData = {
            bookingId: parseInt(bookingId),
            content: content.trim(),
        };
        if (star) feedbackData.star = star;
        let endpoint = '';
        if (feedbackType === 'STORAGE') {
            feedbackData.storageId = parseInt(storageId);
            endpoint = '/api/customer/feedback/storage';
        } else if (feedbackType === 'TRANSPORTATION') {
            feedbackData.transportId = parseInt(transportId);
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

                {/* Form đánh giá */}
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                            >
                                <option value="">Chọn loại đánh giá</option>
                                {storageId && <option value="STORAGE">Kho hàng</option>}
                                {transportId && <option value="TRANSPORTATION">Vận chuyển</option>}
                            </select>

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
                                <Star
                                    key={rating}
                                    className={`w-6 h-6 cursor-pointer ${star >= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                    onClick={() => handleStarClick(rating)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Thông báo lỗi */}
                    {error && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Nút gửi */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;