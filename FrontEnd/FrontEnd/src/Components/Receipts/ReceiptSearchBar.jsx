import React, { useState } from "react";

export default function ReceiptSearchBar({ onSearch, loading }) {
  const [search, setSearch] = useState({
    keyword: "",
    status: "",
    fromDate: "",
    toDate: ""
  });

  const handleChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(search);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 mb-4 bg-white p-4 rounded-xl shadow">
      <input
        type="text"
        name="keyword"
        value={search.keyword}
        onChange={handleChange}
        placeholder="Từ khóa (mã biên lai, tên KH...)"
        className="border px-3 py-2 rounded-lg"
      />
      <select
        name="status"
        value={search.status}
        onChange={handleChange}
        className="border px-3 py-2 rounded-lg"
      >
        <option value="">Tất cả trạng thái</option>
        <option value="PAID">Đã thanh toán</option>
        <option value="PENDING">Chờ xử lý</option>
        <option value="OVERDUE">Quá hạn</option>
      </select>
      <input
        type="date"
        name="fromDate"
        value={search.fromDate}
        onChange={handleChange}
        className="border px-3 py-2 rounded-lg"
      />
      <input
        type="date"
        name="toDate"
        value={search.toDate}
        onChange={handleChange}
        className="border px-3 py-2 rounded-lg"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        disabled={loading}
      >
        Tìm kiếm
      </button>
    </form>
  );
}
