"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { LoadingSpinner, ErrorMessage } from "../../Components/HungStorage/LoadingError";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, List, Plus, Search, Eye, Edit, ArrowLeft } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import PaymentSidebar from "./PaymentSidebar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { format, subDays, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import SidebarPayment from "./PaymentSidebar";
import Header from '../../Components/FormLogin_yen/Header.jsx';
import Footer from '../../Components/FormLogin_yen/Footer.jsx';
import SidebarStorageApproval from '../StorageApproval/SidebarStorageApproval';

const API_BASE = "/api/payments";

const StatsCards = React.memo(({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {[
      { label: "Tổng số thanh toán", value: stats.total, color: "blue" },
      { label: "Đã thanh toán", value: stats.paid, color: "green" },
      { label: "Chờ xử lý", value: stats.pending, color: "yellow" },
      { label: "Thất bại", value: stats.failed, color: "red" },
    ].map((item, idx) => (
      <motion.div
        key={idx}
        whileHover={{ scale: 1.05 }}
        className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 ${
          item.color === "blue"
            ? "border-blue-500"
            : item.color === "green"
            ? "border-green-500"
            : item.color === "red"
            ? "border-red-500"
            : "border-yellow-500"
        }`}
      >
        <p className="text-sm font-medium text-gray-600 mb-2">{item.label}</p>
        <p
          className={`text-3xl font-bold ${
            item.color === "blue"
              ? "text-blue-600"
              : item.color === "green"
              ? "text-green-600"
              : item.color === "red"
              ? "text-red-600"
              : "text-yellow-600"
          }`}
        >
          {item.value}
        </p>
      </motion.div>
    ))}
  </div>
));

const FilterBar = React.memo(({ filters, onFiltersChange, onClearFilters, resultCount, loading }) => {
  const handleFilterChange = (name, value) => {
    onFiltersChange({ ...filters, [name]: value });
  };
  const hasActiveFilters = Object.values(filters).some((value) => value !== "" && value !== null);
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã booking..."
              value={filters.bookingCode || ""}
              onChange={(e) => handleFilterChange("bookingCode", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t text-sm text-gray-600">
        <span>
          Tìm thấy <strong>{resultCount}</strong> kết quả
          {hasActiveFilters && " với bộ lọc hiện tại"}
        </span>
        {loading && (
          <span className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Đang tải...
          </span>
        )}
      </div>
    </div>
  );
});

const PaymentTable = React.memo(
  ({
    payments,
    loading,
    error,
    onRetry,
    onView,
    showPagination = false,
    paginationProps,
    showFilters = false,
    filterProps,
    showSearchBar = false,
    searchProps,
  }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      {showFilters && filterProps && <FilterBar {...filterProps} />}
      {showSearchBar && searchProps && <FilterBar {...searchProps} />}
      {error ? (
        <ErrorMessage error={error} onRetry={onRetry} />
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {/* <th className="border p-3 text-left text-gray-700 font-semibold">ID</th> */}
                  <th className="border p-3 text-left text-gray-700 font-semibold">Mã Booking</th>
                  {/* <th className="border p-3 text-left text-gray-700 font-semibold">Tên khách hàng</th> */}
                  {/* <th className="border p-3 text-left text-gray-700 font-semibold">Loại người trả</th> */}
                  <th className="border p-3 text-left text-gray-700 font-semibold">Số tiền</th>
                  <th className="border p-3 text-left text-gray-700 font-semibold">Ngày thanh toán</th>
                  {/* <th className="border p-3 text-left text-gray-700 font-semibold">Trạng thái</th> */}
                  <th className="border p-3 text-left text-gray-700 font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border p-8 text-center text-gray-500">
                      {loading ? "Đang tải..." : "Không tìm thấy kết quả phù hợp"}
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.paymentId} className="hover:bg-gray-100 cursor-pointer">
                      {/* <td className="border p-3 font-medium">{p.paymentId}</td> */}
                      <td className="border p-3">{p.bookingCode || "N/A"}</td>
                      {/* <td className="border p-3">{p.customerName || "N/A"}</td> */}
                      {/* <td className="border p-3">{p.payerType || "N/A"}</td> */}
                      <td className="border p-3">{p.amount?.toLocaleString() || "0"}</td>
                      <td className="border p-3">{p.paidDate || "N/A"}</td>
                      {/* <td className="border p-3">{p.status || "N/A"}</td> */}
                      <td className="border p-3">
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => onView(p)}
                        >
                          <Eye size={18} className="inline mr-1" /> Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {showPagination && paginationProps && (
            <Pagination {...paginationProps} />
          )}
        </>
      )}
    </div>
  )
);

const PaymentDetail = React.memo(({ payment, onBack }) => (
  <div className="p-4 max-w-md mx-auto mt-8 bg-white rounded shadow-md">
    <button
      onClick={onBack}
      className="mb-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
    >
      <ArrowLeft size={18} className="inline mr-1" /> Quay lại danh sách
    </button>
    {!payment ? (
      <p>Không có dữ liệu để hiển thị</p>
    ) : (
      <>
        <h2 className="text-xl font-bold mb-4">Chi tiết biên nhận #{payment.paymentId}</h2>
        <p><strong>Mã booking:</strong> {payment.bookingCode || "N/A"}</p>
        <p><strong>Số tiền:</strong> {payment.amount?.toLocaleString() || "0"}</p>
        <p><strong>Ngày thanh toán:</strong> {payment.paidDate || "N/A"}</p>
        <p><strong>Ghi chú:</strong> {payment.note || "Không có ghi chú"}</p>
      </>
    )}
  </div>
));

// DailyPaymentChart component
const DailyPaymentChart = React.memo(({ payments }) => {
  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return format(date, "yyyy-MM-dd");
    });
    const dailyCounts = last30Days.map((date) => {
      const count = payments.filter((p) => {
        if (!p.paidDate) return false;
        // paidDate có thể là yyyy-MM-dd hoặc yyyy-MM-ddTHH:mm:ss
        const paidDate = p.paidDate.slice(0, 10);
        return paidDate === date;
      }).length;
      return count;
    });
    return {
      labels: last30Days.map((date) => format(parseISO(date), "dd/MM", { locale: vi })),
      datasets: [
        {
          label: "Số thanh toán được tạo",
          data: dailyCounts,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [payments]);
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Số lượng thanh toán được tạo mỗi ngày (30 ngày gần nhất)",
        font: { size: 16, weight: "bold" },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mt-8">
      <div style={{ height: "400px" }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
});

export default function PaymentManagement() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("overview");
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filters, setFilters] = useState({
    bookingCode: "",
    amount: "",
    paidDate: "",
    note: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 5, // default 5 per page
    totalItems: 0,
    totalPages: 0,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Stats (optional: can fetch from backend if available)
  const stats = useMemo(() => {
    const total = pagination.totalItems;
    const paid = payments.filter((p) => p.status === "PAID").length;
    const pending = payments.filter((p) => p.status === "PENDING").length;
    const failed = payments.filter((p) => p.status === "FAILED").length;
    return { total, paid, pending, failed };
  }, [payments, pagination.totalItems]);

  // Fetch payments from backend with pagination and filters
  const fetchPayments = useCallback(async (page = 1, size = pagination.itemsPerPage) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", page - 1); // Spring pageable is 0-based
      params.append("size", size);
      // Chỉ truyền page và size cho API /api/payments/list
      const response = await axiosInstance.get(`/api/payments/list?${params.toString()}`);
      const data = response.data;
      setPayments(data.content || []);
      setPagination({
        currentPage: data.number + 1,
        itemsPerPage: data.size,
        totalItems: data.totalElements,
        totalPages: data.totalPages,
      });
    } catch (err) {
      setError("Lỗi khi tải dữ liệu thanh toán.");
      toast.error("Lỗi tải dữ liệu thanh toán.");
    } finally {
      setLoading(false);
    }
  }, [pagination.itemsPerPage]);

  useEffect(() => {
    if (currentPage === "list" || currentPage === "overview") {
      fetchPayments(pagination.currentPage, pagination.itemsPerPage);
    }
    // eslint-disable-next-line
  }, [currentPage, fetchPayments]);

  // Pagination handlers
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    fetchPayments(page, pagination.itemsPerPage);
  };
  const handleItemsPerPageChange = (itemsPerPage) => {
    setPagination((prev) => ({ ...prev, itemsPerPage, currentPage: 1 }));
    fetchPayments(1, itemsPerPage);
  };

  // Filter/search handlers
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchPayments(1, pagination.itemsPerPage);
  };
  const handleClearFilters = () => {
    setFilters({ bookingCode: "", amount: "", paidDate: "", note: "" });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchPayments(1, pagination.itemsPerPage);
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    // Debounce or fetch immediately
    fetchPayments(1, pagination.itemsPerPage);
  };
  const clearSearch = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchPayments(1, pagination.itemsPerPage);
  };

  // Handle view detail
  const handleViewDetail = (payment) => {
    setSelectedPayment(payment);
    setCurrentPage("detail");
  };

  // Advanced FilterBar (unchanged, but triggers fetch on change)
  const PaymentFilterBar = React.memo(({ filters, onFiltersChange, onClearFilters, resultCount, loading }) => {
    const hasActiveFilters = Object.values(filters).some((value) => value !== "" && value !== null);
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã booking</label>
            <input
              type="text"
              placeholder="Nhập mã booking..."
              value={filters.bookingCode || ""}
              onChange={(e) => onFiltersChange({ ...filters, bookingCode: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
            <input
              type="number"
              placeholder="Nhập số tiền..."
              value={filters.amount || ""}
              onChange={(e) => onFiltersChange({ ...filters, amount: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thanh toán</label>
            <input
              type="date"
              value={filters.paidDate || ""}
              onChange={(e) => onFiltersChange({ ...filters, paidDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <input
              type="text"
              placeholder="Nhập ghi chú..."
              value={filters.note || ""}
              onChange={(e) => onFiltersChange({ ...filters, note: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t text-sm text-gray-600">
          <span>
            Tìm thấy <strong>{resultCount}</strong> kết quả
            {hasActiveFilters && " với bộ lọc hiện tại"}
          </span>
          {loading && (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Đang tải...
            </span>
          )}
          <button
            onClick={onClearFilters}
            className="px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>
    );
  });

  // SearchBar
  const PaymentSearchBar = React.memo(({ value, onChange, onClear, resultCount }) => (
    <div className="mb-6">
      <div className="flex items-center mb-4 relative">
        <Search className="absolute left-3 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm nhanh theo mã booking..."
          className="w-full pl-10 pr-12 py-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          value={value}
          onChange={onChange}
          autoComplete="off"
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute right-3 p-1 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-200"
            title="Xóa tìm kiếm"
            type="button"
          >
            ×
          </button>
        )}
      </div>
      <div className="text-sm text-gray-600">Tìm thấy {resultCount} kết quả{value && ` cho "${value}"`}</div>
    </div>
  ));

  // PaymentTable with backend pagination
  const PaymentTable = React.memo(({ payments, loading, error, onRetry, onView }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      {error ? (
        <ErrorMessage error={error} onRetry={onRetry} />
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
{/*                   <th className="border p-3 text-left text-gray-700 font-semibold">ID</th> */}
                  <th className="border p-3 text-left text-gray-700 font-semibold">Mã Booking</th>
{/*                   <th className="border p-3 text-left text-gray-700 font-semibold">Tên khách hàng</th> */}
{/*                   <th className="border p-3 text-left text-gray-700 font-semibold">Loại người trả</th> */}
                  <th className="border p-3 text-left text-gray-700 font-semibold">Số tiền</th>
                  <th className="border p-3 text-left text-gray-700 font-semibold">Ngày thanh toán</th>
{/*                   <th className="border p-3 text-left text-gray-700 font-semibold">Trạng thái</th> */}
                  <th className="border p-3 text-left text-gray-700 font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="border p-8 text-center text-gray-500">
                      {loading ? "Đang tải..." : "Không tìm thấy kết quả phù hợp"}
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.paymentId} className="hover:bg-gray-100 cursor-pointer">
{/*                       <td className="border p-3 font-medium">{p.paymentId}</td> */}
                      <td className="border p-3">{p.bookingCode || "N/A"}</td>
{/*                       <td className="border p-3">{p.customerName || "N/A"}</td> */}
{/*                       <td className="border p-3">{p.payerType || "N/A"}</td> */}
                      <td className="border p-3">{p.amount?.toLocaleString() || "0"}</td>
                      <td className="border p-3">{p.paidDate || "N/A"}</td>
{/*                       <td className="border p-3">{p.status || "N/A"}</td> */}
                      <td className="border p-3">
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => onView(p)}
                        >
                          <Eye size={18} className="inline mr-1" /> Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        
        </>
      )}
    </div>
  ));

  // Page content
  const Overview = (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
        <BarChart className="mr-2" /> Tổng Quan Thanh Toán
      </h2>
      <StatsCards stats={stats} />
      <DailyPaymentChart payments={payments} />
    </motion.div>
  );

  const PaymentList = useMemo(() => {
    const paginationProps = {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      itemsPerPage: pagination.itemsPerPage,
      onPageChange: handlePageChange,
      onItemsPerPageChange: handleItemsPerPageChange,
    };
    const filterProps = {
      filters,
      onFiltersChange: handleFiltersChange,
      onClearFilters: handleClearFilters,
      resultCount: pagination.totalItems,
      loading,
      showAdvanced,
      setShowAdvanced,
    };
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
          <List className="mr-2" /> Danh Sách Biên Nhận
        </h2>
        <PaymentSearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          onClear={clearSearch}
          resultCount={pagination.totalItems}
        />
        <PaymentFilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          resultCount={pagination.totalItems}
          loading={loading}
        />
        <PaymentTable
          payments={payments}
          loading={loading}
          error={error}
          onRetry={() => fetchPayments(pagination.currentPage, pagination.itemsPerPage)}
          onView={handleViewDetail}
          showPagination={true}
          paginationProps={paginationProps}
          showFilters={true}
          filterProps={filterProps}
        />
      </motion.div>
    );
  }, [payments, loading, error, filters, searchTerm, pagination, fetchPayments]);

  const Detail = (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <PaymentDetail payment={selectedPayment} onBack={() => setCurrentPage("list")} />
    </motion.div>
  );

  // Handler cho sidebar home button
  const handleBackToHome = () => {
    navigate("/manager-dashboard");
  };
  // Handler cho sidebar logout button
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <SidebarPayment
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onBackToHome={handleBackToHome}
          onLogout={handleLogout}
        />
        <main className="flex-1 ml-64 pt-20 pb-16 px-6">
          <button
            className="mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-semibold shadow"
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </button>
          <AnimatePresence mode="wait">
            {currentPage === "overview" && <>{Overview}</>}
            {currentPage === "list" && <>{PaymentList}</>}
            {currentPage === "detail" && <>{Detail}</>}
          </AnimatePresence>
        </main>
      </div>
      <Footer />
    </div>
  );
}