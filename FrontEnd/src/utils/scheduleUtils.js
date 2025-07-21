import { 
    WorkStatusLabels, 
    ShiftAssignmentStatusLabels, 
    TimeOffStatusLabels,
    EventColors,
    ValidationRules 
} from '../types/scheduleTypes.js';

/**
 * Utility functions for schedule management
 */

/**
 * Format date to YYYY-MM-DD string
 */
export const formatDateForAPI = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
};

/**
 * Format time to HH:MM string
 */
export const formatTimeForAPI = (time) => {
    if (!time) return '';
    if (typeof time === 'string') return time;
    return time.toTimeString().slice(0, 5);
};

/**
 * Parse date string to Date object
 */
export const parseDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString);
};

/**
 * Get work status label in Vietnamese
 */
export const getWorkStatusLabel = (status) => {
    return WorkStatusLabels[status] || status;
};

/**
 * Get shift assignment status label in Vietnamese
 */
export const getShiftAssignmentStatusLabel = (status) => {
    return ShiftAssignmentStatusLabels[status] || status;
};

/**
 * Get time-off status label in Vietnamese
 */
export const getTimeOffStatusLabel = (status) => {
    return TimeOffStatusLabels[status] || status;
};

/**
 * Get color for calendar event based on type
 */
export const getEventColor = (eventType) => {
    return EventColors[eventType] || EventColors.AVAILABLE;
};

/**
 * Calculate number of days between two dates
 */
export const calculateDaysBetween = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Validate shift time format
 */
export const validateTimeFormat = (time) => {
    return ValidationRules.timeFormat.pattern.test(time);
};

/**
 * Validate date format
 */
export const validateDateFormat = (date) => {
    return ValidationRules.dateFormat.pattern.test(date);
};

/**
 * Validate shift name
 */
export const validateShiftName = (name) => {
    if (!name || name.trim().length === 0) return false;
    if (name.length > ValidationRules.shiftName.maxLength) return false;
    return ValidationRules.shiftName.pattern.test(name);
};

/**
 * Validate time-off reason
 */
export const validateTimeOffReason = (reason) => {
    if (!reason || reason.trim().length < ValidationRules.timeOffReason.minLength) return false;
    if (reason.length > ValidationRules.timeOffReason.maxLength) return false;
    return true;
};

/**
 * Check if start time is before end time
 */
export const isValidTimeRange = (startTime, endTime) => {
    if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) return false;
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return startMinutes < endMinutes;
};

/**
 * Check if date range is valid
 */
export const isValidDateRange = (startDate, endDate, maxDays = ValidationRules.maxDateRangeDays) => {
    if (!startDate || !endDate) return false;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) return false;
    
    const daysDiff = calculateDaysBetween(startDate, endDate);
    return daysDiff <= maxDays;
};

/**
 * Check if date is in the past
 */
export const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
};

/**
 * Get week start date (Monday) for a given date
 */
export const getWeekStartDate = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
};

/**
 * Get month start and end dates
 */
export const getMonthRange = (year, month) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return {
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate)
    };
};

/**
 * Generate time options for dropdowns (15-minute intervals)
 */
export const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            options.push({
                value: timeString,
                label: timeString
            });
        }
    }
    return options;
};

/**
 * Format duration in minutes to human readable format
 */
export const formatDuration = (minutes) => {
    if (minutes < 60) {
        return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
        return `${hours} giờ`;
    }
    return `${hours} giờ ${remainingMinutes} phút`;
};

/**
 * Calculate shift duration in minutes
 */
export const calculateShiftDuration = (startTime, endTime) => {
    if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) return 0;
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return endMinutes - startMinutes;
};

/**
 * Group calendar events by date
 */
export const groupEventsByDate = (events) => {
    return events.reduce((groups, event) => {
        const date = event.date || formatDateForAPI(new Date());
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(event);
        return groups;
    }, {});
};

/**
 * Sort events by time
 */
export const sortEventsByTime = (events) => {
    return events.sort((a, b) => {
        const timeA = a.startTime || a.deliveryTime || '00:00';
        const timeB = b.startTime || b.deliveryTime || '00:00';
        return timeA.localeCompare(timeB);
    });
};

/**
 * Filter events by work status
 */
export const filterEventsByStatus = (events, status) => {
    return events.filter(event => event.workStatus === status);
};

/**
 * Get current week dates (Monday to Sunday)
 */
export const getCurrentWeekDates = () => {
    const today = new Date();
    const startOfWeek = getWeekStartDate(today);
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        dates.push(formatDateForAPI(date));
    }
    
    return dates;
};

/**
 * Check if two time ranges overlap
 */
export const doTimeRangesOverlap = (start1, end1, start2, end2) => {
    if (!validateTimeFormat(start1) || !validateTimeFormat(end1) || 
        !validateTimeFormat(start2) || !validateTimeFormat(end2)) {
        return false;
    }
    
    const [s1h, s1m] = start1.split(':').map(Number);
    const [e1h, e1m] = end1.split(':').map(Number);
    const [s2h, s2m] = start2.split(':').map(Number);
    const [e2h, e2m] = end2.split(':').map(Number);
    
    const start1Minutes = s1h * 60 + s1m;
    const end1Minutes = e1h * 60 + e1m;
    const start2Minutes = s2h * 60 + s2m;
    const end2Minutes = e2h * 60 + e2m;
    
    return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
};

/**
 * Format error message for user display
 */
export const formatErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return 'Đã xảy ra lỗi không xác định';
};

/**
 * Debounce function for search inputs
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};