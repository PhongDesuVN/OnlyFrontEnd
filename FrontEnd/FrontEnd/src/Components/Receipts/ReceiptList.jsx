import React from "react";

// Lưu ý: data truyền vào phải là mảng các payment object trả về từ backend (PaymentDTO hoặc Payment entity với các field đúng tên dưới đây)
export default function ReceiptList({ data, loading, page, total, onPageChange, onViewDetail }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <table className="w-full border-collapse mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Mã biên lai</th>
            <th className="p-2 border">Khách hàng</th>
            <th className="p-2 border">Số tiền</th>
            <th className="p-2 border">Ngày</th>
            <th className="p-2 border">Trạng thái</th>
            <th className="p-2 border">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="text-center py-6">Đang tải...</td>
            </tr>
          ) : data && data.length > 0 ? (
            data.map((r, idx) => (
              <tr key={r.paymentId ?? idx}>
                <td className="border p-2">{r.paymentId}</td>
                <td className="border p-2">
                  {r.customerName || r.booking?.customer?.name || "N/A"}
                </td>
                <td className="border p-2">{r.amount?.toLocaleString()} VNĐ</td>
                <td className="border p-2">{r.paidDate ? new Date(r.paidDate).toLocaleDateString("vi-VN") : "N/A"}</td>
                <td className="border p-2">
                  <span className={
                    r.status === "PAID" ? "text-green-600" :
                    r.status === "OVERDUE" ? "text-red-600" : "text-yellow-600"
                  }>
                    {r.status}
                  </span>
                </td>
                <td className="border p-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => onViewDetail(r.paymentId)}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-6">Không có dữ liệu</td>
            </tr>
          )}
        </tbody>

      </table>
      <div className="flex justify-end">
        {total > 10 && (
          <Pagination
            current={page}
            total={total}
            pageSize={10}
            onChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
}
