// bookingApi.js
import axios from "axios";
import Cookies from "js-cookie";

// Bạn có thể thay đổi baseURL này theo môi trường build/deploy nếu cần
const API_BASE_URL = "http://localhost:8080/api/bookings";

// Khởi tạo một instance axios riêng cho booking (nếu muốn dùng interceptor riêng)
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Tự động gắn token cho mọi request
api.interceptors.request.use((config) => {
  const token = Cookies.get("authToken");
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

class BookingApi {
  // Tổng quan booking
  async getOverview() {
    const res = await api.get("/overview");
    return res.data;
  }

  // Lấy tất cả bookings
  async getAllBookings() {
    const res = await api.get("/");
    return res.data;
  }

  // Lấy thông tin slot của một kho
  async getSlotsInfo(storageId) {
    const res = await api.get(`/storage/${storageId}/slots`);
    return res.data;
  }

  // Lấy chi tiết booking của 1 slot
  async getSlotDetail(storageId, slotIndex) {
    const res = await api.get(`/storage/${storageId}/slots/${slotIndex}`);
    return res.data;
  }

  // Tìm kiếm booking theo tên khách hàng
  async searchBookings(fullName) {
    const res = await api.get(`/search`, { params: { fullName } });
    return res.data;
  }

  // Lấy booking theo ID
  async getBookingById(id) {
    const res = await api.get(`/${id}`);
    return res.data;
  }

  // Tạo mới booking
  async createBooking(payload) {
    const res = await api.post(`/`, payload);
    return res.data;
  }

  // Update booking
  async updateBooking(id, payload) {
    const res = await api.put(`/${id}`, payload);
    return res.data;
  }

  // Xoá booking
  async deleteBooking(id) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }

  // Cập nhật payment status
  async updatePaymentStatus(id, status) {
    // status: string ("PAID", "UNPAID", ...)
    const res = await api.put(`/${id}/payment`, null, { params: { status } });
    return res.data;
  }
}

const bookingApi = new BookingApi();
export default bookingApi;
