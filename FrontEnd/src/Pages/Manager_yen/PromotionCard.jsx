import { useState } from "react"
import {
    Gift, Save, Trash2, TrendingUp,
    Clock, AlertCircle, X, Tag, Edit
} from "lucide-react"

const PromotionCard = ({ promo, onUpdate, onCancel, onUpdateDescription }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false)
    const [editedPromo, setEditedPromo] = useState({
        id: promo.id,
        name: promo.name || "",
        description: promo.description || "",
        startDate: new Date(promo.startDate).toISOString().split("T")[0],
        endDate: new Date(promo.endDate).toISOString().split("T")[0]
    })

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "active": return "bg-green-100 text-green-700"
            case "expired": return "bg-red-100 text-red-700"
            case "pending": return "bg-yellow-100 text-yellow-700"
            case "cancelled": return "bg-gray-200 text-gray-600"
            case "sắp bắt đầu": return "bg-blue-100 text-blue-700"
            default: return "bg-blue-100 text-blue-700"
        }
    }

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case "active": return <TrendingUp className="w-4 h-4" />
            case "expired": return <Clock className="w-4 h-4" />
            case "pending": return <AlertCircle className="w-4 h-4" />
            case "cancelled": return <X className="w-4 h-4" />
            case "sắp bắt đầu": return <Tag className="w-4 h-4" />
            default: return <Tag className="w-4 h-4" />
        }
    }

    return (
        <div className="p-2 border rounded-lg bg-white flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 w-1/5">
                <div className="p-1 bg-gradient-to-br from-rose-500 to-indigo-500 text-white rounded">
                    <Gift className="w-5 h-5" />
                </div>
                <span className="truncate">{promo.name || "Chưa có tên"}</span>
            </div>
            <div className="w-1/5">
                <span>{new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}</span>
            </div>
            <div className="w-1/5">
                <span className="break-words">{promo.description || "Chưa có mô tả"}</span> {/* Loại bỏ truncate, dùng break-words */}
            </div>
            <div className={`w-1/5 flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(promo.status)}`}>
                {getStatusIcon(promo.status)} {promo.status}
            </div>
            <div className="w-1/5 flex items-center gap-2">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    <Edit className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onCancel(promo.id)}
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setIsDescriptionModalOpen(true)}
                    className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                    <Edit className="w-4 h-4" />
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-bold mb-4">Chỉnh sửa khuyến mãi</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tên</label>
                                <input
                                    type="text"
                                    value={editedPromo.name}
                                    onChange={(e) => setEditedPromo({ ...editedPromo, name: e.target.value })}
                                    className="mt-1 p-2 w-full border rounded"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        value={editedPromo.startDate}
                                        onChange={(e) => setEditedPromo({ ...editedPromo, startDate: e.target.value })}
                                        className="mt-1 p-2 w-full border rounded"
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        value={editedPromo.endDate}
                                        onChange={(e) => setEditedPromo({ ...editedPromo, endDate: e.target.value })}
                                        className="mt-1 p-2 w-full border rounded"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                <input
                                    type="text"
                                    value={editedPromo.description}
                                    onChange={(e) => setEditedPromo({ ...editedPromo, description: e.target.value })}
                                    className="mt-1 p-2 w-full border rounded"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => {
                                    if (new Date(editedPromo.startDate) > new Date(editedPromo.endDate)) {
                                        alert("Ngày bắt đầu phải trước ngày kết thúc!")
                                        return
                                    }
                                    onUpdate(editedPromo)
                                    setIsModalOpen(false)
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDescriptionModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-bold mb-4">Cập nhật mô tả</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                <input
                                    type="text"
                                    value={editedPromo.description}
                                    onChange={(e) => setEditedPromo({ ...editedPromo, description: e.target.value })}
                                    className="mt-1 p-2 w-full border rounded"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                onClick={() => setIsDescriptionModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => {
                                    onUpdateDescription({ id: editedPromo.id, description: editedPromo.description })
                                    setIsDescriptionModalOpen(false)
                                }}
                                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PromotionCard