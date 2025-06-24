// src/utils/api.js
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8083";

/**
 * Hàm gọi API hỗ trợ xác thực bằng token lưu trong cookie hoặc localStorage.
 * @param {string} endpoint - Đường dẫn endpoint (VD: "/api/bookings")
 * @param {object} options - Cấu hình fetch như method, body, headers, auth
 * @returns {Promise<Response>}
 */
export const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    // Chuẩn bị headers
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    // Nếu cần xác thực thì thêm token vào headers
    if (options.auth) {
        const token = Cookies.get("authToken") || localStorage.getItem("authToken");
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn("⚠️ Không tìm thấy token xác thực. Yêu cầu có thể bị từ chối.");
        }
    }

    const config = {
        method: options.method || "GET",
        headers,
        body: options.body,
        credentials: "include", // Đảm bảo cookie như authToken được gửi đi nếu backend cần
        ...options,
    };

    try {
        const response = await fetch(url, config);
        return response;
    } catch (error) {
        console.error("❌ API call failed:", {
            url,
            error: error.message,
        });
        throw error;
    }
};
