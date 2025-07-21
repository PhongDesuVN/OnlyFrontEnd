import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Layout,
  Card,
  Table,
  Button,
  Space,
  Typography,
  message,
  Modal,
  Tag,
  Tooltip,
  Input,
  Select,
  DatePicker,
  Popconfirm,
  Alert,
  Spin,
  Row,
  Col,
  Statistic,
  Tabs,
  Badge,
  Divider,
  Form
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  ReloadOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  FilterOutlined,
  EyeOutlined,
  CommentOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { safeDayjs, safeFormat, safeUnix } from '../../utils/dateUtils.js';
import Cookies from 'js-cookie';
import timeOffService from '../../Services/timeOffService.js';
import userService from '../../Services/userService.js';
import TimeOffForm from './components/TimeOffForm.jsx';
import NotificationBadge from './components/NotificationBadge.jsx';
import { 
  TimeOffStatusEnum, 
  TimeOffStatusLabels,
  ValidationRules 
} from '../../types/scheduleTypes.js';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { TextArea } = Input;

/**
 * TimeOffRequests component for managing time-off requests
 * Supports both operator view (submit/view requests) and manager view (approve/reject)
 */
const TimeOffRequests = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [timeOffRequests, setTimeOffRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [bulkApprovalVisible, setBulkApprovalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [timeOffFormVisible, setTimeOffFormVisible] = useState(false);
  const [approvalForm] = Form.useForm();
  const [bulkForm] = Form.useForm();
  const [userId, setUserId] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    status: 'ALL',
    dateRange: null,
    searchText: '',
    operatorId: null
  });

  // Get current user info
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        let userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        // Nếu không có operatorId/userId, gọi API lấy profile
        if ( !userInfo.userId) {
          setUserId(userInfo.userId);
          // Giả sử có API userService.getProfile()
          try {
            const profile = await userService.getProfile();
            console.log('profile', profile);
            userInfo = { ...userInfo, ...profile };
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
          } catch (e) {
            console.error('Không thể lấy profile user:', e);
          }
        }
        setCurrentUser(userInfo);
      } catch (error) {
        console.error('Error getting user info:', error);
      }
    };
    getUserInfo();
  }, []);

  // Load data on component mount
  useEffect(() => {
    if (currentUser) {
      loadTimeOffRequests();
      loadStatistics();
    }
  }, [currentUser]);

  // Apply filters when filter state changes
  useEffect(() => {
    applyFilters();
  }, [timeOffRequests, filters]);

  // Check if current user is manager
  const isManager = useMemo(() => {
    return currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN';
  }, [currentUser]);

  // Load time-off requests based on user role
  const loadTimeOffRequests = useCallback(async () => {
    try {
      setLoading(true);
      let requests = [];

      if (isManager) {
        // Nếu có filter ngày thì gọi API range, không thì chỉ lấy pending
        if (filters.dateRange && filters.dateRange.length === 2) {
          const [startDate, endDate] = filters.dateRange;
          requests = await timeOffService.getManagerTimeOffRequestsByDateRange(startDate, endDate);
        } else {
          requests = await timeOffService.getPendingTimeOffRequests();
        }
      } else {
        requests = await timeOffService.getOperatorTimeOffRequests();
      }

      setTimeOffRequests(requests);
    } catch (error) {
      console.error('Error loading time-off requests:', error);
      message.error('Không thể tải danh sách yêu cầu nghỉ phép');
    } finally {
      setLoading(false);
    }
  }, [isManager, currentUser, filters.dateRange]);

  // Load statistics (only for managers)
  const loadStatistics = useCallback(async () => {
    // Only load statistics if user is a manager
    if (!isManager) {
      console.log('Skipping statistics load - user is not a manager');
      return;
    }
    
    try {
      const stats = await timeOffService.getTimeOffStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
      // Don't show error message for statistics as it's not critical
    }
  }, [isManager]);

  // Apply filters to requests
  const applyFilters = useCallback(() => {
    let filtered = [...timeOffRequests];

    // Filter by status
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(request => request.status === filters.status);
    }

    // Filter by date range
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter(request => {
        const requestDate = safeDayjs(request.requestDate);
        if (!requestDate) return false;
        return requestDate.isAfter(startDate.startOf('day')) && 
               requestDate.isBefore(endDate.endOf('day'));
      });
    }

    // Filter by search text (operator name, reason)
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(request => 
        (request.operatorName || '').toLowerCase().includes(searchLower) ||
        (request.reason || '').toLowerCase().includes(searchLower)
      );
    }

    // Filter by operator (manager view)
    if (filters.operatorId) {
      filtered = filtered.filter(request => request.operatorId === filters.operatorId);
    }

    setFilteredRequests(filtered);
  }, [timeOffRequests, filters]);

  // Handle request approval
  const handleApproveRequest = useCallback(async (requestId, approvalData) => {
    try {
      await timeOffService.approveTimeOffRequest(requestId, {
        managerId: currentUser.managerId || currentUser.userId,
        managerComments: approvalData.comments || ''
      });
      message.success('Đã duyệt yêu cầu nghỉ phép');
      loadTimeOffRequests();
      loadStatistics();
    } catch (error) {
      console.error('Error approving request:', error);
      message.error('Không thể duyệt yêu cầu nghỉ phép');
    }
  }, [currentUser, loadTimeOffRequests, loadStatistics]);

  // Handle request rejection
  const handleRejectRequest = useCallback(async (requestId, rejectionData) => {
    try {
      await timeOffService.rejectTimeOffRequest(requestId, {
        managerId: currentUser.managerId || currentUser.userId,
        managerComments: rejectionData.comments || ''
      });
      message.success('Đã từ chối yêu cầu nghỉ phép');
      loadTimeOffRequests();
      loadStatistics();
    } catch (error) {
      console.error('Error rejecting request:', error);
      message.error('Không thể từ chối yêu cầu nghỉ phép');
    }
  }, [currentUser, loadTimeOffRequests, loadStatistics]);

  // Handle bulk approval
  const handleBulkApproval = useCallback(async (values) => {
    try {
      await timeOffService.bulkApproveTimeOffRequests({
        requestIds: selectedRowKeys,
        managerId: currentUser.managerId || currentUser.userId,
        managerComments: values.comments || ''
      });
      message.success(`Đã duyệt ${selectedRowKeys.length} yêu cầu nghỉ phép`);
      setSelectedRowKeys([]);
      setBulkApprovalVisible(false);
      bulkForm.resetFields();
      loadTimeOffRequests();
      loadStatistics();
    } catch (error) {
      console.error('Error in bulk approval:', error);
      message.error('Không thể duyệt hàng loạt yêu cầu nghỉ phép');
    }
  }, [selectedRowKeys, currentUser, bulkForm, loadTimeOffRequests, loadStatistics]);

  // Handle request cancellation (operator only)
  const handleCancelRequest = useCallback(async (requestId) => {
    try {
      await timeOffService.cancelTimeOffRequest(requestId);
      message.success('Đã hủy yêu cầu nghỉ phép');
      loadTimeOffRequests();
      loadStatistics();
    } catch (error) {
      console.error('Error cancelling request:', error);
      message.error('Không thể hủy yêu cầu nghỉ phép');
    }
  }, [currentUser, loadTimeOffRequests, loadStatistics]);

  // Show request details
  const showRequestDetails = useCallback((request) => {
    setSelectedRequest(request);
    setDetailModalVisible(true);
  }, []);

  // Show approval modal
  const showApprovalModal = useCallback((request, isApproval = true) => {
    setSelectedRequest({ ...request, isApproval });
    setApprovalModalVisible(true);
    approvalForm.resetFields();
  }, [approvalForm]);

  // Handle approval form submission
  const handleApprovalSubmit = useCallback(async () => {
    try {
      const values = await approvalForm.validateFields();
      if (selectedRequest.isApproval) {
        await handleApproveRequest(selectedRequest.requestId, values);
      } else {
        await handleRejectRequest(selectedRequest.requestId, values);
      }
      setApprovalModalVisible(false);
      approvalForm.resetFields();
    } catch (error) {
      console.error('Error in approval form:', error);
    }
  }, [selectedRequest, approvalForm, handleApproveRequest, handleRejectRequest]);

  // Get status tag color
  const getStatusTagColor = useCallback((status) => {
    switch (status) {
      case TimeOffStatusEnum.PENDING:
        return 'orange';
      case TimeOffStatusEnum.APPROVED:
        return 'green';
      case TimeOffStatusEnum.REJECTED:
        return 'red';
      default:
        return 'default';
    }
  }, []);

  // Table columns configuration
  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: 'Nhân viên',
        dataIndex: 'operatorName',
        key: 'operatorName',
        render: (text, record) => (
          <Space direction="vertical" size="small">
            <Text strong>{text}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.operatorEmail}
            </Text>
          </Space>
        ),
        sorter: (a, b) => (a.operatorName || '').localeCompare(b.operatorName || ''),
      },
      {
        title: 'Thời gian nghỉ',
        key: 'timeRange',
        render: (_, record) => (
          <Space direction="vertical" size="small">
            <Text>
              <CalendarOutlined className="mr-1" />
              {safeFormat(record.startDate, 'DD/MM/YYYY')} - {safeFormat(record.endDate, 'DD/MM/YYYY')}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.totalDays} ngày
            </Text>
          </Space>
        ),
        sorter: (a, b) => safeUnix(a.startDate) - safeUnix(b.startDate),
      },
      {
        title: 'Lý do',
        dataIndex: 'reason',
        key: 'reason',
        ellipsis: {
          showTitle: false,
        },
        render: (text) => (
          <Tooltip title={text}>
            <Text style={{ maxWidth: 200 }}>{text}</Text>
          </Tooltip>
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
          <Tag color={getStatusTagColor(status)}>
            {TimeOffStatusLabels[status] || status}
          </Tag>
        ),
        filters: [
          { text: 'Chờ duyệt', value: TimeOffStatusEnum.PENDING },
          { text: 'Đã duyệt', value: TimeOffStatusEnum.APPROVED },
          { text: 'Từ chối', value: TimeOffStatusEnum.REJECTED },
        ],
        onFilter: (value, record) => record.status === value,
      },
      {
        title: 'Ngày yêu cầu',
        dataIndex: 'requestDate',
        key: 'requestDate',
        render: (date) => safeFormat(date, 'DD/MM/YYYY HH:mm'),
        sorter: (a, b) => safeUnix(a.requestDate) - safeUnix(b.requestDate),
      }
    ];

    // Add action column
    const actionColumn = {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showRequestDetails(record)}
            />
          </Tooltip>
          
          {isManager && record.status === TimeOffStatusEnum.PENDING && (
            <>
              <Tooltip title="Duyệt">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  style={{ color: '#52c41a' }}
                  onClick={() => showApprovalModal(record, true)}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  style={{ color: '#ff4d4f' }}
                  onClick={() => showApprovalModal(record, false)}
                />
              </Tooltip>
            </>
          )}
          
          {!isManager && record.status === TimeOffStatusEnum.PENDING && (
            <Popconfirm
              title="Bạn có chắc chắn muốn hủy yêu cầu này?"
              onConfirm={() => handleCancelRequest(record.requestId)}
              okText="Có"
              cancelText="Không"
            >
              <Tooltip title="Hủy yêu cầu">
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  style={{ color: '#ff4d4f' }}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    };

    return [...baseColumns, actionColumn];
  }, [isManager, getStatusTagColor, showRequestDetails, showApprovalModal, handleCancelRequest]);

  // Row selection for bulk operations (manager only)
  const rowSelection = useMemo(() => {
    if (!isManager) return null;

    return {
      selectedRowKeys,
      onChange: setSelectedRowKeys,
      getCheckboxProps: (record) => ({
        disabled: record.status !== TimeOffStatusEnum.PENDING,
      }),
    };
  }, [isManager, selectedRowKeys]);

  // Render statistics cards
  const renderStatistics = () => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic
            title="Tổng yêu cầu"
            value={statistics.totalRequests || 0}
            prefix={<FileTextOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Chờ duyệt"
            value={statistics.pendingRequests || 0}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Đã duyệt"
            value={statistics.approvedRequests || 0}
            prefix={<CheckOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Từ chối"
            value={statistics.rejectedRequests || 0}
            prefix={<CloseOutlined />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render filter controls
  const renderFilters = () => (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={16} align="middle">
        <Col span={6}>
          <Input
            placeholder="Tìm kiếm theo tên nhân viên hoặc lý do..."
            prefix={<SearchOutlined />}
            value={filters.searchText}
            onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
            allowClear
          />
        </Col>
        <Col span={4}>
          <Select
            placeholder="Trạng thái"
            value={filters.status}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            style={{ width: '100%' }}
          >
            <Option value="ALL">Tất cả</Option>
            <Option value={TimeOffStatusEnum.PENDING}>Chờ duyệt</Option>
            <Option value={TimeOffStatusEnum.APPROVED}>Đã duyệt</Option>
            <Option value={TimeOffStatusEnum.REJECTED}>Từ chối</Option>
          </Select>
        </Col>
        <Col span={6}>
          <RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            value={filters.dateRange}
            onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={3}>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadTimeOffRequests}
            loading={loading}
          >
            Làm mới
          </Button>
        </Col>
        {!isManager && (
          <Col span={3}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setTimeOffFormVisible(true)}
            >
              Tạo yêu cầu
            </Button>
          </Col>
        )}
        {isManager && selectedRowKeys.length > 0 && (
          <Col span={4}>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => setBulkApprovalVisible(true)}
            >
              Duyệt hàng loạt ({selectedRowKeys.length})
            </Button>
          </Col>
        )}
      </Row>
    </Card>
  );

  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Title level={2}>
                <CalendarOutlined className="mr-2" />
                Quản lý yêu cầu nghỉ phép
              </Title>
              <Text type="secondary">
                {isManager 
                  ? 'Quản lý và duyệt yêu cầu nghỉ phép của nhân viên'
                  : 'Xem và quản lý yêu cầu nghỉ phép của bạn'
                }
              </Text>
            </div>
            {currentUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Text type="secondary">Thông báo lịch làm việc:</Text>
                <NotificationBadge
                  operatorId={currentUser.operatorId || currentUser.userId}
                  showIcon={true}
                  size="default"
                  onNotificationCountChange={(count) => {
                    console.log('Schedule notification count changed:', count);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {isManager && renderStatistics()}
        {renderFilters()}

        <Card>
          <Table
            columns={columns}
            dataSource={filteredRequests}
            rowKey="requestId"
            loading={loading}
            rowSelection={rowSelection}
            scroll={{ x: 1200 }}
            pagination={{
              total: filteredRequests.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} của ${total} yêu cầu`,
            }}
          />
        </Card>

        {/* Request Detail Modal */}
        <Modal
          title={
            <Space>
              <FileTextOutlined />
              Chi tiết yêu cầu nghỉ phép
            </Space>
          }
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>
          ]}
          width={600}
        >
          {selectedRequest && (
            <div>
              <Row gutter={16}>
                <Col span={12}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text strong>Nhân viên:</Text>
                    <Text>{selectedRequest.operatorName}</Text>
                    <Text type="secondary">{selectedRequest.operatorEmail}</Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text strong>Trạng thái:</Text>
                    <Tag color={getStatusTagColor(selectedRequest.status)}>
                      {TimeOffStatusLabels[selectedRequest.status]}
                    </Tag>
                  </Space>
                </Col>
              </Row>
              
              <Divider />
              
              <Row gutter={16}>
                <Col span={12}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text strong>Ngày bắt đầu:</Text>
                    <Text>{safeFormat(selectedRequest.startDate, 'DD/MM/YYYY')}</Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text strong>Ngày kết thúc:</Text>
                    <Text>{safeFormat(selectedRequest.endDate, 'DD/MM/YYYY')}</Text>
                  </Space>
                </Col>
              </Row>
              
              <Divider />
              
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text strong>Lý do nghỉ phép:</Text>
                <Text>{selectedRequest.reason}</Text>
              </Space>
              
              {selectedRequest.managerComments && (
                <>
                  <Divider />
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text strong>Nhận xét của quản lý:</Text>
                    <Text>{selectedRequest.managerComments}</Text>
                  </Space>
                </>
              )}
              
              <Divider />
              
              <Row gutter={16}>
                <Col span={12}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text strong>Ngày yêu cầu:</Text>
                    <Text>{safeFormat(selectedRequest.requestDate, 'DD/MM/YYYY HH:mm')}</Text>
                  </Space>
                </Col>
                {selectedRequest.reviewedDate && (
                  <Col span={12}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Text strong>Ngày duyệt:</Text>
                      <Text>{safeFormat(selectedRequest.reviewedDate, 'DD/MM/YYYY HH:mm')}</Text>
                    </Space>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </Modal>

        {/* Approval/Rejection Modal */}
        <Modal
          title={
            <Space>
              <CommentOutlined />
              {selectedRequest?.isApproval ? 'Duyệt yêu cầu nghỉ phép' : 'Từ chối yêu cầu nghỉ phép'}
            </Space>
          }
          open={approvalModalVisible}
          onCancel={() => setApprovalModalVisible(false)}
          onOk={handleApprovalSubmit}
          okText={selectedRequest?.isApproval ? 'Duyệt' : 'Từ chối'}
          cancelText="Hủy"
          okButtonProps={{
            type: selectedRequest?.isApproval ? 'primary' : 'danger'
          }}
        >
          <Form form={approvalForm} layout="vertical">
            <Form.Item
              name="comments"
              label="Nhận xét (tùy chọn)"
            >
              <TextArea
                rows={4}
                placeholder="Nhập nhận xét của bạn..."
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Bulk Approval Modal */}
        <Modal
          title={
            <Space>
              <CheckOutlined />
              Duyệt hàng loạt yêu cầu nghỉ phép
            </Space>
          }
          open={bulkApprovalVisible}
          onCancel={() => setBulkApprovalVisible(false)}
          onOk={() => bulkForm.submit()}
          okText="Duyệt tất cả"
          cancelText="Hủy"
        >
          <Alert
            message={`Bạn đang duyệt ${selectedRowKeys.length} yêu cầu nghỉ phép`}
            type="info"
            style={{ marginBottom: 16 }}
          />
          <Form form={bulkForm} layout="vertical" onFinish={handleBulkApproval}>
            <Form.Item
              name="comments"
              label="Nhận xét chung (tùy chọn)"
            >
              <TextArea
                rows={4}
                placeholder="Nhập nhận xét chung cho tất cả yêu cầu..."
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Time-off Request Form */}
        <TimeOffForm
          visible={timeOffFormVisible}
          onCancel={() => setTimeOffFormVisible(false)}
          onSuccess={() => {
            loadTimeOffRequests();
            loadStatistics();
          }}
          currentUser={currentUser}
        />
      </Content>
    </Layout>
  );
};

export default TimeOffRequests;