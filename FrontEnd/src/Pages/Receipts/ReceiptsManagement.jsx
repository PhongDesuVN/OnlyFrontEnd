import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, BarChart, List, Search, AlertCircle, Loader, X } from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:8083/api/payments";

// Tách các component nhỏ ra ngoài để tránh re-create
const Header = React.memo(() => (
  <header className="fixed w-full top-0 bg-white shadow-lg z-10">
    <div className="container mx-auto px-4 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">Quản Lý Biên Lai</h1>
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
        <FileText className="mr-2" /> Quản Lý Biên Lai
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
        placeholder="Nhập mã biên lai, tên khách hàng hoặc trạng thái..."
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

const ReceiptTable = React.memo(({ receipts: tableReceipts, showSearchBar = false, searchProps, loading, error, onRetry }) => (
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
              <th className="border p-3 text-left text-gray-700 font-semibold">Mã Biên Lai</th>
              <th className="border p-3 text-left text-gray-700 font-semibold">Khách Hàng</th>
              <th className="border p-3 text-left text-gray-700 font-semibold">Số Tiền</th>
              <th className="border p-3 text-left text-gray-700 font-semibold">Ngày Lập</th>
              <th className="border p-3 text-left text-gray-700 font-semibold">Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {tableReceipts.length === 0 ? (
              <tr>
                <td colSpan="5" className="border p-8 text-center text-gray-500">
                  {loading ? "Đang tải..." : searchProps?.value ? "Không tìm thấy kết quả phù hợp" : "Không có dữ liệu"}
                </td>
              </tr>
            ) : (
              tableReceipts.map(receipt => (
                <motion.tr
                  key={receipt.paymentId}
                  whileHover={{ backgroundColor: "#f3f4f6" }}
                  transition={{ duration: 0.2 }}
                  className="hover:shadow-sm"
                >
                  <td className="border p-3 font-medium">{receipt.paymentId}</td>
                  <td className="border p-3">{receipt.customerName || "N/A"}</td>
                  <td className="border p-3 font-semibold text-green-600">
                    {receipt.amount?.toLocaleString()} VNĐ
                  </td>
                  <td className="border p-3">{receipt.paidDate || "N/A"}</td>
                  <td className="border p-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      receipt.status === "PAID"
                        ? "bg-green-100 text-green-700"
                        : receipt.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}>
                      {receipt.status}
                    </span>
                  </td>
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
      { label: "Tổng số biên lai", value: stats.total, color: "blue" },
      { label: "Đã thanh toán", value: stats.paid, color: "green" },
      { label: "Chưa thanh toán", value: stats.unpaid, color: "red" },
      { label: "Đang xử lý", value: stats.pending, color: "yellow" }
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
      <p>© 2025 Hệ Thống Quản Lý Biên Lai. Mọi quyền được bảo lưu.</p>
    </div>
  </footer>
));

export default function ReceiptsManagement() {
  const [receipts, setReceipts] = useState([]);
  const [currentPage, setCurrentPage] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load dữ liệu ban đầu
const fetchInitialData = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    // 1. Kiểm tra token kỹ càng hơn
    const authToken = localStorage.getItem('authToken');
    const fallbackToken = localStorage.getItem('token');
    const accessToken = localStorage.getItem('accessToken');

    const token = authToken || fallbackToken || accessToken;

    // 2. Kiểm tra token có tồn tại và hợp lệ không
    if (!token) {
      throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
    }

    // 3. Kiểm tra token có hết hạn không (nếu là JWT)
    if (token.includes('.')) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp && payload.exp < currentTime) {
          throw new Error('Token đã hết hạn. Vui lòng đăng nhập lại.');
        }
      } catch (jwtError) {
        console.warn('Không thể parse JWT token:', jwtError);
      }
    }

    // 4. Cấu hình headers đầy đủ
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Thêm headers khác nếu cần
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 10000 // 10 seconds timeout
    };

    console.log('Making API request with config:', {
      url: `${API_BASE}/search?page=0&size=100`,
      headers: { ...config.headers, Authorization: 'Bearer [HIDDEN]' }
    });

    const response = await axios.get(`${API_BASE}/search?page=0&size=100`, config);

    console.log('API Response:', response.data);
    setReceipts(response.data.content || []);

  } catch (err) {
    console.error('API Error Details:', {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers
    });

    // 5. Xử lý lỗi chi tiết hơn
    if (err.response?.status === 403) {
      setError("Không có quyền truy cập dữ liệu. Vui lòng kiểm tra quyền tài khoản.");

      // Có thể redirect về trang đăng nhập
      // window.location.href = '/login';

    } else if (err.response?.status === 401) {
      setError("Token không hợp lệ hoặc đã hết hạn. Đang chuyển hướng về trang đăng nhập...");

      // Xóa token cũ và redirect
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');

      // Chuyển hướng sau 2 giây
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } else if (err.response?.status === 404) {
      setError("API endpoint không tồn tại. Vui lòng kiểm tra cấu hình server.");

    } else if (err.code === 'ECONNABORTED') {
      setError("Kết nối timeout. Vui lòng thử lại sau.");

    } else if (err.message.includes('Network Error')) {
      setError("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.");

    } else {
      setError(`Lỗi không xác định: ${err.message}`);
    }
  } finally {
    setLoading(false);
  }
}, []);

// 6. Thêm function để refresh token nếu cần
const refreshAuthToken = useCallback(async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Không có refresh token');
    }

    const response = await axios.post(`${API_BASE}/auth/refresh`, {
      refreshToken: refreshToken
    });

    const newToken = response.data.accessToken;
    localStorage.setItem('authToken', newToken);

    return newToken;
  } catch (error) {
    console.error('Refresh token error:', error);
    // Redirect to login
    window.location.href = '/login';
    return null;
  }
}, []);

// 7. Thêm interceptor để tự động handle 401 errors
useEffect(() => {
  const responseInterceptor = axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Thử refresh token
        const newToken = await refreshAuthToken();
        if (newToken) {
          // Retry request với token mới
          error.config.headers['Authorization'] = `Bearer ${newToken}`;
          return axios.request(error.config);
        }
      }
      return Promise.reject(error);
    }
  );

  // Cleanup
  return () => {
    axios.interceptors.response.eject(responseInterceptor);
  };
}, [refreshAuthToken]);

  // Client-side filtering với performance tối ưu
  const filteredReceipts = useMemo(() => {
    if (!searchTerm.trim()) {
      return receipts;
    }

    const term = searchTerm.toLowerCase().trim();
    return receipts.filter(receipt => {
      const paymentId = receipt.paymentId?.toString().toLowerCase() || '';
      const customerName = receipt.customerName?.toLowerCase() || '';
      const status = receipt.status?.toLowerCase() || '';

      return paymentId.includes(term) ||
             customerName.includes(term) ||
             status.includes(term);
    });
  }, [receipts, searchTerm]);

  // Handle search input change - sử dụng event.target.value trực tiếp
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const total = receipts.length;
    const paid = receipts.filter(r => r.status === "PAID").length;
    const unpaid = receipts.filter(r => r.status === "UNPAID").length;
    const pending = receipts.filter(r => r.status === "PENDING").length;

    return { total, paid, unpaid, pending };
  }, [receipts]);

  // Search props để tránh tạo object mới mỗi lần render
  const searchProps = useMemo(() => ({
    value: searchTerm,
    onChange: handleSearchChange,
    onClear: clearSearch,
    resultCount: filteredReceipts.length
  }), [searchTerm, handleSearchChange, clearSearch, filteredReceipts.length]);

  // Page components - đã tối ưu hóa props
  const OverviewReceipts = useMemo(() => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
        <BarChart className="mr-2" /> Tổng Quan Biên Lai
      </h2>
      <StatsCards stats={stats} />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <ReceiptTable
          receipts={receipts.slice(0, 10)}
          loading={loading}
          error={error}
          onRetry={fetchInitialData}
        />
      )}
    </motion.div>
  ), [stats, loading, receipts, error, fetchInitialData]);

  const ViewReceipts = useMemo(() => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
        <List className="mr-2" /> Danh Sách Biên Lai
      </h2>
      <ReceiptTable
        receipts={receipts}
        loading={loading}
        error={error}
        onRetry={fetchInitialData}
      />
    </motion.div>
  ), [receipts, loading, error, fetchInitialData]);

  const SearchReceipts = useMemo(() => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
        <Search className="mr-2" /> Tìm Kiếm Biên Lai
      </h2>
      <ReceiptTable
        receipts={filteredReceipts}
        showSearchBar={true}
        searchProps={searchProps}
        loading={loading}
        error={error}
        onRetry={fetchInitialData}
      />
    </motion.div>
  ), [filteredReceipts, searchProps, loading, error, fetchInitialData]);

  // Main render
  if (error && receipts.length === 0) {
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
                {OverviewReceipts}
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
                {ViewReceipts}
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
                {SearchReceipts}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}