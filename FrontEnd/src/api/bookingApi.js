import axios from "axios";
import Cookies from "js-cookie";

// Base URL cho booking API
const API_BASE_URL = "/api/bookings";

// Khởi tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor để tự động gắn token
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

// Interceptor để xử lý response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

class BookingApi {
  // GET /api/bookings/overview
  async getOverview() {
    const res = await api.get("/overview");
    return res.data;
  }

  // GET /api/bookings
  async getAllBookings() {
    const res = await api.get("/");
    return res.data;
  }

  // GET /api/bookings/{id}
  async getBookingById(id) {
    const res = await api.get(`/${id}`);
    return res.data;
  }

  // POST /api/bookings
  async createBooking(payload) {
    const res = await api.post("/", payload);
    return res.data;
  }

  // PUT /api/bookings/{id}
  async updateBooking(id, payload) {
    const res = await api.put(`/${id}`, payload);
    return res.data;
  }

  // DELETE /api/bookings/{id}
  async deleteBooking(id) {
    const res = await api.delete(`/${id}`);
    return res.data;
  }

  // GET /api/bookings/search?fullName={fullName}
  async searchBookings(fullName) {
    const res = await api.get("/search", { params: { fullName } });
    return res.data;
  }

  // PUT /api/bookings/{id}/payment?status={status}
  async updatePaymentStatus(id, status) {
    const res = await api.put(`/${id}/payment`, null, { params: { status } });
    return res.data;
  }

  // GET /api/bookings/storage/{storageId}/slots
  async getSlotsInfo(storageId) {
    const res = await api.get(`/storage/${storageId}/slots`);
    return res.data;
  }

  // GET /api/bookings/storage/{storageId}/slots/{slotIndex}
  async getSlotDetail(storageId, slotIndex) {
    const res = await api.get(`/storage/${storageId}/slots/${slotIndex}`);
    return res.data;
  }


}

// Export instance
const bookingApi = new BookingApi();
export default bookingApi;
export const createBooking = (payload) => api.post("/", payload);
export const updateBooking = (id, payload) => api.put(`/${id}`, payload);
export const deleteBooking = (id) => api.delete(`/${id}`);
export const getSlotsInfo = (storageId) => api.get(`/storage/${storageId}/slots`);
export const getSlotDetail = (storageId, slotIndex) => api.get(`/storage/${storageId}/slots/${slotIndex}`);