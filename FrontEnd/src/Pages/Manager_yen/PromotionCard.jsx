"use client"

import { useState } from "react"
import { Save, Trash2 } from "lucide-react"

// Hàm validate discountValue dựa trên discountType
const validateDiscountValue = (value, discountType) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return false;
    if (discountType === "Phần trăm" && numValue > 100) return false;
    return true;
}

const PromotionCard = ({ promo, onUpdate, onCancel, onUpdateDescription }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editedPromo, setEditedPromo] = useState({
        id: promo.id,
        name: promo.name || "",
        description: promo.description || "",
        startDate: new Date(promo.startDate).toISOString().split("T")[0] || "",
        endDate: new Date(promo.endDate).toISOString().split("T")[0] || "",
        status: promo.status || "Hoạt động",
        discountType: promo.discountType || "Phần trăm",
        discountValue: promo.discountValue || 0
    })
    const [discountValueError, setDiscountValueError] = useState("")

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "hoạt động": return "bg-green-100 text-green-700"
            case "hết hạn": return "bg-red-100 text-red-700"
            case "đang chờ": return "bg-yellow-100 text-yellow-700"
            case "đã hủy": return "bg-gray-200 text-gray-600"
            case "sắp bắt đầu": return "bg-blue-100 text-blue-700"
            default: return "bg-blue-100 text-blue-700"
        }
    }

    return (
        <>
            <div
                className="grid grid-cols-7 gap-4 p-4 items-center text-sm min-h-[60px] bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                style={{ gridTemplateColumns: "1fr 2fr 1.5fr 1fr 1fr 1fr 1.2fr" }}
            >
                <span className="pl-4 text-center truncate">{promo.name || "Chưa có tên"}</span>
                <span className="text-center truncate">{promo.description || "Chưa có mô tả"}</span>
                <span className="text-center truncate">
                    {promo.startDate && promo.endDate
                        ? `${new Date(promo.startDate).toLocaleDateString()} - ${new Date(promo.endDate).toLocaleDateString()}`
                        : "N/A"}
                </span>
                <span className={`text-center truncate px-2 py-1 rounded-full ${getStatusColor(promo.status)}`}>
                    {promo.status || "Hoạt động"}
                </span>
                <span className="text-center truncate">
                    {promo.discountType || "Phần trăm"}
                </span>
                <span className="text-center truncate">
                    {promo.discountValue ? `${promo.discountValue}${promo.discountType === "Phần trăm" ? "%" : " VNĐ"}` : "N/A"}
                </span>
                <div className="pr-4 text-center flex justify-center gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                        <Save className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onCancel(promo.id)}
                        className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border-2 border-blue-100 w-full max-w-md">
                        <h2 className="text-lg font-bold text-blue-900 mb-4">Chỉnh sửa khuyến mãi</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-700">Tên</label>
                                <input
                                    type="text"
                                    value={editedPromo.name}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 100) {
                                            setEditedPromo({ ...editedPromo, name: e.target.value })
                                        } else {
                                            alert("Tên khuyến mãi không được vượt quá 100 ký tự!")
                                        }
                                    }}
                                    className="mt-1 p-2 w-full border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white/80 shadow-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-blue-700">Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        value={editedPromo.startDate}
                                        onChange={(e) => setEditedPromo({ ...editedPromo, startDate: e.target.value })}
                                        className="mt-1 p-2 w-full border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white/80 shadow-sm"
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-blue-700">Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        value={editedPromo.endDate}
                                        onChange={(e) => setEditedPromo({ ...editedPromo, endDate: e.target.value })}
                                        className="mt-1 p-2 w-full border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white/80 shadow-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-700">Mô tả</label>
                                <input
                                    type="text"
                                    value={editedPromo.description}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 200) {
                                            setEditedPromo({ ...editedPromo, description: e.target.value })
                                            onUpdateDescription({ id: editedPromo.id, description: e.target.value })
                                        } else {
                                            alert("Mô tả không được vượt quá 200 ký tự!")
                                        }
                                    }}
                                    className="mt-1 p-2 w-full border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white/80 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-700">Trạng thái</label>
                                <select
                                    value={editedPromo.status}
                                    onChange={(e) => setEditedPromo({ ...editedPromo, status: e.target.value })}
                                    className="mt-1 p-2 w-full border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white/80 shadow-sm"
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
                                    value={editedPromo.discountType}
                                    onChange={(e) => {
                                        setEditedPromo({ ...editedPromo, discountType: e.target.value, discountValue: "" })
                                        setDiscountValueError("")
                                    }}
                                    className="mt-1 p-2 w-full border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white/80 shadow-sm"
                                >
                                    <option value="Phần trăm">Phần trăm</option>
                                    <option value="Số tiền cố định">Số tiền cố định</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-700">Giá trị giảm giá</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={editedPromo.discountValue}
                                        onChange={(e) => {
                                            const value = e.target.value
                                            setEditedPromo({ ...editedPromo, discountValue: value })
                                            if (value && !validateDiscountValue(value, editedPromo.discountType)) {
                                                setDiscountValueError(
                                                    editedPromo.discountType === "Phần trăm"
                                                        ? "Giá trị giảm giá phải từ 0 đến 100!"
                                                        : "Giá trị giảm giá phải lớn hơn hoặc bằng 0!"
                                                )
                                            } else {
                                                setDiscountValueError("")
                                            }
                                        }}
                                        className={`mt-1 p-2 w-full border-2 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white/80 shadow-sm pr-12 ${
                                            discountValueError ? "border-red-500" : "border-blue-200"
                                        }`}
                                        min="0"
                                        step={editedPromo.discountType === "Phần trăm" ? "0.1" : "1000"}
                                        placeholder={editedPromo.discountType === "Phần trăm" ? "Ví dụ: 10" : "Ví dụ: 50000"}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                        {editedPromo.discountType === "Phần trăm" ? "%" : "VND"}
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
                                    setIsModalOpen(false)
                                    setDiscountValueError("")
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"
                            >
                                Thoát
                            </button>
                            <button
                                onClick={() => {
                                    if (new Date(editedPromo.startDate) > new Date(editedPromo.endDate)) {
                                        alert("Ngày bắt đầu phải trước ngày kết thúc!")
                                        return
                                    }
                                    if (!validateDiscountValue(editedPromo.discountValue, editedPromo.discountType)) {
                                        alert(editedPromo.discountType === "Phần trăm"
                                            ? "Giá trị giảm giá phải từ 0 đến 100 cho loại phần trăm!"
                                            : "Giá trị giảm giá phải lớn hơn hoặc bằng 0!")
                                        return
                                    }
                                    if (editedPromo.name.length > 100) {
                                        alert("Tên khuyến mãi không được vượt quá 100 ký tự!")
                                        return
                                    }
                                    if (editedPromo.description.length > 200) {
                                        alert("Mô tả không được vượt quá 200 ký tự!")
                                        return
                                    }
                                    onUpdate(editedPromo)
                                    setIsModalOpen(false)
                                    setDiscountValueError("")
                                }}
                                className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg ${
                                    discountValueError ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                disabled={discountValueError}
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default PromotionCard