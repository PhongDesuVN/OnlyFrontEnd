"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "../../utils/axiosInstance.js"
import Footer from "../../Components/FormLogin_yen/Footer.jsx"
import ConfirmDialog from "../../Components/FormLogin_yen/ConfirmDialog.jsx"
import PromotionCard from "./PromotionCard"

import {
    Gift, Save, Trash2, TrendingUp,
    Clock, AlertCircle, X, Tag, ArrowLeft, LogOut, Truck, Search, Plus, Home, User, Zap
} from "lucide-react"
import Cookies from "js-cookie";

// Component Menu bên trái
const LeftMenu = ({ onLogout }) => {
    return (
        <div className="w-64 bg-gradient-to-br from-indigo-600 to-purple-600 min-h-screen p-6 text-white shadow-lg">
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Menu</h2>
                <ul className="space-y-2">
                    <li>
                        <Link to="/manager-dashboard" className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-indigo-500">
                            <Home className="w-5 h-5" /> Về trang chủ
                        </Link>
                    </li>
                    <li>
                        <Link to="/promotions" className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-indigo-500">
                            <Gift className="w-5 h-5" /> Danh sách khuyến mãi
                        </Link>
                    </li>
                    <li>
                        <Link to="/stats" className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-indigo-500">
                            <TrendingUp className="w-5 h-5" /> Thống kê
                        </Link>
                    </li>
                    <li>
                        <Link to="/settings" className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-indigo-500">
                            <Zap className="w-5 h-5" /> Cài đặt
                        </Link>
                    </li>
                </ul>
            </div>
            <div className="mt-auto">
                <button onClick={onLogout} className="flex items-center gap-2 text-red-400 hover:text-red-200 w-full text-left p-2 rounded-lg hover:bg-indigo-500">
                    <LogOut className="w-5 h-5" /> Logout
                </button>
            </div>
        </div>
    )
}

const PromotionManager = () => {
    const [promotions, setPromotions] = useState([])
    const [allPromotions, setAllPromotions] = useState([]) // Lưu toàn bộ danh sách để lọc client-side
    const [loading, setLoading] = useState(false)
    const [keyword, setKeyword] = useState("")
    const [status, setStatus] = useState("")
    const [dialog, setDialog] = useState({ open: false, type: "", promo: null, data: null })
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newPromotion, setNewPromotion] = useState({ name: "", startDate: "", endDate: "", description: "", status: "Active" })
    const [filtered, setFiltered] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 6

    // Lấy toàn bộ danh sách khi tải trang
    useEffect(() => {
        fetchAllPromotions()
    }, [])

    const handleLogout = () => {
        Cookies.remove("authToken")
        window.location.replace("/login")
    }

    // Hàm lấy toàn bộ danh sách
    const fetchAllPromotions = async () => {
        setLoading(true)
        try {
            const response = await axios.get("/api/promotions")
            const data = Array.isArray(response.data) ? response.data : (response.data.content || [])
            console.log("Dữ liệu toàn bộ từ API:", data)
            setPromotions(data)
            setAllPromotions(data) // Lưu toàn bộ để dùng cho lọc client-side
        } catch (error) {
            console.error("Lỗi tải dữ liệu toàn bộ:", error.response ? error.response.data : error.message)
            alert("❌ Không thể tải danh sách khuyến mãi. Vui lòng kiểm tra kết nối hoặc backend.")
            setPromotions([])
            setAllPromotions([])
        } finally {
            setLoading(false)
        }
    }

    // Hàm áp dụng bộ lọc
    const fetchPromotions = async () => {
        setLoading(true)
        try {
            console.log("Gửi request với params:", { keyword, status })
            const response = await axios.get("/api/promotions", {
                params: { keyword: keyword.trim() || undefined, status: status.trim() || undefined }
            })
            let data = Array.isArray(response.data) ? response.data : (response.data.content || [])
            console.log("Dữ liệu từ server sau khi lọc:", data)

            if (data.length === 0 && (keyword.trim() || status.trim())) {
                console.log("Không có kết quả từ server, áp dụng lọc client-side");
                data = allPromotions.filter(promo =>
                    (!keyword.trim() || promo.name.toLowerCase().includes(keyword.trim().toLowerCase())) &&
                    (!status.trim() || promo.status === status.trim())
                );
            }

            console.log("Dữ liệu sau khi lọc (server hoặc client):", data)
            setPromotions(data)
            setFiltered(!!keyword.trim() || !!status.trim())
        } catch (error) {
            console.error("Lỗi tải dữ liệu khi lọc:", error.response ? error.response.data : error.message)
            alert(`❌ Lỗi khi lọc danh sách: ${error.response?.data?.message || error.message}. Sử dụng lọc client-side thay thế.`)
            const filteredData = allPromotions.filter(promo =>
                (!keyword.trim() || promo.name.toLowerCase().includes(keyword.trim().toLowerCase())) &&
                (!status.trim() || promo.status === status.trim())
            );
            console.log("Dữ liệu lọc client-side:", filteredData)
            setPromotions(filteredData)
            setFiltered(!!keyword.trim() || !!status.trim())
        } finally {
            setLoading(false)
        }
    }

    // Hàm xóa lọc và quay lại danh sách toàn bộ
    const resetFilter = async () => {
        setLoading(true) // Bắt đầu loading để tạo hiệu ứng mượt mà
        setKeyword("") // Reset ngay lập tức để UI phản hồi nhanh
        setStatus("")
        setFiltered(false)
        setCurrentPage(1)
        await fetchAllPromotions() // Tải lại toàn bộ danh sách
        setLoading(false) // Kết thúc loading
    }

    const openConfirm = (promo, type, data = null) => {
        setDialog({ open: true, type, promo, data })
    }

    const handleConfirmed = async () => {
        const { promo, type, data } = dialog
        if (!promo) return
        try {
            let response
            if (type === "update") {
                response = await axios.post("/api/promotions/update", {
                    id: data.id,
                    name: data.name,
                    description: data.description,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    status: data.status
                })
            } else if (type === "cancel") {
                response = await axios.post("/api/promotions/cancel", { id: promo })
            } else if (type === "update-description") {
                response = await axios.post("/api/promotions/update-description", {
                    id: data.id,
                    description: data.description
                })
            }
            await fetchAllPromotions() // Sau khi cập nhật, tải lại toàn bộ danh sách
            alert("✅ Thao tác thành công")
        } catch (error) {
            console.error("Lỗi cập nhật:", error.response?.data || error.message)
            alert(`❌ Thao tác thất bại: ${error.response?.data?.message || error.message}`)
        } finally {
            setDialog({ open: false, type: "", promo: null, data: null })
        }
    }

    const handleAddPromotion = async () => {
        if (!newPromotion.name || !newPromotion.startDate || !newPromotion.endDate || !newPromotion.status) {
            alert("Vui lòng điền đầy đủ thông tin!")
            return
        }
        try {
            const startDate = new Date(newPromotion.startDate)
            const endDate = new Date(newPromotion.endDate)
            if (startDate > endDate) {
                alert("Ngày bắt đầu phải trước ngày kết thúc!")
                return
            }
            const response = await axios.post("/api/promotions/add", {
                name: newPromotion.name,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                description: newPromotion.description,
                status: newPromotion.status
            })
            await fetchAllPromotions() // Sau khi thêm, tải lại toàn bộ danh sách
            setIsAddModalOpen(false)
            setNewPromotion({ name: "", startDate: "", endDate: "", description: "", status: "Active" })
            alert("✅ Thêm khuyến mãi thành công")
        } catch (error) {
            console.error("Lỗi thêm khuyến mãi:", error)
            alert(`❌ Thao tác thất bại: ${error.response?.data?.message || error.message}`)
        }
    }

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentPromotions = promotions.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(promotions.length / itemsPerPage)
    const getPageNumbers = () => {
        const pages = []
        let startPage = Math.max(1, currentPage - Math.floor(5 / 2))
        let endPage = Math.min(totalPages, startPage + 5 - 1)

        if (endPage - startPage < 5 - 1) {
            startPage = Math.max(1, endPage - 5 + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
        }
        return pages
    }

    const paginate = (pageNumber) => setCurrentPage(pageNumber)
    const goToPrevious = () => setCurrentPage(prev => Math.max(prev - 1, 1))
    const goToNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex-grow flex">
                <LeftMenu onLogout={handleLogout} />
                <div className="flex-1 p-8">
                    <main className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight border-b-2 border-purple-500 pb-3">Quản Lý Khuyến Mãi</h1>
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm khuyến mãi..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="w-full px-5 py-3 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-300 ease-in-out text-gray-800 placeholder-gray-400 shadow-sm"
                                />
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-600 w-5 h-5 transition-transform duration-300 hover:scale-110" />
                            </div>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="px-5 py-3 bg-white/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-300 ease-in-out text-gray-800"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="Active">Active</option>
                                <option value="Expired">Expired</option>
                                <option value="Pending">Pending</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Sắp bắt đầu">Sắp bắt đầu</option>
                            </select>
                            <button
                                onClick={fetchPromotions}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-700 to-purple-700 text-white rounded-lg hover:from-indigo-800 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                Tìm kiếm
                            </button>
                            {filtered && (
                                <>
                                    <button
                                        onClick={resetFilter}
                                        className="px-6 py-3 bg-gradient-to-r from-indigo-700 to-purple-700 text-white rounded-lg hover:from-indigo-800 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
                                    >
                                        <X className="w-5 h-5" /> Xóa lọc
                                    </button>
                                    <button
                                        onClick={resetFilter}
                                        className="px-6 py-3 bg-gradient-to-r from-indigo-700 to-purple-700 text-white rounded-lg hover:from-indigo-800 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-5 h-5" /> Quay lại
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-700 to-purple-700 text-white rounded-lg hover:from-indigo-800 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> Thêm Khuyến Mãi
                            </button>
                        </div>
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-indigo-600"></div>
                            </div>
                        ) : promotions.length === 0 ? (
                            <div className="text-center text-gray-600 py-12">
                                Không có khuyến mãi nào để hiển thị. Vui lòng thêm khuyến mãi hoặc kiểm tra bộ lọc.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-5 gap-4 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm rounded-t-xl shadow-md">
                                    <span className="pl-4">Tên</span>
                                    <span>Ngày Tháng</span>
                                    <span>Mô tả</span>
                                    <span>Trạng thái</span>
                                    <span className="pr-4">Hành Động</span>
                                </div>
                                <div className="space-y-2">
                                    {currentPromotions.map(promo => (
                                        <div
                                            key={promo.id}
                                            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                        >
                                            <PromotionCard
                                                promo={promo}
                                                onUpdate={(data) => openConfirm(promo, "update", data)}
                                                onCancel={(id) => openConfirm(id, "cancel")}
                                                onUpdateDescription={(data) => openConfirm(promo, "update-description", data)}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-center gap-3 mt-8 items-center">
                                    <button
                                        onClick={goToPrevious}
                                        disabled={currentPage === 1}
                                        className="p-3 rounded-full bg-gradient-to-r from-indigo-700 to-purple-700 text-white hover:from-indigo-800 hover:to-purple-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    {getPageNumbers().map(number => (
                                        <button
                                            key={number}
                                            onClick={() => paginate(number)}
                                            className={`px-4 py-2 rounded-full ${currentPage === number ? 'bg-gradient-to-r from-indigo-700 to-purple-700 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-all duration-300`}
                                        >
                                            {number}
                                        </button>
                                    ))}
                                    <button
                                        onClick={goToNext}
                                        disabled={currentPage === totalPages}
                                        className="p-3 rounded-full bg-gradient-to-r from-indigo-700 to-purple-700 text-white hover:from-indigo-800 hover:to-purple-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ArrowLeft className="w-5 h-5 rotate-180" />
                                    </button>
                                    <span className="text-sm text-gray-600 font-medium">
                                        Trang {currentPage} / {totalPages}
                                    </span>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            <ConfirmDialog
                open={dialog.open}
                onClose={() => setDialog({ open: false, type: "", promo: null, data: null })}
                onConfirm={handleConfirmed}
                title={dialog.type === "cancel" ? "Xác nhận hủy" : dialog.type === "update-description" ? "Xác nhận cập nhật mô tả" : "Xác nhận cập nhật"}
                message={
                    dialog.type === "cancel"
                        ? "Bạn có chắc chắn muốn hủy khuyến mãi này không?"
                        : dialog.type === "update-description"
                            ? "Bạn có chắc chắn muốn cập nhật mô tả này không?"
                            : "Bạn có chắc chắn muốn cập nhật khuyến mãi này không?"
                }
                confirmLabel={dialog.type === "cancel" ? "Xóa" : "Xác nhận"}
                confirmColor="from-indigo-700 to-purple-700"
            />
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-bold mb-4">Thêm Khuyến Mãi Mới</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tên</label>
                                <input
                                    type="text"
                                    value={newPromotion.name}
                                    onChange={(e) => setNewPromotion({ ...newPromotion, name: e.target.value })}
                                    className="mt-1 p-2 w-full border rounded"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        value={newPromotion.startDate}
                                        onChange={(e) => setNewPromotion({ ...newPromotion, startDate: e.target.value })}
                                        className="mt-1 p-2 w-full border rounded"
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        value={newPromotion.endDate}
                                        onChange={(e) => setNewPromotion({ ...newPromotion, endDate: e.target.value })}
                                        className="mt-1 p-2 w-full border rounded"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                <input
                                    type="text"
                                    value={newPromotion.description}
                                    onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })}
                                    className="mt-1 p-2 w-full border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                <select
                                    value={newPromotion.status}
                                    onChange={(e) => setNewPromotion({ ...newPromotion, status: e.target.value })}
                                    className="mt-1 p-2 w-full border rounded"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Expired">Expired</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Sắp bắt đầu">Sắp bắt đầu</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-700 to-purple-700 text-white rounded-lg hover:from-indigo-800 hover:to-purple-800"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAddPromotion}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-700 to-purple-700 text-white rounded-lg hover:from-indigo-800 hover:to-purple-800"
                            >
                                Thêm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer className="mt-auto" />
        </div>
    )
}

export default PromotionManager