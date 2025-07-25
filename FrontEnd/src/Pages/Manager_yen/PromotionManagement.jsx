"use client"

import React, { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import axios from "../../utils/axiosInstance.js"
import Header from "../../Components/FormLogin_yen/Header"
import Footer from "../../Components/FormLogin_yen/Footer.jsx"
import ConfirmDialog from "../../Components/FormLogin_yen/ConfirmDialog.jsx"
import PromotionCard from "./PromotionCard"
import {
    Gift, Save, Trash2, TrendingUp,
    Clock, AlertCircle, X, Tag, ArrowLeft, LogOut, Truck, Search, Plus, Home, User, Zap
} from "lucide-react"
import Cookies from "js-cookie"

// Ánh xạ trạng thái và loại giảm giá
const statusMapToBackend = {
    "Hoạt động": "ACTIVE",
    "Hết hạn": "EXPIRED",
    "Đang chờ": "PENDING",
    "Đã hủy": "CANCELED",
    "Sắp bắt đầu": "UPCOMING"
}

const statusMapToFrontend = {
    ACTIVE: "Hoạt động",
    EXPIRED: "Hết hạn",
    PENDING: "Đang chờ",
    CANCELED: "Đã hủy",
    UPCOMING: "Sắp bắt đầu"
}

const discountTypeMapToBackend = {
    "Phần trăm": "PERCENTAGE",
    "Số tiền cố định": "AMOUNT"
}

const discountTypeMapToFrontend = {
    PERCENTAGE: "Phần trăm",
    AMOUNT: "Số tiền cố định"
}

// Hàm validate discountValue dựa trên discountType
const validateDiscountValue = (value, discountType) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return false;
    if (discountType === "Phần trăm" && numValue > 100) return false;
    return true;
}

// Hàm validate độ dài keyword tìm kiếm
const validateSearchKeyword = (keyword) => {
    return keyword.length <= 100; // Chỉ kiểm tra độ dài tối đa 100 ký tự
}

// Component LeftMenu (giữ nguyên)
const LeftMenu = ({ onLogout }) => {
    const { pathname } = useLocation()
    const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`)

    return (
        <aside className="w-72 pt-20 min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl border-r border-blue-700/30 backdrop-blur-sm">
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
                <Link
                    to="/manager-dashboard"
                    className={`group flex items-center gap-4 p-4 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                        isActive("/manager-dashboard")
                            ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]"
                            : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"
                    }`}
                >
                    {isActive("/manager-dashboard") && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                    )}
                    <div
                        className={`p-2.5 rounded-xl transition-all duration-300 ${
                            isActive("/manager-dashboard") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"
                        }`}
                    >
                        <Home className={`w-5 h-5 transition-all duration-300 ${
                            isActive("/manager-dashboard") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"
                        }`} />
                    </div>
                    <div className="flex-1 relative z-10">
                        <span className="font-semibold">Về trang chủ</span>
                    </div>
                    {isActive("/manager-dashboard") && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                    )}
                </Link>
                <Link
                    to="/promotions"
                    className={`group flex items-center gap-4 p-4 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                        isActive("/promotions")
                            ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]"
                            : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"
                    }`}
                >
                    {isActive("/promotions") && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                    )}
                    <div
                        className={`p-2.5 rounded-xl transition-all duration-300 ${
                            isActive("/promotions") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"
                        }`}
                    >
                        <Gift className={`w-5 h-5 transition-all duration-300 ${
                            isActive("/promotions") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"
                        }`} />
                    </div>
                    <div className="flex-1 relative z-10">
                        <span className="font-semibold">Danh sách khuyến mãi</span>
                    </div>
                    {isActive("/promotions") && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                    )}
                </Link>
                <Link
                    to="/stats"
                    className={`group flex items-center gap-4 p-4 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                        isActive("/stats")
                            ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]"
                            : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"
                    }`}
                >
                    {isActive("/stats") && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                    )}
                    <div
                        className={`p-2.5 rounded-xl transition-all duration-300 ${
                            isActive("/stats") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"
                        }`}
                    >
                        <TrendingUp className={`w-5 h-5 transition-all duration-300 ${
                            isActive("/stats") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"
                        }`} />
                    </div>
                    <div className="flex-1 relative z-10">
                        <span className="font-semibold">Thống kê</span>
                    </div>
                    {isActive("/stats") && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                    )}
                </Link>
                <button
                    onClick={onLogout}
                    className="group flex items-center gap-4 p-4 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"
                >
                    <div className="p-2.5 rounded-xl transition-all duration-300 group-hover:bg-blue-700/50">
                        <LogOut className="w-5 h-5 text-blue-300 group-hover:text-blue-100" />
                    </div>
                    <div className="flex-1 relative z-10">
                        <span className="font-semibold">Đăng Xuất</span>
                    </div>
                </button>
            </nav>
            <div className="absolute bottom-8 left-6 right-6">
                <div className="relative">
                    <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                    <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent blur-sm"></div>
                </div>
            </div>
        </aside>
    )
}

const PromotionManager = () => {
    const [promotions, setPromotions] = useState([])
    const [allPromotions, setAllPromotions] = useState([])
    const [loading, setLoading] = useState(false)
    const [keyword, setKeyword] = useState("")
    const [status, setStatus] = useState("")
    const [dialog, setDialog] = useState({ open: false, type: "", promo: null, data: null })
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newPromotion, setNewPromotion] = useState({
        name: "",
        startDate: "",
        endDate: "",
        description: "",
        status: "Hoạt động",
        discountType: "Phần trăm",
        discountValue: ""
    })
    const [filtered, setFiltered] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [searchError, setSearchError] = useState("")
    const [discountValueError, setDiscountValueError] = useState("")
    const itemsPerPage = 7

    useEffect(() => {
        fetchAllPromotions()
    }, [])

    const handleLogout = () => {
        Cookies.remove("authToken")
        window.location.replace("/login")
    }

    const fetchAllPromotions = async () => {
        setLoading(true)
        try {
            console.log("Auth Token:", Cookies.get("authToken"))
            const response = await axios.get("/api/promotions")
            const data = Array.isArray(response.data) ? response.data : (response.data.content || [])
            const transformedData = data.map(promo => ({
                ...promo,
                status: statusMapToFrontend[promo.status] || promo.status,
                discountType: discountTypeMapToFrontend[promo.discountType] || promo.discountType
            }))
            // Sắp xếp theo tên (ABC)
            transformedData.sort((a, b) => a.name.localeCompare(b.name))
            console.log("Dữ liệu toàn bộ từ API (sau sắp xếp):", transformedData)
            setPromotions(transformedData)
            setAllPromotions(transformedData)
        } catch (error) {
            console.error("Lỗi tải dữ liệu toàn bộ:", error.response ? error.response.data : error.message)
            alert("❌ Không thể tải danh sách khuyến mãi. Vui lòng kiểm tra kết nối hoặc backend.")
            setPromotions([])
            setAllPromotions([])
        } finally {
            setLoading(false)
        }
    }

    const fetchPromotions = async () => {
        if (keyword && !validateSearchKeyword(keyword)) {
            setSearchError("Tên tìm kiếm không được vượt quá 100 ký tự!")
            return
        }
        setSearchError("")
        setLoading(true)
        try {
            console.log("Gửi request với params:", { keyword, status })
            console.log("Auth Token:", Cookies.get("authToken"))
            const response = await axios.get("/api/promotions", {
                params: {
                    keyword: keyword.trim() || undefined,
                    status: statusMapToBackend[status] || status.trim() || undefined
                }
            })
            let data = Array.isArray(response.data) ? response.data : (response.data.content || [])
            data = data.map(promo => ({
                ...promo,
                status: statusMapToFrontend[promo.status] || promo.status,
                discountType: discountTypeMapToFrontend[promo.discountType] || promo.discountType
            }))
            // Sắp xếp theo tên (ABC)
            data.sort((a, b) => a.name.localeCompare(b.name))
            console.log("Dữ liệu từ server sau khi lọc (sau sắp xếp):", data)
            if (data.length === 0 && (keyword.trim() || status.trim())) {
                console.log("Không có kết quả từ server, áp dụng lọc client-side")
                data = allPromotions.filter(promo =>
                    (!keyword.trim() || promo.name.toLowerCase().includes(keyword.trim().toLowerCase())) &&
                    (!status.trim() || promo.status === status)
                )
                // Sắp xếp client-side
                data.sort((a, b) => a.name.localeCompare(b.name))
            }
            console.log("Dữ liệu sau khi lọc (server hoặc client, sau sắp xếp):", data)
            setPromotions(data)
            setFiltered(!!keyword.trim() || !!status.trim())
        } catch (error) {
            console.error("Lỗi tải dữ liệu khi lọc:", error.response ? error.response.data : error.message)
            alert(`❌ Lỗi khi lọc danh sách: ${error.response?.data?.message || error.message}. Sử dụng lọc client-side thay thế.`)
            const filteredData = allPromotions.filter(promo =>
                (!keyword.trim() || promo.name.toLowerCase().includes(keyword.trim().toLowerCase())) &&
                (!status.trim() || promo.status === status)
            )
            // Sắp xếp client-side
            filteredData.sort((a, b) => a.name.localeCompare(b.name))
            console.log("Dữ liệu lọc client-side (sau sắp xếp):", filteredData)
            setPromotions(filteredData)
            setFiltered(!!keyword.trim() || !!status.trim())
        } finally {
            setLoading(false)
        }
    }

    const resetFilter = async () => {
        setLoading(true)
        setKeyword("")
        setStatus("")
        setSearchError("")
        setFiltered(false)
        setCurrentPage(1)
        await fetchAllPromotions()
        setLoading(false)
    }

    const openConfirm = (promo, type, data = null) => {
        setDialog({ open: true, type, promo, data })
    }

    const handleConfirmed = async () => {
        const { promo, type, data } = dialog
        if (!promo) return
        try {
            console.log("Auth Token:", Cookies.get("authToken"))
            let response
            if (type === "update") {
                if (!validateDiscountValue(data.discountValue, data.discountType)) {
                    alert(data.discountType === "Phần trăm"
                        ? "Giá trị giảm giá phải từ 0 đến 100 cho loại phần trăm!"
                        : "Giá trị giảm giá phải lớn hơn hoặc bằng 0!")
                    return
                }
                const payload = {
                    id: data.id,
                    name: data.name,
                    description: data.description,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    status: statusMapToBackend[data.status] || data.status,
                    discountType: discountTypeMapToBackend[data.discountType] || data.discountType,
                    discountValue: parseFloat(data.discountValue)
                }
                console.log("Payload for /api/promotions/update:", payload)
                response = await axios.post("/api/promotions/update", payload)
            } else if (type === "cancel") {
                const payload = { id: promo }
                console.log("Payload for /api/promotions/cancel:", payload)
                response = await axios.post("/api/promotions/cancel", payload)
            } else if (type === "update-description") {
                const payload = {
                    id: data.id,
                    description: data.description
                }
                console.log("Payload for /api/promotions/update-description:", payload)
                response = await axios.post("/api/promotions/update-description", payload)
            }
            await fetchAllPromotions()
            alert("✅ Thao tác thành công")
        } catch (error) {
            console.error("Lỗi cập nhật:", error.response?.data || error.message)
            alert(`❌ Thao tác thất bại: ${error.response?.data?.message || error.message}`)
        } finally {
            setDialog({ open: false, type: "", promo: null, data: null })
        }
    }

    const handleAddPromotion = async () => {
        if (!newPromotion.name || !newPromotion.startDate || !newPromotion.endDate || !newPromotion.status || !newPromotion.discountType || !newPromotion.discountValue) {
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
            if (!validateDiscountValue(newPromotion.discountValue, newPromotion.discountType)) {
                alert(newPromotion.discountType === "Phần trăm"
                    ? "Giá trị giảm giá phải từ 0 đến 100 cho loại phần trăm!"
                    : "Giá trị giảm giá phải lớn hơn hoặc bằng 0!")
                return
            }
            if (newPromotion.name.length > 100) {
                alert("Tên khuyến mãi không được vượt quá 100 ký tự!")
                return
            }
            if (newPromotion.description.length > 200) {
                alert("Mô tả không được vượt quá 200 ký tự!")
                return
            }
            const payload = {
                name: newPromotion.name,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                description: newPromotion.description,
                status: statusMapToBackend[newPromotion.status] || newPromotion.status,
                discountType: discountTypeMapToBackend[newPromotion.discountType] || newPromotion.discountType,
                discountValue: parseFloat(newPromotion.discountValue)
            }
            console.log("Payload for /api/promotions/add:", payload)
            console.log("Auth Token:", Cookies.get("authToken"))
            const response = await axios.post("/api/promotions/add", payload)
            await fetchAllPromotions()
            setIsAddModalOpen(false)
            setNewPromotion({
                name: "",
                startDate: "",
                endDate: "",
                description: "",
                status: "Hoạt động",
                discountType: "Phần trăm",
                discountValue: ""
            })
            setDiscountValueError("")
            alert("✅ Thêm khuyến mãi thành công")
        } catch (error) {
            console.error("Lỗi thêm khuyến mãi:", error.response?.data || error.message)
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
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <div className="flex flex-1">
                <LeftMenu onLogout={handleLogout} />
                <div className="flex-1 pl-[14px] pt-6 pr-4 min-w-0 flex flex-col gap-10">
                    <main>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-8">
                            Quản Lý Khuyến Mãi
                        </h1>
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-200 mb-8">
                            <div className="flex flex-col sm:flex-row gap-3 items-center">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên khuyến mãi..."
                                        value={keyword}
                                        onChange={(e) => {
                                            setKeyword(e.target.value)
                                            if (e.target.value && !validateSearchKeyword(e.target.value)) {
                                                setSearchError("Tên tìm kiếm không được vượt quá 100 ký tự!")
                                            } else {
                                                setSearchError("")
                                            }
                                        }}
                                        className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 text-gray-800 shadow-sm placeholder-gray-400 ${
                                            searchError ? "border-red-500" : ""
                                        }`}
                                    />
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5 hover:text-blue-600 transition-colors duration-200" />
                                    {searchError && (
                                        <p className="text-red-500 text-xs mt-1">{searchError}</p>
                                    )}
                                </div>
                                <div className="w-full sm:w-48">
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 text-gray-800 shadow-sm"
                                    >
                                        <option value="">Tất cả trạng thái</option>
                                        <option value="Hoạt động">Hoạt động</option>
                                        <option value="Hết hạn">Hết hạn</option>
                                        <option value="Đang chờ">Đang chờ</option>
                                        <option value="Đã hủy">Đã hủy</option>
                                        <option value="Sắp bắt đầu">Sắp bắt đầu</option>
                                    </select>
                                </div>
                                <button
                                    onClick={fetchPromotions}
                                    disabled={searchError}
                                    className={`px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 ${
                                        searchError ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                    title="Tìm kiếm khuyến mãi"
                                >
                                    <Search className="w-4 h-4" /> Tìm
                                </button>
                                {filtered && (
                                    <>
                                        <button
                                            onClick={resetFilter}
                                            className="px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 focus:ring-2 focus:ring-gray-400 transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2"
                                            title="Hủy bộ lọc"
                                        >
                                            <X className="w-4 h-4" /> Hủy bộ lọc
                                        </button>
                                        <button
                                            onClick={resetFilter}
                                            className="px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 focus:ring-2 focus:ring-gray-400 transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2"
                                            title="Quay lại danh sách đầy đủ"
                                        >
                                            <ArrowLeft className="w-4 h-4" /> Quay lại
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-400 transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2"
                                    title="Thêm khuyến mãi mới"
                                >
                                    <Plus className="w-4 h-4" /> Thêm
                                </button>
                            </div>
                        </div>
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-blue-600"></div>
                            </div>
                        ) : promotions.length === 0 ? (
                            <div className="mb-6 p-4 bg-red-100/80 backdrop-blur-sm text-red-700 rounded-2xl shadow-md border-2 border-red-200">
                                Không có khuyến mãi nào để hiển thị. Vui lòng thêm khuyến mãi hoặc kiểm tra bộ lọc.
                            </div>
                        ) : (
                            <div className="space-y-6 overflow-hidden">
                                <div
                                    className="grid grid-cols-7 gap-4 p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm rounded-t-xl shadow-md"
                                    style={{ gridTemplateColumns: "1fr 2fr 1.5fr 1fr 1fr 1fr 1.2fr" }}
                                >
                                    <span className="pl-4 text-center">Tên</span>
                                    <span className="text-center">Mô tả</span>
                                    <span className="text-center">Ngày Tháng</span>
                                    <span className="text-center">Trạng thái</span>
                                    <span className="text-center">Loại giảm giá</span>
                                    <span className="text-center">Giá trị giảm giá</span>
                                    <span className="pr-4 text-center">Hành Động</span>
                                </div>
                                <div className="space-y-2">
                                    {currentPromotions.map(promo => (
                                        <div
                                            key={promo.id}
                                            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 min-h-[60px]"
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
                                <div className="flex justify-center gap-3 mt-12 items-center">
                                    <button
                                        onClick={goToPrevious}
                                        disabled={currentPage === 1}
                                        className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Trang trước"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    {getPageNumbers().map(number => (
                                        <button
                                            key={number}
                                            onClick={() => paginate(number)}
                                            className={`px-4 py-2 rounded-full ${currentPage === number ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-all duration-300`}
                                            title={`Trang ${number}`}
                                        >
                                            {number}
                                        </button>
                                    ))}
                                    <button
                                        onClick={goToNext}
                                        disabled={currentPage === totalPages}
                                        className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Trang sau"
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
            <Footer />
            <ConfirmDialog
                open={dialog.open}
                onClose={() => setDialog({ open: false, type: "", promo: null, data: null })}
                onConfirm={handleConfirmed}
                title={
                    dialog.type === "cancel"
                        ? "Xác nhận hủy khuyến mãi"
                        : "Xác nhận cập nhật khuyến mãi"
                }
                message={
                    dialog.type === "cancel"
                        ? "Bạn có chắc chắn muốn hủy khuyến mãi này không?"
                        : "Bạn có chắc chắn muốn cập nhật khuyến mãi này không?"
                }
                confirmLabel={dialog.type === "cancel" ? "Xác nhận" : undefined}
                confirmColor="from-blue-600 to-blue-700"
            />
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white/80 p-6 rounded-2xl shadow-xl border-2 border-blue-100 backdrop-blur-sm w-96">
                        <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-4">Thêm Khuyến Mãi Mới</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-700">Tên</label>
                                <input
                                    type="text"
                                    value={newPromotion.name}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 100) {
                                            setNewPromotion({ ...newPromotion, name: e.target.value })
                                        } else {
                                            alert("Tên khuyến mãi không được vượt quá 100 ký tự!")
                                        }
                                    }}
                                    className="mt-1 px-5 py-3 bg-white/80 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 text-gray-800 shadow-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-blue-700">Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        value={newPromotion.startDate}
                                        onChange={(e) => setNewPromotion({ ...newPromotion, startDate: e.target.value })}
                                        className="mt-1 px-5 py-3 bg-white/80 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 text-gray-800 shadow-sm"
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-blue-700">Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        value={newPromotion.endDate}
                                        onChange={(e) => setNewPromotion({ ...newPromotion, endDate: e.target.value })}
                                        className="mt-1 px-5 py-3 bg-white/80 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 text-gray-800 shadow-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-700">Mô tả</label>
                                <input
                                    type="text"
                                    value={newPromotion.description}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 200) {
                                            setNewPromotion({ ...newPromotion, description: e.target.value })
                                        } else {
                                            alert("Mô tả không được vượt quá 200 ký tự!")
                                        }
                                    }}
                                    className="mt-1 px-5 py-3 bg-white/80 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 text-gray-800 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-700">Trạng thái</label>
                                <select
                                    value={newPromotion.status}
                                    onChange={(e) => setNewPromotion({ ...newPromotion, status: e.target.value })}
                                    className="mt-1 px-5 py-3 bg-white/80 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 text-gray-800 shadow-sm"
                                >
                                    <option value="Hoạt động">Hoạt động</option>
                                    <option value="Hết hạn">Hết hạn</option>
                                    <option value="Đang chờ">Đang chờ</option>
                                    <option value="Đã hủy">Đã hủy</option>
                                    <option value="Sắp bắt đầu">Sắp bắt đầu</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-700">Loại giảm giá</label>
                                <select
                                    value={newPromotion.discountType}
                                    onChange={(e) => {
                                        setNewPromotion({ ...newPromotion, discountType: e.target.value, discountValue: "" })
                                        setDiscountValueError("")
                                    }}
                                    className="mt-1 px-5 py-3 bg-white/80 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 text-gray-800 shadow-sm"
                                >
                                    <option value="">Chọn loại</option>
                                    <option value="Phần trăm">Phần trăm</option>
                                    <option value="Số tiền cố định">Số tiền cố định</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-700">Giá trị giảm giá</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={newPromotion.discountValue}
                                        onChange={(e) => {
                                            const value = e.target.value
                                            setNewPromotion({ ...newPromotion, discountValue: value })
                                            if (value && !validateDiscountValue(value, newPromotion.discountType)) {
                                                setDiscountValueError(
                                                    newPromotion.discountType === "Phần trăm"
                                                        ? "Giá trị giảm giá phải từ 0 đến 100!"
                                                        : "Giá trị giảm giá phải lớn hơn hoặc bằng 0!"
                                                )
                                            } else {
                                                setDiscountValueError("")
                                            }
                                        }}
                                        className={`mt-1 px-5 py-3 bg-white/80 border-2 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 text-gray-800 shadow-sm pr-12 ${
                                            discountValueError ? "border-red-500" : "border-blue-200"
                                        }`}
                                        min="0"
                                        step={newPromotion.discountType === "Phần trăm" ? "0.1" : "1000"}
                                        placeholder={newPromotion.discountType === "Phần trăm" ? "Ví dụ: 10" : "Ví dụ: 50000"}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                        {newPromotion.discountType === "Phần trăm" ? "%" : "VND"}
                                    </span>
                                </div>
                                {discountValueError && (
                                    <p className="text-red-500 text-xs mt-1">{discountValueError}</p>
                                )}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false)
                                    setDiscountValueError("")
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                Thoát
                            </button>
                            <button
                                onClick={handleAddPromotion}
                                disabled={discountValueError}
                                className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-md hover:shadow-lg ${
                                    discountValueError ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                Thêm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PromotionManager