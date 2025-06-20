import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Warehouse, BarChart, List, Search, AlertCircle, Loader, X } from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:8083/api/storage-units";

const Header = React.memo(() => (
  <header className="fixed w-full top-0 bg-white shadow-lg z-10">
    <div className="container mx-auto px-4 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Warehouse className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">Quản Lý Kho Lưu Trữ</h1>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/"
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
          >
            Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  </header>
));

const Sidebar = React.memo(({ currentPage, onPageChange }) => {
  const pageLabels = {
    overview: "Tổng Quan",
    view: "Danh Sách",
    search: "Tìm Kiếm"
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-gradient-to-b from-blue-900 to-purple-600 text-white p-6 h-screen shadow-2xl"
    >
      <h1 className="text-2xl font-extrabold mb-8 flex items-center tracking-tight">
        <Warehouse className="mr-2" /> Quản Lý Kho
      </h1>
      <nav>
        {["overview", "view", "search"].map(page => (
          <motion.button
            key={page}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center w-full text-left py-3 px-4 mb-3 rounded-lg transition-all duration-300 ${
              currentPage === page ? "bg-blue-500 shadow-lg" : "hover:bg-blue-600"
            }`}
            onClick={() => onPageChange(page)}
          >
            {page === "overview" && <BarChart className="mr-2" size={20} />}
            {page === "view" && <List className="mr-2" size={20} />}
            {page === "search" && <Search className="mr-2" size={20} />}
            {pageLabels[page]}
          </motion.button>
        ))}
      </nav>
    </motion.div>
  );
});

const LoadingSpinner = React.memo(() => (
  <div className="flex items-center justify-center py-8">
    <Loader className="animate-spin mr-2" size={20} />
    <span>Đang tải dữ liệu...</span>
  </div>
));

const ErrorMessage = React.memo(({ error, onRetry }) => (
  <div className="flex items-center justify-center py-8 text-red-600">
    <AlertCircle className="mr-2" size={20} />
    <span>{error}</span>
    <button
      onClick={onRetry}
      className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
    >
      Thử lại
    </button>
  </div>
));

const SearchBar = React.memo(({ value, onChange, onClear, resultCount }) => (
  <div className="mb-6">
    <div className="flex items-center mb-4 relative">
      <Search className="absolute left-3 text-gray-500" size={20} />
      <input
        type="text"
        placeholder="Nhập tên kho, địa chỉ, trạng thái, tên quản lý..."
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
          <X size={16} />
        </button>
      )}
    </div>
    <div className="text-sm text-gray-600">
      Tìm thấy {resultCount} kết quả
      {value && ` cho "${value}"`}
    </div>
  </div>
));

const StorageTable = React.memo(({ storages, showSearchBar = false, searchProps, loading, error, onRetry }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
    {showSearchBar && searchProps && (
      <SearchBar {...searchProps} />
    )}

    {error ? (
      <ErrorMessage error={error} onRetry={onRetry} />
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left text-gray-700 font-semibold">Mã Kho</th>
              <th className="border p-3 text-left text-gray-700 font-semibold">Tên Kho</th>
              <th className="border p-3 text-left text-gray-700 font-semibold">Địa Chỉ</th>
              <th className="border p-3 text-left text-gray-700 font-semibold">Quản Lý</th>
              <th className="border p-3 text-left text-gray-700 font-semibold">Số ĐT</th>
              <th className="border p-3 text-left text-gray-700 font-semibold">Trạng Thái</th>
              <th className="border p-3 text-left text-gray-700 font-semibold">Ghi chú</th>
              <th className="border p-3 text-left text-gray-700 font-semibold">Ngày Tạo</th>
            </tr>
          </thead>
          <tbody>
            {storages.length === 0 ? (
              <tr>
                <td colSpan="8" className="border p-8 text-center text-gray-500">
                  {loading ? "Đang tải..." : searchProps?.value ? "Không tìm thấy kết quả phù hợp" : "Không có dữ liệu"}
                </td>
              </tr>
            ) : (
              storages.map(storage => (
                <motion.tr
                  key={storage.storageId}
                  whileHover={{ backgroundColor: "#f3f4f6" }}
                  transition={{ duration: 0.2 }}
                  className="hover:shadow-sm"
                >
                  <td className="border p-3 font-medium">{storage.storageId}</td>
                  <td className="border p-3">{storage.name}</td>
                  <td className="border p-3">{storage.address}</td>
                  <td className="border p-3">{storage.managerName || "N/A"}</td>
                  <td className="border p-3">{storage.phone}</td>
                  <td className="border p-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      storage.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : storage.status === "INACTIVE"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {storage.status}
                    </span>
                  </td>
                  <td className="border p-3">{storage.note}</td>
                  <td className="border p-3">{storage.createdAt ? storage.createdAt.replace("T", " ").slice(0, 19) : "N/A"}</td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )}
  </div>
));

const StatsCards = React.memo(({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {[
      { label: "Tổng số kho", value: stats.total, color: "blue" },
      { label: "Kho đang hoạt động", value: stats.active, color: "green" },
      { label: "Kho ngừng hoạt động", value: stats.inactive, color: "red" },
      { label: "Kho khác", value: stats.other, color: "yellow" }
    ].map((item, idx) => (
      <motion.div
        key={idx}
        whileHover={{ scale: 1.05 }}
        className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 ${
          item.color === 'blue' ? 'border-blue-500' :
          item.color === 'green' ? 'border-green-500' :
          item.color === 'red' ? 'border-red-500' : 'border-yellow-500'
        }`}
      >
        <p className="text-sm font-medium text-gray-600 mb-2">{item.label}</p>
        <p className={`text-3xl font-bold ${
          item.color === 'blue' ? 'text-blue-600' :
          item.color === 'green' ? 'text-green-600' :
          item.color === 'red' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          {item.value}
        </p>
      </motion.div>
    ))}
  </div>
));

const Footer = React.memo(() => (
  <footer className="bg-gray-800 text-white py-8 mt-16">
    <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
      <p>© 2025 Hệ Thống Quản Lý Kho Lưu Trữ. Mọi quyền được bảo lưu.</p>
    </div>
  </footer>
));

export default function StorageUnitManagement() {
  const [storages, setStorages] = useState([]);
  const [currentPage, setCurrentPage] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Lấy token từ cookie hoặc localStorage (chỉ giữ lại 1)
      const getCookie = (name) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
      };
      const token = getCookie('authToken'); // hoặc localStorage.getItem('authToken')
      if (!token) throw new Error('Bạn chưa đăng nhập hoặc token đã hết hạn.');

      // Gửi token vào header
      const response = await axios.get(API_BASE, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setStorages(response.data || []);
    } catch (err) {
      setError("Không thể tải dữ liệu từ API. Vui lòng kiểm tra kết nối và quyền truy cập.");
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const filteredStorages = useMemo(() => {
    if (!searchTerm.trim()) {
      return storages;
    }
    const term = searchTerm.toLowerCase().trim();
    return storages.filter(storage => {
      return (
        (storage.name?.toLowerCase() || "").includes(term) ||
        (storage.address?.toLowerCase() || "").includes(term) ||
        (storage.managerName?.toLowerCase() || "").includes(term) ||
        (storage.status?.toLowerCase() || "").includes(term)
      );
    });
  }, [storages, searchTerm]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);
  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const total = storages.length;
    const active = storages.filter(r => r.status === "ACTIVE").length;
    const inactive = storages.filter(r => r.status === "INACTIVE").length;
    const other = storages.filter(r => r.status !== "ACTIVE" && r.status !== "INACTIVE").length;
    return { total, active, inactive, other };
  }, [storages]);

  const searchProps = useMemo(() => ({
    value: searchTerm,
    onChange: handleSearchChange,
    onClear: clearSearch,
    resultCount: filteredStorages.length
  }), [searchTerm, handleSearchChange, clearSearch, filteredStorages.length]);

  const OverviewStorages = useMemo(() => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
        <BarChart className="mr-2" /> Tổng Quan Kho Lưu Trữ
      </h2>
      <StatsCards stats={stats} />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <StorageTable
          storages={storages.slice(0, 10)}
          loading={loading}
          error={error}
          onRetry={fetchInitialData}
        />
      )}
    </motion.div>
  ), [stats, loading, storages, error, fetchInitialData]);

  const ViewStorages = useMemo(() => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
        <List className="mr-2" /> Danh Sách Kho Lưu Trữ
      </h2>
      <StorageTable
        storages={storages}
        loading={loading}
        error={error}
        onRetry={fetchInitialData}
      />
    </motion.div>
  ), [storages, loading, error, fetchInitialData]);

  const SearchStorages = useMemo(() => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
        <Search className="mr-2" /> Tìm Kiếm Kho Lưu Trữ
      </h2>
      <StorageTable
        storages={filteredStorages}
        showSearchBar={true}
        searchProps={searchProps}
        loading={loading}
        error={error}
        onRetry={fetchInitialData}
      />
    </motion.div>
  ), [filteredStorages, searchProps, loading, error, fetchInitialData]);

  if (error && storages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-10">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchInitialData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex pt-20">
        <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
        <div className="flex-1 p-8 overflow-auto">
          <AnimatePresence mode="wait">
            {currentPage === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {OverviewStorages}
              </motion.div>
            )}
            {currentPage === "view" && (
              <motion.div
                key="view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {ViewStorages}
              </motion.div>
            )}
            {currentPage === "search" && (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {SearchStorages}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}
