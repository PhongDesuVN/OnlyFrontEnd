import React from 'react';
import { Modal, Descriptions, Tag, Space, Button, Divider, Typography } from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  getWorkStatusLabel, 
  getShiftAssignmentStatusLabel, 
  getTimeOffStatusLabel 
} from '../../../utils/scheduleUtils.js';

const { Title, Text } = Typography;

/**
 * EventDetailModal component for displaying detailed event information
 */
const EventDetailModal = ({ 
  visible, 
  onClose, 
  event, 
  eventType,
  onAction
}) => {
  if (!event) return null;

  const getModalTitle = () => {
    switch (eventType) {
      case 'order':
        return `Chi tiết đơn hàng #${event.bookingId}`;
      case 'shift':
        return `Chi tiết ca làm việc: ${event.shiftName}`;
      case 'timeoff':
        return 'Chi tiết đơn xin nghỉ phép';
      default:
        return 'Chi tiết sự kiện';
    }
  };

  const getStatusColor = (status, type) => {
    if (type === 'order') {
      const colors = {
        'PENDING': 'orange',
        'CONFIRMED': 'blue',
        'IN_PROGRESS': 'cyan',
        'COMPLETED': 'green',
        'CANCELLED': 'red',
        'DELIVERED': 'success'
      };
      return colors[status] || 'default';
    }
    
    if (type === 'shift') {
      const colors = {
        'ASSIGNED': 'blue',
        'COMPLETED': 'green',
        'CANCELLED': 'red'
      };
      return colors[status] || 'default';
    }
    
    if (type === 'timeoff') {
      const colors = {
        'PENDING': 'orange',
        'APPROVED': 'green',
        'REJECTED': 'red'
      };
      return colors[status] || 'default';
    }
    
    return 'default';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const renderOrderDetails = () => (
    <Descriptions column={1} bordered size="small">
      <Descriptions.Item 
        label={<><UserOutlined className="mr-1" />Khách hàng</>}
      >
        {event.customerName}
      </Descriptions.Item>
      
      <Descriptions.Item 
        label={<><ClockCircleOutlined className="mr-1" />Thời gian giao hàng</>}
      >
        {event.deliveryTime}
      </Descriptions.Item>
      
      <Descriptions.Item 
        label={<><EnvironmentOutlined className="mr-1" />Điểm lấy hàng</>}
      >
        {event.pickupLocation}
      </Descriptions.Item>
      
      <Descriptions.Item 
        label={<><EnvironmentOutlined className="mr-1" />Điểm giao hàng</>}
      >
        {event.deliveryLocation}
      </Descriptions.Item>
      
      <Descriptions.Item 
        label={<><FileTextOutlined className="mr-1" />Trạng thái</>}
      >
        <Tag color={getStatusColor(event.status, 'order')}>
          {event.status}
        </Tag>
      </Descriptions.Item>
      
      {event.total && (
        <Descriptions.Item 
          label={<><DollarOutlined className="mr-1" />Tổng tiền</>}
        >
          <Text strong className="text-green-600">
            {formatCurrency(event.total)}
          </Text>
        </Descriptions.Item>
      )}
    </Descriptions>
  );

  const renderShiftDetails = () => (
    <Descriptions column={1} bordered size="small">
      <Descriptions.Item 
        label={<><CalendarOutlined className="mr-1" />Tên ca làm việc</>}
      >
        {event.shiftName}
      </Descriptions.Item>
      
      <Descriptions.Item 
        label={<><ClockCircleOutlined className="mr-1" />Thời gian bắt đầu</>}
      >
        {event.startTime}
      </Descriptions.Item>
      
      <Descriptions.Item 
        label={<><ClockCircleOutlined className="mr-1" />Thời gian kết thúc</>}
      >
        {event.endTime}
      </Descriptions.Item>
      
      <Descriptions.Item 
        label={<><FileTextOutlined className="mr-1" />Trạng thái</>}
      >
        <Tag color={getStatusColor(event.status, 'shift')}>
          {getShiftAssignmentStatusLabel(event.status)}
        </Tag>
      </Descriptions.Item>
    </Descriptions>
  );

  const renderTimeOffDetails = () => (
    <Descriptions column={1} bordered size="small">
      <Descriptions.Item 
        label={<><UserOutlined className="mr-1" />Nhân viên</>}
      >
        {event.operatorName}
      </Descriptions.Item>
      
      <Descriptions.Item 
        label={<><CalendarOutlined className="mr-1" />Ngày bắt đầu</>}
      >
        {format(parseISO(event.startDate), 'dd/MM/yyyy', { locale: vi })}
      </Descriptions.Item>
      
      <Descriptions.Item 
        label={<><CalendarOutlined className="mr-1" />Ngày kết thúc</>}
      >
        {format(parseISO(event.endDate), 'dd/MM/yyyy', { locale: vi })}
      </Descriptions.Item>
      
      <Descriptions.Item 
        label={<><FileTextOutlined className="mr-1" />Lý do</>}
      >
        {event.reason}
      </Descriptions.Item>
      
      <Descriptions.Item 
        label={<><FileTextOutlined className="mr-1" />Trạng thái</>}
      >
        <Tag color={getStatusColor(event.status, 'timeoff')}>
          {getTimeOffStatusLabel(event.status)}
        </Tag>
      </Descriptions.Item>
      
      {event.totalDays && (
        <Descriptions.Item 
          label={<><ClockCircleOutlined className="mr-1" />Tổng số ngày</>}
        >
          {event.totalDays} ngày
        </Descriptions.Item>
      )}
      
      {event.managerComments && (
        <Descriptions.Item 
          label={<><FileTextOutlined className="mr-1" />Nhận xét của quản lý</>}
        >
          {event.managerComments}
        </Descriptions.Item>
      )}
      
      {event.reviewedByName && (
        <Descriptions.Item 
          label={<><UserOutlined className="mr-1" />Người duyệt</>}
        >
          {event.reviewedByName}
        </Descriptions.Item>
      )}
    </Descriptions>
  );

  const renderActionButtons = () => {
    const buttons = [];
    
    if (eventType === 'timeoff' && event.status === 'PENDING') {
      buttons.push(
        <Button 
          key="approve" 
          type="primary" 
          icon={<CheckCircleOutlined />}
          onClick={() => onAction?.('approve', event)}
        >
          Duyệt
        </Button>
      );
      buttons.push(
        <Button 
          key="reject" 
          danger 
          icon={<CloseCircleOutlined />}
          onClick={() => onAction?.('reject', event)}
        >
          Từ chối
        </Button>
      );
    }
    
    if (eventType === 'shift' && event.status === 'ASSIGNED') {
      buttons.push(
        <Button 
          key="complete" 
          type="primary" 
          icon={<CheckCircleOutlined />}
          onClick={() => onAction?.('complete', event)}
        >
          Hoàn thành
        </Button>
      );
      buttons.push(
        <Button 
          key="cancel" 
          danger 
          icon={<CloseCircleOutlined />}
          onClick={() => onAction?.('cancel', event)}
        >
          Hủy ca
        </Button>
      );
    }
    
    return buttons;
  };

  const renderContent = () => {
    switch (eventType) {
      case 'order':
        return renderOrderDetails();
      case 'shift':
        return renderShiftDetails();
      case 'timeoff':
        return renderTimeOffDetails();
      default:
        return <Text>Không có thông tin chi tiết</Text>;
    }
  };

  const actionButtons = renderActionButtons();

  return (
    <Modal
      title={getModalTitle()}
      open={visible}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        ...actionButtons
      ]}
    >
      <div className="event-detail-content">
        {renderContent()}
        
        {event.hasConflicts && (
          <>
            <Divider />
            <div className="conflict-warning">
              <Text type="warning">
                <FileTextOutlined className="mr-1" />
                Cảnh báo xung đột: {event.conflictDetails}
              </Text>
            </div>
          </>
        )}
      </div>
      
      <style>{`
        .event-detail-content {
          max-height: 60vh;
          overflow-y: auto;
        }
        
        .conflict-warning {
          padding: 12px;
          background-color: #fff7e6;
          border: 1px solid #ffd591;
          border-radius: 6px;
        }
      `}</style>
    </Modal>
  );
};

export default EventDetailModal;