import { createPortal } from "react-dom"
import { AlertTriangle } from "lucide-react"

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, dangerText = "Hành động này không thể hoàn tác!", confirmLabel = "Xác nhận", cancelLabel = "Huỷ", confirmColor = "from-rose-500 to-pink-500" }) {
    if (!open) return null

    return createPortal(
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center animate-fade-in">
                <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full bg-gradient-to-br ${confirmColor}`}>
                        <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                <p className="text-slate-600 mt-2">{message}</p>
                <p className="text-red-600 font-semibold mt-1">{dangerText}</p>
                <div className="mt-6 flex justify-center gap-4">
                    <button onClick={onClose} className="px-5 py-2 bg-gray-200 rounded-xl hover:bg-gray-300">
                        {cancelLabel}
                    </button>
                    <button onClick={onConfirm} className={`px-5 py-2 rounded-xl text-white font-semibold bg-gradient-to-br ${confirmColor} hover:brightness-110`}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}