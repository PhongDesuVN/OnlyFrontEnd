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
  Statistic
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  CalendarOutlined,
  UserAddOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import shiftService from '../../Services/shiftService.js';
import userService from '../../Services/userService.js';
import { ShiftAssignmentStatusLabels, EventColors } from '../../types/scheduleTypes.js';
import ShiftForm from './components/ShiftForm.jsx';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * ShiftManagement page component
 * Provides comprehensive shift management with CRUD operations, operator assignments, and statistics
 */
const ShiftManagement = () => {
  // State management
  const [shifts, setShifts] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalShifts: 0,
    activeShifts: 0,
    inactiveShifts: 0
  });

  // Modal states
  const [shiftFormVisible, setShiftFormVisible] = useState(false);
  const [assignmentModalVisible, setAssignmentModalVisible] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [editingShift, setEditingShift] = useState(null);

  // Filter and search states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);

  // Assignment states
  const [selectedOperators, setSelectedOperators] = useState([]);
  const [assignmentDate, setAssignmentDate] = useState(null); // always Date or null
  const [availableOperators, setAvailableOperators] = useState([]);

  // Assume isManager is determined elsewhere or hardcode for now
  const isManager = true;

  // Load initial data
  useEffect(() => {
    loadShifts();
    loadOperators();
    loadStatistics();
  }, []);

  // Load shifts data
  const loadShifts = useCallback(async () => {
    try {
      setTableLoading(true);
      const response = isManager 
        ? await shiftService.getAllShifts()
        : await shiftService.getAllActiveShifts();
      // Map 'active' to 'isActive' for compatibility
      const mapped = Array.isArray(response)
        ? response.map(shift => ({ ...shift, isActive: typeof shift.isActive !== 'undefined' ? shift.isActive : shift.active }))
        : [];
      setShifts(mapped);
    } catch (error) {
      console.error('Error loading shifts:', error);
      message.error('Không thể tải danh sách ca làm việc');
      setShifts([]);
    } finally {
      setTableLoading(false);
    }
  }, [isManager]);

  // Load operators data
  const loadOperators = useCallback(async () => {
    try {
      const response = await userService.getAllStaff();
      // Map staff data to match expected format for operators
      const mappedOperators = Array.isArray(response) 
        ? response.map(staff => ({
            operatorId: staff.id,
            userId: staff.id,
            operatorName: staff.fullName,
            fullname: staff.fullName,
            email: staff.email,
            role: staff.role
          }))
        : [];
      setOperators(mappedOperators);
    } catch (error) {
      console.error('Error loading operators:', error);
      message.error('Không thể tải danh sách nhân viên');
      setOperators([]);
    }
  }, []);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    if (!isManager) return;
    
    try {
      const stats = await shiftService.getShiftStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }, [isManager]);

  // Handle shift creation
  const handleCreateShift = useCallback(() => {
    setEditingShift(null);
    setShiftFormVisible(true);
  }, []);

  // Handle shift editing
  const handleEditShift = useCallback((shift) => {
    setEditingShift(shift);
    setShiftFormVisible(true);
  }, []);

  // Handle shift deletion
  const handleDeleteShift = useCallback(async (shiftId) => {
    try {
      setLoading(true);
      await shiftService.deleteShift(shiftId);
      message.success('Đã xóa ca làm việc thành công');
      loadShifts();
      loadStatistics();
    } catch (error) {
      console.error('Error deleting shift:', error);
      message.error('Không thể xóa ca làm việc');
    } finally {
      setLoading(false);
    }
  }, [loadShifts, loadStatistics]);

  // Handle shift form success
  const handleShiftFormSuccess = useCallback(() => {
    loadShifts();
    loadStatistics();
  }, [loadShifts, loadStatistics]);

  // Handle shift form cancel
  const handleShiftFormCancel = useCallback(() => {
    setShiftFormVisible(false);
    setEditingShift(null);
  }, []);

  // Handle operator assignment
  const handleAssignOperators = useCallback(async (shift) => {
    setSelectedShift(shift);
    setSelectedOperators([]);
    setAssignmentDate(dayjs());
    
    try {
      // Load available operators for this shift
      const available = await shiftService.getAvailableOperators(
        shift.shiftId, 
        dayjs().format('YYYY-MM-DD')
      );
      setAvailableOperators(Array.isArray(available) ? available : []);
    } catch (error) {
      console.error('Error loading available operators:', error);
      setAvailableOperators(operators);
    }
    
    setAssignmentModalVisible(true);
  }, [operators]);

  // Submit operator assignment
  const handleSubmitAssignment = useCallback(async () => {
    if (!selectedShift || !assignmentDate || selectedOperators.length === 0) {
      message.warning('Vui lòng chọn đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      await shiftService.assignOperatorsToShift({
        shiftId: selectedShift.shiftId,
        operatorIds: selectedOperators,
        assignmentDate: assignmentDate.format('YYYY-MM-DD')
      });
      
      message.success('Đã phân công nhân viên thành công');
      setAssignmentModalVisible(false);
      loadShifts();
    } catch (error) {
      console.error('Error assigning operators:', error);
      message.error('Không thể phân công nhân viên');
    } finally {
      setLoading(false);
    }
  }, [selectedShift, assignmentDate, selectedOperators, loadShifts]);

  // Handle assignment date change
  const handleAssignmentDateChange = useCallback(async (date) => {
    // date có thể là dayjs hoặc Date hoặc string
    const jsDate = date && date.toDate ? date.toDate() : (date instanceof Date ? date : date ? new Date(date) : null);
    setAssignmentDate(jsDate);
    if (selectedShift && jsDate) {
      try {
        // dayjs(jsDate) để lấy format đúng
        const available = await shiftService.getAvailableOperators(
          selectedShift.shiftId,
          dayjs(jsDate).format('YYYY-MM-DD')
        );
        setAvailableOperators(Array.isArray(available) ? available : []);
      } catch (error) {
        console.error('Error loading available operators:', error);
        setAvailableOperators(operators);
      }
    }
  }, [selectedShift, operators]);

  // Filter shifts based on search and filters
  const filteredShifts = useMemo(() => {
    let filtered = shifts;

    // Search filter
    if (searchText) {
      filtered = filtered.filter(shift =>
        shift.shiftName?.toLowerCase().includes(searchText.toLowerCase()) ||
        shift.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(shift => {
        if (statusFilter === 'active') return shift.isActive;
        if (statusFilter === 'inactive') return !shift.isActive;
        return true;
      });
    }

    return filtered;
  }, [shifts, searchText, statusFilter]);

  // Table columns configuration
  const columns = [
    {
      title: 'Tên ca làm việc',
      dataIndex: 'shiftName',
      key: 'shiftName',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {record.description && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.description}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div>
            <ClockCircleOutlined className="mr-1" />
            <Text>{record.startTime} - {record.endTime}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {calculateShiftDuration(record.startTime, record.endTime)}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Nhân viên được phân công',
      key: 'assignedOperators',
      render: (_, record) => (
        <div>
          <TeamOutlined className="mr-1" />
          <Text>{record.assignedOperators?.length || 0} nhân viên</Text>
          {record.assignedOperators?.length > 0 && (
            <div style={{ marginTop: 4 }}>
              {record.assignedOperators.slice(0, 3).map(op => (
                <Tag key={op.operatorId} size="small">
                  {op.operatorName}
                </Tag>
              ))}
              {record.assignedOperators.length > 3 && (
                <Tag size="small">+{record.assignedOperators.length - 3}</Tag>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Phân công nhân viên">
            <Button
              type="text"
              icon={<UserAddOutlined />}
              onClick={() => handleAssignOperators(record)}
              disabled={!isManager || !record.isActive}
            />
          </Tooltip>
          
          {isManager && (
            <>
              <Tooltip title="Chỉnh sửa">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditShift(record)}
                />
              </Tooltip>
              
              <Popconfirm
                title="Xác nhận xóa ca làm việc?"
                description="Hành động này không thể hoàn tác"
                onConfirm={() => handleDeleteShift(record.shiftId)}
                okText="Xóa"
                cancelText="Hủy"
                okType="danger"
              >
                <Tooltip title="Xóa">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Calculate shift duration
  const calculateShiftDuration = (startTime, endTime) => {
    const start = dayjs(`2000-01-01 ${startTime}`);
    const end = dayjs(`2000-01-01 ${endTime}`);
    const duration = end.diff(start, 'hour', true);
    return `${duration} giờ`;
  };

  // Render statistics cards
  const renderStatistics = () => {
    if (!isManager) return null;

    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng số ca làm việc"
              value={statistics.totalShifts}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Ca đang hoạt động"
              value={statistics.activeShifts}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Ca không hoạt động"
              value={statistics.inactiveShifts}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <Layout>
      <Content style={{ padding: 24, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        {/* Page Header */}
        <div style={{
          background: 'white',
          padding: 24,
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          marginBottom: 24
        }}>
          <Title level={2}>
            <ClockCircleOutlined className="mr-2" />
            Quản lý ca làm việc
          </Title>
          <Text type="secondary">
            Tạo, chỉnh sửa ca làm việc và phân công nhân viên
          </Text>
        </div>

        {/* Statistics */}
        {renderStatistics()}

        {/* Filters and Actions */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={8} md={6}>
              <Search
                placeholder="Tìm kiếm ca làm việc..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
            
            <Col xs={24} sm={8} md={4}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="active">Hoạt động</Option>
                <Option value="inactive">Không hoạt động</Option>
              </Select>
            </Col>

            <Col xs={24} sm={8} md={6}>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadShifts}
                  loading={loading}
                >
                  Làm mới
                </Button>
                
                {isManager && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateShift}
                  >
                    Tạo ca mới
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Shifts Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredShifts}
            rowKey="shiftId"
            loading={tableLoading}
            pagination={{
              total: filteredShifts.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} ca làm việc`,
            }}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Operator Assignment Modal */}
        <Modal
          title={`Phân công nhân viên - ${selectedShift?.shiftName}`}
          open={assignmentModalVisible}
          onOk={handleSubmitAssignment}
          onCancel={() => setAssignmentModalVisible(false)}
          confirmLoading={loading}
          width={600}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>Thông tin ca làm việc:</Text>
              <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
                <div><Text>Tên ca: {selectedShift?.shiftName}</Text></div>
                <div><Text>Thời gian: {selectedShift?.startTime} - {selectedShift?.endTime}</Text></div>
                {selectedShift && (
                  <div><Text>Thời lượng: {calculateShiftDuration(selectedShift.startTime, selectedShift.endTime)}</Text></div>
                )}
              </div>
            </div>

            <div>
              <Text strong>Ngày phân công: *</Text>
              <DatePicker
                value={assignmentDate ? dayjs(assignmentDate) : null}
                onChange={handleAssignmentDateChange}
                style={{ width: '100%', marginTop: 8 }}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </div>

            <div>
              <Text strong>Chọn nhân viên: *</Text>
              <Select
                mode="multiple"
                value={selectedOperators}
                onChange={setSelectedOperators}
                style={{ width: '100%', marginTop: 8 }}
                placeholder="Chọn nhân viên để phân công"
                optionFilterProp="children"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {availableOperators.map(operator => (
                  <Option key={operator.id} value={operator.id}>
                    {operator.fullName} - {operator.email}
                  </Option>
                ))}
              </Select>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Hiển thị {availableOperators.length} nhân viên có thể phân công
              </Text>
            </div>
          </Space>
        </Modal>

        {/* Shift Form Modal */}
        <ShiftForm
          visible={shiftFormVisible}
          onCancel={handleShiftFormCancel}
          onSuccess={handleShiftFormSuccess}
          editingShift={editingShift}
          operators={operators}
        />
      </Content>
    </Layout>
  );
};

export default ShiftManagement;