"use client"

import { useEffect, useState } from "react"
import axios from "../../utils/axiosInstance.js"
import Header from "../../Components/FormLogin_yen/Header.jsx"
import Footer from "../../Components/FormLogin_yen/Footer.jsx"
import ConfirmDialog from "../../Components/FormLogin_yen/ConfirmDialog.jsx"

import {
    Gift, Save, RefreshCw, Trash2, TrendingUp,
    Clock, AlertCircle, X, Tag, ArrowLeft
} from "lucide-react"

// Component hiển thị một khuyến mãi
const PromotionCard = ({ promo, onUpdateName, onUpdateDates, onCancel }) => {
    const [nameEdit, setNameEdit] = useState(promo.name)
    const [localDates, setLocalDates] = useState({
        startDate: new Date(promo.startDate).toISOString().split("T")[0],
        endDate: new Date(promo.endDate).toISOString().split("T")[0]
    })

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "active": return "bg-green-100 text-green-700"
            case "expired": return "bg-red-100 text-red-700"
            case "pending": return "bg-yellow-100 text-yellow-700"
            case "cancelled": return "bg-gray-200 text-gray-600"
            default: return "bg-blue-100 text-blue-700"
        }
    }

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case "active": return <TrendingUp className="w-4 h-4" />
            case "expired": return <Clock className="w-4 h-4" />
            case "pending": return <AlertCircle className="w-4 h-4" />
            case "cancelled": return <X className="w-4 h-4" />
            default: return <Tag className="w-4 h-4" />
        }
    }

    const handleDateUpdate = () => {
        if (new Date(localDates.startDate) > new Date(localDates.endDate)) {
            alert("Ngày bắt đầu phải trước ngày kết thúc!")
            return
        }
        onUpdateDates(promo, localDates)
    }

    return (
        <div className="p-6 rounded-2xl bg-white shadow-xl">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-rose-500 to-indigo-500 text-white rounded-xl">
                        <Gift className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            #{promo.id} – {promo.name}
                        </h2>
                        <p className="text-sm text-slate-500">
                            {new Date(promo.startDate).toLocaleDateString()} → {new Date(promo.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-slate-500">
                            Mô tả: {promo.description || "Chưa có mô tả"}
                        </p>
                    </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(promo.status)}`}>
                    {getStatusIcon(promo.status)} {promo.status}
                </div>
            </div>

            <div className="grid gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <input
                        type="text"
                        value={nameEdit}
                        onChange={(e) => setNameEdit(e.target.value)}
                        className="flex-1 border px-4 py-3 rounded-xl shadow-inner"
                        placeholder="Nhập tên khuyến mãi"
                    />
                    <button
                        onClick={() => onUpdateName(promo, nameEdit)}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700"
                    >
                        <Save className="w-4 h-4" /> Cập nhật tên
                    </button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 flex gap-4">
                        <input
                            type="date"
                            value={localDates.startDate}
                            onChange={(e) => setLocalDates({ ...localDates, startDate: e.target.value })}
                            className="w-1/2 border px-4 py-3 rounded-xl"
                        />
                        <input
                            type="date"
                            value={localDates.endDate}
                            onChange={(e) => setLocalDates({ ...localDates, endDate: e.target.value })}
                            className="w-1/2 border px-4 py-3 rounded-xl"
                        />
                    </div>
                    <button
                        onClick={handleDateUpdate}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700"
                    >
                        <RefreshCw className="w-4 h-4" /> Cập nhật ngày
                    </button>
                </div>

                <button
                    onClick={() => onCancel(promo)}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700"
                >
                    <Trash2 className="w-4 h-4" /> Hủy khuyến mãi
                </button>
            </div>
        </div>
    )
}

const PromotionManager = () => {
    const [promotions, setPromotions] = useState([])
    const [loading, setLoading] = useState(false)
    const [keyword, setKeyword] = useState("")
    const [dialog, setDialog] = useState({ open: false, type: "", promo: null, data: null })
    const [filtered, setFiltered] = useState(false)

    useEffect(() => {
        fetchPromotions()
    }, [])

    const fetchPromotions = async () => {
        setLoading(true)
        try {
            const res = await axios.get("/api/promotions")
            const data = Array.isArray(res.data) ? res.data : res.data.content || []
            const filteredData = keyword.trim()
                ? data.filter(promo => promo.name.toLowerCase().includes(keyword.toLowerCase()))
                : data
            setPromotions(filteredData)
            setFiltered(!!keyword.trim())
            console.log("Phản hồi API:", res.data)
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error)
            alert("❌ Không thể tải danh sách khuyến mãi")
            setPromotions([])
        } finally {
            setLoading(false)
        }
    }

    const resetFilter = async () => {
        setKeyword("")
        await fetchPromotions()
    }

    const openConfirm = (promo, type, data = null) => {
        setDialog({ open: true, type, promo, data })
    }

    const handleConfirmed = async () => {
        const { promo, type, data } = dialog
        if (!promo) return
        try {
            if (type === "name") {
                await axios.post("/api/promotions/update", {
                    id: promo.id,
                    name: data.name
                })
            } else if (type === "dates") {
                await axios.post("/api/promotions/update-dates", {
                    id: promo.id,
                    startDate: data.startDate,
                    endDate: data.endDate
                })
            } else if (type === "cancel") {
                await axios.post("/api/promotions/cancel", { id: promo.id })
            }
            fetchPromotions()
            alert("✅ Thao tác thành công")
        } catch (error) {
            console.error("Lỗi cập nhật:", error.response?.data || error.message)
            alert(`❌ Thao tác thất bại: ${error.response?.data?.message || error.message}`)
        } finally {
            setDialog({ open: false, type: "", promo: null, data: null })
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-400 via-indigo-200 to-purple-300">
            <div className="flex-grow">
                <Header className="mb-16" />
                <div className="h-16"></div>
                <main className="p-6">
                    <div className="max-w-5xl mx-auto">
                        <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-rose-700 to-indigo-700">
                            Quản lý khuyến mãi
                        </h1>

                        <div className="flex flex-wrap gap-4 mb-6 items-center">
                            <input
                                type="text"
                                placeholder="Tìm tên khuyến mãi..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="px-4 py-2 rounded-xl border border-slate-300 shadow-inner w-full sm:w-auto flex-grow"
                            />
                            <button
                                onClick={fetchPromotions}
                                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow hover:from-indigo-700 hover:to-purple-700 transition"
                            >
                                Lọc
                            </button>
                            {filtered && (
                                <button
                                    onClick={resetFilter}
                                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow hover:from-indigo-700 hover:to-purple-700 transition flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <p className="text-center py-10 text-slate-500">Đang tải...</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {promotions.map(promo => (
                                    <PromotionCard
                                        key={promo.id}
                                        promo={promo}
                                        onUpdateName={(promo, name) => openConfirm(promo, "name", { name })}
                                        onUpdateDates={(promo, dates) => openConfirm(promo, "dates", dates)}
                                        onCancel={(promo) => openConfirm(promo, "cancel")}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <ConfirmDialog
                open={dialog.open}
                onClose={() => setDialog({ open: false, type: "", promo: null, data: null })}
                onConfirm={handleConfirmed}
                title={dialog.type === "cancel" ? "Xác nhận hủy" : "Xác nhận cập nhật"}
                message={
                    dialog.type === "cancel"
                        ? "Bạn có chắc chắn muốn hủy khuyến mãi này không?"
                        : "Bạn có chắc chắn muốn cập nhật khuyến mãi này không?"
                }
                confirmLabel={dialog.type === "cancel" ? "Xóa" : "Xác nhận"}
                confirmColor={dialog.type === "cancel" ? "from-rose-500 to-pink-500" : "from-indigo-600 to-purple-600"}
            />

            <Footer className="mt-auto" />
        </div>
    )
}

export default PromotionManager