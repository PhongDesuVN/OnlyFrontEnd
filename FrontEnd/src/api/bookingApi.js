import axiosInstance from '../utils/axiosInstance';

const API_BASE = '/api/bookings';

// Lấy thông tin slots của một storage unit
export const getSlotsInfo = (storageId) => {
  return axiosInstance.get(`/api/bookings/storage/${storageId}/slots`);
};

// Lấy chi tiết slot
export const getSlotDetail = (storageId, slotIndex) => {
  return axiosInstance.get(`/api/bookings/storage/${storageId}/slots/${slotIndex}`);
};

// Tạo booking mới
export const createBooking = (bookingData) => {
  return axiosInstance.post(API_BASE, bookingData);
};

// Cập nhật booking
export const updateBooking = (bookingId, bookingData) => {
  return axiosInstance.put(`${API_BASE}/${bookingId}`, bookingData);
};

// Xóa booking
export const deleteBooking = (bookingId) => {
  return axiosInstance.delete(`${API_BASE}/${bookingId}`);
};

// Lấy danh sách bookings
export const getBookings = (params = {}) => {
  return axiosInstance.get(API_BASE, { params });
};

// Lấy chi tiết booking
export const getBookingDetail = (bookingId) => {
  return axiosInstance.get(`${API_BASE}/${bookingId}`);
};

export const getInitIds = () => {
  return axiosInstance.get('/api/bookings/init-ids');
};