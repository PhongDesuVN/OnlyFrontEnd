

"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "../../utils/axiosInstance.js";
import Footer from "../../Components/FormLogin_yen/Footer.jsx";
import {
    Edit,MessageSquare, Ban, Search,Phone,Mail, MapPin,User,X,
    Check, AlertTriangle,Loader2,Shield,Home, ChevronLeft,Zap, Download, LogOut,
} from "lucide-react";

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
const FeedbackModal = ({ staff, feedback, setFeedback, onSubmit, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500 rounded-lg">
                        <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Gửi Phản Hồi</h2>
                        <p className="text-slate-600 text-sm">Đến: {staff.username}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-6 h-6 text-slate-400" />
                </button>
            </div>
            <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Viết phản hồi của bạn tại đây..."
            />
            <div className="mt-4 flex justify-end gap-4">
                <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    Hủy Bỏ
                </button>
                <button onClick={onSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Gửi Phản Hồi
                </button>
            </div>
        </div>
    </div>
);

// Component Modal Chỉnh sửa
const EditModal = ({ staff, editForm, setEditForm, onSubmit, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-500 rounded-lg">
                        <Edit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Chỉnh Sửa Nhân Viên</h2>
                        <p className="text-slate-600 text-sm">{staff.username}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-6 h-6 text-slate-400" />
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                        <User className="w-4 h-4" /> Tên Đăng Nhập
                    </label>
                    <input
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email
                    </label>
                    <input
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                        <User className="w-4 h-4" /> Họ và Tên
                    </label>
                    <input
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Số Điện Thoại
                    </label>
                    <input
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                        <User className="w-4 h-4" /> Giới Tính
                    </label>
                    <select
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={editForm.gender || ""}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    >
                        <option value="">Chọn giới tính</option>
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Trạng Thái
                    </label>
                    <select
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={editForm.status || ""}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                        <option value="">Chọn trạng thái</option>
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Không hoạt động</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Địa Chỉ
                    </label>
                    <input
                        className="w-full border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                </div>
            </div>
            <div className="mt-4 flex justify-end gap-4">
                <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    Hủy Bỏ
                </button>
                <button onClick={onSubmit} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Cập Nhật
                </button>
            </div>
        </div>
    </div>
);

// Component Modal Xác nhận
const ConfirmModal = ({ onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-lg p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Xác Nhận Chặn</h2>
            <p className="text-slate-600 mb-4">
                Bạn có chắc chắn muốn chặn nhân viên này không?<br />
                <span className="font-bold text-red-600">Hành động này không thể hoàn tác!</span>
            </p>
            <div className="flex justify-center gap-4">
                <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    Hủy Bỏ
                </button>
                <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Chặn
                </button>
            </div>
        </div>
    </div>
);

// Component Modal Chi tiết Nhân viên
const StaffDetailsModal = ({ staff, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500 rounded-lg">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Thông Tin Nhân Viên</h2>
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
                <StaffInfoField icon={Shield} value={staff.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"} />
                <StaffInfoField icon={User} value={staff.gender === "MALE" ? "Nam" : staff.gender === "FEMALE" ? "Nữ" : "Chưa có"} />
            </div>
            <div className="mt-4 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    Đóng
                </button>
            </div>
        </div>
    </div>
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

    const fetchStaffList = async (page = 0) => {
        setState((prev) => ({ ...prev, loading: true }));
        try {
            const params = { page, size: 5 };
            let url = `/api/v1/manager/${state.managerId}/staff`; // Default endpoint

            // Nếu có searchTerm hoặc filter, sử dụng endpoint /filter
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
        fetchStaffList();
    };

    const handleFeedback = async () => {
        try {
            await axios.post(`/api/v1/manager/${state.managerId}/staff/${state.selectedStaff.operatorId}/feedback`, {
                message: state.feedback,
            });
            alert("Phản hồi đã được gửi thành công");
            setState((prev) => ({ ...prev, feedback: "", selectedStaff: null }));
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
        try {
            await axios.put(`/api/v1/manager/${state.managerId}/staff/${state.editStaff.operatorId}`, state.editForm);
            alert("Nhân viên đã được cập nhật");
            fetchStaffList(state.currentPage);
        } catch (error) {
            console.error("Failed to update staff:", error);
            alert("Cập nhật thất bại");
        } finally {
            setState((prev) => ({ ...prev, editStaff: null }));
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
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-2" />
                    <p className="text-white text-lg font-medium">Đang tải thông tin quản lý...</p>
                    <p className="text-purple-200 text-sm mt-1">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-400 via-indigo-200 to-purple-300">
            <div className="flex flex-1">
                <div className="w-64 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 text-white shadow-lg">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4">Menu</h2>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={handleBackToHome}
                                    className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-purple-800 hover:text-white"
                                >
                                    <Home className="w-5 h-5" /> Về trang chủ
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => fetchStaffList()}
                                    className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-purple-800 hover:text-white"
                                >
                                    <User className="w-5 h-5" /> Danh sách
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => navigate("/staffperformance")}
                                    className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-purple-800 hover:text-white"
                                >
                                    <Zap className="w-5 h-5" /> Tổng quan
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="mt-auto">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-400 hover:text-red-200 w-full text-left p-2 rounded-lg hover:bg-purple-800"
                        >
                            <LogOut className="w-5 h-5" /> Logout
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-2 bg-purple-600 rounded-lg">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                                        Quản Lý Nhân Viên
                                    </h1>
                                    <p className="text-slate-600 flex items-center gap-2 text-sm">
                                        <Zap className="w-4 h-4 text-yellow-500" />
                                        Quản lý đội ngũ của bạn một cách hiệu quả
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="bg-white rounded-lg p-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="relative flex-1 min-w-[200px]">
                                        <input
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Tìm kiếm theo tên, email hoặc username..."
                                            value={state.searchTerm}
                                            onChange={(e) => setState((prev) => ({ ...prev, searchTerm: e.target.value }))}
                                            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                        />
                                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    </div>
                                    <select
                                        className="border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                    <button
                                        onClick={handleSearch}
                                        disabled={state.loading}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        {state.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                        Tìm kiếm
                                    </button>
                                    <button
                                        onClick={handleExportExcel}
                                        disabled={state.exporting || state.loading}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {state.exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                        Export Excel
                                    </button>
                                    {state.filtered && (
                                        <button
                                            onClick={() => {
                                                setState((prev) => ({ ...prev, searchTerm: "", filter: "", filtered: false }));
                                                fetchStaffList();
                                            }}
                                            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
                                        >
                                            <ChevronLeft className="w-5 h-5" /> Quay lại
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {state.loading ? (
                            <div className="bg-white rounded-lg p-6 text-center">
                                <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-2" />
                                <p className="text-slate-700 text-lg font-bold">Đang tải danh sách nhân viên...</p>
                                <p className="text-slate-500 text-sm">Chuẩn bị dữ liệu cho bạn</p>
                            </div>
                        ) : state.staffList.length === 0 ? (
                            <div className="bg-white rounded-lg p-6 text-center">
                                <User className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                                <p className="text-slate-700 text-lg font-bold">Không tìm thấy nhân viên nào</p>
                                <p className="text-slate-600 text-sm">Thử điều chỉnh từ khóa tìm kiếm hoặc thêm nhân viên mới</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full bg-white border border-gray-200 rounded-lg">
                                    <thead>
                                    <tr className="bg-purple-600 text-white">
                                        <th className="p-3 text-left">Họ và Tên</th>
                                        <th className="p-3 text-left">Username</th>
                                        <th className="p-3 text-left">Email</th>
                                        <th className="p-3 text-left">Số Điện Thoại</th>
                                        <th className="p-3 text-left">Địa Chỉ</th>
                                        <th className="p-3 text-left">Trạng Thái</th>
                                        <th className="p-3 text-left">Giới Tính</th>
                                        <th className="p-3 text-left">Hành Động</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {state.staffList.map((staff, index) => (
                                        <tr key={staff.operatorId} className="border-b hover:bg-gray-50">
                                            <td className="p-3">{staff.fullName || "Chưa có"}</td>
                                            <td className="p-3">@{staff.username || "Chưa có"}</td>
                                            <td className="p-3">{staff.email || "Chưa có"}</td>
                                            <td className="p-3">{staff.phone || "Chưa có"}</td>
                                            <td className="p-3">{staff.address || "Chưa có"}</td>
                                            <td className="p-3">{staff.status || "Chưa có"}</td>
                                            <td className="p-3">{staff.gender || "Chưa có"}</td>
                                            <td className="p-3 flex gap-2">
                                                <button
                                                    onClick={() => fetchStaffDetails(staff.operatorId)}
                                                    className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                                                >
                                                    <User className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setState((prev) => ({ ...prev, selectedStaff: staff }))}
                                                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
                                                        }))
                                                    }
                                                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setState((prev) => ({ ...prev, confirmAction: { type: "block", staffId: staff.operatorId } }))
                                                    }
                                                    className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                                                >
                                                    <Ban className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {state.totalPages > 1 && (
                            <div className="flex justify-center gap-3 mt-4 items-center">
                                <button
                                    onClick={goToPrevious}
                                    disabled={state.currentPage === 0}
                                    className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                {getPageNumbers().map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => fetchStaffList(page)}
                                        className={`px-3 py-1 rounded-full ${
                                            page === state.currentPage
                                                ? "bg-purple-600 text-white shadow-md"
                                                : "bg-gray-200 text-purple-600 hover:bg-gray-300"
                                        } transition-all duration-300`}
                                    >
                                        {page + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={goToNext}
                                    disabled={state.currentPage === state.totalPages - 1}
                                    className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5 rotate-180" />
                                </button>
                                <span className="text-sm text-gray-600 font-medium">
                  Trang {state.currentPage + 1} / {state.totalPages}
                </span>
                            </div>
                        )}

                        {state.selectedStaff && (
                            <FeedbackModal
                                staff={state.selectedStaff}
                                feedback={state.feedback}
                                setFeedback={(value) => setState((prev) => ({ ...prev, feedback: value }))}
                                onSubmit={handleFeedback}
                                onClose={() => setState((prev) => ({ ...prev, selectedStaff: null }))}
                            />
                        )}

                        {state.editStaff && (
                            <EditModal
                                staff={state.editStaff}
                                editForm={state.editForm}
                                setEditForm={(value) => setState((prev) => ({ ...prev, editForm: value }))}
                                onSubmit={handleEdit}
                                onClose={() => setState((prev) => ({ ...prev, editStaff: null }))}
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
                </div>
            </div>
            <Footer
                className="w-full bg-gray-800 text-white p-4 fixed bottom-0 left-0 z-10"
                style={{ width: "calc(100% - 256px)" }}
            />
        </div>
    );
}
