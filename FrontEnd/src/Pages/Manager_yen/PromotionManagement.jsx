"use client"

import { useEffect, useState } from "react"
import axios from "../../utils/axiosInstance.js"
import Footer from "../../Components/FormLogin_yen/Footer.jsx"
import {
    Gift, Calendar,Edit3,X,Sparkles,Star,Heart,Zap,Crown,Award,Home,ChevronLeft,Clock,Tag,TrendingUp,AlertCircle,Save,
    RefreshCw,Trash2,CalendarDays, BadgePercent, Loader2,
} from "lucide-react"

const PromotionManager = () => {
    const [promotions, setPromotions] = useState([])
    // Set initial dates to current date
    const [dates, setDates] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    })
    const [loading, setLoading] = useState(false)
    const [editingPromo, setEditingPromo] = useState(null)

    useEffect(() => {
        fetchPromotions()
    }, [])

    const fetchPromotions = async () => {
        setLoading(true)
        try {
            const res = await axios.get("/api/promotions")
            setPromotions(res.data)
        } catch (err) {
            console.error("Failed to load promotions:", err)
            alert("❌ Không thể tải danh sách khuyến mãi")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async (promotion) => {
        try {
            const res = await axios.post("/api/promotions/update", {
                id: promotion.id,
                name: promotion.name,
            })
            alert("✅ " + res.data.message)
            fetchPromotions()
            setEditingPromo(null)
        } catch (err) {
            console.error("Update error", err)
            alert("❌ Cập nhật thất bại")
        }
    }

    const handleUpdateDates = async (promotionId) => {
        if (!dates.startDate || !dates.endDate) {
            alert("⚠️ Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc")
            return
        }
        try {
            const res = await axios.post("/api/promotions/update-dates", {
                id: promotionId,
                startDate: dates.startDate,
                endDate: dates.endDate,
            })
            alert("✅ " + res.data.message)
            fetchPromotions()
            setDates({ startDate: "", endDate: "" }) // Reset to empty after update
        } catch (err) {
            console.error("Date update error", err)
            alert("❌ Cập nhật ngày thất bại")
        }
    }

    const handleCancel = async (promotionId) => {
        if (!confirm("🤔 Bạn có chắc chắn muốn hủy khuyến mãi này không?")) return

        try {
            const res = await axios.post("/api/promotions/cancel", { id: promotionId })
            alert("✅ " + res.data.message)
            fetchPromotions()
        } catch (err) {
            console.error("Cancel error", err)
            alert("❌ Hủy khuyến mãi thất bại")
        }
    }

    const handleBackToHome = () => {
        window.history.back()
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "active":
            case "đang hoạt động":
                return "from-green-500 to-emerald-500"
            case "expired":
            case "hết hạn":
                return "from-red-500 to-pink-500"
            case "pending":
            case "chờ duyệt":
                return "from-yellow-500 to-orange-500"
            case "cancelled":
            case "đã hủy":
                return "from-gray-500 to-slate-500"
            default:
                return "from-blue-500 to-indigo-500"
        }
    }

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case "active":
            case "đang hoạt động":
                return <TrendingUp className="w-4 h-4" />
            case "expired":
            case "hết hạn":
                return <Clock className="w-4 h-4" />
            case "pending":
            case "chờ duyệt":
                return <AlertCircle className="w-4 h-4" />
            case "cancelled":
            case "đã hủy":
                return <X className="w-4 h-4" />
            default:
                return <Tag className="w-4 h-4" />
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float-delayed"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="relative z-10 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-8">
                            <button
                                onClick={handleBackToHome}
                                className="group flex items-center gap-4 px-8 py-4 bg-white/90 backdrop-blur-md hover:bg-white/95 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-white/30 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-purple-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="p-2 bg-gradient-to-br from-rose-500 to-purple-500 rounded-2xl group-hover:scale-110 transition-transform duration-200">
                                        <ChevronLeft className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <div className="flex items-center gap-2">
                                            <Home className="w-5 h-5 text-slate-600 group-hover:text-rose-600 transition-colors duration-200" />
                                            <span className="text-slate-700 font-bold text-lg group-hover:text-rose-700 transition-colors duration-200">
                        Về Trang Chủ
                      </span>
                                        </div>
                                        <p className="text-slate-500 text-sm group-hover:text-rose-500 transition-colors duration-200">
                                            Quay lại dashboard chính
                                        </p>
                                    </div>
                                </div>
                            </button>

                            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md rounded-2xl px-6 py-3 shadow-lg border border-white/20">
                                <Crown className="w-6 h-6 text-yellow-500 animate-pulse" />
                                <span className="text-slate-700 font-semibold">Quản Lý Khuyến Mãi</span>
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mb-6">
                            <div className="relative">
                                <div className="p-4 bg-gradient-to-br from-rose-600 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl">
                                    <Gift className="w-10 h-10 text-white" />
                                </div>
                                <div className="absolute -top-2 -right-2">
                                    <BadgePercent className="w-6 h-6 text-yellow-400 animate-spin" />
                                </div>
                                <div className="absolute -bottom-1 -left-1">
                                    <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-5xl font-black bg-gradient-to-r from-rose-800 via-purple-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                                    Quản Lý Khuyến Mãi
                                </h1>
                                <p className="text-slate-600 flex items-center gap-3 text-lg">
                                    <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
                                    Tạo và quản lý các chương trình khuyến mãi
                                    <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
                                </p>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/40 p-20 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-purple-500/5"></div>
                            <div className="text-center relative z-10">
                                <div className="relative inline-block mb-8">
                                    <Loader2 className="w-16 h-16 animate-spin text-rose-600 mx-auto" />
                                    <div className="absolute inset-0">
                                        <Star className="w-4 h-4 text-yellow-400 absolute -top-3 -right-3 animate-ping" />
                                        <Sparkles className="w-4 h-4 text-pink-400 absolute -bottom-3 -left-3 animate-ping delay-300" />
                                        <Heart className="w-3 h-3 text-red-400 absolute top-0 left-0 animate-ping delay-500" />
                                    </div>
                                </div>
                                <p className="text-slate-700 text-2xl font-bold mb-2">Đang tải danh sách khuyến mãi...</p>
                                <p className="text-slate-500 text-lg">✨ Chuẩn bị điều tuyệt vời cho bạn</p>
                            </div>
                        </div>
                    ) : promotions.length === 0 ? (
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/40 p-20 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5"></div>
                            <div className="relative z-10">
                                <div className="relative inline-block mb-8">
                                    <Gift className="w-24 h-24 text-slate-300 mx-auto" />
                                    <div className="absolute -top-3 -right-3">
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <span className="text-red-500 text-sm font-bold">0</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-700 text-2xl font-bold mb-3">Chưa có khuyến mãi nào</p>
                                <p className="text-slate-500 text-lg">Hãy tạo chương trình khuyến mãi đầu tiên của bạn</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-8">
                            {promotions.map((promo, index) => (
                                <div
                                    key={promo.id}
                                    className="group bg-white/85 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 p-10 hover:shadow-3xl hover:bg-white/95 transition-all duration-700 transform hover:-translate-y-3 hover:scale-[1.02] relative overflow-hidden"
                                    style={{
                                        animationDelay: `${index * 200}ms`,
                                        animation: "slideInUp 1s ease-out forwards",
                                    }}
                                >
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-rose-400/15 to-pink-400/15 rounded-full blur-3xl group-hover:scale-150 group-hover:rotate-45 transition-all duration-700"></div>
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-400/15 to-indigo-400/15 rounded-full blur-3xl group-hover:scale-150 group-hover:-rotate-45 transition-all duration-700"></div>

                                    <div className="relative z-10 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="relative">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                                                        <Gift className="w-8 h-8" />
                                                    </div>
                                                    <div className="absolute -top-1 -right-1">
                                                        <Award className="w-5 h-5 text-yellow-500 animate-pulse" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <h3 className="text-2xl font-black text-slate-800 group-hover:text-rose-700 transition-colors duration-300">
                                                            #{promo.id} – {promo.name}
                                                        </h3>
                                                        <div
                                                            className={`px-4 py-2 bg-gradient-to-r ${getStatusColor(promo.status)} text-white rounded-2xl font-semibold text-sm flex items-center gap-2 shadow-lg`}
                                                        >
                                                            {getStatusIcon(promo.status)}
                                                            {promo.status}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-600 flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        Khuyến mãi #{promo.id}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleCancel(promo.id)}
                                                className="group/btn p-4 bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl transition-all duration-300 transform hover:scale-110 hover:rotate-3 hover:shadow-2xl relative overflow-hidden"
                                                title="Hủy Khuyến Mãi"
                                            >
                                                <div className="absolute inset-0 bg-white/20 transform scale-0 group-hover/btn:scale-100 transition-transform duration-300 rounded-2xl"></div>
                                                <div className="relative z-10 flex items-center gap-2">
                                                    <Trash2 className="w-5 h-5" />
                                                    <span className="font-semibold">Hủy</span>
                                                </div>
                                            </button>
                                        </div>

                                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl"></div>
                                            <div className="relative z-10">
                                                <label className="block text-lg font-black text-slate-700 mb-4 flex items-center gap-3">
                                                    <Edit3 className="w-5 h-5 text-blue-600" />
                                                    Tên Khuyến Mãi
                                                    <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                                                </label>
                                                <div className="flex gap-4">
                                                    <input
                                                        type="text"
                                                        defaultValue={promo.name}
                                                        className="flex-1 border-2 border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg font-medium shadow-inner bg-white/80"
                                                        placeholder="Nhập tên khuyến mãi..."
                                                        onChange={(e) =>
                                                            setPromotions((prev) =>
                                                                prev.map((p) => (p.id === promo.id ? { ...p, name: e.target.value } : p)),
                                                            )
                                                        }
                                                    />
                                                    <button
                                                        onClick={() => handleUpdate(promo)}
                                                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center gap-3 relative overflow-hidden"
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 transform scale-x-0 hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                                        <div className="relative z-10 flex items-center gap-3">
                                                            <Save className="w-5 h-5" />
                                                            Cập nhật tên
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-xl"></div>
                                            <div className="relative z-10">
                                                <label className="block text-lg font-black text-slate-700 mb-4 flex items-center gap-3">
                                                    <CalendarDays className="w-5 h-5 text-green-600" />
                                                    Thời Gian Khuyến Mãi
                                                    <Star className="w-4 h-4 text-yellow-500 animate-spin" />
                                                </label>
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <label className="block text-sm font-semibold text-slate-600 mb-2">Ngày Bắt Đầu</label>
                                                        <input
                                                            type="date"
                                                            value={dates.startDate}
                                                            onChange={(e) => setDates((prev) => ({ ...prev, startDate: e.target.value }))}
                                                            className="w-full border-2 border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg font-medium shadow-inner bg-white/80"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-sm font-semibold text-slate-600 mb-2">Ngày Kết Thúc</label>
                                                        <input
                                                            type="date"
                                                            value={dates.endDate}
                                                            onChange={(e) => setDates((prev) => ({ ...prev, endDate: e.target.value }))}
                                                            className="w-full border-2 border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg font-medium shadow-inner bg-white/80"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleUpdateDates(promo.id)}
                                                        className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center gap-3 relative overflow-hidden self-end"
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 transform scale-x-0 hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                                        <div className="relative z-10 flex items-center gap-3">
                                                            <RefreshCw className="w-5 h-5" />
                                                            Cập nhật ngày
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
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

export default PromotionManager