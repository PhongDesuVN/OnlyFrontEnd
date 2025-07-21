import axiosInstance from '../utils/axiosInstance.js';

/**
 * Service for schedule and calendar management API calls
 */
class ScheduleService {
    constructor() {
        this.baseURL = '/api/schedule';
    }

    /**
     * Get calendar data for the authenticated operator and date
     */
    async getCalendarData(date) {
        try {
            console.log('Getting calendar data for date:', date);
            const response = await axiosInstance.get(`${this.baseURL}/calendar`, {
                params: { date }
            });
            console.log('Calendar data response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching calendar data:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get calendar data for the authenticated operator within a date range
     */
    async getCalendarDataRange(startDate, endDate) {
        try {
            const response = await axiosInstance.get(`${this.baseURL}/calendar/range`, {
                params: { startDate, endDate }
            });
            console.log('Calendar data range response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching calendar data range:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get weekly schedule for the authenticated operator
     */
    async getWeeklySchedule(weekStartDate) {
        try {
            console.log('Getting weekly schedule for week start:', weekStartDate);
            const response = await axiosInstance.get(`${this.baseURL}/weekly`, {
                params: { weekStartDate }
            });
            console.log('Weekly schedule response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching weekly schedule:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get monthly schedule for the authenticated operator
     */
    async getMonthlySchedule(year, month) {
        try {
            console.log('Getting monthly schedule for year:', year, 'month:', month);
            const response = await axiosInstance.get(`${this.baseURL}/monthly`, {
                params: { year, month }
            });
            console.log('Monthly schedule response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching monthly schedule:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get assigned orders for the authenticated operator within date range
     */
    async getAssignedOrders(startDate, endDate) {
        try {
            console.log('Getting assigned orders from:', startDate, 'to:', endDate);
            const response = await axiosInstance.get(`${this.baseURL}/orders`, {
                params: { startDate, endDate }
            });
            console.log('Assigned orders response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching assigned orders:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get current day schedule for the authenticated operator
     */
    async getTodaySchedule() {
        try {
            console.log('Getting today schedule');
            const response = await axiosInstance.get(`${this.baseURL}/today`);
            console.log('Today schedule response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching today schedule:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get schedule summary for multiple operators (manager view)
     */
    async getScheduleSummary(operatorIds, date) {
        try {
            console.log('Getting schedule summary for operators:', operatorIds, 'date:', date);
            const response = await axiosInstance.get(`${this.baseURL}/summary`, {
                params: {
                    operatorIds: operatorIds.join(','),
                    date
                }
            });
            console.log('Schedule summary response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching schedule summary:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Handle API errors and transform them into user-friendly messages
     */
    handleError(error) {
        return error.message; // Assuming error.message is the user-friendly message
    }
}

// Export instance of the service
const scheduleService = new ScheduleService();
export default scheduleService;