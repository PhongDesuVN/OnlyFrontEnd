import React from 'react';
import { Space, Button, Select, DatePicker, Typography, Tooltip } from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  CalendarOutlined,
  ReloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

/**
 * CalendarToolbar component for calendar navigation and controls
 */
const CalendarToolbar = ({
  currentDate,
  viewMode = 'month',
  onDateChange,
  onViewModeChange,
  onRefresh,
  onFilterChange,
  loading = false,
  showFilters = true,
  filters = {},
  className = ''
}) => {
  const getDateTitle = () => {
    switch (viewMode) {
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: vi });
      case 'week':
        return `Tuần ${format(currentDate, 'w, MMMM yyyy', { locale: vi })}`;
      case 'day':
        return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: vi });
      default:
        return format(currentDate, 'MMMM yyyy', { locale: vi });
    }
  };

  const handlePrevious = () => {
    let newDate;
    switch (viewMode) {
      case 'month':
        newDate = subMonths(currentDate, 1);
        break;
      case 'week':
        newDate = subWeeks(currentDate, 1);
        break;
      case 'day':
        newDate = subDays(currentDate, 1);
        break;
      default:
        newDate = subMonths(currentDate, 1);
    }
    onDateChange?.(newDate);
  };

  const handleNext = () => {
    let newDate;
    switch (viewMode) {
      case 'month':
        newDate = addMonths(currentDate, 1);
        break;
      case 'week':
        newDate = addWeeks(currentDate, 1);
        break;
      case 'day':
        newDate = addDays(currentDate, 1);
        break;
      default:
        newDate = addMonths(currentDate, 1);
    }
    onDateChange?.(newDate);
  };

  const handleToday = () => {
    onDateChange?.(new Date());
  };

  const handleDatePickerChange = (date) => {
    if (date) {
      onDateChange?.(date.toDate ? date.toDate() : new Date(date));
    }
  };

  const handleViewModeChange = (mode) => {
    onViewModeChange?.(mode);
  };

  const handleStatusFilterChange = (status) => {
    onFilterChange?.({ ...filters, status });
  };

  const handleOperatorFilterChange = (operatorId) => {
    onFilterChange?.({ ...filters, operatorId });
  };

  return (
    <div className={`calendar-toolbar ${className}`}>
      <div className="toolbar-main">
        <div className="toolbar-left">
          <Space size="middle">
            {/* Navigation Controls */}
            <Space.Compact>
              <Button 
                icon={<LeftOutlined />} 
                onClick={handlePrevious}
                disabled={loading}
              />
              <Button 
                onClick={handleToday}
                disabled={loading}
              >
                Hôm nay
              </Button>
              <Button 
                icon={<RightOutlined />} 
                onClick={handleNext}
                disabled={loading}
              />
            </Space.Compact>

            {/* Date Picker */}
            <DatePicker
              value={currentDate ? dayjs(currentDate) : null}
              onChange={handleDatePickerChange}
              picker={viewMode === 'month' ? 'month' : 'date'}
              format={viewMode === 'month' ? 'MM/YYYY' : 'DD/MM/YYYY'}
              placeholder="Chọn ngày"
              disabled={loading}
            />

            {/* Refresh Button */}
            <Tooltip title="Làm mới dữ liệu">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={onRefresh}
                loading={loading}
              />
            </Tooltip>
          </Space>
        </div>

        <div className="toolbar-center">
          <Title level={3} className="date-title">
            {getDateTitle()}
          </Title>
        </div>

        <div className="toolbar-right">
          <Space>
            {/* View Mode Selector */}
            <Select
              value={viewMode}
              onChange={handleViewModeChange}
              disabled={loading}
              style={{ width: 120 }}
            >
              <Option value="month">Tháng</Option>
              <Option value="week">Tuần</Option>
              <Option value="day">Ngày</Option>
            </Select>

            {/* Filters */}
            {showFilters && (
              <Space>
                <Tooltip title="Bộ lọc">
                  <FilterOutlined className="filter-icon" />
                </Tooltip>
                
                <Select
                  placeholder="Trạng thái"
                  value={filters.status}
                  onChange={handleStatusFilterChange}
                  allowClear
                  style={{ width: 120 }}
                  disabled={loading}
                >
                  <Option value="WORKING">Đang làm việc</Option>
                  <Option value="TIME_OFF">Nghỉ phép</Option>
                  <Option value="AVAILABLE">Có thể làm việc</Option>
                </Select>

                <Select
                  placeholder="Nhân viên"
                  value={filters.operatorId}
                  onChange={handleOperatorFilterChange}
                  allowClear
                  style={{ width: 150 }}
                  disabled={loading}
                >
                  {/* Options will be populated by parent component */}
                </Select>
              </Space>
            )}
          </Space>
        </div>
      </div>

      <style>{`
        .calendar-toolbar {
          background: white;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 16px;
        }
        
        .toolbar-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .toolbar-left {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 300px;
        }
        
        .toolbar-center {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          min-width: 200px;
        }
        
        .toolbar-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex: 1;
          min-width: 300px;
        }
        
        .date-title {
          margin: 0;
          text-align: center;
          color: #1890ff;
          font-weight: 600;
        }
        
        .filter-icon {
          color: #8c8c8c;
          font-size: 16px;
        }
        
        @media (max-width: 768px) {
          .toolbar-main {
            flex-direction: column;
            align-items: stretch;
          }
          
          .toolbar-left,
          .toolbar-center,
          .toolbar-right {
            justify-content: center;
            min-width: auto;
          }
          
          .date-title {
            font-size: 18px;
          }
        }
        
        @media (max-width: 480px) {
          .calendar-toolbar {
            padding: 12px 16px;
          }
          
          .toolbar-main {
            gap: 12px;
          }
          
          .date-title {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default CalendarToolbar;