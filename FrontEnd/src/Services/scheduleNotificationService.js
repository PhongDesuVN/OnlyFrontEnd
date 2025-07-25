import axiosInstance from '../utils/axiosInstance.js';

/**
 * Service for schedule notification operations
 * Handles API calls for notification badge functionality
 * Requirements: 5.4, 5.5
 */
class ScheduleNotificationService {
  /**
   * Get count of unread schedule notifications for an operator
   * @param {number} operatorId - The operator ID
   * @returns {Promise<number>} - Count of unread notifications
   */
  async getUnreadNotificationCount(operatorId) {
    try {
      const response = await axiosInstance.get(`/api/schedule/notifications/unread-count/${operatorId}`);
      return response.data.count || 0;
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      throw error;
    }
  }

  /**
   * Mark all schedule notifications as read for an operator
   * @param {number} operatorId - The operator ID
   * @returns {Promise<boolean>} - Success status
   */
  async markAllNotificationsAsRead(operatorId) {
    try {
      await axiosInstance.patch(`/api/schedule/notifications/mark-read/${operatorId}`);
      return true;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  /**
   * Check if schedule notification service is available
   * @returns {Promise<boolean>} - Service availability status
   */
  async checkServiceHealth() {
    try {
      await axiosInstance.get('/api/schedule/notifications/health');
      return true;
    } catch (error) {
      console.error('Schedule notification service health check failed:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const scheduleNotificationService = new ScheduleNotificationService();
export default scheduleNotificationService;