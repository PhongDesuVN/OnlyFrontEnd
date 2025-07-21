import React, { useState, useCallback, useMemo } from 'react';
import { Layout, message, Alert, Card, Space, Typography } from 'antd';
import { CalendarOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';
import CalendarView from './components/CalendarView.jsx';
import CalendarToolbar from './components/CalendarToolbar.jsx';
import EventDetailModal from './components/EventDetailModal.jsx';
import useScheduleData from '../../hooks/useScheduleData.js';
import timeOffService from '../../Services/timeOffService.js';

const { Content } = Layout;
const { Title, Text } = Typography;


const ScheduleCalendar = () => {
  // Get current user info (assuming it's stored in localStorage or context)
  const currentUser = useMemo(() => {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }, []);

  // Use custom hook for schedule data management
  const {
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
    refreshData
  } = useScheduleData();

  // Modal state for event details
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetailVisible, setEventDetailVisible] = useState(false);
  const [eventType, setEventType] = useState(null);

  // Event handlers for calendar interactions

  const handleDateSelect = useCallback((dateString, date) => {
    console.log('Date selected:', dateString, date);
    // Switch to day view when a date is selected
    if (viewMode !== 'day') {
      handleViewModeChange('day');
      handleDateChange(date);
    }
  }, [viewMode, handleViewModeChange, handleDateChange]);

  const handleEventClick = useCallback((event, date) => {
    console.log('Event clicked:', event, date);
    setSelectedEvent(event);
    setEventType(event.type);
    setEventDetailVisible(true);
  }, []);

  const handleEventAction = useCallback(async (action, event) => {
    try {
      switch (action) {
        case 'approve':
          if (event.type === 'timeoff') {
            await timeOffService.approveTimeOffRequest(event.requestId, {
              managerId: currentUser?.managerId || 1,
              managerComments: 'Đã duyệt từ lịch'
            });
            message.success('Đã duyệt đơn xin nghỉ phép');
          }
          break;

        case 'reject':
          if (event.type === 'timeoff') {
            await timeOffService.rejectTimeOffRequest(event.requestId, {
              managerId: currentUser?.managerId || 1,
              managerComments: 'Từ chối từ lịch'
            });
            message.success('Đã từ chối đơn xin nghỉ phép');
          }
          break;

        case 'complete':
          if (event.type === 'shift') {
            // Update shift status to completed
            message.success('Đã hoàn thành ca làm việc');
          }
          break;

        case 'cancel':
          if (event.type === 'shift') {
            // Cancel shift assignment
            message.success('Đã hủy ca làm việc');
          }
          break;

        default:
          console.log('Unknown action:', action);
      }

      setEventDetailVisible(false);
      refreshData(); // Refresh data after action

    } catch (err) {
      console.error('Error performing action:', err);
      message.error('Không thể thực hiện thao tác');
    }
  }, [currentUser, refreshData]);

  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const handleToolbarFilterChange = useCallback((newFilters) => {
    handleFilterChange(newFilters);
  }, [handleFilterChange]);

  // Render statistics cards
  const renderStatistics = () => (
    <div className="statistics-cards">
      <Space size="middle" wrap>
        <Card size="small" className="stat-card">
          <div className="stat-content">
            <CalendarOutlined className="stat-icon total" />
            <div>
              <Text type="secondary">Tổng sự kiện</Text>
              <div className="stat-number">{statistics.totalEvents}</div>
            </div>
          </div>
        </Card>

        <Card size="small" className="stat-card">
          <div className="stat-content">
            <ClockCircleOutlined className="stat-icon working" />
            <div>
              <Text type="secondary">Ngày làm việc</Text>
              <div className="stat-number">{statistics.workingDays}</div>
            </div>
          </div>
        </Card>

        <Card size="small" className="stat-card">
          <div className="stat-content">
            <TeamOutlined className="stat-icon timeoff" />
            <div>
              <Text type="secondary">Ngày nghỉ phép</Text>
              <div className="stat-number">{statistics.timeOffDays}</div>
            </div>
          </div>
        </Card>

        <Card size="small" className="stat-card">
          <div className="stat-content">
            <CalendarOutlined className="stat-icon available" />
            <div>
              <Text type="secondary">Ngày có thể làm việc</Text>
              <div className="stat-number">{statistics.availableDays}</div>
            </div>
          </div>
        </Card>
      </Space>
    </div>
  );

  return (
    <Layout>
      <Content className="schedule-calendar-page">
        <div className="page-header">
          <Title level={2}>
            <CalendarOutlined className="mr-2" />
            Lịch làm việc
          </Title>
          <Text type="secondary">
            Xem lịch đơn hàng được phân công và ca làm việc
          </Text>
        </div>

        {renderStatistics()}

        <CalendarToolbar
          currentDate={currentDate}
          viewMode={viewMode}
          onDateChange={handleDateChange}
          onViewModeChange={handleViewModeChange}
          onRefresh={handleRefresh}
          onFilterChange={handleToolbarFilterChange}
          loading={loading}
          filters={filters}
        />

        <CalendarView
          events={events}
          onDateSelect={handleDateSelect}
          onEventClick={handleEventClick}
          viewMode={viewMode}
          loading={loading}
          error={error}
          selectedDate={currentDate}
          className="main-calendar"
        />

        <EventDetailModal
          visible={eventDetailVisible}
          onClose={() => setEventDetailVisible(false)}
          event={selectedEvent}
          eventType={eventType}
          onAction={handleEventAction}
        />
      </Content>

      <style>{`
        .schedule-calendar-page {
          padding: 24px;
          background-color: #f5f5f5;
          min-height: 100vh;
        }

        .page-header {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }

        .statistics-cards {
          margin-bottom: 24px;
        }

        .stat-card {
          min-width: 160px;
        }

        .stat-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-icon {
          font-size: 24px;
          padding: 8px;
          border-radius: 8px;
        }

        .stat-icon.total {
          color: #1890ff;
          background-color: #e6f7ff;
        }

        .stat-icon.working {
          color: #52c41a;
          background-color: #f6ffed;
        }

        .stat-icon.timeoff {
          color: #ff4d4f;
          background-color: #fff2f0;
        }

        .stat-icon.available {
          color: #8c8c8c;
          background-color: #f5f5f5;
        }

        .stat-number {
          font-size: 20px;
          font-weight: bold;
          color: #262626;
        }

        .main-calendar {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .schedule-calendar-page {
            padding: 16px;
          }

          .page-header {
            padding: 16px;
          }

          .statistics-cards {
            overflow-x: auto;
          }

          .stat-card {
            min-width: 140px;
          }
        }
      `}</style>
    </Layout>
  );
};

export default ScheduleCalendar;