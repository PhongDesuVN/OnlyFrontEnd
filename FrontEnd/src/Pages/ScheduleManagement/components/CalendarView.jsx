import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, Badge, Tooltip, Spin, Alert } from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { format, parseISO, isToday, isSameMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  getEventColor, 
  getWorkStatusLabel, 
  formatDateForAPI,
  groupEventsByDate,
  sortEventsByTime 
} from '../../../utils/scheduleUtils.js';

/**
 * Base CalendarView component with custom cell rendering
 * Supports different event types with color coding
 */
const CalendarView = ({
  events = [],
  onDateSelect,
  onEventClick,
  viewMode = 'month',
  loading = false,
  error = null,
  selectedDate = null,
  className = '',
  showTooltips = true,
  maxEventsPerDay = 3
}) => {
  const [currentDate, setCurrentDate] = useState(() => {
    if (selectedDate) {
      try {
        return selectedDate instanceof Date ? selectedDate : 
               typeof selectedDate === 'string' ? parseISO(selectedDate) : new Date();
      } catch {
        return new Date();
      }
    }
    return new Date();
  });

  // Sync with selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      try {
        const newDate = selectedDate instanceof Date ? selectedDate : 
                       typeof selectedDate === 'string' ? parseISO(selectedDate) : new Date();
        setCurrentDate(newDate);
      } catch {
        // If parsing fails, keep current date
      }
    }
  }, [selectedDate]);

  // Group events by date for efficient lookup
  const eventsByDate = useMemo(() => {
    return groupEventsByDate(events);
  }, [events]);

  // Handle date selection
  const handleDateSelect = useCallback((date) => {
    const dateString = formatDateForAPI(date.toDate());
    setCurrentDate(date.toDate());
    onDateSelect?.(dateString, date.toDate());
  }, [onDateSelect]);

  // Handle event click
  const handleEventClick = useCallback((event, date) => {
    onEventClick?.(event, date);
  }, [onEventClick]);

  // Custom cell renderer for calendar dates
  const dateCellRender = useCallback((value) => {
    const dateString = formatDateForAPI(value.toDate());
    const dayEvents = eventsByDate[dateString] || [];
    
    if (dayEvents.length === 0) return null;

    // Sort events by time
    const sortedEvents = sortEventsByTime(dayEvents);
    const visibleEvents = sortedEvents.slice(0, maxEventsPerDay);
    const hiddenCount = sortedEvents.length - maxEventsPerDay;

    return (
      <div className="calendar-events">
        {visibleEvents.map((event, index) => (
          <EventItem
            key={`${event.id || event.bookingId || event.shiftId || event.requestId}-${index}`}
            event={event}
            onEventClick={handleEventClick}
            date={dateString}
            showTooltips={showTooltips}
          />
        ))}
        {hiddenCount > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            +{hiddenCount} sự kiện khác
          </div>
        )}
      </div>
    );
  }, [eventsByDate, maxEventsPerDay, handleEventClick, showTooltips]);

  // Custom month cell renderer
  const monthCellRender = useCallback((value) => {
    const monthEvents = events.filter(event => {
      const eventDate = parseISO(event.date);
      return isSameMonth(eventDate, value.toDate());
    });

    if (monthEvents.length === 0) return null;

    return (
      <div className="text-center">
        <Badge count={monthEvents.length} className="calendar-month-badge" />
      </div>
    );
  }, [events]);

  // Handle calendar panel change
  const handlePanelChange = useCallback((date, mode) => {
    setCurrentDate(date.toDate());
  }, []);

  if (error) {
    return (
      <Alert
        message="Lỗi tải dữ liệu lịch"
        description={error}
        type="error"
        showIcon
        className={className}
      />
    );
  }

  return (
    <div className={`calendar-view ${className}`}>
      <Spin spinning={loading} tip="Đang tải dữ liệu lịch...">
        <Calendar
          onSelect={handleDateSelect}
          onPanelChange={handlePanelChange}
          cellRender={(date, info) => {
            if (info.type === 'date') return dateCellRender(date);
            if (info.type === 'month') return monthCellRender(date);
            return null;
          }}
          mode={viewMode}
          className="custom-calendar"
        />
      </Spin>
      
      <style>{`
        .calendar-view .custom-calendar {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .calendar-view .custom-calendar .ant-picker-calendar-header {
          padding: 16px 24px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .calendar-view .custom-calendar .ant-picker-content {
          padding: 0;
        }
        
        .calendar-view .custom-calendar .ant-picker-cell {
          position: relative;
        }
        
        .calendar-view .custom-calendar .ant-picker-cell-today .ant-picker-cell-inner {
          border: 2px solid #1890ff;
          font-weight: bold;
        }
        
        .calendar-view .calendar-events {
          margin-top: 4px;
          max-height: 80px;
          overflow: hidden;
        }
        
        .calendar-view .calendar-month-badge {
          margin-top: 8px;
        }
        
        .calendar-view .event-item {
          margin-bottom: 2px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          line-height: 1.2;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .calendar-view .event-item:hover {
          opacity: 0.8;
          transform: translateY(-1px);
        }
        
        .calendar-view .event-item.order {
          background-color: #e6f7ff;
          border-left: 3px solid #1890ff;
          color: #1890ff;
        }
        
        .calendar-view .event-item.shift {
          background-color: #f6ffed;
          border-left: 3px solid #52c41a;
          color: #52c41a;
        }
        
        .calendar-view .event-item.timeoff {
          background-color: #fff2f0;
          border-left: 3px solid #ff4d4f;
          color: #ff4d4f;
        }
        
        .calendar-view .event-item.available {
          background-color: #f5f5f5;
          border-left: 3px solid #d9d9d9;
          color: #8c8c8c;
        }
        
        .calendar-view .event-icon {
          font-size: 10px;
          flex-shrink: 0;
        }
        
        .calendar-view .event-text {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .calendar-view .event-time {
          font-size: 10px;
          opacity: 0.8;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};

/**
 * Individual event item component
 */
const EventItem = ({ event, onEventClick, date, showTooltips }) => {
  const getEventType = (event) => {
    if (event.bookingId) return 'order';
    if (event.shiftId) return 'shift';
    if (event.requestId) return 'timeoff';
    return 'available';
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'order':
        return <CalendarOutlined className="event-icon" />;
      case 'shift':
        return <ClockCircleOutlined className="event-icon" />;
      case 'timeoff':
        return <UserOutlined className="event-icon" />;
      default:
        return <ExclamationCircleOutlined className="event-icon" />;
    }
  };

  const getEventTitle = (event, type) => {
    switch (type) {
      case 'order':
        return event.customerName || `Đơn hàng #${event.bookingId}`;
      case 'shift':
        return event.shiftName || 'Ca làm việc';
      case 'timeoff':
        return 'Nghỉ phép';
      default:
        return 'Sự kiện';
    }
  };

  const getEventTime = (event, type) => {
    switch (type) {
      case 'order':
        return event.deliveryTime;
      case 'shift':
        return `${event.startTime}-${event.endTime}`;
      case 'timeoff':
        return 'Cả ngày';
      default:
        return '';
    }
  };

  const getTooltipContent = (event, type) => {
    switch (type) {
      case 'order':
        return (
          <div>
            <div><strong>Khách hàng:</strong> {event.customerName}</div>
            <div><strong>Thời gian:</strong> {event.deliveryTime}</div>
            <div><strong>Địa chỉ:</strong> {event.deliveryLocation}</div>
            <div><strong>Trạng thái:</strong> {event.status}</div>
          </div>
        );
      case 'shift':
        return (
          <div>
            <div><strong>Ca làm việc:</strong> {event.shiftName}</div>
            <div><strong>Thời gian:</strong> {event.startTime} - {event.endTime}</div>
            <div><strong>Trạng thái:</strong> {event.status}</div>
          </div>
        );
      case 'timeoff':
        return (
          <div>
            <div><strong>Loại:</strong> Nghỉ phép</div>
            <div><strong>Lý do:</strong> {event.reason}</div>
            <div><strong>Trạng thái:</strong> {event.status}</div>
          </div>
        );
      default:
        return 'Chi tiết sự kiện';
    }
  };

  const eventType = getEventType(event);
  const eventTitle = getEventTitle(event, eventType);
  const eventTime = getEventTime(event, eventType);
  const tooltipContent = getTooltipContent(event, eventType);

  const handleClick = (e) => {
    e.stopPropagation();
    onEventClick?.(event, date);
  };

  const eventItem = (
    <div
      className={`event-item ${eventType}`}
      onClick={handleClick}
    >
      {getEventIcon(eventType)}
      <span className="event-text">{eventTitle}</span>
      {eventTime && <span className="event-time">{eventTime}</span>}
    </div>
  );

  if (showTooltips) {
    return (
      <Tooltip title={tooltipContent} placement="top">
        {eventItem}
      </Tooltip>
    );
  }

  return eventItem;
};

export default CalendarView;