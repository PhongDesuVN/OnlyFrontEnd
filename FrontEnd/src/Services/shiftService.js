import axiosInstance from '../utils/axiosInstance.js';

/**
 * Service for shift management API calls
 */
class ShiftService {
    constructor() {
        this.baseURL = '/api/shifts';
    }

    /**
     * Create a new work shift
     */
    async createShift(shiftData) {
        try {
            console.log('Creating shift with data:', shiftData);
            const response = await axiosInstance.post(this.baseURL, shiftData);
            console.log('Create shift response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating shift:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Update an existing work shift
     */
    async updateShift(shiftId, shiftData) {
        try {
            console.log('Updating shift ID:', shiftId, 'with data:', shiftData);
            const response = await axiosInstance.put(`${this.baseURL}/${shiftId}`, shiftData);
            console.log('Update shift response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating shift:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get shift details by ID
     */
    async getShiftById(shiftId) {
        try {
            console.log('Getting shift by ID:', shiftId);
            const response = await axiosInstance.get(`${this.baseURL}/${shiftId}`);
            console.log('Get shift response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching shift by ID:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get all active shifts
     */
    async getAllActiveShifts() {
        try {
            console.log('Getting all active shifts');
            const response = await axiosInstance.get(this.baseURL);
            console.log('Get active shifts response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching active shifts:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get all shifts (active and inactive) - Manager only
     */
    async getAllShifts() {
        try {
            console.log('Getting all shifts');
            const response = await axiosInstance.get(`${this.baseURL}/all`);
            console.log('Get all shifts response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching all shifts:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Delete a shift (soft delete - set inactive)
     */
    async deleteShift(shiftId) {
        try {
            console.log('Deleting shift ID:', shiftId);
            await axiosInstance.delete(`${this.baseURL}/${shiftId}`);
            console.log('Shift deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting shift:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Assign operators to a shift for a specific date
     */
    async assignOperatorsToShift(assignmentData) {
        try {
            console.log('Assigning operators to shift:', assignmentData);
            await axiosInstance.post(`${this.baseURL}/assign`, assignmentData);
            console.log('Operators assigned successfully');
            return true;
        } catch (error) {
            console.error('Error assigning operators to shift:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Remove operator assignment from a shift
     */
    async removeOperatorAssignment(shiftId, operatorId, assignmentDate) {
        try {
            console.log('Removing operator assignment:', { shiftId, operatorId, assignmentDate });
            await axiosInstance.delete(`${this.baseURL}/${shiftId}/assignments`, {
                params: { operatorId, assignmentDate }
            });
            console.log('Operator assignment removed successfully');
            return true;
        } catch (error) {
            console.error('Error removing operator assignment:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get shift assignments for a specific operator
     */
    async getOperatorShiftAssignments(operatorId, startDate, endDate) {
        try {
            console.log('Getting shift assignments for operator:', operatorId, 'from:', startDate, 'to:', endDate);
            const response = await axiosInstance.get(`${this.baseURL}/assignments/${operatorId}`, {
                params: { startDate, endDate }
            });
            console.log('Operator shift assignments response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching operator shift assignments:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Check for shift time conflicts for an operator
     */
    async checkTimeConflict(shiftId, operatorId, assignmentDate) {
        try {
            console.log('Checking time conflict for:', { shiftId, operatorId, assignmentDate });
            const response = await axiosInstance.get(`${this.baseURL}/conflicts/check`, {
                params: { shiftId, operatorId, assignmentDate }
            });
            console.log('Time conflict check response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error checking time conflict:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get available operators for a shift assignment
     */
    async getAvailableOperators(shiftId, assignmentDate) {
        try {
            console.log('Getting available operators for shift:', shiftId, 'date:', assignmentDate);
            const response = await axiosInstance.get(`${this.baseURL}/${shiftId}/available-operators`, {
                params: { assignmentDate }
            });
            console.log('Available operators response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching available operators:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Bulk assign multiple shifts to operators
     */
    async bulkAssignShifts(assignmentRequests) {
        try {
            console.log('Bulk assigning shifts:', assignmentRequests);
            await axiosInstance.post(`${this.baseURL}/bulk-assign`, assignmentRequests);
            console.log('Bulk assignment completed successfully');
            return true;
        } catch (error) {
            console.error('Error in bulk assignment:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get shift statistics (Manager only)
     */
    async getShiftStatistics() {
        try {
            console.log('Getting shift statistics');
            const response = await axiosInstance.get(`${this.baseURL}/statistics`);
            console.log('Shift statistics response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching shift statistics:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Handle API errors and transform them into user-friendly messages
     */
    handleError(error) {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;
            switch (status) {
                case 400:
                    return new Error(data || 'Invalid shift data or parameters');
                case 401:
                    return new Error('Authentication required');
                case 403:
                    return new Error('Access denied - Manager permission required');
                case 404:
                    return new Error('Shift not found');
                case 409:
                    return new Error('Shift conflict detected');
                case 500:
                    return new Error('Server error occurred');
                default:
                    return new Error(data || 'An error occurred while processing shift data');
            }
        } else if (error.request) {
            // Network error
            return new Error('Network error - please check your connection');
        } else {
            // Other error
            return new Error(error.message || 'An unexpected error occurred');
        }
    }
}

// Export instance of the service
const shiftService = new ShiftService();
export default shiftService;