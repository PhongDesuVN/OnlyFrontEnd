// bookingApi.js
import axios from "axios";
import Cookies from "js-cookie";

// 1) Tạo một axios instance mặc định gửi kèm cookie
const api = axios.create({
  baseURL: "http://localhost:8083/api/bookings",
  withCredentials: true,       // luôn gửi cookie
});

// 2) (Option) Nếu muốn vẫn hỗ trợ header Bearer từ cookie,
//    bạn có thể build header từ cookie và set vào interceptor:
api.interceptors.request.use(config => {
  const token = Cookies.get("authToken");
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

export function getSlotsInfo(storageId) {
  return api.get(`/storage/${storageId}/slots`);
}

export function getSlotDetail(storageId, slotIndex) {
  return api.get(`/storage/${storageId}/slots/${slotIndex}`);
}

export function createBooking(payload) {
  return api.post(`/`, payload);
}

export function updateBooking(id, payload) {
  return api.put(`/${id}`, payload);
}

export function deleteBooking(id) {
  return api.delete(`/${id}`);
}
