import axiosInstance from '../utils/axiosInstance.js';

/**
 * Service for time-off request management API calls
 */
class TimeOffService {
    constructor() {
        this.baseURL = '/api/timeoff';
    }

    /**
     * Submit a new time-off request
     */
    async submitTimeOffRequest(requestData) {
        try {
            console.log('Submitting time-off request:', requestData);
            const response = await axiosInstance.post(`${this.baseURL}/request`, requestData);
            console.log('Submit time-off request response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error submitting time-off request:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Approve a time-off request
     */
    async approveTimeOffRequest(requestId, approvalData) {
        try {
            // Đúng format: { requestId, managerComments }
            const payload = {
                requestId,
                managerComments: approvalData.comments || ''
            };
            const response = await axiosInstance.put(`${this.baseURL}/${requestId}/approve`, payload);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Reject a time-off request
     */
    async rejectTimeOffRequest(requestId, rejectionData) {
        try {
            // Đúng format: { requestId, managerComments }
            const payload = {
                requestId,
                managerComments: rejectionData.comments || ''
            };
            const response = await axiosInstance.put(`${this.baseURL}/${requestId}/reject`, payload);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Get time-off request by ID
     */
    async getTimeOffRequestById(requestId) {
        try {
            console.log('Getting time-off request by ID:', requestId);
            const response = await axiosInstance.get(`${this.baseURL}/${requestId}`);
            console.log('Get time-off request response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching time-off request by ID:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get all time-off requests for an operator
     */
    async getOperatorTimeOffRequests() {
        try {
            const response = await axiosInstance.get(`${this.baseURL}/staff-request`);
            return response.data;
        } catch (error) {
            console.error('Error fetching operator time-off requests:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get time-off requests by status
     */
    async getTimeOffRequestsByStatus(status) {
        try {
            console.log('Getting time-off requests by status:', status);
            const response = await axiosInstance.get(`${this.baseURL}/status/${status}`);
            console.log('Time-off requests by status response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching time-off requests by status:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get pending time-off requests for manager review
     */
    async getPendingTimeOffRequests() {
        try {
            console.log('Getting pending time-off requests');
            const response = await axiosInstance.get(`${this.baseURL}/pending`);
            console.log('Pending time-off requests response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching pending time-off requests:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get time-off requests within date range
     */
    async getTimeOffRequestsByDateRange(startDate, endDate) {
        try {
            console.log('Getting time-off requests from:', startDate, 'to:', endDate);
            const response = await axiosInstance.get(`${this.baseURL}/range`, {
                params: { startDate, endDate }
            });
            console.log('Time-off requests by date range response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching time-off requests by date range:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get operator's time-off requests within date range
     */
    async getOperatorTimeOffRequestsByDateRange(operatorId, startDate, endDate) {
        try {
            console.log('Getting time-off requests for operator:', operatorId, 'from:', startDate, 'to:', endDate);
            const response = await axiosInstance.get(`${this.baseURL}/requests/${operatorId}/range`, {
                params: { startDate, endDate }
            });
            console.log('Operator time-off requests by date range response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching operator time-off requests by date range:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Cancel a time-off request (only if pending)
     */
    async cancelTimeOffRequest(requestId) {
        try {
            console.log('Cancelling time-off request ID:', requestId);
            await axiosInstance.delete(`${this.baseURL}/${requestId}/cancel`);
            console.log('Time-off request cancelled successfully');
            return true;
        } catch (error) {
            console.error('Error cancelling time-off request:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get approved time-off for a specific date and operator
     */
    async getApprovedTimeOffForDate(operatorId, date) {
        try {
            console.log('Getting approved time-off for operator:', operatorId, 'date:', date);
            const response = await axiosInstance.get(`${this.baseURL}/approved/${operatorId}`, {
                params: { date }
            });
            console.log('Approved time-off for date response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching approved time-off for date:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get time-off statistics
     */
    async getTimeOffStatistics() {
        try {
            console.log('Getting time-off statistics');
            const response = await axiosInstance.get(`${this.baseURL}/statistics`);
            console.log('Time-off statistics response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching time-off statistics:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Bulk approve multiple time-off requests
     */
    async bulkApproveTimeOffRequests(bulkApprovalData) {
        try {
            console.log('Bulk approving time-off requests:', bulkApprovalData);
            const response = await axiosInstance.put(`${this.baseURL}/bulk-approve`, bulkApprovalData);
            console.log('Bulk approve response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in bulk approval:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get time-off summary for multiple operators (manager view)
     */
    async getTimeOffSummary(operatorIds, startDate, endDate) {
        try {
            console.log('Getting time-off summary for operators:', operatorIds, 'from:', startDate, 'to:', endDate);
            const response = await axiosInstance.get(`${this.baseURL}/summary`, {
                params: { 
                    operatorIds: operatorIds.join(','),
                    startDate, 
                    endDate 
                }
            });
            console.log('Time-off summary response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching time-off summary:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get manager's time-off requests by date range (or all pending if no range)
     */
    async getManagerTimeOffRequestsByDateRange(startDate, endDate) {
        if (!startDate || !endDate) {
            // Nếu không truyền ngày, lấy pending
            return this.getPendingTimeOffRequests();
        }
        try {
            const response = await axiosInstance.get(`${this.baseURL}/range`, {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching manager time-off requests by date range:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Handle API errors and transform them into user-friendly messages
     */
    handleError(error) {
        return error.message; // Assuming error.message is now available directly
    }
}

// Export instance of the service
const timeOffService = new TimeOffService();
export default timeOffService;