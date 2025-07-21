import { apiCall } from '../../utils/api';

// Kiểm tra trạng thái của booking có phải là COMPLETED không
export const checkBookingCompleted = async (bookingId) => {
    try {
        const response = await apiCall(`/api/customer/bookings/${bookingId}`, { auth: true });
        
        if (response.ok) {
            const bookingData = await response.json();
            return bookingData.status === 'COMPLETED';
        } else {
            console.error('Error checking booking status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Error checking booking status:', error);
        return false;
    }
};

// Gửi feedback cho kho hàng
export const submitStorageFeedback = async (bookingId, content, star, storageId) => {
    try {
        // Kiểm tra dữ liệu đầu vào
        if (!bookingId || !content || !star || !storageId) {
            console.error('Missing required fields for storage feedback:', {
                bookingId,
                content,
                star,
                storageId
            });
            return { success: false, message: 'Thiếu thông tin cần thiết để gửi đánh giá kho hàng' };
        }

        const feedbackData = {
            bookingId: parseInt(bookingId),
            content: content,
            star: parseInt(star),
            storageId: parseInt(storageId)
        };

        console.log('Submitting storage feedback:', feedbackData); // Log dữ liệu gửi lên

        const response = await apiCall('/api/customer/feedback/storage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(feedbackData),
            auth: true
        });

        console.log('Response status:', response.status); // Log trạng thái response

        if (response.ok) {
            return { success: true, message: 'Đánh giá kho hàng thành công!' };
        } else {
            const errorData = await response.text(); // Sử dụng response.text() để tránh lỗi JSON
            console.error('Error response from server:', errorData || 'No error message provided');
            return {
                success: false,
                message: errorData || `Không thể gửi đánh giá kho hàng (Status: ${response.status})`
            };
        }
    } catch (error) {
        console.error('Error submitting storage feedback:', error);
        return { success: false, message: 'Có lỗi xảy ra khi gửi đánh giá kho hàng' };
    }
};

export const submitTransportFeedback = async (bookingId, content, star, transportId) => {
    try {
        // Kiểm tra dữ liệu đầu vào
        if (!bookingId || !content || !star || !transportId) {
            console.error('Missing required fields for transport feedback:', {
                bookingId,
                content,
                star,
                transportId
            });
            return { success: false, message: 'Thiếu thông tin cần thiết để gửi đánh giá vận chuyển' };
        }

        const feedbackData = {
            bookingId: parseInt(bookingId),
            content: content,
            star: parseInt(star),
            transportId: parseInt(transportId)
        };

        console.log('Submitting transport feedback:', feedbackData); // Log dữ liệu gửi lên

        const response = await apiCall('/api/customer/feedback/transport', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(feedbackData),
            auth: true
        });

        console.log('Response status:', response.status); // Log trạng thái response

        if (response.ok) {
            return { success: true, message: 'Đánh giá vận chuyển thành công!' };
        } else {
            const errorData = await response.text(); // Sử dụng response.text() để tránh lỗi JSON
            console.error('Error response from server:', errorData || 'No error message provided');
            return {
                success: false,
                message: errorData || `Không thể gửi đánh giá vận chuyển (Status: ${response.status})`
            };
        }
    } catch (error) {
        console.error('Error submitting transport feedback:', error);
        return { success: false, message: 'Có lỗi xảy ra khi gửi đánh giá vận chuyển' };
    }
};

// Lấy tất cả storage + feedbacks
export async function getAllStorageWithFeedbacks() {
    const response = await apiCall('/api/customer/feedback/storage-units', { auth: true });
    if (!response.ok) throw new Error('Lỗi lấy danh sách kho');
    return await response.json();
}

// Lấy tất cả transport + feedbacks
export async function getAllTransportWithFeedbacks() {
    const response = await apiCall('/api/customer/feedback/transport-units', { auth: true });
    if (!response.ok) throw new Error('Lỗi lấy danh sách vận chuyển');
    return await response.json();
}

// Lấy top 3 storage theo averageStar
export async function getTopStorages() {
    const allStorages = await getAllStorageWithFeedbacks();
    return [...allStorages].sort((a, b) => b.averageStar - a.averageStar).slice(0, 3);
}

// Lấy top 3 transport theo averageStar
export async function getTopTransports() {
    const allTransports = await getAllTransportWithFeedbacks();
    return [...allTransports].sort((a, b) => b.averageStar - a.averageStar).slice(0, 3);
}

// Lấy tất cả tên storage + tổng feedback + star trung bình
export async function getStorageSummaryList() {
    const allStorages = await getAllStorageWithFeedbacks();
    return allStorages.map(s => ({
        storageId: s.storageId,
        name: s.name,
        totalFeedbacks: s.totalFeedbacks,
        averageStar: s.averageStar
    }));
}

// Lấy tất cả tên transport + tổng feedback + star trung bình
export async function getTransportSummaryList() {
    const allTransports = await getAllTransportWithFeedbacks();
    return allTransports.map(t => ({
        transportId: t.transportId,
        nameCompany: t.nameCompany,
        totalFeedbacks: t.totalFeedbacks,
        averageStar: t.averageStar
    }));
}

// Lấy tất cả feedback của 1 storage (bao gồm full_name và img customer)
export async function getFeedbacksByStorageId(storageId) {
    const allStorages = await getAllStorageWithFeedbacks();
    const storage = allStorages.find(s => s.storageId === storageId);
    return storage ? storage.feedbacks : [];
}

// Lấy tất cả feedback của 1 transport (bao gồm full_name và img customer)
export async function getFeedbacksByTransportId(transportId) {
    const allTransports = await getAllTransportWithFeedbacks();
    const transport = allTransports.find(t => t.transportId === transportId);
    return transport ? transport.feedbacks : [];
}

// Like feedback
export async function likeFeedback(feedbackId) {
    const response = await apiCall(`/api/customer/feedback/${feedbackId}/like`, { auth: true });
    if (!response.ok) throw new Error('Lỗi like feedback');
    return await response.json();
}

// Dislike feedback
export async function dislikeFeedback(feedbackId) {
    const response = await apiCall(`/api/customer/feedback/${feedbackId}/dislike`, { auth: true });
    if (!response.ok) throw new Error('Lỗi dislike feedback');
    return await response.json();
} 

// Lấy tất cả booking của customer đang đăng nhập
export async function getAllBookingsOfCustomer() {
    const response = await apiCall('/api/customer/bookings/customer', { auth: true });
    if (!response.ok) throw new Error('Lỗi lấy danh sách booking của customer');
    return await response.json();
} 