// User DTO types to match backend

export const UserCreateRequest = {
    fullName: '', // required, max 50 chars
    username: '', // required, 4-100 chars
    email: '',    // required, valid email, max 100 chars
    phone: '',    // required, Vietnamese phone format: ^(\+84|0)[0-9]{9}$, max 20 chars
    address: '',  // optional, max 255 chars
    role: '',     // required, STAFF|MANAGER|CUSTOMER
    gender: '',   // optional, MALE|FEMALE|OTHER
    password: ''  // required, min 6 chars, must contain uppercase, lowercase, and number
};

export const UserUpdateRequest = {
    fullName: '', // required, max 50 chars
    email: '',    // required, valid email, max 100 chars
    phone: '',    // required, Vietnamese phone format, max 20 chars
    address: '',  // optional, max 255 chars
    role: '',     // required, STAFF|MANAGER|CUSTOMER
    gender: ''    // optional, MALE|FEMALE|OTHER
    // Note: password update might need separate endpoint
};

export const UserSearchResponse = {
    id: 0,
    fullName: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    gender: '',
    status: '', // active|blocked
    createdAt: ''
};

// Validation patterns
export const ValidationPatterns = {
    email: /\S+@\S+\.\S+/,
    vietnamesePhone: /^(\+84|0)[0-9]{9}$/,
    password: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/
};

// Role mappings
export const RoleLabels = {
    CUSTOMER: 'Khách hàng',
    STAFF: 'Nhân viên',
    MANAGER: 'Quản lý'
};

// Gender mappings
export const GenderLabels = {
    MALE: 'Nam',
    FEMALE: 'Nữ',
    OTHER: 'Khác'
};

// Status mappings
export const StatusLabels = {
    active: 'Hoạt động',
    blocked: 'Bị khóa'
}; 