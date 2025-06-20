const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8083"

/**
 * Hàm gọi API chung cho toàn dự án.
 * @param {string} endpoint - Đường dẫn API, ví dụ: "/api/auth/register"
 * @param {object} options - Cấu hình fetch, ví dụ: { method, body, headers, auth }
 *  - Nếu muốn thêm Authorization header, truyền `auth: true`
 * @returns {Promise<Response>} - Kết quả từ fetch
 */
export const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`

    const config = {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    }

    // ✅ Thêm Authorization nếu cần
    if (options.auth) {
        const token = localStorage.getItem("authToken")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }

    try {
        const response = await fetch(url, config)

        // ❌ KHÔNG throw lỗi nếu status !== 2xx
        // Để caller (component) tự xử lý
        return response
    } catch (error) {
        // Chỉ bắt lỗi mạng hoặc fetch fail
        console.error("❌ API call failed:", { url, error: error.message })
        throw error
    }
}
