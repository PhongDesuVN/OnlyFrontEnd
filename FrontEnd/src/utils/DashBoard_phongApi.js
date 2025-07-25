import { apiCall } from './api';
import Cookies from "js-cookie";

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

    logout: async () => {
        try {
            const response = await apiCall('/api/auth/logout', {
                method: 'POST',
                auth: true,
                credentials: 'include',
            });
            let data;
            if (response.headers.get("content-type")?.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
                console.warn("Phản hồi không phải JSON:", data);
                if (response.ok) {
                    data = { message: "Đăng xuất thành công!" };
                } else {
                    throw new Error(data || "Phản hồi từ server không hợp lệ");
                }
            }
            console.log('Phản hồi từ logout:', {
                status: response.status,
                data,
            });
            if (!response.ok) {
                throw new Error(data.message || 'Lỗi khi đăng xuất');
            }
            return data;
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    getMonthlyRevenue: async (year, unit, startMonth, endMonth) => {
        try {
            const response = await apiCall('/api/dashboard/staff/monthly-revenue', {
                method: 'GET',
                params: { year, unit, startMonth, endMonth },
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
            console.log('Phản hồi từ getMonthlyRevenue:', {
                status: response.status,
                data,
            });
            if (!response.ok) {
                throw new Error(data.message || 'Lỗi khi lấy dữ liệu doanh thu');
            }
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu doanh thu:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    getPerformanceData: async (year, unit, startMonth, endMonth) => {
        try {
            const response = await apiCall('/api/dashboard/staff/performance-data', {
                method: 'GET',
                params: { year, unit, startMonth, endMonth },
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
            console.log('Phản hồi từ getPerformanceData:', {
                status: response.status,
                data,
            });
            if (!response.ok) {
                throw new Error(data.message || 'Lỗi khi lấy dữ liệu hiệu suất');
            }
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu hiệu suất:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    getDetailData: async (year, unit, startMonth, endMonth) => {
        try {
            const response = await apiCall('/api/dashboard/staff/detail-data', {
                method: 'GET',
                params: { year, unit, startMonth, endMonth },
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
            console.log('Phản hồi từ getDetailData:', {
                status: response.status,
                data,
            });
            if (!response.ok) {
                throw new Error(data.message || 'Lỗi khi lấy dữ liệu chi tiết');
            }
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu chi tiết:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    getTransportData: async (year, unit, startMonth, endMonth) => {
        try {
            const response = await apiCall('/api/dashboard/staff/transport-data', {
                method: 'GET',
                params: { year, unit, startMonth, endMonth },
                auth: true,
            });
            let data;
            if (response.status === 204) {
                data = {
                    totalShipments: 0,
                    revenue: "0 đ",
                    deliveryRate: 0,
                    totalVolume: 0,
                    shipmentGrowth: 0,
                    revenueGrowth: 0,
                    deliveryRateGrowth: 0,
                    volumeGrowth: 0,
                };
                console.log('Phản hồi từ getTransportData (204 No Content):', {
                    status: response.status,
                    data,
                });
                return data;
            }
            if (response.headers.get("content-type")?.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
                console.warn("Phản hồi không phải JSON:", data);
                throw new Error("Phản hồi từ server không hợp lệ");
            }
            console.log('Phản hồi từ getTransportData:', {
                status: response.status,
                data,
            });
            if (!response.ok) {
                if (response.status === 403) {
                    Cookies.remove("authToken");
                    Cookies.remove("userRole");
                    Cookies.remove("username");
                    window.location.href = "/login";
                    throw new Error("Không có quyền truy cập. Vui lòng đăng nhập lại.");
                }
                throw new Error(data.message || 'Lỗi khi lấy dữ liệu vận chuyển');
            }
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu vận chuyển:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    getRankingData: async (period, metric) => {
        try {
            const response = await apiCall('/api/dashboard/staff/ranking-data', {
                method: 'GET',
                params: { period, metric },
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
            console.log('Phản hồi từ getRankingData:', {
                status: response.status,
                data,
            });
            if (!response.ok) {
                throw new Error(data.message || 'Lỗi khi lấy dữ liệu xếp hạng');
            }
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu xếp hạng:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    getTeamRanking: async (period, metric) => {
        try {
            const response = await apiCall('/api/dashboard/staff/team-ranking', {
                method: 'GET',
                params: { period, metric },
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
            console.log('Phản hồi từ getTeamRanking:', {
                status: response.status,
                data,
            });
            if (!response.ok) {
                throw new Error(data.message || 'Lỗi khi lấy dữ liệu xếp hạng đội nhóm');
            }
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu xếp hạng đội nhóm:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    getAchievements: async () => {
        try {
            const response = await apiCall('/api/dashboard/staff/achievements', {
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
            console.log('Phản hồi từ getAchievements:', {
                status: response.status,
                data,
            });
            if (!response.ok) {
                throw new Error(data.message || 'Lỗi khi lấy dữ liệu thành tích');
            }
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu thành tích:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },
};

export default DashBoardApi;