import { apiCall } from './api';

const ManageOrderApi = {
    getOrders: async () => {
        try {
            const response = await apiCall('/api/bookings', { method: 'GET', auth: true });
            let data;
            if (response.headers.get("content-type")?.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
                console.warn("Phản hồi không phải JSON:", data);
                throw new Error("Phản hồi từ server không hợp lệ");
            }
            console.log('Phản hồi từ getOrders:', {
                status: response.status,
                data,
            });
            if (!response.ok) {
                throw new Error(data.message || 'Lỗi khi lấy danh sách đơn hàng');
            }
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách đơn hàng:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    updateOrder: async (id, order) => {
        try {
            const response = await apiCall(`/api/bookings/${id}`, {
                method: 'PUT',
                body: JSON.stringify(order),
                auth: true,
            });
            let data;
            if (response.headers.get("content-type")?.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
                console.warn("Phản hồi không phải JSON:", data);
                throw new Error("Phản hồi từ server không hợp lệ");
            }
            console.log(`Phản hồi từ updateOrder (ID: ${id}):`, {
                status: response.status,
                data,
            });
            if (!response.ok) {
                throw new Error(data.message || 'Lỗi khi cập nhật đơn hàng');
            }
            return data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật đơn hàng ${id}:`, {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    searchOrders: async (fullName) => {
        try {
            const response = await apiCall(`/api/bookings/search?fullName=${encodeURIComponent(fullName)}`, {
                method: 'GET',
                auth: true,
            });
            let data;
            if (response.headers.get("content-type")?.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
                console.warn("Phản hồi không phải JSON:", data);
                throw new Error("Phản hồi từ server không hợp lệ");
            }
            console.log(`Phản hồi từ searchOrders (fullName: ${fullName}):`, {
                status: response.status,
                data,
            });
            if (!response.ok) {
                throw new Error(data.message || 'Lỗi khi tìm kiếm đơn hàng');
            }
            return data;
        } catch (error) {
            console.error('Lỗi khi tìm kiếm đơn hàng:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    updatePaymentStatus: async (id, status) => {
        try {
            const response = await apiCall(`/api/bookings/${id}/payment?status=${encodeURIComponent(status)}`, {
                method: 'PUT',
                auth: true,
            });
            let data;
            const contentType = response.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
                // Nếu phản hồi là chuỗi thành công, tạo đối tượng giả lập
                if (data.includes("thành công")) {
                    data = { message: data, paymentStatus: status };
                } else {
                    console.warn(`Phản hồi không phải JSON (ID: ${id}, Status: ${status}):`, data);
                    throw new Error("Phản hồi từ server không hợp lệ");
                }
            }
            console.log(`Phản hồi từ updatePaymentStatus (ID: ${id}, status: ${status}):`, {
                status: response.status,
                headers: Object.fromEntries(response.headers),
                data,
            });
            if (!response.ok) {
                throw new Error(data.message || `Lỗi HTTP ${response.status}: ${data}`);
            }
            return data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật trạng thái thanh toán ${id}:`, {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                stack: error.stack,
            });
            throw error;
        }
    },
    getOverview: async () => {
        try {
            const response = await apiCall('/api/bookings/overview', { method: 'GET', auth: true });
            let data;
            if (response.headers.get("content-type")?.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
                console.warn("Phản hồi không phải JSON:", data);
                throw new Error("Phản hồi từ server không hợp lệ");
            }
            console.log('Phản hồi từ getOverview:', {
                status: response.status,
                data,
            });
            if (!response.ok) {
                throw new Error(data.message || 'Lỗi khi lấy thông tin tổng quan');
            }
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy thông tin tổng quan:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },
};

export default ManageOrderApi;