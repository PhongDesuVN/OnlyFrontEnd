// Service để xử lý các API calls liên quan đến revenue management
const API_BASE_URL = 'http://localhost:8083/api/revenues';

class RevenueService {
    // Lấy tất cả revenues
    async getAllRevenues(token = null) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await fetch(API_BASE_URL, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching revenues:', error);
            throw error;
        }
    }

    // Lấy revenues theo date range
    async getRevenuesByDateRange(startDate, endDate, token = null) {
        try {
            const url = `${API_BASE_URL}/date-range?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await fetch(url, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching revenues by date range:', error);
            throw error;
        }
    }

    // Lấy revenues theo beneficiary
    async getRevenuesByBeneficiary(beneficiaryId, token = null) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await fetch(`${API_BASE_URL}/beneficiary/${beneficiaryId}`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching revenues by beneficiary:', error);
            throw error;
        }
    }

    // Lấy revenues theo source type
    async getRevenuesBySourceType(sourceType, token = null) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await fetch(`${API_BASE_URL}/source-type/${sourceType}`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching revenues by source type:', error);
            throw error;
        }
    }

    // Lấy revenues theo booking
    async getRevenuesByBooking(bookingId, token = null) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await fetch(`${API_BASE_URL}/booking/${bookingId}`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching revenues by booking:', error);
            throw error;
        }
    }

    // Lấy tổng revenue theo date range
    async getTotalRevenue(startDate, endDate, token = null) {
        try {
            const url = `${API_BASE_URL}/total?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await fetch(url, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching total revenue:', error);
            throw error;
        }
    }

    // Export to Excel
    async exportToExcel(startDate, endDate, token = null) {
        try {
            let url = `${API_BASE_URL}/export/excel`;
            if (startDate && endDate) {
                url += `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
            }
            const headers = {
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Type': 'application/json'
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const response = await fetch(url, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            return blob;
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            throw error;
        }
    }
}

// Export instance của service
const revenueService = new RevenueService();
export default revenueService; 
