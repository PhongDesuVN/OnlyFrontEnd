import React from "react";

export default function ReceiptDetailModal({ open, onClose, receipt }) {
  if (!open || !receipt) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">Chi tiết biên lai</h2>
        <div className="space-y-2 text-gray-700">
          <p><b>Mã biên lai:</b> {receipt.id}</p>
          <p><b>Khách hàng:</b> {receipt.customerName}</p>
          <p><b>Số tiền:</b> {receipt.amount?.toLocaleString()} VNĐ</p>
          <p><b>Ngày:</b> {receipt.date}</p>
          <p><b>Trạng thái:</b> {receipt.status}</p>
        </div>
      </div>
    </div>
  );
}
