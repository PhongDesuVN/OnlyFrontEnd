import { useState, useEffect, useCallback, useMemo } from 'react';
import { message } from 'antd';
import scheduleService from '../Services/scheduleService.js';
import shiftService from '../Services/shiftService.js';
import timeOffService from '../Services/timeOffService.js';
import { 
  formatDateForAPI, 
  getCurrentWeekDates,
  getMonthRange,
  debounce 
} from '../utils/scheduleUtils.js';

/**
 * Custom hook for managing schedule data
 */
const useScheduleData = (initialDate = new Date(), initialViewMode = 'month') => {
  // State
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: null
  });
  const [statistics, setStatistics] = useState({
    totalEvents: 0,
    workingDays: 0,
    timeOffDays: 0,
    availableDays: 0
  });

  // Transform schedule data to events format
  const transformScheduleDataToEvents = useCallback((scheduleData) => {
    const events = [];
    const dataArray = Array.isArray(scheduleData) ? scheduleData : [scheduleData];
    dataArray.forEach(dayData => {
      let date;
      try {
        if (dayData.date) {
          date = typeof dayData.date === 'string' ? dayData.date : formatDateForAPI(dayData.date);
        } else {
          console.warn('Day data missing date field:', dayData);
          return;
        }
      } catch (error) {
        console.error('Error processing date in schedule data:', error, dayData);
        return;
      }
      if (dayData.orders && Array.isArray(dayData.orders)) {
        dayData.orders.forEach(order => {
          try {
            events.push({
              ...order,
              date,
              type: 'order',
              id: `order-${order.bookingId || order.id || Math.random()}-${date}`
            });
          } catch (error) {
            console.error('Error processing order event:', error, order);
          }
        });
      }
      if (dayData.shifts && Array.isArray(dayData.shifts)) {
        dayData.shifts.forEach(shift => {
          try {
            events.push({
              ...shift,
              date,
              type: 'shift',
              id: `shift-${shift.shiftId || shift.id || Math.random()}-${date}`
            });
          } catch (error) {
            console.error('Error processing shift event:', error, shift);
          }
        });
      }
      if (dayData.timeOffStatus?.hasTimeOff) {
        try {
          events.push({
            ...dayData.timeOffStatus,
            date,
            type: 'timeoff',
            id: `timeoff-${date}`
          });
        } catch (error) {
          console.error('Error processing time-off event:', error, dayData.timeOffStatus);
        }
      }
    });
    return events;
  }, []);

  // Apply filters to events
  const applyFilters = useCallback((events, filters) => {
    let filtered = [...events];
    if (filters.status) {
      filtered = filtered.filter(event => {
        if (filters.status === 'WORKING') {
          return event.type === 'order' || event.type === 'shift';
        }
        if (filters.status === 'TIME_OFF') {
          return event.type === 'timeoff';
        }
        if (filters.status === 'AVAILABLE') {
          return event.workStatus === 'AVAILABLE';
        }
        return true;
      });
    }
    return filtered;
  }, []);

  // Update statistics
  const updateStatistics = useCallback((events) => {
    const stats = {
      totalEvents: events.length,
      workingDays: 0,
      timeOffDays: 0,
      availableDays: 0
    };
    const dateGroups = events.reduce((groups, event) => {
      if (!groups[event.date]) {
        groups[event.date] = [];
      }
      groups[event.date].push(event);
      return groups;
    }, {});
    Object.values(dateGroups).forEach(dayEvents => {
      const hasWork = dayEvents.some(e => e.type === 'order' || e.type === 'shift');
      const hasTimeOff = dayEvents.some(e => e.type === 'timeoff');
      if (hasTimeOff) {
        stats.timeOffDays++;
      } else if (hasWork) {
        stats.workingDays++;
      } else {
        stats.availableDays++;
      }
    });
    setStatistics(stats);
  }, []);

  // Fetch schedule data
  const fetchScheduleData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let scheduleData = [];
      switch (viewMode) {
        case 'month': {
          const { startDate, endDate } = getMonthRange(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1
          );
          scheduleData = await scheduleService.getCalendarDataRange(startDate, endDate);
          break;
        }
        case 'week': {
          const weekDates = getCurrentWeekDates();
          scheduleData = await scheduleService.getCalendarDataRange(weekDates[0], weekDates[6]);
          break;
        }
        case 'day': {
          const dayData = await scheduleService.getCalendarData(formatDateForAPI(currentDate));
          scheduleData = [dayData];
          break;
        }
        default: {
          scheduleData = await scheduleService.getMonthlySchedule(currentDate.getFullYear(), currentDate.getMonth() + 1);
        }
      }
      const transformedEvents = transformScheduleDataToEvents(scheduleData);
      const filteredEvents = applyFilters(transformedEvents, filters);
      setEvents(filteredEvents);
      updateStatistics(transformedEvents);
    } catch (err) {
      console.error('Error fetching schedule data:', err);
      const errorMessage = err.message || 'Không thể tải dữ liệu lịch';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentDate, viewMode, filters, transformScheduleDataToEvents, applyFilters, updateStatistics]);

  // Debounced fetch
  const debouncedFetchData = useMemo(
    () => debounce(fetchScheduleData, 300),
    [fetchScheduleData]
  );

  // Event handlers
  const handleDateChange = useCallback((date) => {
    setCurrentDate(date instanceof Date ? date : new Date(date));
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const refreshData = useCallback(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);

  // Get today's schedule
  const getTodaySchedule = useCallback(async () => {
    try {
      const todayData = await scheduleService.getTodaySchedule();
      return todayData;
    } catch (err) {
      console.error('Error fetching today schedule:', err);
      return null;
    }
  }, []);

  // Get weekly schedule
  const getWeeklySchedule = useCallback(async (weekStartDate) => {
    try {
      const weeklyData = await scheduleService.getWeeklySchedule(weekStartDate);
      return weeklyData;
    } catch (err) {
      console.error('Error fetching weekly schedule:', err);
      return [];
    }
  }, []);

  // Effects
  useEffect(() => {
    debouncedFetchData();
  }, [debouncedFetchData]);

  // Cleanup
  useEffect(() => {
    return () => {
      debouncedFetchData.cancel?.();
    };
  }, [debouncedFetchData]);

  return {
    currentDate,
    viewMode,
    events,
    loading,
    error,
    filters,
    statistics,
    handleDateChange,
    handleViewModeChange,
    handleFilterChange,
    refreshData,
    getTodaySchedule,
    getWeeklySchedule,
    transformScheduleDataToEvents,
    applyFilters,
    updateStatistics
  };
};

export default useScheduleData;