"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import axios from "../../utils/axiosInstance.js" // Adjust path to your axios instance
import Footer from "../../Components/FormLogin_yen/Footer.jsx"
import {
    Edit,
    MessageSquare,
    Ban,
    Trash2,
    Search,
    Users,
    Phone,
    Mail,
    MapPin,
    User,
    X,
    Check,
    AlertTriangle,
    Loader2,
    Sparkles,
    Star,
    Heart,
    Zap,
    Crown,
    Shield,
    Award,
    Home,
    ChevronLeft,
} from "lucide-react"

export default function StaffManagement() {
    const [managerId, setManagerId] = useState(null)
    const [staffList, setStaffList] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [selectedStaff, setSelectedStaff] = useState(null)
    const [feedback, setFeedback] = useState("")
    const [editStaff, setEditStaff] = useState(null)
    const [editForm, setEditForm] = useState({ email: "", fullName: "", phone: "", address: "" })
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [confirmAction, setConfirmAction] = useState({ type: "", staffId: null })

    // Authentication using JWT token from cookies
    useEffect(() => {
        const token = Cookies.get("authToken")
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                console.log("📦 Decoded in StaffManagement:", payload)
                setManagerId(payload.managerId)
            } catch (err) {
                console.error("❌ Token decode failed in StaffManagement.jsx", err)
                setManagerId(null)
            }
        } else {
            console.warn("⚠️ No token in cookies (StaffManagement)")
        }
    }, [])

    useEffect(() => {
        if (managerId) {
            fetchStaffList()
        }
    }, [managerId])

    const fetchStaffList = async (page = 0) => {
        setLoading(true)
        try {
            const res = await axios.get(`/api/v1/manager/${managerId}/staff`, {
                params: { page, size: 5 }
            })
            console.log("📡 fetchStaffList response:", JSON.stringify(res.data, null, 2)) // Log full response for debugging
            const staffData = res.data.data.staffs || res.data.data.content || [] // Handle both 'staffs' and 'content'
            setStaffList(Array.isArray(staffData) ? staffData : [])
            setTotalPages(res.data.data.totalPages || 0)
            setCurrentPage(res.data.data.pageNumber || 0)
        } catch (err) {
            console.error("❌ fetchStaffList error:", err)
            setStaffList([]) // Clear staffList on error
            alert("Không thể tải danh sách nhân viên")
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        if (!searchTerm) {
            return fetchStaffList()
        }
        setLoading(true)
        try {
            const res = await axios.get(`/api/v1/manager/${managerId}/staff/search`, {
                params: { searchTerm, page: 0, size: 5 }
            })
            console.log("📡 handleSearch response:", JSON.stringify(res.data, null, 2)) // Log full response for debugging
            const staffData = res.data.data.content || res.data.data.staffs || [] // Handle both 'content' and 'staffs'
            setStaffList(Array.isArray(staffData) ? staffData : [])
            setTotalPages(res.data.data.totalPages || 0)
            setCurrentPage(res.data.data.pageNumber || 0)
        } catch (err) {
            console.error("❌ handleSearch error:", err)
            setStaffList([]) // Clear staffList on error
            alert("Tìm kiếm thất bại")
        } finally {
            setLoading(false)
        }
    }

    const handleFeedback = async () => {
        try {
            await axios.post(`/api/v1/manager/${managerId}/staff/${selectedStaff.operatorId}/feedback`, {
                message: feedback
            })
            console.log("✅ Feedback sent successfully")
            alert("✅ Phản hồi đã được gửi thành công")
            setFeedback("")
            setSelectedStaff(null)
        } catch (err) {
            console.error("❌ handleFeedback error:", err)
            alert("❌ Không thể gửi phản hồi")
        }
    }

    const handleBlock = async () => {
        try {
            await axios.patch(`/api/v1/manager/${managerId}/staff/${confirmAction.staffId}/block`)
            console.log("🚫 Staff blocked successfully")
            alert("🚫 Nhân viên đã bị chặn")
            fetchStaffList(currentPage)
        } catch (err) {
            console.error("❌ handleBlock error:", err)
            alert("❌ Không thể chặn nhân viên")
        } finally {
            setConfirmAction({ type: "", staffId: null })
        }
    }

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/v1/manager/${managerId}/staff/${confirmAction.staffId}`)
            console.log("🗑️ Staff deleted successfully")
            alert("🗑️ Nhân viên đã được xóa")
            fetchStaffList(currentPage)
        } catch (err) {
            console.error("❌ handleDelete error:", err)
            alert("❌ Không thể xóa nhân viên")
        } finally {
            setConfirmAction({ type: "", staffId: null })
        }
    }

    const handleEdit = async () => {
        console.log("✏️ editForm:", editForm)
        try {
            const res = await axios.put(`/api/v1/manager/${managerId}/staff/${editStaff.operatorId}`, editForm)
            console.log("✅ handleEdit response:", res.data)
            alert("✏️ Nhân viên đã được cập nhật")
            fetchStaffList(currentPage)
        } catch (err) {
            console.error("❌ handleEdit error:", err)
            alert("❌ Cập nhật thất bại")
        } finally {
            setEditStaff(null)
        }
    }

    const handleBackToHome = () => {
        window.history.back()
    }

    if (!managerId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>

                <div className="text-center relative z-10">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 animate-spin text-white mx-auto mb-6" />
                        <div className="absolute inset-0 w-16 h-16 mx-auto">
                            <Sparkles className="w-4 h-4 text-yellow-300 absolute top-0 right-0 animate-ping" />
                            <Star className="w-3 h-3 text-pink-300 absolute bottom-0 left-0 animate-ping delay-300" />
                        </div>
                    </div>
                    <p className="text-white text-xl font-medium">Đang tải thông tin quản lý...</p>
                    <p className="text-purple-200 text-sm mt-2">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            {/* Animated background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float-delayed"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="relative z-10 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Enhanced Header with Back Button */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={handleBackToHome}
                                className="group flex items-center gap-4 px-8 py-4 bg-white/90 backdrop-blur-md hover:bg-white/95 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-white/30 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl group-hover:scale-110 transition-transform duration-200">
                                        <ChevronLeft className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <div className="flex items-center gap-2">
                                            <Home className="w-5 h-5 text-slate-600 group-hover:text-purple-600 transition-colors duration-200" />
                                            <span className="text-slate-700 font-bold text-lg group-hover:text-purple-700 transition-colors duration-200">
                        Về Trang Chủ
                      </span>
                                        </div>
                                        <p className="text-slate-500 text-sm group-hover:text-purple-500 transition-colors duration-200">
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
                                    <Users className="w-10 h-10 text-white" />
                                </div>
                                <div className="absolute -top-2 -right-2">
                                    <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />
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
                                    <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Ultra Enhanced Search Section */}
                    <div className="relative mb-10">
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/40 p-10 relative overflow-hidden">
                            {/* Multiple decorative elements */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
                            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-br from-indigo-400/15 to-purple-400/15 rounded-full blur-2xl animate-pulse delay-1000"></div>

                            <div className="relative z-10 flex items-center gap-8">
                                <div className="relative flex-1 max-w-3xl">
                                    <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400">
                                        <Search className="w-7 h-7" />
                                    </div>
                                    <input
                                        className="w-full pl-16 pr-16 py-6 border-3 border-slate-200 rounded-3xl bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-6 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-500 placeholder-slate-400 text-xl font-medium shadow-inner hover:shadow-lg"
                                        placeholder="🔍 Tìm kiếm theo tên, email hoặc username..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                    />
                                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                        <Heart className="w-5 h-5 text-pink-400 animate-pulse" />
                                        <Star className="w-4 h-4 text-yellow-400 animate-spin" />
                                    </div>
                                </div>
                                <button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="group px-10 py-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white rounded-3xl font-bold text-xl transition-all duration-500 transform hover:scale-110 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-4 relative overflow-hidden shadow-xl"
                                >
                                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                                    <div className="relative z-10 flex items-center gap-4">
                                        {loading ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <Search className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                                        )}
                                        <span>Tìm Kiếm</span>
                                        <Sparkles className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Ultra Enhanced Staff List */}
                    {loading ? (
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/40 p-20 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5"></div>
                            <div className="text-center relative z-10">
                                <div className="relative inline-block mb-8">
                                    <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto" />
                                    <div className="absolute inset-0">
                                        <Star className="w-4 h-4 text-yellow-400 absolute -top-3 -right-3 animate-ping" />
                                        <Sparkles className="w-4 h-4 text-pink-400 absolute -bottom-3 -left-3 animate-ping delay-300" />
                                        <Heart className="w-3 h-3 text-red-400 absolute top-0 left-0 animate-ping delay-500" />
                                    </div>
                                </div>
                                <p className="text-slate-700 text-2xl font-bold mb-2">Đang tải danh sách nhân viên...</p>
                                <p className="text-slate-500 text-lg">✨ Chuẩn bị điều tuyệt vời cho bạn</p>
                            </div>
                        </div>
                    ) : staffList.length === 0 ? (
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/40 p-20 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5"></div>
                            <div className="relative z-10">
                                <div className="relative inline-block mb-8">
                                    <Users className="w-24 h-24 text-slate-300 mx-auto" />
                                    <div className="absolute -top-3 -right-3">
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <span className="text-red-500 text-sm font-bold">0</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-700 text-2xl font-bold mb-3">Không tìm thấy nhân viên nào</p>
                                <p className="text-slate-500 text-lg">Thử điều chỉnh từ khóa tìm kiếm hoặc thêm nhân viên mới</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-10">
                            {staffList.map((staff, index) => (
                                <div
                                    key={staff.operatorId}
                                    className="group bg-white/85 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 p-10 hover:shadow-3xl hover:bg-white/95 transition-all duration-700 transform hover:-translate-y-3 hover:scale-[1.02] relative overflow-hidden"
                                    style={{
                                        animationDelay: `${index * 200}ms`,
                                        animation: "slideInUp 1s ease-out forwards",
                                    }}
                                >
                                    {/* Enhanced decorative background elements */}
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
                                                <div className="absolute top-0 left-0 w-full h-full">
                                                    <Sparkles className="w-4 h-4 text-white absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="text-3xl font-black text-slate-800 mb-4 group-hover:text-purple-700 transition-colors duration-500 flex items-center gap-3">
                                                    {staff.fullName}
                                                    <Shield className="w-6 h-6 text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse" />
                                                    <Crown className="w-5 h-5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-spin" />
                                                </h3>

                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4 text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                                                        <div className="p-3 bg-blue-100 rounded-2xl group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-300 shadow-lg">
                                                            <Mail className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <span className="font-semibold text-lg">{staff.email}</span>
                                                    </div>

                                                    {staff.phone && (
                                                        <div className="flex items-center gap-4 text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                                                            <div className="p-3 bg-green-100 rounded-2xl group-hover:bg-green-200 group-hover:scale-110 transition-all duration-300 shadow-lg">
                                                                <Phone className="w-5 h-5 text-green-600" />
                                                            </div>
                                                            <span className="font-semibold text-lg">{staff.phone}</span>
                                                        </div>
                                                    )}

                                                    {staff.address && (
                                                        <div className="flex items-center gap-4 text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                                                            <div className="p-3 bg-purple-100 rounded-2xl group-hover:bg-purple-200 group-hover:scale-110 transition-all duration-300 shadow-lg">
                                                                <MapPin className="w-5 h-5 text-purple-600" />
                                                            </div>
                                                            <span className="font-semibold text-lg">{staff.address}</span>
                                                        </div>
                                                    )}

                                                    {staff.username && (
                                                        <div className="flex items-center gap-4 text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                                                            <div className="p-3 bg-indigo-100 rounded-2xl group-hover:bg-indigo-200 group-hover:scale-110 transition-all duration-300 shadow-lg">
                                                                <User className="w-5 h-5 text-indigo-600" />
                                                            </div>
                                                            <span className="font-semibold text-lg">@{staff.username}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ultra Enhanced Action Buttons */}
                                        <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-8 group-hover:translate-x-0">
                                            <button
                                                onClick={() => setSelectedStaff(staff)}
                                                className="group/btn p-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-125 hover:rotate-6 hover:shadow-2xl relative overflow-hidden"
                                                title="Gửi Phản Hồi"
                                            >
                                                <div className="absolute inset-0 bg-white/30 transform scale-0 group-hover/btn:scale-100 transition-transform duration-300 rounded-2xl"></div>
                                                <MessageSquare className="w-6 h-6 relative z-10 group-hover/btn:animate-pulse" />
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setEditStaff(staff)
                                                    setEditForm({
                                                        username: staff.username,
                                                        email: staff.email,
                                                        fullName: staff.fullName || "",
                                                        phone: staff.phone || "",
                                                        address: staff.address || "",
                                                    })
                                                }}
                                                className="group/btn p-4 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-125 hover:rotate-6 hover:shadow-2xl relative overflow-hidden"
                                                title="Chỉnh Sửa"
                                            >
                                                <div className="absolute inset-0 bg-white/30 transform scale-0 group-hover/btn:scale-100 transition-transform duration-300 rounded-2xl"></div>
                                                <Edit className="w-6 h-6 relative z-10 group-hover/btn:animate-pulse" />
                                            </button>

                                            <button
                                                onClick={() => setConfirmAction({ type: "block", staffId: staff.operatorId })}
                                                className="group/btn p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-125 hover:rotate-6 hover:shadow-2xl relative overflow-hidden"
                                                title="Chặn Nhân Viên"
                                            >
                                                <div className="absolute inset-0 bg-white/30 transform scale-0 group-hover/btn:scale-100 transition-transform duration-300 rounded-2xl"></div>
                                                <Ban className="w-6 h-6 relative z-10 group-hover/btn:animate-pulse" />
                                            </button>

                                            <button
                                                onClick={() => setConfirmAction({ type: "delete", staffId: staff.operatorId })}
                                                className="group/btn p-4 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-125 hover:rotate-6 hover:shadow-2xl relative overflow-hidden"
                                                title="Xóa Nhân Viên"
                                            >
                                                <div className="absolute inset-0 bg-white/30 transform scale-0 group-hover/btn:scale-100 transition-transform duration-300 rounded-2xl"></div>
                                                <Trash2 className="w-6 h-6 relative z-10 group-hover/btn:animate-pulse" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Ultra Enhanced Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-16">
                            <div className="bg-white/85 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/40 p-4 flex gap-3 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10"></div>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => fetchStaffList(i)}
                                        className={`relative z-10 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-125 ${
                                            i === currentPage
                                                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl scale-125 animate-pulse"
                                                : "text-slate-600 hover:bg-white/90 hover:text-purple-700 hover:shadow-xl"
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ultra Enhanced Feedback Modal */}
                    {selectedStaff && (
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
                            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-3xl w-full max-w-2xl transform transition-all duration-700 scale-100 relative overflow-hidden border border-white/30">
                                {/* Enhanced decorative elements */}
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
                                                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                                                        Gửi Phản Hồi
                                                        <Sparkles className="w-6 h-6 text-yellow-500 animate-spin" />
                                                    </h2>
                                                    <p className="text-slate-600 mt-2 text-lg font-semibold">Đến: {selectedStaff.fullName}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedStaff(null)}
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
                        placeholder="✨ Viết phản hồi của bạn tại đây..."
                    />
                                    </div>

                                    <div className="p-10 pt-0 flex justify-end gap-6">
                                        <button
                                            onClick={() => setSelectedStaff(null)}
                                            className="px-8 py-4 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all duration-300 font-bold text-lg transform hover:scale-110"
                                        >
                                            Hủy Bỏ
                                        </button>
                                        <button
                                            onClick={handleFeedback}
                                            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-black text-lg transition-all duration-500 transform hover:scale-110 hover:shadow-2xl flex items-center gap-4 relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/20 transform scale-x-0 hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                                            <div className="relative z-10 flex items-center gap-4">
                                                <MessageSquare className="w-6 h-6" />
                                                Gửi Phản Hồi
                                                <Heart className="w-5 h-5 animate-pulse" />
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ultra Enhanced Edit Modal */}
                    {editStaff && (
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
                            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-3xl w-full max-w-2xl transform transition-all duration-700 scale-100 relative overflow-hidden border border-white/30">
                                {/* Enhanced decorative elements */}
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
                                                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                                                        Chỉnh Sửa Nhân Viên
                                                        <Star className="w-6 h-6 text-yellow-500 animate-spin" />
                                                    </h2>
                                                    <p className="text-slate-600 mt-2 text-lg font-semibold">{editStaff.fullName}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setEditStaff(null)}
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
                                            onClick={() => setEditStaff(null)}
                                            className="px-8 py-4 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all duration-300 font-bold text-lg transform hover:scale-110"
                                        >
                                            Hủy Bỏ
                                        </button>
                                        <button
                                            onClick={handleEdit}
                                            className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-black text-lg transition-all duration-500 transform hover:scale-110 hover:shadow-2xl flex items-center gap-4 relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/20 transform scale-x-0 hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                                            <div className="relative z-10 flex items-center gap-4">
                                                <Check className="w-6 h-6" />
                                                Cập Nhật
                                                <Sparkles className="w-5 h-5 animate-pulse" />
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ultra Enhanced Confirm Dialog */}
                    {confirmAction.type && (
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
                            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-3xl w-full max-w-lg transform transition-all duration-700 scale-100 relative overflow-hidden border border-white/30">
                                {/* Enhanced decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>

                                <div className="relative z-10 p-12 text-center">
                                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
                                        <AlertTriangle className="w-10 h-10 text-white animate-pulse" />
                                    </div>

                                    <h2 className="text-3xl font-black text-slate-800 mb-4 flex items-center justify-center gap-3">
                                        Xác Nhận {confirmAction.type === "delete" ? "Xóa" : "Chặn"}
                                        <Zap className="w-6 h-6 text-yellow-500 animate-pulse" />
                                    </h2>

                                    <p className="text-slate-600 mb-10 text-xl leading-relaxed">
                                        Bạn có chắc chắn muốn {confirmAction.type === "delete" ? "xóa" : "chặn"} nhân viên này không?
                                        <br />
                                        <span className="font-black text-red-600 text-lg">Hành động này không thể hoàn tác!</span>
                                    </p>

                                    <div className="flex justify-center gap-6">
                                        <button
                                            onClick={() => setConfirmAction({ type: "", staffId: null })}
                                            className="px-8 py-4 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all duration-300 font-bold text-lg transform hover:scale-110"
                                        >
                                            Hủy Bỏ
                                        </button>
                                        <button
                                            onClick={confirmAction.type === "delete" ? handleDelete : handleBlock}
                                            className="px-12 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-2xl font-black text-lg transition-all duration-500 transform hover:scale-110 hover:shadow-2xl relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/20 transform scale-x-0 hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                                            <div className="relative z-10">{confirmAction.type === "delete" ? "Xóa" : "Chặn"}</div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
            <Footer />
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