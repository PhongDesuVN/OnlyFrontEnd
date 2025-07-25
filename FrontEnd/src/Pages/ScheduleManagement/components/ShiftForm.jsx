import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  Form,
  Input,
  TimePicker,
  Switch,
  Button,
  Space,
  Alert,
  Typography,
  Row,
  Col,
  Select,
  message,
  Divider,
  Tag
} from 'antd';
import {
  ClockCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import shiftService from '../../../Services/shiftService.js';
import userService from '../../../Services/userService.js';
import { DefaultValues, ValidationRules } from '../../../types/scheduleTypes.js';
import { useScheduleErrorHandler } from '../../../hooks/useErrorHandler.js';
import { useNotification } from '../../../Components/NotificationSystem.jsx';


const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

/**
 * ShiftForm component for creating and editing work shifts
 * Includes time validation, conflict checking, and operator multi-select with search
 */
const ShiftForm = ({
                     visible,
                     onCancel,
                     onSuccess,
                     editingShift = null,
                     operators = []
                   }) => {
  const [form] = Form.useForm();
  const [validationErrors, setValidationErrors] = useState([]);
  const [timeConflicts, setTimeConflicts] = useState([]);
  const [selectedOperators, setSelectedOperators] = useState([]);
  const [availableOperators, setAvailableOperators] = useState([]);
  const [previewData, setPreviewData] = useState(null);

  const isEditing = !!editingShift;
  const { error, isLoading, executeWithErrorHandling, clearError } = useScheduleErrorHandler();
  const notification = useNotification();

  // Initialize form when modal opens or editing shift changes
  useEffect(() => {
    if (visible) {
      if (isEditing) {
        // Populate form with existing shift data
        form.setFieldsValue({
          shiftName: editingShift.shiftName,
          startTime: editingShift.startTime ? dayjs(editingShift.startTime, 'HH:mm') : null,
          endTime: editingShift.endTime ? dayjs(editingShift.endTime, 'HH:mm') : null,
          description: editingShift.description || '',
          isActive: editingShift.isActive !== false
        });
        setSelectedOperators(editingShift.assignedOperators?.map(op => op.operatorId) || []);
      } else {
        // Reset form for new shift
        form.setFieldsValue({
          ...DefaultValues.createShift,
          startTime: dayjs(DefaultValues.createShift.startTime, 'HH:mm'),
          endTime: dayjs(DefaultValues.createShift.endTime, 'HH:mm')
        });
        setSelectedOperators([]);
      }

      setValidationErrors([]);
      setTimeConflicts([]);
      loadAvailableOperators();
    }
  }, [visible, isEditing, editingShift, form]);

  // Load available operators
  const loadAvailableOperators = useCallback(async () => {
    await executeWithErrorHandling(
        async () => {
          const response = await userService.getAllStaff();
          // Map staff data to match expected format for operators
          const operatorStaff = Array.isArray(response)
              ? response.map(staff => ({
                operatorId: staff.id,
                userId: staff.id,
                operatorName: staff.fullName,
                fullname: staff.fullName,
                email: staff.email,
                role: staff.role
              }))
              : [];
          setAvailableOperators(operatorStaff);
        },
        {
          context: { operation: 'loadAvailableOperators' },
          onError: () => setAvailableOperators(operators),
          showNotification: false
        }
    );
  }, [operators, executeWithErrorHandling]);

  // Validate shift times
  const validateShiftTimes = useCallback((startTime, endTime) => {
    const errors = [];

    if (!startTime || !endTime) {
      errors.push('Vui lòng chọn thời gian bắt đầu và kết thúc');
      return errors;
    }

    // Check if start time is before end time
    if (startTime.isAfter(endTime) || startTime.isSame(endTime)) {
      errors.push('Thời gian bắt đầu phải trước thời gian kết thúc');
    }

    // Check minimum shift duration (1 hour)
    const duration = endTime.diff(startTime, 'hour', true);
    if (duration < 1) {
      errors.push('Ca làm việc phải có thời lượng tối thiểu 1 giờ');
    }

    // Check maximum shift duration (12 hours)
    if (duration > 12) {
      errors.push('Ca làm việc không được vượt quá 12 giờ');
    }

    return errors;
  }, []);

  // Check for time conflicts with existing shifts
  const checkTimeConflicts = useCallback(async (startTime, endTime, excludeShiftId = null) => {
    try {
      const allShifts = await shiftService.getAllActiveShifts();
      const conflicts = [];

      allShifts.forEach(shift => {
        // Skip the current shift when editing
        if (excludeShiftId && shift.shiftId === excludeShiftId) return;

        const shiftStart = dayjs(shift.startTime, 'HH:mm');
        const shiftEnd = dayjs(shift.endTime, 'HH:mm');

        // Check for time overlap
        const hasOverlap = (
            (startTime.isBefore(shiftEnd) && endTime.isAfter(shiftStart)) ||
            (startTime.isSame(shiftStart) || endTime.isSame(shiftEnd))
        );

        if (hasOverlap) {
          conflicts.push({
            shiftName: shift.shiftName,
            timeRange: `${shift.startTime} - ${shift.endTime}`,
            overlapType: getOverlapType(startTime, endTime, shiftStart, shiftEnd)
          });
        }
      });

      return conflicts;
    } catch (error) {
      console.error('Error checking time conflicts:', error);
      return [];
    }
  }, []);

  // Determine overlap type for better user feedback
  const getOverlapType = (newStart, newEnd, existingStart, existingEnd) => {
    if (newStart.isSame(existingStart) && newEnd.isSame(existingEnd)) {
      return 'identical';
    } else if (newStart.isBefore(existingStart) && newEnd.isAfter(existingEnd)) {
      return 'contains';
    } else if (newStart.isAfter(existingStart) && newEnd.isBefore(existingEnd)) {
      return 'contained';
    } else {
      return 'partial';
    }
  };

  // Handle form value changes for real-time validation
  const handleFormChange = useCallback(async (changedFields, allFields) => {
    // Get current form values
    const formValues = form.getFieldsValue();
    const startTime = formValues.startTime;
    const endTime = formValues.endTime;

    if (startTime && endTime) {
      // Validate times
      const errors = validateShiftTimes(startTime, endTime);
      setValidationErrors(errors);

      // Check conflicts if times are valid
      if (errors.length === 0) {
        const conflicts = await checkTimeConflicts(
            startTime,
            endTime,
            isEditing ? editingShift.shiftId : null
        );
        setTimeConflicts(conflicts);

        // Update preview data
        setPreviewData({
          duration: endTime.diff(startTime, 'hour', true),
          timeRange: `${startTime.format('HH:mm')} - ${endTime.format('HH:mm')}`,
          hasConflicts: conflicts.length > 0
        });
      } else {
        setTimeConflicts([]);
        setPreviewData(null);
      }
    }
  }, [form, validateShiftTimes, checkTimeConflicts, isEditing, editingShift]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    await executeWithErrorHandling(
        async () => {
          const values = await form.validateFields();

          // Final validation
          const timeErrors = validateShiftTimes(values.startTime, values.endTime);
          if (timeErrors.length > 0) {
            setValidationErrors(timeErrors);
            return;
          }

          // Check conflicts one more time
          const conflicts = await checkTimeConflicts(
              values.startTime,
              values.endTime,
              isEditing ? editingShift.shiftId : null
          );

          // Warn about conflicts but allow creation
          if (conflicts.length > 0) {
            const confirmed = await new Promise((resolve) => {
              Modal.confirm({
                title: 'Phát hiện xung đột thời gian',
                content: (
                    <div>
                      <p>Ca làm việc này có thời gian trùng với:</p>
                      <ul>
                        {conflicts.map((conflict, index) => (
                            <li key={index}>
                              <strong>{conflict.shiftName}</strong> ({conflict.timeRange})
                            </li>
                        ))}
                      </ul>
                      <p>Bạn có muốn tiếp tục tạo ca làm việc này không?</p>
                    </div>
                ),
                onOk: () => resolve(true),
                onCancel: () => resolve(false),
                okText: 'Tiếp tục',
                cancelText: 'Hủy'
              });
            });

            if (!confirmed) return;
          }

          // Prepare shift data
          const shiftData = {
            shiftName: values.shiftName.trim(),
            startTime: values.startTime.format('HH:mm'),
            endTime: values.endTime.format('HH:mm'),
            description: values.description?.trim() || '',
            isActive: values.isActive !== false
          };

          // Create or update shift
          let response;
          if (isEditing) {
            response = await shiftService.updateShift(editingShift.shiftId, shiftData);
            notification.showSuccess('Đã cập nhật ca làm việc thành công');
          } else {
            response = await shiftService.createShift(shiftData);
            notification.showSuccess('Đã tạo ca làm việc thành công');
          }

          // Handle operator assignments for new shifts
          if (!isEditing && selectedOperators.length > 0) {
            try {
              await shiftService.assignOperatorsToShift({
                shiftId: response.shiftId,
                operatorIds: selectedOperators,
                assignmentDate: dayjs().format('YYYY-MM-DD')
              });
              notification.showSuccess('Đã phân công nhân viên thành công');
            } catch (assignError) {
              notification.showWarning('Ca làm việc đã được tạo nhưng không thể phân công nhân viên');
            }
          }

          // Close modal and refresh data
          onSuccess();
          handleCancel();
        },
        {
          context: {
            operation: isEditing ? 'updateShift' : 'createShift',
            shiftId: isEditing ? editingShift.shiftId : null
          }
        }
    );
  }, [form, validateShiftTimes, checkTimeConflicts, isEditing, editingShift, selectedOperators, onSuccess, executeWithErrorHandling, notification]);

  // Handle modal cancel
  const handleCancel = useCallback(() => {
    form.resetFields();
    setValidationErrors([]);
    setTimeConflicts([]);
    setSelectedOperators([]);
    setPreviewData(null);
    onCancel();
  }, [form, onCancel]);

  // Render validation alerts
  const renderValidationAlerts = () => {
    if (validationErrors.length === 0 && timeConflicts.length === 0) return null;

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

          {timeConflicts.length > 0 && (
              <Alert
                  type="warning"
                  icon={<InfoCircleOutlined />}
                  message="Cảnh báo xung đột thời gian"
                  description={
                    <div>
                      <p>Ca làm việc này có thời gian trùng với:</p>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {timeConflicts.map((conflict, index) => (
                            <li key={index}>
                              <strong>{conflict.shiftName}</strong> ({conflict.timeRange})
                            </li>
                        ))}
                      </ul>
                      <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
                        Bạn vẫn có thể tạo ca làm việc này nhưng cần lưu ý khi phân công nhân viên.
                      </p>
                    </div>
                  }
              />
          )}
        </Space>
    );
  };

  // Render shift preview
  const renderShiftPreview = () => {
    if (!previewData) return null;

    return (
        <div style={{
          padding: 16,
          backgroundColor: '#f5f5f5',
          borderRadius: 6,
          marginBottom: 16
        }}>
          <Title level={5}>
            <CheckCircleOutlined className="mr-2" />
            Xem trước ca làm việc
          </Title>
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Thời gian:</Text>
              <div>{previewData.timeRange}</div>
            </Col>
            <Col span={12}>
              <Text strong>Thời lượng:</Text>
              <div>{previewData.duration} giờ</div>
            </Col>
          </Row>
          {selectedOperators.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Text strong>Nhân viên được chọn:</Text>
                <div style={{ marginTop: 4 }}>
                  {selectedOperators.map(operatorId => {
                    const operator = availableOperators.find(op =>
                        (op.operatorId || op.userId) === operatorId
                    );
                    return operator ? (
                        <Tag key={operatorId} color="blue">
                          {operator.operatorName || operator.fullname}
                        </Tag>
                    ) : (
                        <Tag key={operatorId} color="red">
                          Không tìm thấy nhân viên
                        </Tag>
                    );
                  })}
                </div>
              </div>
          )}
        </div>
    );
  };

  return (
      <Modal
          title={
            <Space>
              <ClockCircleOutlined />
              {isEditing ? 'Chỉnh sửa ca làm việc' : 'Tạo ca làm việc mới'}
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
                loading={isLoading}
                onClick={handleSubmit}
                disabled={validationErrors.length > 0}
            >
              {isEditing ? 'Cập nhật' : 'Tạo ca làm việc'}
            </Button>
          ]}
          width={700}
          destroyOnClose
      >
        {error && (
            <Alert
                type="error"
                icon={<ExclamationCircleOutlined />}
                message="Lỗi khi xử lý dữ liệu"
                description={error.message}
                showIcon
                closable
                onClose={clearError}
                className="mb-4"
            />
        )}
        {renderValidationAlerts()}
        {renderShiftPreview()}

        <Form
            form={form}
            layout="vertical"
            onValuesChange={handleFormChange}
            requiredMark="optional"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                  name="shiftName"
                  label="Tên ca làm việc"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên ca làm việc' },
                    { max: ValidationRules.shiftName.maxLength, message: `Tên ca không được vượt quá ${ValidationRules.shiftName.maxLength} ký tự` },
                    { pattern: ValidationRules.shiftName.pattern, message: 'Tên ca chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới' }
                  ]}
              >
                <Input
                    placeholder="Ví dụ: Ca sáng, Ca chiều, Ca đêm..."
                    maxLength={ValidationRules.shiftName.maxLength}
                    showCount
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                  name="startTime"
                  label="Thời gian bắt đầu"
                  rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]}
              >
                <TimePicker
                    format="HH:mm"
                    placeholder="Chọn giờ bắt đầu"
                    style={{ width: '100%' }}
                    minuteStep={15}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                  name="endTime"
                  label="Thời gian kết thúc"
                  rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc' }]}
              >
                <TimePicker
                    format="HH:mm"
                    placeholder="Chọn giờ kết thúc"
                    style={{ width: '100%' }}
                    minuteStep={15}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
              name="description"
              label="Mô tả (tùy chọn)"
          >
            <TextArea
                placeholder="Mô tả chi tiết về ca làm việc..."
                rows={3}
                maxLength={500}
                showCount
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                  label="Trạng thái hoạt động"
                  name="isActive"
                  valuePropName="checked"
                  style={{ marginBottom: 16 }}
              >
                <Switch
                    checkedChildren="Hoạt động"
                    unCheckedChildren="Không hoạt động"
                    defaultChecked={true}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
  );
};

export default ShiftForm;