"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "../../utils/axiosInstance.js";
import Header from '../../Components/FormLogin_yen/Header.jsx';
import Footer from "../../Components/FormLogin_yen/Footer.jsx";
import {
    Edit, MessageSquare, Ban, Search, Phone, Mail, MapPin, User, X,
    AlertTriangle, Loader2, Shield, Home, ChevronLeft, Zap, Download, LogOut, Truck
} from "lucide-react";

// Hàm validate
const validateField = (field, value) => {
    switch (field) {
        case "searchTerm":
            if (value.length > 100) return "Tìm kiếm không được vượt quá 100 ký tự";
            if (!/^[a-zA-Z0-9\s\-_]*$/.test(value)) return "Tìm kiếm chỉ chứa chữ cái, số, dấu cách, dấu gạch ngang, dấu gạch dưới";
            return "";
        case "username":
            if (!value) return "Tên đăng nhập không được để trống";
            if (value.length < 3 || value.length > 50) return "Tên đăng nhập phải từ 3-50 ký tự";
            if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Tên đăng nhập chỉ chứa chữ cái, số, dấu gạch dưới";
            return "";
        case "fullName":
            if (!value) return "Họ và tên không được để trống";
            if (value.length < 2 || value.length > 100) return "Họ và tên phải từ 2-100 ký tự";
            if (!/^[a-zA-Z\s\-]+$/.test(value)) return "Họ và tên chỉ chứa chữ cái, dấu cách, dấu gạch ngang";
            return "";
        case "email":
            if (!value) return "Email không được để trống";
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email không hợp lệ";
            return "";
        case "phone":
            if (!value) return "Số điện thoại không được để trống";
            if (!/^(?:\+84|0)(?:3[2-9]|5[689]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/.test(value)) return "Số điện thoại không hợp lệ (VD: +84987654321 hoặc 0987654321)";
            return "";
        case "address":
            if (!value) return "Địa chỉ không được để trống";
            if (value.length < 5 || value.length > 200) return "Địa chỉ phải từ 5-200 ký tự";
            return "";
        case "gender":
            if (!value || !["MALE", "FEMALE"].includes(value)) return "Vui lòng chọn giới tính";
            return "";
        case "status":
            if (!value || !["ACTIVE", "INACTIVE"].includes(value)) return "Vui lòng chọn trạng thái";
            return "";
        case "feedback":
            if (!value) return "Phản hồi không được để trống";
            if (value.length > 500) return "Phản hồi không được vượt quá 500 ký tự";
            return "";
        default:
            return "";
    }
};

// Component hiển thị trường thông tin nhân viên
const StaffInfoField = ({ icon: Icon, value }) => (
    value && (
        <div className="flex items-center gap-4 text-slate-600">
            <div className="p-2 bg-blue-100 rounded-lg">
                <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-semibold text-lg">{value}</span>
        </div>
    )
);

// Component Modal Phản hồi
const FeedbackModal = ({ staff, feedback, setFeedback, onSubmit, onClose, errors }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500 rounded-lg">
                        <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">Gửi Phản Hồi</h2>
                        <p className="text-slate-600 text-sm">Đến: {staff.username}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-6 h-6 text-slate-400" />
                </button>
            </div>
            <div className="relative">
                <textarea
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className={`w-full border ${errors.feedback ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 shadow-sm placeholder-gray-400`}
                    placeholder="Viết phản hồi của bạn tại đây..."
                />
                {errors.feedback && <p className="text-red-500 text-sm mt-1">{errors.feedback}</p>}
            </div>
            <div className="mt-4 flex justify-end gap-4">
                <button onClick={onClose} className="px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 focus:ring-2 focus:ring-gray-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    Hủy Bỏ
                </button>
                <button
                    onClick={onSubmit}
                    disabled={!!errors.feedback}
                    className={`px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-sm hover:shadow-md ${errors.feedback ? "opacity-50 cursor-not-allowed" : "hover:from-blue-700 hover:to-blue-800"}`}
                >
                    Gửi Phản Hồi
                </button>
            </div>
        </div>
    </div>
);

// Component Modal Chỉnh sửa
const EditModal = ({ staff, editForm, setEditForm, onSubmit, onClose, errors }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-500 rounded-lg">
                        <Edit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">Chỉnh Sửa Nhân Viên</h2>
                        <p className="text-slate-600 text-sm">{staff.username}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-6 h-6 text-slate-400" />
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1 flex items-center gap-2">
                        <User className="w-4 h-4" /> Tên Đăng Nhập
                    </label>
                    <input
                        className={`w-full border ${errors.username ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 shadow-sm`}
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    />
                    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                </div>
                <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email
                    </label>
                    <input
                        className={`w-full border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 shadow-sm`}
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1 flex items-center gap-2">
                        <User className="w-4 h-4" /> Họ và Tên
                    </label>
                    <input
                        className={`w-full border ${errors.fullName ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 shadow-sm`}
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>
                <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1 flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Số Điện Thoại
                    </label>
                    <input
                        className={`w-full border ${errors.phone ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 shadow-sm`}
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1 flex items-center gap-2">
                        <User className="w-4 h-4" /> Giới Tính
                    </label>
                    <select
                        className={`w-full border ${errors.gender ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 shadow-sm`}
                        value={editForm.gender || ""}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    >
                        <option value="">Chọn giới tính</option>
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>
                <div>
                    <label className="block text-sm font-bold text-blue-700 mb-1 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Trạng Thái
                    </label>
                    <select
                        className={`w-full border ${errors.status ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 shadow-sm`}
                        value={editForm.status || ""}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                        <option value="">Chọn trạng thái</option>
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Không hoạt động</option>
                    </select>
                    {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-blue-700 mb-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Địa Chỉ
                    </label>
                    <input
                        className={`w-full border ${errors.address ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 shadow-sm`}
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
            </div>
            <div className="mt-4 flex justify-end gap-4">
                <button onClick={onClose} className="px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 focus:ring-2 focus:ring-gray-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    Hủy Bỏ
                </button>
                <button
                    onClick={onSubmit}
                    disabled={Object.values(errors).some((error) => error)}
                    className={`px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg focus:ring-2 focus:ring-green-400 transition-all duration-300 shadow-sm hover:shadow-md ${Object.values(errors).some((error) => error) ? "opacity-50 cursor-not-allowed" : "hover:from-green-700 hover:to-green-800"}`}
                >
                    Cập Nhật
                </button>
            </div>
        </div>
    </div>
);

// Component Modal Xác nhận
const ConfirmModal = ({ onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 w-full max-w-lg p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-2">Xác Nhận Chặn</h2>
            <p className="text-slate-600 mb-4">
                Bạn có chắc chắn muốn chặn nhân viên này không?<br />
                <span className="font-bold text-red-600">Hành động này không thể hoàn tác!</span>
            </p>
            <div className="flex justify-center gap-4">
                <button onClick={onClose} className="px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 focus:ring-2 focus:ring-gray-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    Hủy Bỏ
                </button>
                <button onClick={onConfirm} className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    Chặn
                </button>
            </div>
        </div>
    </div>
);

// Component Modal Chi tiết Nhân viên
const StaffDetailsModal = ({ staff, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500 rounded-lg">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">Thông Tin Nhân Viên</h2>
                        <p className="text-slate-600 text-sm">{staff.username}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-6 h-6 text-slate-400" />
                </button>
            </div>
            <div className="space-y-4">
                <StaffInfoField icon={User} value={staff.fullName} />
                <StaffInfoField icon={User} value={`@${staff.username}`} />
                <StaffInfoField icon={Mail} value={staff.email} />
                <StaffInfoField icon={Phone} value={staff.phone} />
                <StaffInfoField icon={MapPin} value={staff.address} />
                <StaffInfoField icon={Shield} value={staff.status === "ACTIVE" ? "Hoạt động" : staff.status === "INACTIVE" ? "Không hoạt động" : "Bị chặn"} />
                <StaffInfoField icon={User} value={staff.gender === "MALE" ? "Nam" : staff.gender === "FEMALE" ? "Nữ" : "Chưa có"} />
            </div>
            <div className="mt-4 flex justify-end">
                <button onClick={onClose} className="px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 focus:ring-2 focus:ring-gray-400 transition-all duration-300 shadow-sm hover:shadow-md">
                    Đóng
                </button>
            </div>
        </div>
    </div>
);

// Component Sidebar
const LeftMenu = ({ onBackToHome, onStaffList, onOverview, onLogout }) => (
    <aside className="w-64 sticky top-28 self-start h-[calc(100vh-112px)] z-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl border-r border-blue-700/30 backdrop-blur-sm">
        <div className="mb-10 p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-blue-300/5 to-transparent blur-2xl rounded-2xl"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-50 tracking-wide">Hệ thống quản lý</h2>
                    </div>
                </div>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-400 via-blue-300 to-transparent rounded-full"></div>
            </div>
        </div>
        <nav className="px-4 space-y-3">
            <button
                onClick={onBackToHome}
                className="w-full group flex items-center gap-4 p-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"
            >
                <div className="p-2 rounded-xl transition-all duration-300 group-hover:bg-blue-700/50">
                    <Home className="w-5 h-5 text-blue-300 group-hover:text-blue-100" />
                </div>
                <span className="flex-1 text-left font-semibold">Về trang chủ</span>
            </button>
            <button
                onClick={onStaffList}
                className="w-full group flex items-center gap-4 p-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                <div className="p-2 rounded-xl bg-blue-500/40 shadow-lg">
                    <User className="w-5 h-5 text-blue-100" />
                </div>
                <span className="flex-1 text-left font-semibold">Danh sách</span>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
            </button>
            <button
                onClick={onOverview}
                className="w-full group flex items-center gap-4 p-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"
            >
                <div className="p-2 rounded-xl transition-all duration-300 group-hover:bg-blue-700/50">
                    <Zap className="w-5 h-5 text-blue-300 group-hover:text-blue-100" />
                </div>
                <span className="flex-1 text-left font-semibold">Tổng quan</span>
            </button>
            <button
                onClick={onLogout}
                className="w-full group flex items-center gap-4 p-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"
            >
                <div className="p-2 rounded-xl transition-all duration-300 group-hover:bg-blue-700/50">
                    <LogOut className="w-5 h-5 text-blue-300 group-hover:text-blue-100" />
                </div>
                <span className="flex-1 text-left font-semibold">Đăng Xuất</span>
            </button>
        </nav>
        <div className="absolute bottom-8 left-6 right-6">
            <div className="relative">
                <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent blur-sm"></div>
            </div>
        </div>
    </aside>
);

export default function StaffManagement() {
    const [state, setState] = useState({
        managerId: null,
        staffList: [],
        searchTerm: "",
        filter: "",
        loading: false,
        selectedStaff: null,
        feedback: "",
        editStaff: null,
        editForm: { email: "", fullName: "", phone: "", address: "", username: "", gender: "", status: "" },
        errors: { searchTerm: "", username: "", fullName: "", email: "", phone: "", address: "", gender: "", status: "", feedback: "" },
        currentPage: 0,
        totalPages: 0,
        confirmAction: { type: "", staffId: null },
        filtered: false,
        staffDetails: null,
        showDetailsModal: false,
        exporting: false,
    });

    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get("authToken");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                setState((prev) => ({ ...prev, managerId: payload.managerId }));
            } catch {
                setState((prev) => ({ ...prev, managerId: null }));
            }
        }
    }, []);

    useEffect(() => {
        if (state.managerId) {
            fetchStaffList();
        }
    }, [state.managerId, state.filter]);

    useEffect(() => {
        setState((prev) => ({
            ...prev,
            errors: { ...prev.errors, searchTerm: validateField("searchTerm", prev.searchTerm) }
        }));
    }, [state.searchTerm]);

    useEffect(() => {
        if (state.editStaff) {
            setState((prev) => ({
                ...prev,
                errors: {
                    ...prev.errors,
                    username: validateField("username", prev.editForm.username),
                    fullName: validateField("fullName", prev.editForm.fullName),
                    email: validateField("email", prev.editForm.email),
                    phone: validateField("phone", prev.editForm.phone),
                    address: validateField("address", prev.editForm.address),
                    gender: validateField("gender", prev.editForm.gender),
                    status: validateField("status", prev.editForm.status),
                }
            }));
        }
    }, [state.editForm]);

    useEffect(() => {
        if (state.selectedStaff) {
            setState((prev) => ({
                ...prev,
                errors: { ...prev.errors, feedback: validateField("feedback", prev.feedback) }
            }));
        }
    }, [state.feedback]);

    const fetchStaffList = async (page = 0) => {
        setState((prev) => ({ ...prev, loading: true }));
        try {
            const params = { page, size: 5 };
            let url = `/api/v1/manager/${state.managerId}/staff`;

            if (state.searchTerm || state.filter) {
                url = `/api/v1/manager/${state.managerId}/staff/filter`;
                if (state.searchTerm) params.searchTerm = state.searchTerm;
                if (state.filter) {
                    if (["ACTIVE", "INACTIVE", "BLOCKED"].includes(state.filter)) {
                        params.status = state.filter;
                    } else if (["MALE", "FEMALE"].includes(state.filter)) {
                        params.gender = state.filter;
                    }
                }
            }

            const res = await axios.get(url, { params });
            const staffData = res.data.data.staffs || res.data.data.content || [];
            setState((prev) => ({
                ...prev,
                staffList: Array.isArray(staffData) ? staffData : [],
                totalPages: res.data.data.totalPages || 0,
                currentPage: page,
                filtered: !!(state.searchTerm || state.filter),
            }));
        } catch (error) {
            console.error("Fetch staff list failed:", error);
            setState((prev) => ({ ...prev, staffList: [] }));
            alert("Không thể tải danh sách nhân viên");
        } finally {
            setState((prev) => ({ ...prev, loading: false }));
        }
    };

    const handleSearch = async () => {
        if (state.errors.searchTerm) {
            alert(state.errors.searchTerm);
            return;
        }
        fetchStaffList();
    };

    const handleFeedback = async () => {
        if (state.errors.feedback) {
            alert(state.errors.feedback);
            return;
        }
        try {
            await axios.post(`/api/v1/manager/${state.managerId}/staff/${state.selectedStaff.operatorId}/feedback`, {
                message: state.feedback,
            });
            alert("Phản hồi đã được gửi thành công");
            setState((prev) => ({ ...prev, feedback: "", selectedStaff: null, errors: { ...prev.errors, feedback: "" } }));
        } catch (error) {
            console.error("Failed to send feedback:", error);
            alert("Không thể gửi phản hồi");
        }
    };

    const handleBlock = async () => {
        try {
            await axios.patch(`/api/v1/manager/${state.managerId}/staff/${state.confirmAction.staffId}/block`);
            alert("Nhân viên đã bị chặn");
            fetchStaffList(state.currentPage);
        } catch (error) {
            console.error("Failed to block staff:", error);
            alert("Không thể chặn nhân viên");
        } finally {
            setState((prev) => ({ ...prev, confirmAction: { type: "", staffId: null } }));
        }
    };

    const handleEdit = async () => {
        const errors = {
            username: validateField("username", state.editForm.username),
            fullName: validateField("fullName", state.editForm.fullName),
            email: validateField("email", state.editForm.email),
            phone: validateField("phone", state.editForm.phone),
            address: validateField("address", state.editForm.address),
            gender: validateField("gender", state.editForm.gender),
            status: validateField("status", state.editForm.status),
        };
        if (Object.values(errors).some((error) => error)) {
            setState((prev) => ({ ...prev, errors }));
            alert("Vui lòng kiểm tra lại các trường thông tin");
            return;
        }
        try {
            await axios.put(`/api/v1/manager/${state.managerId}/staff/${state.editStaff.operatorId}`, state.editForm);
            alert("Nhân viên đã được cập nhật");
            fetchStaffList(state.currentPage);
            setState((prev) => ({ ...prev, editStaff: null, errors: { ...prev.errors, username: "", fullName: "", email: "", phone: "", address: "", gender: "", status: "" } }));
        } catch (error) {
            console.error("Failed to update staff:", error);
            alert("Cập nhật thất bại");
        }
    };

    const handleExportExcel = async () => {
        setState((prev) => ({ ...prev, exporting: true }));
        try {
            const payload = {
                searchTerm: state.searchTerm || null,
                includeStatistics: true,
            };
            if (state.filter) {
                if (["ACTIVE", "INACTIVE", "BLOCKED"].includes(state.filter)) {
                    payload.status = state.filter;
                } else if (["MALE", "FEMALE"].includes(state.filter)) {
                    payload.gender = state.filter;
                }
            }

            const response = await axios.post(`/api/v1/manager/${state.managerId}/staff/export`, payload, {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Staff_Export_${state.managerId}_${new Date().toISOString().slice(0, 10)}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            alert("Xuất Excel thành công!");
        } catch (error) {
            console.error("Export Excel failed:", error);
            alert("Không thể xuất file Excel");
        } finally {
            setState((prev) => ({ ...prev, exporting: false }));
        }
    };

    const fetchStaffDetails = async (operatorId) => {
        setState((prev) => ({ ...prev, loading: true }));
        try {
            const res = await axios.get(`/api/v1/manager/${state.managerId}/staff/${operatorId}`);
            setState((prev) => ({ ...prev, staffDetails: res.data.data, showDetailsModal: true }));
        } catch (error) {
            console.error("Failed to fetch staff details:", error);
            alert("Không thể tải thông tin chi tiết nhân viên");
        } finally {
            setState((prev) => ({ ...prev, loading: false }));
        }
    };

    const handleBackToHome = () => {
        window.history.back();
    };

    const handleLogout = () => {
        Cookies.remove("authToken");
        window.location.href = "/login";
    };

    const getPageNumbers = () => {
        const maxPageButtons = 5;
        const pages = [];
        let startPage = Math.max(0, state.currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(state.totalPages - 1, startPage + maxPageButtons - 1);

        if (endPage - startPage < maxPageButtons - 1) {
            startPage = Math.max(0, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    const goToPrevious = () => {
        if (state.currentPage > 0) {
            fetchStaffList(state.currentPage - 1);
        }
    };

    const goToNext = () => {
        if (state.currentPage < state.totalPages - 1) {
            fetchStaffList(state.currentPage + 1);
        }
    };

    if (!state.managerId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-2" />
                    <p className="text-white text-lg font-medium">Đang tải thông tin quản lý...</p>
                    <p className="text-blue-200 text-sm mt-1">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <LeftMenu
                    onBackToHome={handleBackToHome}
                    onStaffList={() => fetchStaffList()}
                    onOverview={() => navigate("/staffperformance")}
                    onLogout={handleLogout}
                />
                <main className="flex-1 pt-20 pb-16 px-6">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-8">
                        Quản Lý Nhân Viên
                    </h1>
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-200 mb-8">
                        <div className="flex flex-col sm:flex-row gap-3 items-center">
                            <div className="relative flex-1">
                                <input
                                    className={`w-full px-4 py-2.5 bg-white border ${state.errors.searchTerm ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 text-gray-800 shadow-sm placeholder-gray-400`}
                                    placeholder="Tìm kiếm theo tên, email hoặc username..."
                                    value={state.searchTerm}
                                    onChange={(e) => setState((prev) => ({ ...prev, searchTerm: e.target.value }))}
                                    onKeyPress={(e) => e.key === "Enter" && !state.errors.searchTerm && handleSearch()}
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 hover:text-blue-600 transition-colors duration-200" />
                                {state.errors.searchTerm && <p className="text-red-500 text-sm mt-1">{state.errors.searchTerm}</p>}
                            </div>
                            <div className="w-full sm:w-48">
                                <select
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 text-gray-800 shadow-sm"
                                    value={state.filter}
                                    onChange={(e) => setState((prev) => ({ ...prev, filter: e.target.value }))}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="ACTIVE">Trạng thái: Hoạt động</option>
                                    <option value="INACTIVE">Trạng thái: Không hoạt động</option>
                                    <option value="BLOCKED">Trạng thái: Bị chặn</option>
                                    <option value="MALE">Giới tính: Nam</option>
                                    <option value="FEMALE">Giới tính: Nữ</option>
                                </select>
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={state.loading || state.errors.searchTerm}
                                className={`px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-sm hover:shadow-md ${state.loading || state.errors.searchTerm ? "opacity-50 cursor-not-allowed" : "hover:from-blue-700 hover:to-blue-800"}`}
                                title="Tìm kiếm nhân viên"
                            >
                                {state.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                Tìm
                            </button>
                            <button
                                onClick={handleExportExcel}
                                disabled={state.exporting || state.loading}
                                className={`px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg focus:ring-2 focus:ring-green-400 transition-all duration-300 shadow-sm hover:shadow-md ${state.exporting || state.loading ? "opacity-50 cursor-not-allowed" : "hover:from-green-700 hover:to-green-800"}`}
                                title="Xuất danh sách nhân viên"
                            >
                                {state.exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                Xuất
                            </button>
                            {state.filtered && (
                                <button
                                    onClick={() => {
                                        setState((prev) => ({ ...prev, searchTerm: "", filter: "", filtered: false, errors: { ...prev.errors, searchTerm: "" } }));
                                        fetchStaffList();
                                    }}
                                    className="px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 focus:ring-2 focus:ring-gray-400 transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2"
                                    title="Quay lại danh sách đầy đủ"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Quay lại
                                </button>
                            )}
                        </div>
                    </div>
                    {state.loading ? (
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 p-6 text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-2" />
                            <p className="text-slate-700 text-lg font-bold">Đang tải danh sách nhân viên...</p>
                            <p className="text-slate-500 text-sm">Chuẩn bị dữ liệu cho bạn</p>
                        </div>
                    ) : state.staffList.length === 0 ? (
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-200 p-6 text-center">
                            <User className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                            <p className="text-slate-700 text-lg font-bold">Không tìm thấy nhân viên nào</p>
                            <p className="text-slate-600 text-sm">Thử điều chỉnh từ khóa tìm kiếm hoặc thêm nhân viên mới</p>
                        </div>
                    ) : (
                        <div className="space-y-6 overflow-hidden">
                            <table className="w-full bg-white/90 border border-blue-200 rounded-xl shadow-lg">
                                <thead>
                                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm rounded-t-xl">
                                    <th className="p-4 text-left">Họ và Tên</th>
                                    <th className="p-4 text-left">Username</th>
                                    <th className="p-4 text-left">Email</th>
                                    <th className="p-4 text-left">Số Điện Thoại</th>
                                    <th className="p-4 text-left">Địa Chỉ</th>
                                    <th className="p-4 text-left">Trạng Thái</th>
                                    <th className="p-4 text-left">Giới Tính</th>
                                    <th className="p-4 text-left">Hành Động</th>
                                </tr>
                                </thead>
                                <tbody className="rounded-b-xl">
                                {state.staffList.map((staff) => (
                                    <tr key={staff.operatorId} className="border-b hover:bg-gray-50">
                                        <td className="p-4">{staff.fullName || "Chưa có"}</td>
                                        <td className="p-4">@{staff.username || "Chưa có"}</td>
                                        <td className="p-4">{staff.email || "Chưa có"}</td>
                                        <td className="p-4">{staff.phone || "Chưa có"}</td>
                                        <td className="p-4">{staff.address || "Chưa có"}</td>
                                        <td className="p-4">{staff.status === "ACTIVE" ? "Hoạt động" : staff.status === "INACTIVE" ? "Không hoạt động" : "Bị chặn"}</td>
                                        <td className="p-4">{staff.gender === "MALE" ? "Nam" : staff.gender === "FEMALE" ? "Nữ" : "Chưa có"}</td>
                                        <td className="p-4 flex gap-2">
                                            <button
                                                onClick={() => fetchStaffDetails(staff.operatorId)}
                                                className="p-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300"
                                                title="Xem chi tiết"
                                            >
                                                <User className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setState((prev) => ({ ...prev, selectedStaff: staff, feedback: "", errors: { ...prev.errors, feedback: "" } }))}
                                                className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                                                title="Gửi phản hồi"
                                            >
                                                <MessageSquare className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setState((prev) => ({
                                                        ...prev,
                                                        editStaff: staff,
                                                        editForm: {
                                                            username: staff.username,
                                                            email: staff.email,
                                                            fullName: staff.fullName || "",
                                                            phone: staff.phone || "",
                                                            address: staff.address || "",
                                                            gender: staff.gender || "",
                                                            status: staff.status || "",
                                                        },
                                                        errors: {
                                                            ...prev.errors,
                                                            username: "",
                                                            fullName: "",
                                                            email: "",
                                                            phone: "",
                                                            address: "",
                                                            gender: "",
                                                            status: "",
                                                        }
                                                    }))
                                                }
                                                className="p-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setState((prev) => ({ ...prev, confirmAction: { type: "block", staffId: staff.operatorId } }))
                                                }
                                                className="p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300"
                                                title="Chặn nhân viên"
                                            >
                                                <Ban className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {state.totalPages > 1 && (
                                <div className="flex justify-center gap-3 mt-12 items-center">
                                    <button
                                        onClick={goToPrevious}
                                        disabled={state.currentPage === 0}
                                        className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Trang trước"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    {getPageNumbers().map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => fetchStaffList(page)}
                                            className={`px-4 py-2 rounded-full ${
                                                page === state.currentPage
                                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            } transition-all duration-300`}
                                            title={`Trang ${page + 1}`}
                                        >
                                            {page + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={goToNext}
                                        disabled={state.currentPage === state.totalPages - 1}
                                        className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Trang sau"
                                    >
                                        <ChevronLeft className="w-5 h-5 rotate-180" />
                                    </button>
                                    <span className="text-sm text-gray-600 font-medium">
                                        Trang {state.currentPage + 1} / {state.totalPages}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
            <Footer />
            {state.selectedStaff && (
                <FeedbackModal
                    staff={state.selectedStaff}
                    feedback={state.feedback}
                    setFeedback={(value) => setState((prev) => ({ ...prev, feedback: value }))}
                    onSubmit={handleFeedback}
                    onClose={() => setState((prev) => ({ ...prev, selectedStaff: null, feedback: "", errors: { ...prev.errors, feedback: "" } }))}
                    errors={state.errors}
                />
            )}
            {state.editStaff && (
                <EditModal
                    staff={state.editStaff}
                    editForm={state.editForm}
                    setEditForm={(value) => setState((prev) => ({ ...prev, editForm: value }))}
                    onSubmit={handleEdit}
                    onClose={() => setState((prev) => ({ ...prev, editStaff: null, errors: { ...prev.errors, username: "", fullName: "", email: "", phone: "", address: "", gender: "", status: "" } }))}
                    errors={state.errors}
                />
            )}
            {state.confirmAction.type && (
                <ConfirmModal
                    onConfirm={handleBlock}
                    onClose={() => setState((prev) => ({ ...prev, confirmAction: { type: "", staffId: null } }))}
                />
            )}
            {state.showDetailsModal && state.staffDetails && (
                <StaffDetailsModal
                    staff={state.staffDetails}
                    onClose={() => setState((prev) => ({ ...prev, showDetailsModal: false }))}
                />
            )}
        </div>
    );
}