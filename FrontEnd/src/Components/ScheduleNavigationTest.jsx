import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Space, Button, Typography } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * Test component to verify schedule management navigation is working
 * This component can be temporarily added to test the routing
 */
const ScheduleNavigationTest = () => {
  return (
    <Card title="Schedule Management Navigation Test" style={{ margin: '20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={4}>Schedule Management Routes</Title>
          <Text type="secondary">Test the schedule management navigation links:</Text>
        </div>
        
        <Space wrap>
          <Link to="/schedule/calendar">
            <Button type="primary" icon={<CalendarOutlined />}>
              Schedule Calendar
            </Button>
          </Link>
          
          <Link to="/schedule/shifts">
            <Button type="default" icon={<ClockCircleOutlined />}>
              Shift Management (Manager Only)
            </Button>
          </Link>
          
          <Link to="/schedule/timeoff">
            <Button type="default" icon={<UserOutlined />}>
              Time Off Requests
            </Button>
          </Link>
        </Space>
        
        <div>
          <Title level={5}>Role-based Access Control</Title>
          <ul>
            <li><strong>Schedule Calendar:</strong> STAFF and MANAGER roles</li>
            <li><strong>Shift Management:</strong> MANAGER role only</li>
            <li><strong>Time Off Requests:</strong> STAFF and MANAGER roles</li>
          </ul>
        </div>
        
        <div>
          <Title level={5}>Navigation Integration</Title>
          <ul>
            <li>✅ Added to Staff sidebar navigation with submenu</li>
            <li>✅ Added to Manager dashboard quick actions</li>
            <li>✅ Role-based route protection implemented</li>
            <li>✅ Proper error messages for unauthorized access</li>
          </ul>
        </div>
      </Space>
    </Card>
  );
};

export default ScheduleNavigationTest;