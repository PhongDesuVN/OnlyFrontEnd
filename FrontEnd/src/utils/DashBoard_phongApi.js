import { apiCall } from './api';

const DashBoardApi = {
    addPosition: async (positionData) => {
        try {
            const response = await apiCall('/api/dashboard/staff/positions', {
                method: 'POST',
                body: JSON.stringify(positionData),
                auth: true,
            });
            let data;
            if (response.headers.get("content-type")?.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
                console.warn("Phản hồi không phải JSON:", data);
                // Nếu không phải JSON nhưng response.ok, giả định thành công với message mặc định
                if (response.ok) {
                    data = { message: "Thêm/Cập nhật chức vụ thành công!" };
                } else {
                    throw new Error(data || "Phản hồi từ server không hợp lệ");
                }
            }
            console.log('Phản hồi từ addPosition:', {
                status: response.status,
                data,
            });
            if (!response.ok) {
                throw new Error(data.message || 'Lỗi khi thêm/cập nhật chức vụ');
            }
            return data;
        } catch (error) {
            console.error('Lỗi khi thêm/cập nhật chức vụ:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    getDashboardStats: async () => {
        try {
            const response = await apiCall('/api/dashboard/staff/stats', {
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
            console.log('Phản hồi từ getDashboardStats:', {
                status: response.status,
                data,
            });
            if (!response.ok) {
                throw new Error(data.message || 'Lỗi khi lấy thống kê');
            }
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy thống kê:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    getRecentActivities: async () => {
        try {
            const response = await apiCall('/api/dashboard/staff/activities', {
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
            console.log('Phản hồi từ getRecentActivities:', {
                status: response.status,
                data,
            });
            if (!response.ok) {
                throw new Error(data.message || 'Lỗi khi lấy hoạt động gần đây');
            }
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy hoạt động gần đây:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },
};

export default DashBoardApi;