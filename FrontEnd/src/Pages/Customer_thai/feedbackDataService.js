import { apiCall } from '../../utils/api';

// Lấy tất cả storage + feedbacks
export async function getAllStorageWithFeedbacks() {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    const response = await apiCall('/api/customer/feedback/storage-units', { headers });
    if (!response.ok) throw new Error('Lỗi lấy danh sách kho');
    return await response.json();
}

// Lấy tất cả transport + feedbacks
export async function getAllTransportWithFeedbacks() {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    const response = await apiCall('/api/customer/feedback/transport-units', { headers });
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
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    const response = await apiCall(`/api/customer/feedback/${feedbackId}/like`, {
        method: 'PATCH',
        headers
    });
    if (!response.ok) throw new Error('Lỗi like feedback');
    return await response.json();
}

// Dislike feedback
export async function dislikeFeedback(feedbackId) {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    const response = await apiCall(`/api/customer/feedback/${feedbackId}/dislike`, {
        method: 'PATCH',
        headers
    });
    if (!response.ok) throw new Error('Lỗi dislike feedback');
    return await response.json();
} 