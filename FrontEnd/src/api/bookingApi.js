// bookingApi.js
import axios from "axios";
import Cookies from "js-cookie";


const API_BASE = "/api/storage-units";

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
