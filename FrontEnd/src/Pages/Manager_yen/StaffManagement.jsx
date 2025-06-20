"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import axios from "../../utils/axiosInstance.js"
import Header from "../../Components/FormLogin_yen/Header.jsx"
import Footer from "../../Components/FormLogin_yen/Footer.jsx"
import {
    Edit, MessageSquare, Ban, Trash2, Search, Phone, Mail,
    MapPin, User, X, Check, AlertTriangle, Loader2, Crown, Shield, Award, Home, ChevronLeft, Zap,
} from "lucide-react"

// Component hiển thị trường thông tin nhân viên
const StaffInfoField = ({ icon: Icon, value }) => (
    value && (
        <div className="flex items-center gap-4 text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
            <div className="p-3 bg-blue-100 rounded-2xl group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-semibold text-lg">{value}</span>
        </div>
    )
)

// Component hiển thị danh sách nhân viên
const StaffCard = ({ staff, index, onFeedback, onEdit, onBlock, onDelete, onViewDetails }) => (
    <div
        key={staff.operatorId}
        className="group bg-white/85 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 p-10 hover:shadow-3xl hover:bg-white/95 transition-all duration-700 transform hover:-translate-y-3 hover:scale-[1.02] relative overflow-hidden cursor-pointer"
        style={{ animationDelay: `${index * 200}ms`, animation: "slideInUp 1s ease-out forwards" }}
        onClick={() => onViewDetails(staff.operatorId)}
    >
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl group-hover:scale-150 group-hover:rotate-45 transition-all duration-700"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl group-hover:scale-150 group-hover:-rotate-45 transition-all duration-700"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-2xl group-hover:scale-200 transition-all duration-700"></div>

        <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-start gap-8">
                <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center text-white font-black text-2xl group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-2xl">
                        {staff.fullName?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                    <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-green-400 rounded-full border-3 border-white animate-pulse shadow-lg"></div>
                    </div>
                    <div className="absolute -bottom-2 -left-2">
                        <Award className="w-6 h-6 text-yellow-500 animate-bounce" />
                    </div>
                </div>

                <div className="flex-1">
                    <h3 className="text-3xl font-black text-slate-800 mb-4 group-hover:text-purple-600 transition-colors duration-500 flex items-center gap-3">
                        {staff.username || "Nhân viên"}
                        <Shield className="w-6 h-6 text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse" />
                        <Crown className="w-5 h-5 text-yellow-400 opacity-0 group-hover:text-yellow-500 transition-all duration-500 animate-spin" />
                    </h3>
                    <p className="text-slate-500 text-lg font-medium">Nhấn để xem chi tiết</p>
                </div>
            </div>

            <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-20 group-hover:translate-x-0">
                <button
                    onClick={(e) => { e.stopPropagation(); onFeedback(staff); }}
                    className="group/btn p-5 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-125 hover:shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/30 transform scale-0 group-hover/btn:scale-100 transition-transform duration-300 rounded-2xl"></div>
                    <MessageSquare className="w-6 h-6 relative z-10 group-hover/btn:animate-pulse" />
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(staff); }}
                    className="group/btn p-5 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-125 hover:shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/30 transform scale-0 group-hover/btn:scale-100 transition-transform duration-300 rounded-2xl"></div>
                    <Edit className="w-6 h-6 relative z-10 group-hover/btn:animate-pulse" />
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onBlock(staff.operatorId); }}
                    className="group/btn p-5 bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-125 hover:shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/30 transform scale-0 group-hover/btn:scale-100 transition-transform duration-300 rounded-2xl"></div>
                    <Ban className="w-6 h-6 relative z-10 group-hover/btn:animate-pulse" />
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(staff.operatorId); }}
                    className="group/btn p-5 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-125 hover:shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/30 transform scale-0 group-hover/btn:scale-100 transition-transform duration-300 rounded-2xl"></div>
                    <Trash2 className="w-6 h-6 relative z-10 group-hover/btn:animate-pulse" />
                </button>
            </div>
        </div>
    </div>
)

// Component Modal Phản hồi
const FeedbackModal = ({ staff, feedback, setFeedback, onSubmit, onClose }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-3xl w-full max-w-2xl transform transition-all duration-700 scale-100 relative overflow-hidden border border-white/30">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>

            <div className="relative z-10">
                <div className="p-10 border-b border-slate-200/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl shadow-2xl">
                                <MessageSquare className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-800">Gửi Phản Hồi</h2>
                                <p className="text-slate-600 mt-2 text-lg font-semibold">Đến: {staff.username}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-slate-100 rounded-2xl transition-all duration-300 transform hover:scale-125 hover:rotate-90"
                        >
                            <X className="w-7 h-7 text-slate-400" />
                        </button>
                    </div>
                </div>

                <div className="p-10">
                    <textarea
                        rows={6}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full border-3 border-slate-200 rounded-3xl px-8 py-6 focus:outline-none focus:ring-6 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-500 resize-none text-xl shadow-inner bg-white/90 font-medium"
                        placeholder="Viết phản hồi của bạn tại đây..."
                    />
                </div>

                <div className="p-10 pt-0 flex justify-end gap-6">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all duration-300 font-bold text-lg transform hover:scale-110"
                    >
                        Hủy Bỏ
                    </button>
                    <button
                        onClick={onSubmit}
                        className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-black text-lg transition-all duration-500 transform hover:scale-110 hover:shadow-2xl flex items-center gap-4 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 transform scale-x-0 hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                        <div className="relative z-10 flex items-center gap-4">
                            <MessageSquare className="w-6 h-6" />
                            Gửi Phản Hồi
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>
)

// Component Modal Chỉnh sửa
const EditModal = ({ staff, editForm, setEditForm, onSubmit, onClose }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-3xl w-full max-w-2xl transform transition-all duration-700 scale-100 relative overflow-hidden border border-white/30">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>

            <div className="relative z-10">
                <div className="p-10 border-b border-slate-200/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl shadow-2xl">
                                <Edit className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-800">Chỉnh Sửa Nhân Viên</h2>
                                <p className="text-slate-600 mt-2 text-lg font-semibold">{staff.username}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-slate-100 rounded-2xl transition-all duration-300 transform hover:scale-125 hover:rotate-90"
                        >
                            <X className="w-7 h-7 text-slate-400" />
                        </button>
                    </div>
                </div>

                <div className="p-10 space-y-8">
                    <div>
                        <label className="block text-lg font-black text-slate-700 mb-4 flex items-center gap-3">
                            <User className="w-5 h-5" />
                            Họ và Tên
                        </label>
                        <input
                            className="w-full border-3 border-slate-200 rounded-2xl px-8 py-5 focus:outline-none focus:ring-6 focus:ring-green-500/30 focus:border-green-500 transition-all duration-500 text-xl shadow-inner bg-white/90 font-medium"
                            placeholder="Nhập họ và tên"
                            value={editForm.fullName}
                            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-black text-slate-700 mb-4 flex items-center gap-3">
                            <Phone className="w-5 h-5" />
                            Số Điện Thoại
                        </label>
                        <input
                            className="w-full border-3 border-slate-200 rounded-2xl px-8 py-5 focus:outline-none focus:ring-6 focus:ring-green-500/30 focus:border-green-500 transition-all duration-500 text-xl shadow-inner bg-white/90 font-medium"
                            placeholder="Nhập số điện thoại"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-black text-slate-700 mb-4 flex items-center gap-3">
                            <MapPin className="w-5 h-5" />
                            Địa Chỉ
                        </label>
                        <input
                            className="w-full border-3 border-slate-200 rounded-2xl px-8 py-5 focus:outline-none focus:ring-6 focus:ring-green-500/30 focus:border-green-500 transition-all duration-500 text-xl shadow-inner bg-white/90 font-medium"
                            placeholder="Nhập địa chỉ"
                            value={editForm.address}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        />
                    </div>
                </div>

                <div className="p-10 pt-0 flex justify-end gap-6">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all duration-300 font-bold text-lg transform hover:scale-110"
                    >
                        Hủy Bỏ
                    </button>
                    <button
                        onClick={onSubmit}
                        className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-black text-lg transition-all duration-500 transform hover:scale-110 hover:shadow-2xl flex items-center gap-4 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 transform scale-x-0 hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                        <div className="relative z-10 flex items-center gap-4">
                            <Check className="w-6 h-6" />
                            Cập Nhật
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>
)

// Component Modal Xác nhận
const ConfirmModal = ({ type, onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-3xl w-full max-w-lg transform transition-all duration-700 scale-100 relative overflow-hidden border border-white/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>

            <div className="relative z-10 p-12 text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
                    <AlertTriangle className="w-10 h-10 text-white animate-pulse" />
                </div>

                <h2 className="text-3xl font-black text-slate-800 mb-4 flex items-center justify-center gap-3">
                    Xác Nhận {type === "delete" ? "Xóa" : "Chặn"}
                    <Zap className="w-6 h-6 text-yellow-500 animate-pulse" />
                </h2>

                <p className="text-slate-600 mb-10 text-xl leading-relaxed">
                    Bạn có chắc chắn muốn {type === "delete" ? "xóa" : "chặn"} nhân viên này không?
                    <br />
                    <span className="font-black text-red-600 text-lg">Hành động này không thể hoàn tác!</span>
                </p>

                <div className="flex justify-center gap-6">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all duration-300 font-bold text-lg transform hover:scale-110"
                    >
                        Hủy Bỏ
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-12 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-2xl font-black text-lg transition-all duration-500 transform hover:scale-110 hover:shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 transform scale-x-0 hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                        <div className="relative z-10">{type === "delete" ? "Xóa" : "Chặn"}</div>
                    </button>
                </div>
            </div>
        </div>
    </div>
)

// Component Modal Chi tiết Nhân viên
const StaffDetailsModal = ({ staff, onClose }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-3xl w-full max-w-2xl transform transition-all duration-700 scale-100 relative overflow-hidden border border-white/30">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>

            <div className="relative z-10">
                <div className="p-10 border-b border-slate-200/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl shadow-2xl">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-800">Thông Tin Nhân Viên</h2>
                                <p className="text-slate-600 mt-2 text-lg font-semibold">{staff.username}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-slate-100 rounded-2xl transition-all duration-300 transform hover:scale-125 hover:rotate-90"
                        >
                            <X className="w-7 h-7 text-slate-400" />
                        </button>
                    </div>
                </div>

                <div className="p-10 space-y-8">
                    <StaffInfoField icon={Mail} value={staff.email} />
                    <StaffInfoField icon={Phone} value={staff.phone} />
                    <StaffInfoField icon={MapPin} value={staff.address} />
                    <StaffInfoField icon={User} value={`@${staff.username}`} />
                    <StaffInfoField icon={Shield} value={staff.status} />
                    <StaffInfoField icon={User} value={staff.gender} />
                </div>

                <div className="p-10 pt-0 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all duration-300 font-bold text-lg transform hover:scale-110"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    </div>
)

export default function StaffManagement() {
    const [state, setState] = useState({
        managerId: null,
        staffList: [],
        searchTerm: "",
        loading: false,
        selectedStaff: null,
        feedback: "",
        editStaff: null,
        editForm: { email: "", fullName: "", phone: "", address: "" },
        currentPage: 0,
        totalPages: 0,
        confirmAction: { type: "", staffId: null },
        filtered: false,
        staffDetails: null,
        showDetailsModal: false
    })

    // Authentication using JWT token from cookies
    useEffect(() => {
        const token = Cookies.get("authToken")
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                setState((prev) => ({ ...prev, managerId: payload.managerId }))
            } catch {
                setState((prev) => ({ ...prev, managerId: null }))
            }
        }
    }, [])

    useEffect(() => {
        if (state.managerId) {
            fetchStaffList()
        }
    }, [state.managerId])

    const fetchStaffList = async (page = 0) => {
        setState((prev) => ({ ...prev, loading: true }))
        try {
            const res = await axios.get(`/api/v1/manager/${state.managerId}/staff`, {
                params: { page, size: 5 }
            })
            const staffData = res.data.data.staffs || res.data.data.content || []
            setState((prev) => ({
                ...prev,
                staffList: Array.isArray(staffData) ? staffData : [],
                totalPages: res.data.data.totalPages || 0,
                currentPage: res.data.data.pageNumber || 0
            }))
        } catch {
            setState((prev) => ({ ...prev, staffList: [] }))
            alert("Không thể tải danh sách nhân viên")
        } finally {
            setState((prev) => ({ ...prev, loading: false }))
        }
    }

    const handleSearch = async () => {
        if (!state.searchTerm) {
            setState((prev) => ({ ...prev, filtered: false }))
            return fetchStaffList()
        }
        setState((prev) => ({ ...prev, loading: true }))
        try {
            const res = await axios.get(`/api/v1/manager/${state.managerId}/staff/search`, {
                params: { searchTerm: state.searchTerm, page: 0, size: 5 }
            })
            const staffData = res.data.data.content || res.data.data.staffs || []
            setState((prev) => ({
                ...prev,
                staffList: Array.isArray(staffData) ? staffData : [],
                totalPages: res.data.data.totalPages || 0,
                currentPage: res.data.data.pageNumber || 0,
                filtered: true
            }))
        } catch {
            setState((prev) => ({ ...prev, staffList: [] }))
            alert("Tìm kiếm thất bại")
        } finally {
            setState((prev) => ({ ...prev, loading: false }))
        }
    }

    const handleFeedback = async () => {
        try {
            await axios.post(`/api/v1/manager/${state.managerId}/staff/${state.selectedStaff.operatorId}/feedback`, {
                message: state.feedback
            })
            alert("Phản hồi đã được gửi thành công")
            setState((prev) => ({ ...prev, feedback: "", selectedStaff: null }))
        } catch {
            alert("Không thể gửi phản hồi")
        }
    }

    const handleBlock = async () => {
        try {
            await axios.patch(`/api/v1/manager/${state.managerId}/staff/${state.confirmAction.staffId}/block`)
            alert("Nhân viên đã bị chặn")
            fetchStaffList(state.currentPage)
        } catch {
            alert("Không thể chặn nhân viên")
        } finally {
            setState((prev) => ({ ...prev, confirmAction: { type: "", staffId: null } }))
        }
    }

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/v1/manager/${state.managerId}/staff/${state.confirmAction.staffId}`)
            alert("Nhân viên đã được xóa")
            fetchStaffList(state.currentPage)
        } catch {
            alert("Không thể xóa nhân viên")
        } finally {
            setState((prev) => ({ ...prev, confirmAction: { type: "", staffId: null } }))
        }
    }

    const handleEdit = async () => {
        try {
            await axios.put(`/api/v1/manager/${state.managerId}/staff/${state.editStaff.operatorId}`, state.editForm)
            alert("Nhân viên đã được cập nhật")
            fetchStaffList(state.currentPage)
        } catch {
            alert("Cập nhật thất bại")
        } finally {
            setState((prev) => ({ ...prev, editStaff: null }))
        }
    }

    const fetchStaffDetails = async (operatorId) => {
        setState((prev) => ({ ...prev, loading: true }))
        try {
            const res = await axios.get(`/api/v1/manager/${state.managerId}/staff/${operatorId}`)
            setState((prev) => ({ ...prev, staffDetails: res.data.data, showDetailsModal: true }))
        } catch {
            alert("Không thể tải thông tin chi tiết nhân viên")
        } finally {
            setState((prev) => ({ ...prev, loading: false }))
        }
    }

    const handleBackToHome = () => {
        window.history.back()
    }

    if (!state.managerId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>

                <div className="text-center relative z-10">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 animate-spin text-white mx-auto mb-2" />
                    </div>
                    <p className="text-white text-xl font-medium">Đang tải thông tin quản lý...</p>
                    <p className="text-purple-200 text-sm mt-2">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-400 via-indigo-200 to-purple-300 relative overflow-hidden">
            <div className="relative z-10">
                <Header className="mb-16" /> {/* Tăng mb-16 để tạo khoảng cách lớn hơn */}
                <div className="h-16"></div> {/* Thêm div trung gian với chiều cao cố định */}
                <div className="pt-16 p-6 flex-grow"> {/* Tăng pt-16 để đảm bảo khoảng cách từ trên */}
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={handleBackToHome}
                                    className="group flex items-center gap-4 px-8 py-4 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:bg-gray-100 border border-gray-200 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="px-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl group-hover:scale-110 transition-transform duration-200">
                                            <ChevronLeft className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <div className="flex items-center gap-2">
                                                <Home className="w-5 h-5 text-slate-600 group-hover:text-purple-600 transition-colors duration-200" />
                                                <span className="text-slate-700 font-bold text-lg group-hover:text-purple-600 transition-colors duration-200">
                                                    Về Trang Chủ
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-sm group-hover:text-purple-500 transition-colors duration-300">
                                                Quay lại dashboard chính
                                            </p>
                                        </div>
                                    </div>
                                </button>

                                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md rounded-2xl px-6 py-3 shadow-lg border border-white/20">
                                    <Crown className="w-6 h-6 text-yellow-500 animate-pulse" />
                                    <span className="text-slate-700 font-semibold">Quản Lý Nhân Viên</span>
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 mb-6">
                                <div className="relative">
                                    <div className="p-4 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl shadow-2xl">
                                        <User className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="absolute -bottom-1 -left-1">
                                        <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-5xl font-black bg-gradient-to-r from-purple-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                                        Quản Lý Nhân Viên
                                    </h1>
                                    <p className="text-slate-600 flex items-center gap-3 text-lg">
                                        <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
                                        Quản lý đội ngũ của bạn một cách hiệu quả
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="relative mb-10">
                            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/40 p-10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
                                <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-br from-indigo-400/15 to-purple-400/15 rounded-full blur-2xl animate-pulse delay-1000"></div>

                                <div className="relative z-10 flex items-center gap-8">
                                    <div className="relative flex-1 max-w-3xl">
                                        <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400">
                                            <Search className="w-7 h-7" />
                                        </div>
                                        <input
                                            className="w-full pl-16 pr-6 py-5 border-3 border-slate-200 rounded-3xl bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-6 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-500 placeholder-slate-400 text-xl font-medium shadow-inner hover:shadow-lg"
                                            placeholder="Tìm kiếm theo tên, email hoặc username..."
                                            value={state.searchTerm}
                                            onChange={(e) => setState((prev) => ({ ...prev, searchTerm: e.target.value }))}
                                            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                        />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handleSearch}
                                            disabled={state.loading}
                                            className="group px-6 py-3 min-w-[160px] bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white rounded-3xl font-medium text-lg transition-all duration-500 transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="relative z-10 flex items-center justify-center gap-2">
                                                {state.loading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Search className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                                                )}
                                                <span>Tìm kiếm</span>
                                            </div>
                                        </button>

                                        {state.filtered && (
                                            <button
                                                onClick={() => {
                                                    setState((prev) => ({ ...prev, searchTerm: "", filtered: false }))
                                                    fetchStaffList()
                                                }}
                                                className="px-6 py-3 min-w-[160px] flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-3xl font-medium text-lg transition-all duration-300 transform hover:scale-105"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                                <span>Quay lại</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {state.loading ? (
                            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/40 p-20 h-64">
                                <div className="text-center">
                                    <div className="relative inline-block mb-8">
                                        <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto" />
                                    </div>
                                    <p className="text-slate-700 text-2xl font-bold mb-2">Đang tải danh sách nhân viên...</p>
                                    <p className="text-slate-500 text-lg">Chuẩn bị dữ liệu cho bạn</p>
                                </div>
                            </div>
                        ) : state.staffList.length === 0 ? (
                            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/40 p-20 text-center h-64">
                                <div className="relative inline-block mb-8">
                                    <User className="w-24 h-24 text-slate-300" />
                                    <div className="absolute -top-3 -right-3">
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <span className="text-red-500 text-sm">0</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-700 text-2xl font-bold mb-3">Không tìm thấy nhân viên nào</p>
                                <p className="text-slate-600 text-lg">Thử điều chỉnh từ khóa tìm kiếm hoặc thêm nhân viên mới</p>
                            </div>
                        ) : (
                            <div className="grid gap-10" style={{ minHeight: '400px' }}>
                                {state.staffList.map((staff, index) => (
                                    <StaffCard
                                        key={staff.operatorId}
                                        staff={staff}
                                        index={index}
                                        onFeedback={(staff) => setState((prev) => ({ ...prev, selectedStaff: staff }))}
                                        onEdit={(staff) => setState((prev) => ({
                                            ...prev,
                                            editStaff: staff,
                                            editForm: {
                                                username: staff.username,
                                                email: staff.email,
                                                fullName: staff.fullName || "",
                                                phone: staff.phone || "",
                                                address: staff.address || ""
                                            }
                                        }))}
                                        onBlock={(staffId) => setState((prev) => ({ ...prev, confirmAction: { type: "block", staffId } }))}
                                        onDelete={(staffId) => setState((prev) => ({ ...prev, confirmAction: { type: "delete", staffId } }))}
                                        onViewDetails={fetchStaffDetails}
                                    />
                                ))}
                            </div>
                        )}

                        {state.totalPages > 1 && (
                            <div className="flex justify-center mt-16">
                                <div className="bg-white/85 backdrop-blur rounded-[2rem] shadow-2xl border border-white/40 p-4 flex gap-3 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10"></div>
                                    {[...Array(state.totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => fetchStaffList(i)}
                                            className={`relative z-10 px-4 py-2 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:bg-purple-100 ${
                                                i === state.currentPage
                                                    ? "bg-blue-600 text-white shadow-2xl animate-pulse"
                                                    : "text-blue-600 hover:bg-gray-200 hover:shadow-xl"
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
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
                                type={state.confirmAction.type}
                                onConfirm={state.confirmAction.type === "delete" ? handleDelete : handleBlock}
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
            <div>
                <Footer />
            </div>

            <style jsx>{`
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-30px) rotate(5deg);
                    }
                }

                @keyframes float-delayed {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-25px) rotate(-5deg);
                    }
                }

                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }

                .animate-float-delayed {
                    animation: float-delayed 10s ease-in-out infinite;
                }

                .shadow-3xl {
                    box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
                }
            `}</style>
        </div>
    )
}