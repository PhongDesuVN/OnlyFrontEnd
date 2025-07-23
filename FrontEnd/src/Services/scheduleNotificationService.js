import { apiCall } from '../utils/api';

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
      const response = await apiCall(`/api/schedule/notifications/unread-count/${operatorId}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.count || 0;
      } else {
        throw new Error('Failed to fetch unread notification count');
      }
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
      const response = await apiCall(`/api/schedule/notifications/mark-read/${operatorId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        return true;
      } else {
        throw new Error('Failed to mark notifications as read');
      }
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
      const response = await apiCall('/api/schedule/notifications/health', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Schedule notification service health check failed:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const scheduleNotificationService = new ScheduleNotificationService();
export default scheduleNotificationService;