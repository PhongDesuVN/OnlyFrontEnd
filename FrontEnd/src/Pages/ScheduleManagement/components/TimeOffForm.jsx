import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  Form,
  DatePicker,
  Input,
  Button,
  Space,
  Alert,
  Typography,
  Row,
  Col,
  message,
  Divider,
  Card,
  Tag
} from 'antd';
import {
  CalendarOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import timeOffService from '../../../Services/timeOffService.js';
import scheduleService from '../../../Services/scheduleService.js';
import { 
  ValidationRules,
  DefaultValues 
} from '../../../types/scheduleTypes.js';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const TimeOffForm = ({
  visible,
  onCancel,
  onSuccess,
  currentUser
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [conflictWarnings, setConflictWarnings] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);

  // Initialize form when modal opens
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        ...DefaultValues.timeOffRequest,
        operatorId: currentUser?.operatorId || currentUser?.userId
      });
      setValidationErrors([]);
      setConflictWarnings([]);
      setPreviewData(null);
      setExistingBookings([]);
    }
  }, [visible, currentUser, form]);

  // Validate date range
  const validateDateRange = useCallback((startDate, endDate) => {
    const errors = [];
    
    if (!startDate || !endDate) {
      return errors;
    }

    // Check if start date is before end date
    if (startDate.isAfter(endDate) || startDate.isSame(endDate)) {
      errors.push('Ngày bắt đầu phải trước ngày kết thúc');
    }

    // Check if dates are in the past
    const today = dayjs().startOf('day');
    if (startDate.isBefore(today)) {
      errors.push('Không thể đăng ký nghỉ phép cho ngày trong quá khứ');
    }

    // Check minimum advance notice (at least 1 day)
    const tomorrow = dayjs().add(1, 'day').startOf('day');
    if (startDate.isBefore(tomorrow)) {
      errors.push('Yêu cầu nghỉ phép phải được đăng ký trước ít nhất 1 ngày');
    }

    // Check maximum time-off duration
    const duration = endDate.diff(startDate, 'day') + 1;
    if (duration > ValidationRules.maxTimeOffDays) {
      errors.push(`Thời gian nghỉ phép không được vượt quá ${ValidationRules.maxTimeOffDays} ngày`);
    }

    // Check if date range is too far in the future (1 year)
    const maxFutureDate = dayjs().add(1, 'year');
    if (startDate.isAfter(maxFutureDate)) {
      errors.push('Không thể đăng ký nghỉ phép quá xa trong tương lai (tối đa 1 năm)');
    }

    return errors;
  }, []);

  // Check for conflicts with existing assignments
  const checkConflicts = useCallback(async (startDate, endDate, operatorId) => {
    try {
      const warnings = [];
      
      // Check for existing bookings/assignments
      const scheduleData = await scheduleService.getOperatorScheduleByDateRange(
        operatorId,
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD')
      );

      if (scheduleData && scheduleData.length > 0) {
        const conflictingBookings = scheduleData.filter(day => 
          day.orders && day.orders.length > 0
        );

        if (conflictingBookings.length > 0) {
          warnings.push({
            type: 'booking_conflict',
            message: `Bạn có ${conflictingBookings.length} ngày đã được phân công đơn hàng trong khoảng thời gian này`,
            details: conflictingBookings.map(day => ({
              date: day.date,
              orderCount: day.orders.length,
              orders: day.orders
            }))
          });
          setExistingBookings(conflictingBookings);
        }
      }

      // Check for existing time-off requests in the same period
      const existingTimeOff = await timeOffService.getOperatorTimeOffRequestsByDateRange(
        operatorId,
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD')
      );

      const overlappingRequests = existingTimeOff.filter(request => 
        request.status === 'PENDING' || request.status === 'APPROVED'
      );

      if (overlappingRequests.length > 0) {
        warnings.push({
          type: 'timeoff_overlap',
          message: 'Bạn đã có yêu cầu nghỉ phép trong khoảng thời gian này',
          details: overlappingRequests.map(request => ({
            startDate: request.startDate,
            endDate: request.endDate,
            status: request.status,
            reason: request.reason
          }))
        });
      }

      return warnings;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return [];
    }
  }, []);

  // Handle form value changes for real-time validation
  const handleFormChange = useCallback(async (changedFields, allFields) => {
    const dateRange = allFields.find(f => f.name[0] === 'dateRange')?.value;
    const reason = allFields.find(f => f.name[0] === 'reason')?.value;

    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      
      // Validate dates
      const errors = validateDateRange(startDate, endDate);
      setValidationErrors(errors);

      // Check conflicts if dates are valid
      if (errors.length === 0 && currentUser) {
        const warnings = await checkConflicts(
          startDate, 
          endDate, 
          currentUser.operatorId || currentUser.userId
        );
        setConflictWarnings(warnings);

        // Update preview data
        const duration = endDate.diff(startDate, 'day') + 1;
        setPreviewData({
          startDate: startDate.format('DD/MM/YYYY'),
          endDate: endDate.format('DD/MM/YYYY'),
          duration,
          hasConflicts: warnings.length > 0,
          reasonLength: reason ? reason.length : 0
        });
      } else {
        setConflictWarnings([]);
        setPreviewData(null);
      }
    }
  }, [validateDateRange, checkConflicts, currentUser]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      
      // Final validation
      const [startDate, endDate] = values.dateRange;
      const dateErrors = validateDateRange(startDate, endDate);
      
      if (dateErrors.length > 0) {
        setValidationErrors(dateErrors);
        return;
      }

      // Check conflicts one more time
      const warnings = await checkConflicts(
        startDate,
        endDate,
        currentUser.operatorId || currentUser.userId
      );

      // Show confirmation if there are conflicts
      if (warnings.length > 0) {
        const hasBookingConflicts = warnings.some(w => w.type === 'booking_conflict');
        const hasTimeOffOverlap = warnings.some(w => w.type === 'timeoff_overlap');

        if (hasTimeOffOverlap) {
          message.error('Không thể tạo yêu cầu nghỉ phép do trùng lặp với yêu cầu khác');
          return;
        }

        if (hasBookingConflicts) {
          const confirmed = await new Promise((resolve) => {
            Modal.confirm({
              title: 'Phát hiện xung đột lịch làm việc',
              content: (
                <div>
                  <p>Bạn có đơn hàng đã được phân công trong khoảng thời gian này.</p>
                  <p>Nếu yêu cầu nghỉ phép được duyệt, các đơn hàng này sẽ cần được phân công lại cho nhân viên khác.</p>
                  <p><strong>Bạn có muốn tiếp tục gửi yêu cầu không?</strong></p>
                </div>
              ),
              onOk: () => resolve(true),
              onCancel: () => resolve(false),
              okText: 'Tiếp tục',
              cancelText: 'Hủy',
              type: 'warning'
            });
          });

          if (!confirmed) return;
        }
      }

      setLoading(true);

      // Prepare request data
      const requestData = {
        operatorId: currentUser.operatorId || currentUser.userId,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        reason: values.reason.trim()
      };

      // Submit request
      await timeOffService.submitTimeOffRequest(requestData);
      message.success('Đã gửi yêu cầu nghỉ phép thành công');

      // Close modal and refresh data
      onSuccess();
      handleCancel();

    } catch (error) {
      console.error('Error submitting time-off request:', error);
      message.error('Không thể gửi yêu cầu nghỉ phép');
    } finally {
      setLoading(false);
    }
  }, [form, validateDateRange, checkConflicts, currentUser, onSuccess]);

  // Handle modal cancel
  const handleCancel = useCallback(() => {
    form.resetFields();
    setValidationErrors([]);
    setConflictWarnings([]);
    setPreviewData(null);
    setExistingBookings([]);
    onCancel();
  }, [form, onCancel]);

  // Render validation alerts
  const renderValidationAlerts = () => {
    if (validationErrors.length === 0 && conflictWarnings.length === 0) return null;

    return (
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        {validationErrors.length > 0 && (
          <Alert
            type="error"
            icon={<ExclamationCircleOutlined />}
            message="Lỗi xác thực"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            }
          />
        )}

        {conflictWarnings.map((warning, index) => (
          <Alert
            key={index}
            type="warning"
            icon={<InfoCircleOutlined />}
            message="Cảnh báo xung đột"
            description={
              <div>
                <p>{warning.message}</p>
                {warning.type === 'booking_conflict' && warning.details && (
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Chi tiết xung đột:</Text>
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
                      {warning.details.map((detail, idx) => (
                        <li key={idx}>
                          <strong>{dayjs(detail.date).format('DD/MM/YYYY')}</strong>: {detail.orderCount} đơn hàng
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {warning.type === 'timeoff_overlap' && warning.details && (
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Yêu cầu trùng lặp:</Text>
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
                      {warning.details.map((detail, idx) => (
                        <li key={idx}>
                          {dayjs(detail.startDate).format('DD/MM/YYYY')} - {dayjs(detail.endDate).format('DD/MM/YYYY')} 
                          <Tag color={detail.status === 'APPROVED' ? 'green' : 'orange'} style={{ marginLeft: 8 }}>
                            {detail.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                          </Tag>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            }
          />
        ))}
      </Space>
    );
  };

  // Render request preview
  const renderRequestPreview = () => {
    if (!previewData) return null;

    return (
      <Card 
        size="small" 
        style={{ 
          marginBottom: 16,
          backgroundColor: previewData.hasConflicts ? '#fff7e6' : '#f6ffed',
          borderColor: previewData.hasConflicts ? '#ffd591' : '#b7eb8f'
        }}
      >
        <Title level={5}>
          <CheckCircleOutlined className="mr-2" />
          Xem trước yêu cầu nghỉ phép
        </Title>
        <Row gutter={16}>
          <Col span={8}>
            <Text strong>Từ ngày:</Text>
            <div>{previewData.startDate}</div>
          </Col>
          <Col span={8}>
            <Text strong>Đến ngày:</Text>
            <div>{previewData.endDate}</div>
          </Col>
          <Col span={8}>
            <Text strong>Số ngày:</Text>
            <div>{previewData.duration} ngày</div>
          </Col>
        </Row>
        <Row style={{ marginTop: 8 }}>
          <Col span={24}>
            <Text strong>Độ dài lý do:</Text>
            <Text style={{ marginLeft: 8 }}>
              {previewData.reasonLength}/{ValidationRules.timeOffReason.maxLength} ký tự
            </Text>
          </Col>
        </Row>
        {previewData.hasConflicts && (
          <Alert
            type="warning"
            message="Có xung đột với lịch làm việc hiện tại"
            style={{ marginTop: 8 }}
            showIcon
          />
        )}
      </Card>
    );
  };

  // Render existing bookings details
  const renderExistingBookings = () => {
    if (existingBookings.length === 0) return null;

    return (
      <Card 
        title={
          <Space>
            <CalendarOutlined />
            <Text>Đơn hàng đã được phân công</Text>
          </Space>
        }
        size="small"
        style={{ marginBottom: 16 }}
      >
        {existingBookings.map((booking, index) => (
          <div key={index} style={{ marginBottom: 8 }}>
            <Text strong>{dayjs(booking.date).format('DD/MM/YYYY')}</Text>
            <Text style={{ marginLeft: 8 }}>({booking.orderCount} đơn hàng)</Text>
            <div style={{ marginLeft: 16, fontSize: '12px', color: '#666' }}>
              {booking.orders.slice(0, 3).map((order, idx) => (
                <div key={idx}>
                  • {order.customerName} - {order.deliveryTime}
                </div>
              ))}
              {booking.orders.length > 3 && (
                <div>... và {booking.orders.length - 3} đơn hàng khác</div>
              )}
            </div>
          </div>
        ))}
      </Card>
    );
  };

  // Disable past dates and weekends (optional)
  const disabledDate = useCallback((current) => {
    // Disable past dates
    return current && current < dayjs().startOf('day');
  }, []);

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          Đăng ký nghỉ phép
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          disabled={validationErrors.length > 0}
        >
          Gửi yêu cầu
        </Button>
      ]}
      width={700}
      destroyOnClose
    >
      {renderValidationAlerts()}
      {renderRequestPreview()}
      {renderExistingBookings()}

      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormChange}
        requiredMark="optional"
      >
        <Form.Item
          name="dateRange"
          label="Thời gian nghỉ phép"
          rules={[
            { required: true, message: 'Vui lòng chọn thời gian nghỉ phép' }
          ]}
        >
          <RangePicker
            style={{ width: '100%' }}
            placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
            format="DD/MM/YYYY"
            disabledDate={disabledDate}
            showTime={false}
          />
        </Form.Item>

        <Form.Item
          name="reason"
          label="Lý do nghỉ phép"
          rules={[
            { required: true, message: 'Vui lòng nhập lý do nghỉ phép' },
            { 
              min: ValidationRules.timeOffReason.minLength, 
              message: `Lý do phải có ít nhất ${ValidationRules.timeOffReason.minLength} ký tự` 
            },
            { 
              max: ValidationRules.timeOffReason.maxLength, 
              message: `Lý do không được vượt quá ${ValidationRules.timeOffReason.maxLength} ký tự` 
            }
          ]}
        >
          <TextArea
            placeholder="Nhập lý do chi tiết cho việc nghỉ phép..."
            rows={4}
            maxLength={ValidationRules.timeOffReason.maxLength}
            showCount
          />
        </Form.Item>

        <Divider />

        <Alert
          type="info"
          message="Lưu ý quan trọng"
          description={
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
              <li>Yêu cầu nghỉ phép phải được đăng ký trước ít nhất 1 ngày</li>
              <li>Yêu cầu sẽ được gửi đến quản lý để xem xét và duyệt</li>
              <li>Bạn sẽ nhận được thông báo khi yêu cầu được duyệt hoặc từ chối</li>
              <li>Nếu có xung đột với đơn hàng đã phân công, quản lý sẽ xem xét và điều chỉnh</li>
            </ul>
          }
          showIcon
        />
      </Form>
    </Modal>
  );
};

export default TimeOffForm;