import axiosInstance from '../utils/axiosInstance.js';

// Service để xử lý các API calls liên quan đến revenue management
class RevenueService {
    // Lấy tất cả revenues
    async getAllRevenues() {
        try {
            const response = await axiosInstance.get('/api/revenues');
            return response.data;
        } catch (error) {
            console.error('Error fetching revenues:', error);
            throw error;
        }
    }

    // Lấy revenues theo date range
    async getRevenuesByDateRange(startDate, endDate) {
        try {
            const response = await axiosInstance.get('/api/revenues/date-range', {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching revenues by date range:', error);
            throw error;
        }
    }

    // Lấy revenues theo beneficiary
    async getRevenuesByBeneficiary(beneficiaryId) {
        try {
            const response = await axiosInstance.get(`/api/revenues/beneficiary/${beneficiaryId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching revenues by beneficiary:', error);
            throw error;
        }
    }

    // Lấy revenues theo source type
    async getRevenuesBySourceType(sourceType) {
        try {
            const response = await axiosInstance.get(`/api/revenues/source-type/${sourceType}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching revenues by source type:', error);
            throw error;
        }
    }

    // Lấy revenues theo booking
    async getRevenuesByBooking(bookingId) {
        try {
            const response = await axiosInstance.get(`/api/revenues/booking/${bookingId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching revenues by booking:', error);
            throw error;
        }
    }

    // Lấy tổng revenue theo date range
    async getTotalRevenue(startDate, endDate) {
        try {
            const response = await axiosInstance.get('/api/revenues/total', {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching total revenue:', error);
            throw error;
        }
    }

    // Export to Excel
    async exportToExcel(startDate, endDate) {
        try {
            const params = {};
            if (startDate && endDate) {
                params.startDate = startDate.toISOString();
                params.endDate = endDate.toISOString();
            }
            const response = await axiosInstance.get('/api/revenues/export/excel', {
                params,
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            throw error;
        }
    }

    // Lấy danh sách doanh thu có phân trang/filter
    async getPagedRevenues(params) {
        try {
            // Xóa các key rỗng/null
            const cleanParams = { ...params };
            Object.keys(cleanParams).forEach(key => {
                if (cleanParams[key] === '' || cleanParams[key] === null || cleanParams[key] === undefined) delete cleanParams[key];
            });
            const response = await axiosInstance.get('/api/revenues/filtered', {
                params: cleanParams,
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching paged revenues:', error);
            throw error;
        }
    }
}

// Export instance của service
const revenueService = new RevenueService();

// Lấy danh sách doanh thu có phân trang/filter
export const getPagedRevenues = async (params) => {
    try {
        // Xóa các key rỗng/null
        const cleanParams = { ...params };
        Object.keys(cleanParams).forEach(key => {
            if (cleanParams[key] === '' || cleanParams[key] === null || cleanParams[key] === undefined) delete cleanParams[key];
        });
        const response = await axiosInstance.get('/api/revenues/filtered', {
            params: cleanParams,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching paged revenues:', error);
        throw error;
    }
};

// Xuất excel với filter
export const exportExcelV2 = async (params) => {
    try {
        const response = await axiosInstance.get('/api/revenues/export/excel', {
            params,
            responseType: 'blob',
        });
        // Tải file về
        const url_download = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url_download;
        link.setAttribute('download', 'revenue_report.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        throw error;
    }
};

export default revenueService; 
