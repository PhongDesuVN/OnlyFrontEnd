import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, Plus, Edit, Trash2, Eye, UserCheck, UserX,
    Mail, Phone, MapPin, User, BarChart, List, Settings,
    Truck, Home, Shield, CheckCircle, AlertCircle, X, Save, Calendar
} from 'lucide-react';
import userService from '../../Services/userService.js';

// Add this at the top of the file (after imports)
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

// Header Component
const Header = () => {
    const navigate = useNavigate();
    return (
        <header className="fixed w-full top-0 bg-white shadow-lg z-40">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Truck className="w-8 h-8 text-blue-600" />
                        <h1 className="text-xl font-bold text-black">Vận Chuyển Nhà</h1>
                    </div>
                    <div className="flex space-x-3">
                        <Link to="/">
                            <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                                Trang Chủ
                            </button>
                        </Link>
                        {/* Nút quay về staff dùng hàm navigate */}
                        <button
                            className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all ml-2"
                            onClick={() => navigate('/staff')}
                        >
                            Quay về
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

// Sidebar Component
const Sidebar = ({ currentPage, setCurrentPage }) => {
    const pageLabels = {
        overview: 'Tổng Quan',
        list: 'Danh Sách ',
        search: 'Tìm Kiếm ',
        // add: 'Thêm User Mới' // Bỏ chức năng thêm user
    };

    return (
        <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-64 mt-16 bg-gradient-to-b from-blue-900 to-purple-600 text-white p-6 h-screen shadow-2xl fixed z-30"
        >
            <nav>
                {/* Bỏ 'add' khỏi danh sách */}
                {['overview', 'list', 'search', 'settings'].map(page => (
                    <motion.button
                        key={page}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center w-full text-left py-3 px-4 mb-3 rounded-lg transition-all duration-300 ${
                            currentPage === page ? 'bg-blue-500 shadow-lg' : 'hover:bg-blue-600'
                        }`}
                        onClick={() => setCurrentPage(page)}
                    >
                        {page === 'overview' && <BarChart className="mr-2" size={20} />}
                        {page === 'list' && <List className="mr-2" size={20} />}
                        {page === 'search' && <Search className="mr-2" size={20} />}
                        {/* {page === 'add' && <Plus className="mr-2" size={20} />} */}
                        {pageLabels[page]}
                    </motion.button>
                ))}
            </nav>
        </motion.div>
    );
};

// User Overview Component
const UserOverview = ({ users }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
            <BarChart className="mr-2" /> Tổng Quan Khách Hàng
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                {
                    label: 'Tổng số Khách hàng tư vấn',
                    value: users.length,
                    color: 'blue',
                    icon: Users
                },
                {
                    label: 'Quản lý',
                    value: users.filter(u => u.role === 'MANAGER').length,
                    color: 'purple',
                    icon: Shield
                },
                {
                    label: 'Nhân viên',
                    value: users.filter(u => u.role === 'STAFF').length,
                    color: 'blue',
                    icon: User
                },
                {
                    label: 'Khách hàng',
                    value: users.filter(u => u.role === 'CUSTOMER').length,
                    color: 'green',
                    icon: Users
                }
            ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                    <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                                <p className={`text-3xl font-bold text-${item.color}-600`}>{item.value}</p>
                            </div>
                            <IconComponent className={`w-10 h-10 text-${item.color}-500`} />
                        </div>
                    </motion.div>
                );
            })}
        </div>

        {/* Thống kê trạng thái */}
        <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Thống Kê Trạng Thái</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    {
                        label: 'User Hoạt động',
                        value: users.filter(u => u.status === 'ACTIVE').length,
                        color: 'green',
                        icon: UserCheck
                    },
                    {
                        label: 'User Bị khóa',
                        value: users.filter(u => u.status === 'BLOCKED').length,
                        color: 'red',
                        icon: UserX
                    },
                    {
                        label: 'Tỷ lệ hoạt động',
                        value: users.length > 0 ? Math.round((users.filter(u => u.status === 'ACTIVE').length / users.length) * 100) + '%' : '0%',
                        color: 'blue',
                        icon: BarChart
                    }
                ].map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{item.label}</p>
                                    <p className={`text-2xl font-bold text-${item.color}-600`}>{item.value}</p>
                                </div>
                                <IconComponent className={`w-8 h-8 text-${item.color}-500`} />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    </motion.div>
);

// User List Component
const UserList = ({ users, onEditUser, onDeleteUser, onToggleStatus }) => {
    // Thêm state cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;
    const totalPages = Math.ceil(users.length / usersPerPage);
    const startIdx = (currentPage - 1) * usersPerPage;
    const endIdx = startIdx + usersPerPage;
    const pagedUsers = users.slice(startIdx, endIdx);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
                <List className="mr-2" /> Danh Sách Khách Hàng
            </h2>
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto border border-gray-100">
                <table className="w-full border-collapse">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-3 text-left text-gray-700">ID</th>
                        <th className="border p-3 text-left text-gray-700">Họ Tên</th>
                        <th className="border p-3 text-left text-gray-700">Tên đăng nhập</th>
                        <th className="border p-3 text-left text-gray-700">Email</th>
                        <th className="border p-3 text-left text-gray-700">Vai Trò</th>
                        <th className="border p-3 text-left text-gray-700">Số Điện Thoại</th>
                        <th className="border p-3 text-left text-gray-700">Trạng Thái</th>
                        <th className="border p-3 text-left text-gray-700">Ngày Tạo</th>
                        <th className="border p-3 text-left text-gray-700">Hành Động</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pagedUsers.map(user => (
                        <motion.tr
                            key={user.id}
                            whileHover={{ backgroundColor: '#f3f4f6' }}
                            transition={{ duration: 0.2 }}
                        >
                            <td className="border p-3">{user.id}</td>
                            <td className="border p-3">
                                <div className="flex items-center">
                                    <User className="w-4 h-4 mr-2 text-gray-500" />
                                    {user.fullName}
                                </div>
                            </td>
                            <td className="border p-3 text-gray-600">{user.username}</td>
                            <td className="border p-3">{user.email}</td>
                            <td className="border p-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        user.role === 'MANAGER'
                                            ? 'bg-purple-100 text-purple-800'
                                            : user.role === 'STAFF'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {user.role === 'MANAGER' ? 'Quản lý' :
                                            user.role === 'STAFF' ? 'Nhân viên' : 'Khách hàng'}
                                    </span>
                            </td>
                            <td className="border p-3">{user.phone}</td>
                            <td className="border p-3">
                                    <span className={`px-2 py-1 rounded-full text-sm ${
                                        user.status === 'ACTIVE'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {user.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                                    </span>
                            </td>
                            <td className="border p-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td className="border p-3">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => onEditUser(user)}
                                        className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => onToggleStatus(user.id)}
                                        className={`p-2 text-white rounded transition-colors ${
                                            user.status === 'ACTIVE'
                                                ? 'bg-orange-500 hover:bg-orange-600'
                                                : 'bg-green-500 hover:bg-green-600'
                                        }`}
                                        title={user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                    >
                                        {user.status === 'ACTIVE' ? <UserX size={16} /> : <UserCheck size={16} />}
                                    </button>
                                    <button
                                        onClick={() => onDeleteUser(user.id)}
                                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                        title="Xóa"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </motion.tr>
                    ))}
                    </tbody>
                </table>
                {/* Phân trang */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-6 space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                        >
                            Trước
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-400' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Search Users Component
const SearchUsers = ({ users, searchParams, setSearchParams }) => {
    const [filteredUsers, setFilteredUsers] = useState(users);

    useEffect(() => {
        const filtered = users.filter(user => {
            return (
                (!searchParams.fullname || user.fullName?.toLowerCase().includes(searchParams.fullname.toLowerCase())) &&
                (!searchParams.username || user.username?.toLowerCase().includes(searchParams.username.toLowerCase())) &&
                (!searchParams.email || user.email?.toLowerCase().includes(searchParams.email.toLowerCase())) &&
                (!searchParams.role || user.role === searchParams.role) &&
                (!searchParams.phone || user.phone?.includes(searchParams.phone)) &&
                (!searchParams.address || user.address?.toLowerCase().includes(searchParams.address.toLowerCase()))
            );
        });
        setFilteredUsers(filtered);
    }, [users, searchParams]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
                <Search className="mr-2" /> Tìm Kiếm Khách Hàng
            </h2>

            {/* Search Form */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Họ Tên</label>
                        <input
                            type="text"
                            placeholder="Nhập họ tên..."
                            value={searchParams.fullname}
                            onChange={(e) => setSearchParams({...searchParams, fullname: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
                        <input
                            type="text"
                            placeholder="Nhập username..."
                            value={searchParams.username || ''}
                            onChange={(e) => setSearchParams({...searchParams, username: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            placeholder="Nhập email..."
                            value={searchParams.email}
                            onChange={(e) => setSearchParams({...searchParams, email: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vai Trò</label>
                        <select
                            value={searchParams.role || ''}
                            onChange={(e) => setSearchParams({...searchParams, role: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tất cả vai trò</option>
                            <option value="CUSTOMER">Khách hàng</option>
                            <option value="STAFF">Nhân viên</option>
                            <option value="MANAGER">Quản lý</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số Điện Thoại</label>
                        <input
                            type="text"
                            placeholder="Nhập số điện thoại..."
                            value={searchParams.phone}
                            onChange={(e) => setSearchParams({...searchParams, phone: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Địa Chỉ</label>
                        <input
                            type="text"
                            placeholder="Nhập địa chỉ..."
                            value={searchParams.address}
                            onChange={(e) => setSearchParams({...searchParams, address: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <button
                        onClick={() => setSearchParams({ fullname: '', username: '', email: '', role: '', phone: '', address: '' })}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Xóa Bộ Lọc
                    </button>
                </div>
            </div>

            {/* Search Results */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold mb-4">Kết Quả Tìm Kiếm ({filteredUsers.length} khách hàng)</h3>
                {filteredUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredUsers.map(user => (
                            <motion.div
                                key={user.id}
                                whileHover={{ scale: 1.02 }}
                                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center mb-2">
                                    <User className="w-8 h-8 text-blue-500 mr-2" />
                                    <h4 className="font-semibold">{user.fullName}</h4>
                                </div>
                                <p className="text-sm text-gray-600 flex items-center mb-1">
                                    <Mail className="w-4 h-4 mr-1" /> {user.email}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center mb-1">
                                    <Phone className="w-4 h-4 mr-1" /> {user.phone}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center mb-2">
                                    <MapPin className="w-4 h-4 mr-1" /> {user.address}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center mb-2">
                                    <Calendar className="w-4 h-4 mr-1" /> {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                </p>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    user.status === 'ACTIVE'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {user.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Không tìm thấy user nào phù hợp với tiêu chí tìm kiếm.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// User Form Component (for Add/Edit)
const UserForm = ({ user, isEdit, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        role: user?.role || 'CUSTOMER',
        gender: user?.gender || 'OTHER',
        password: '',
        status: user?.status || 'ACTIVE'
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        // Full Name validation
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Họ tên không được để trống';
        } else if (formData.fullName.length > 50) {
            newErrors.fullName = 'Họ tên không được vượt quá 50 ký tự';
        }

        // Username validation (only for create)
        if (!isEdit) {
            if (!formData.username.trim()) {
                newErrors.username = 'Username không được để trống';
            } else if (formData.username.length < 4 || formData.username.length > 100) {
                newErrors.username = 'Username phải có từ 4-100 ký tự';
            }
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email không được để trống';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        } else if (formData.email.length > 100) {
            newErrors.email = 'Email không được vượt quá 100 ký tự';
        }

        // Phone validation (Vietnamese format)
        if (!formData.phone.trim()) {
            newErrors.phone = 'Số điện thoại không được để trống';
        } else if (!/^(\+84|0)[0-9]{9}$/.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại không đúng định dạng Việt Nam';
        } else if (formData.phone.length > 20) {
            newErrors.phone = 'Số điện thoại không được vượt quá 20 ký tự';
        }

        // Address validation
        if (formData.address && formData.address.length > 255) {
            newErrors.address = 'Địa chỉ không được vượt quá 255 ký tự';
        }

        // Role validation
        if (!formData.role) {
            newErrors.role = 'Vai trò không được để trống';
        } else if (!['STAFF', 'MANAGER', 'CUSTOMER'].includes(formData.role)) {
            newErrors.role = 'Vai trò phải là STAFF, MANAGER hoặc CUSTOMER';
        }

        // Password validation (only for create)
        if (!isEdit) {
            if (!formData.password.trim()) {
                newErrors.password = 'Mật khẩu không được để trống';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            } else if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/.test(formData.password)) {
                newErrors.password = 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formData);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
                <Plus className="mr-2" /> {isEdit ? 'Cập Nhật User' : 'Thêm User Mới'}
            </h2>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Họ Tên */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Họ Tên *
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Nhập họ tên (tối đa 50 ký tự)..."
                                maxLength={50}
                            />
                            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                        </div>

                        {/* Username - chỉ hiển thị khi tạo mới */}
                        {!isEdit && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.username ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Nhập tên đăng nhập (4-100 ký tự)..."
                                    minLength={4}
                                    maxLength={100}
                                />
                                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Nhập email (tối đa 100 ký tự)..."
                                maxLength={100}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {/* Số Điện Thoại */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số Điện Thoại *
                            </label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="VD: 0912345678 hoặc +84912345678"
                                maxLength={20}
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>

                        {/* Vai trò */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vai Trò *
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.role ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="CUSTOMER">Khách hàng</option>
                                <option value="STAFF">Nhân viên</option>
                                <option value="MANAGER">Quản lý</option>
                            </select>
                            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                        </div>

                        {/* Giới tính */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Giới Tính
                            </label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </div>

                        {/* Mật khẩu - chỉ hiển thị khi tạo mới */}
                        {!isEdit && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật Khẩu *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                                            errors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Nhập mật khẩu (ít nhất 6 ký tự, có chữ hoa, thường và số)..."
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <Eye size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                <p className="text-xs text-gray-500 mt-1">
                                    Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số
                                </p>
                            </div>
                        )}

                        {/* Trạng thái - chỉ hiển thị khi chỉnh sửa */}
                        {isEdit && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trạng Thái
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="ACTIVE">Hoạt động</option>
                                    <option value="BLOCKED">Bị khóa</option>
                                </select>
                            </div>
                        )}

                        {/* Địa chỉ */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Địa Chỉ
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                rows={3}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.address ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Nhập địa chỉ (tối đa 255 ký tự)..."
                                maxLength={255}
                            />
                            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                        </div>
                    </div>

                    <div className="flex space-x-4 mt-8">
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isEdit ? 'Cập Nhật' : 'Thêm Mới'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

// Main Dashboard Component
const Dashboard = () => {
    const [currentPage, setCurrentPage] = useState('overview');
    const [users, setUsers] = useState([]);
    const [searchParams, setSearchParams] = useState({
        fullname: '',
        username: '',
        email: '',
        role: '',
        phone: '',
        address: ''
    });
    const [editingUser, setEditingUser] = useState(null);
    const [showUserForm, setShowUserForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Load users on component mount
    useEffect(() => {
        loadUsers();
    }, []);

    // Auto clear success message after 3 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const userData = await userService.getAllUsers({});
            // Lọc chỉ lấy khách hàng (role === 'CUSTOMER')
            const customers = userData.filter(u => u.role === 'CUSTOMER');
            // Sort users by createdAt date (newest first)
            const sortedUsers = customers.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateB - dateA; // Descending order (newest first)
            });
            setUsers(sortedUsers);
        } catch (err) {
            setError('Không thể tải danh sách khách hàng . Sử dụng dữ liệu mẫu.');
            console.error('Error loading users:', err);
            // Giữ dữ liệu mẫu nếu API không hoạt động
        } finally {
            setLoading(false);
        }
    };

    // Bỏ hoàn toàn chức năng thêm user mới
    // const handleAddUser = async (userData) => { ... } // XÓA

    const handleEditUser = (user) => {
        setEditingUser(user);
        setShowUserForm(true);
        // setCurrentPage('add'); // Không chuyển sang trang add nữa
    };

    const handleUpdateUser = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            console.log('Updating user with ID:', editingUser.id);
            console.log('Update data:', userData);

            // Filter out fields that shouldn't be sent in update request
            const updateData = {
                fullName: userData.fullName,
                email: userData.email,
                phone: userData.phone,
                address: userData.address,
                role: userData.role,
                gender: userData.gender
            };

            console.log('Filtered update data:', updateData);

            const updatedUser = await userService.updateUser(editingUser.id, updateData);

            console.log('Update successful, received:', updatedUser);

            // Cập nhật state với user đã được cập nhật
            setUsers(users.map(user =>
                user.id === editingUser.id ? { ...editingUser, ...userData } : user
            ));

            setEditingUser(null);
            setShowUserForm(false);
            setCurrentPage('list');
            setSuccess('User đã được cập nhật thành công');

            // Hiển thị thông báo thành công
            console.log('User updated successfully');

        } catch (err) {
            console.error('Update error details:', err);
            setError(`Không thể cập nhật user: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa user này?')) {
            setLoading(true);
            try {
                await userService.deleteUser(userId);
                setUsers(users.filter(user => user.id !== userId));
                setSuccess('User đã được xóa thành công');
            } catch (err) {
                setError('Không thể xóa user');
                console.error('Error deleting user:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleToggleStatus = async (userId) => {
        setLoading(true);
        try {
            await userService.changeUserStatus(userId);
            setUsers(users.map(user =>
                user.id === userId
                    ? { ...user, status: user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' }
                    : user
            ));
            setSuccess('Trạng thái user đã được thay đổi thành công');
        } catch (err) {
            setError('Không thể thay đổi trạng thái user');
            console.error('Error changing user status:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderPage = () => {
        // Không cho phép hiển thị form thêm mới, chỉ cho phép chỉnh sửa
        if (showUserForm && editingUser) {
            return (
                <UserForm
                    user={editingUser}
                    isEdit={true}
                    onSave={handleUpdateUser}
                    onCancel={() => {
                        setShowUserForm(false);
                        setEditingUser(null);
                        setCurrentPage('list');
                    }}
                />
            );
        }
        switch (currentPage) {
            case 'overview':
                return <UserOverview users={users} />;
            case 'list':
                return (
                    <UserList
                        users={users}
                        onEditUser={handleEditUser}
                        onDeleteUser={handleDeleteUser}
                        onToggleStatus={handleToggleStatus}
                    />
                );
            case 'search':
                return (
                    <SearchUsers
                        users={users}
                        searchParams={searchParams}
                        setSearchParams={setSearchParams}
                    />
                );
            case 'settings':
                return <SettingsPage />;
            default:
                return <UserOverview users={users} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <main className="flex-1 ml-64 pt-20 p-8">
                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center"
                    >
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {error}
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-700 hover:text-red-900"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}

                {/* Loading Indicator */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
                    >
                        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="text-gray-700">Đang xử lý...</span>
                        </div>
                    </motion.div>
                )}

                {/* Success Message */}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center"
                    >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {success}
                        <button
                            onClick={() => setSuccess(null)}
                            className="ml-auto text-green-700 hover:text-green-900"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {renderPage()}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Dashboard;