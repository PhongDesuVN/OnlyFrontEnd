import React from 'react';
import { Card, Tag, Typography, Space, Divider, Button } from 'antd';
import { 
  CalendarOutlined, 
  EnvironmentOutlined, 
  UserOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

const { Text, Title } = Typography;

/**
 * OrderCard component for displaying order details in calendar
 */
const OrderCard = ({ 
  order, 
  onViewDetails, 
  showActions = true,
  compact = false 
}) => {
  if (!order) return null;

  const getStatusColor = (status) => {
    const statusColors = {
      'PENDING': 'orange',
      'CONFIRMED': 'blue',
      'IN_PROGRESS': 'cyan',
      'COMPLETED': 'green',
      'CANCELLED': 'red',
      'DELIVERED': 'success'
    };
    return statusColors[status] || 'default';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'PENDING': 'Chờ xử lý',
      'CONFIRMED': 'Đã xác nhận',
      'IN_PROGRESS': 'Đang thực hiện',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
      'DELIVERED': 'Đã giao hàng'
    };
    return statusTexts[status] || status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (compact) {
    return (
      <Card 
        size="small" 
        className="order-card-compact"
        hoverable
        onClick={() => onViewDetails?.(order)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarOutlined className="text-blue-500" />
            <Text strong>#{order.bookingId}</Text>
            <Text type="secondary">{order.customerName}</Text>
          </div>
          <div className="flex items-center space-x-2">
            <Text className="text-xs">{order.deliveryTime}</Text>
            <Tag color={getStatusColor(order.status)} size="small">
              {getStatusText(order.status)}
            </Tag>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="order-card"
      hoverable
      actions={showActions ? [
        <Button 
          key="view" 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => onViewDetails?.(order)}
        >
          Xem chi tiết
        </Button>
      ] : []}
    >
      <div className="order-header">
        <div className="flex items-center justify-between mb-3">
          <Title level={5} className="mb-0">
            <CalendarOutlined className="mr-2 text-blue-500" />
            Đơn hàng #{order.bookingId}
          </Title>
          <Tag color={getStatusColor(order.status)}>
            {getStatusText(order.status)}
          </Tag>
        </div>
      </div>

      <Space direction="vertical" size="small" className="w-full">
        {/* Customer Information */}
        <div className="flex items-center">
          <UserOutlined className="mr-2 text-gray-500" />
          <Text strong>{order.customerName}</Text>
        </div>

        {/* Delivery Time */}
        <div className="flex items-center">
          <ClockCircleOutlined className="mr-2 text-gray-500" />
          <Text>Thời gian giao hàng: {order.deliveryTime}</Text>
        </div>

        {/* Locations */}
        <div className="space-y-1">
          <div className="flex items-start">
            <EnvironmentOutlined className="mr-2 text-green-500 mt-1" />
            <div>
              <Text type="secondary" className="text-xs">Điểm lấy hàng:</Text>
              <br />
              <Text className="text-sm">{order.pickupLocation}</Text>
            </div>
          </div>
          <div className="flex items-start">
            <EnvironmentOutlined className="mr-2 text-red-500 mt-1" />
            <div>
              <Text type="secondary" className="text-xs">Điểm giao hàng:</Text>
              <br />
              <Text className="text-sm">{order.deliveryLocation}</Text>
            </div>
          </div>
        </div>

        {/* Total Amount */}
        {order.total && (
          <>
            <Divider className="my-2" />
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarOutlined className="mr-2 text-green-500" />
                <Text>Tổng tiền:</Text>
              </div>
              <Text strong className="text-green-600">
                {formatCurrency(order.total)}
              </Text>
            </div>
          </>
        )}
      </Space>

      <style>{`
        .order-card {
          margin-bottom: 8px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .order-card:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .order-card-compact {
          margin-bottom: 4px;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .order-card-compact:hover {
          border-color: #1890ff;
        }
        
        .order-header {
          margin-bottom: 12px;
        }
      `}</style>
    </Card>
  );
};

export default OrderCard;