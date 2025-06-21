import axiosInstance from './axiosinstance';

const ManageOrderApi = {
    getOrders: async () => {
        try {
            const response = await axiosInstance.get('/bookings');
            console.log('Phản hồi từ getOrders:', {
                status: response.status,
                data: response.data,
            });
            return response.data;
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
            const response = await axiosInstance.put(`/bookings/${id}`, order);
            console.log(`Phản hồi từ updateOrder (ID: ${id}):`, {
                status: response.status,
                data: response.data,
            });
            return response.data;
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
            const response = await axiosInstance.get(`/bookings/search?fullName=${encodeURIComponent(fullName)}`);
            console.log(`Phản hồi từ searchOrders (fullName: ${fullName}):`, {
                status: response.status,
                data: response.data,
            });
            return response.data;
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
            const response = await axiosInstance.put(`/bookings/${id}/payment?status=${status}`);
            console.log(`Phản hồi từ updatePaymentStatus (ID: ${id}, status: ${status}):`, {
                status: response.status,
                data: response.data,
            });
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi cập nhật trạng thái thanh toán ${id}:`, {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    getOverview: async () => {
        try {
            const response = await axiosInstance.get('/bookings/overview');
            console.log('Phản hồi từ getOverview:', {
                status: response.status,
                data: response.data,
            });
            return response.data;
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