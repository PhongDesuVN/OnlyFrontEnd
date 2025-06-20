"use client"

import { useEffect, useState } from "react"
import axios from "../../utils/axiosInstance.js"
import Footer from "../../Components/FormLogin_yen/Footer.jsx"
import ConfirmDialog from "../../Components/FormLogin_yen/ConfirmDialog.jsx"

import {
    Gift, Save, RefreshCw, Trash2, TrendingUp,
    Clock, AlertCircle, X, Tag, ArrowLeft
} from "lucide-react"

const PromotionManager = () => {
    const [promotions, setPromotions] = useState([])
    const [loading, setLoading] = useState(false)
    const [keyword, setKeyword] = useState("")
    const [dates, setDates] = useState({ startDate: "", endDate: "" })
    const [dialog, setDialog] = useState({ open: false, type: "", promo: null })
    const [filtered, setFiltered] = useState(false)
    const [nameEdits, setNameEdits] = useState({}) // 👈 new state

    useEffect(() => {
        fetchPromotions()
    }, [])

    const fetchPromotions = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`/api/promotions?keyword=${encodeURIComponent(keyword)}`)
            setPromotions(res.data)
            setFiltered(!!keyword.trim())
        } catch {
            alert("❌ Không thể tải danh sách khuyến mãi")
        } finally {
            setLoading(false)
        }
    }

    const resetFilter = async () => {
        setKeyword("")
        await fetchPromotions()
    }

    const openConfirm = (promo, type) => {
        setDialog({ open: true, type, promo })
    }

    const handleConfirmed = async () => {
        const { promo, type } = dialog
        if (!promo) return
        try {
            if (type === "name") {
                const name = nameEdits[promo.id] ?? promo.name
                await axios.post("/api/promotions/update", {
                    id: promo.id,
                    name
                })
                setNameEdits((prev) => {
                    const updated = { ...prev }
                    delete updated[promo.id]
                    return updated
                })
            } else if (type === "dates") {
                await axios.post("/api/promotions/update-dates", {
                    id: promo.id,
                    startDate: dates.startDate,
                    endDate: dates.endDate
                })
            } else if (type === "cancel") {
                await axios.post("/api/promotions/cancel", { id: promo.id })
            }
            fetchPromotions()
        } catch {
            alert("❌ Thao tác thất bại")
        } finally {
            setDialog({ open: false, type: "", promo: null })
        }
    }

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

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-100">
            <main className="flex-grow p-6">
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
                            className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
                        >
                            Lọc
                        </button>
                        {filtered && (
                            <button
                                onClick={resetFilter}
                                className="px-6 py-2 bg-gray-400 text-white rounded-xl shadow hover:bg-gray-500 transition flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <p className="text-center py-10 text-slate-500">Đang tải...</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {promotions.map((promo) => (
                                <div key={promo.id} className="p-6 rounded-2xl bg-white shadow-xl">
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
                                                value={nameEdits[promo.id] ?? promo.name}
                                                onChange={(e) =>
                                                    setNameEdits((prev) => ({
                                                        ...prev,
                                                        [promo.id]: e.target.value
                                                    }))
                                                }
                                                className="flex-1 border px-4 py-3 rounded-xl shadow-inner"
                                            />
                                            <button
                                                onClick={() => openConfirm(promo, "name")}
                                                className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2 hover:bg-blue-700"
                                            >
                                                <Save className="w-4 h-4" /> Cập nhật tên
                                            </button>
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            <div className="flex-1 flex gap-4">
                                                <input
                                                    type="date"
                                                    value={dates.startDate}
                                                    onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
                                                    className="w-1/2 border px-4 py-3 rounded-xl"
                                                />
                                                <input
                                                    type="date"
                                                    value={dates.endDate}
                                                    onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
                                                    className="w-1/2 border px-4 py-3 rounded-xl"
                                                />
                                            </div>
                                            <button
                                                onClick={() => openConfirm(promo, "dates")}
                                                className="px-6 py-3 bg-green-600 text-white rounded-xl flex items-center gap-2 hover:bg-green-700"
                                            >
                                                <RefreshCw className="w-4 h-4" /> Cập nhật ngày
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => openConfirm(promo, "cancel")}
                                            className="px-6 py-3 bg-red-600 text-white rounded-xl flex items-center gap-2 hover:bg-red-700 w-max"
                                        >
                                            <Trash2 className="w-4 h-4" /> Hủy khuyến mãi
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <ConfirmDialog
                open={dialog.open}
                onClose={() => setDialog({ ...dialog, open: false })}
                onConfirm={handleConfirmed}
                title={dialog.type === 'cancel' ? 'Xác Nhận Huỷ' : 'Xác Nhận Cập Nhật'}
                message={
                    dialog.type === 'cancel'
                        ? 'Bạn có chắc chắn muốn huỷ khuyến mãi này không?'
                        : 'Bạn có chắc chắn muốn cập nhật khuyến mãi này không?'
                }
                confirmLabel={dialog.type === 'cancel' ? 'Xoá' : 'Xác nhận'}
                confirmColor={dialog.type === 'cancel' ? 'from-rose-500 to-pink-500' : 'from-blue-500 to-indigo-500'}
            />

            <Footer />
        </div>
    )
}

export default PromotionManager
