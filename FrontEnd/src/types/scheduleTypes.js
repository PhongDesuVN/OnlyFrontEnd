// Schedule Management DTO types to match backend

// Schedule Calendar Response
export const ScheduleCalendarResponse = {
    date: '', // LocalDate format: YYYY-MM-DD
    orders: [], // Array of OrderSummary
    shifts: [], // Array of ShiftInfo
    timeOffStatus: {}, // TimeOffStatus object
    totalOrders: 0,
    workStatus: '' // WORKING, TIME_OFF, AVAILABLE
};

export const OrderSummary = {
    bookingId: 0,
    customerName: '',
    pickupLocation: '',
    deliveryLocation: '',
    status: '',
    deliveryTime: '', // HH:mm format
    total: 0
};

export const ShiftInfo = {
    shiftId: 0,
    shiftName: '',
    startTime: '', // HH:mm format
    endTime: '', // HH:mm format
    status: '' // ASSIGNED, COMPLETED, CANCELLED
};

export const TimeOffStatus = {
    hasTimeOff: false,
    reason: '',
    status: '' // PENDING, APPROVED, REJECTED
};

// Shift Management Types
export const CreateShiftRequest = {
    shiftName: '', // required, max 100 chars
    startTime: '', // required, HH:mm format
    endTime: '', // required, HH:mm format
    description: '', // optional
    isActive: true // default true
};

export const ShiftDetailsResponse = {
    shiftId: 0,
    shiftName: '',
    startTime: '', // LocalTime format
    endTime: '', // LocalTime format
    description: '',
    isActive: false,
    assignedOperators: [] // Array of OperatorAssignment
};

export const OperatorAssignment = {
    operatorId: 0,
    operatorName: '',
    email: '',
    assignmentStatus: '',
    assignmentDate: ''
};

export const ShiftAssignmentRequest = {
    shiftId: 0, // required
    operatorIds: [], // required, array of integers
    assignmentDate: '' // required, YYYY-MM-DD format
};

export const ShiftStatistics = {
    totalShifts: 0,
    activeShifts: 0,
    inactiveShifts: 0
};

// Time-off Management Types
export const TimeOffRequestDto = {
    operatorId: 0, // required
    startDate: '', // required, YYYY-MM-DD format
    endDate: '', // required, YYYY-MM-DD format
    reason: '' // required, min 5 chars
};

export const TimeOffApprovalRequest = {
    requestId: 0, // required
    managerId: 0, // required
    managerComments: '' // optional
};

export const TimeOffStatusResponse = {
    requestId: 0,
    operatorId: 0,
    operatorName: '',
    operatorEmail: '',
    startDate: '', // YYYY-MM-DD format
    endDate: '', // YYYY-MM-DD format
    reason: '',
    status: '', // PENDING, APPROVED, REJECTED
    managerComments: '',
    requestDate: '', // ISO DateTime format
    reviewedDate: '', // ISO DateTime format
    reviewedByName: '',
    reviewedById: 0,
    totalDays: 0,
    hasConflicts: false,
    conflictDetails: ''
};

export const BulkApprovalRequest = {
    requestIds: [], // array of integers
    managerId: 0,
    managerComments: ''
};

export const BulkOperationResult = {
    totalProcessed: 0,
    successCount: 0,
    failureCount: 0
};

export const TimeOffStatistics = {
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalRequests: 0
};

// Enums and Status Labels
export const WorkStatus = {
    WORKING: 'WORKING',
    TIME_OFF: 'TIME_OFF',
    AVAILABLE: 'AVAILABLE'
};

export const WorkStatusLabels = {
    WORKING: 'Đang làm việc',
    TIME_OFF: 'Nghỉ phép',
    AVAILABLE: 'Có thể làm việc'
};

export const ShiftAssignmentStatus = {
    ASSIGNED: 'ASSIGNED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
};

export const ShiftAssignmentStatusLabels = {
    ASSIGNED: 'Đã phân công',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy'
};

export const TimeOffStatusEnum = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
};

export const TimeOffStatusLabels = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối'
};

// Validation patterns and rules
export const ValidationRules = {
    shiftName: {
        required: true,
        maxLength: 100,
        pattern: /^[a-zA-Z0-9\s\-_]+$/
    },
    timeFormat: {
        pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    dateFormat: {
        pattern: /^\d{4}-\d{2}-\d{2}$/
    },
    timeOffReason: {
        required: true,
        minLength: 5,
        maxLength: 500
    },
    maxOperatorsPerShift: 20,
    maxBulkOperations: 50,
    maxDateRangeDays: 90,
    maxTimeOffDays: 365
};

// Color coding for calendar events
export const EventColors = {
    ORDER: '#1890ff', // Blue for orders
    SHIFT: '#52c41a', // Green for shifts
    TIME_OFF: '#ff4d4f', // Red for time-off
    AVAILABLE: '#d9d9d9' // Gray for available
};

// Default values for forms
export const DefaultValues = {
    createShift: {
        shiftName: '',
        startTime: '08:00',
        endTime: '17:00',
        description: '',
        isActive: true
    },
    timeOffRequest: {
        operatorId: 0,
        startDate: '',
        endDate: '',
        reason: ''
    },
    dateRangeQuery: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
};