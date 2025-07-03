"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import SlotGrid from "../../Components/HungStorage/SlotGrid";



import { motion, AnimatePresence } from "framer-motion";
import {
  Warehouse,
  BarChart,
  List,
  Search,
  AlertCircle,
  Loader,
  X,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  ArrowLeft,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify"; // Thêm react-toastify để hiển thị thông báo
import "react-toastify/dist/ReactToastify.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import { format, subDays, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const API_BASE = "http://localhost:8083/api/storage-units";

// Component Pagination được cập nhật
const Pagination = React.memo(
  ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }) => {
    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
          range.push(i);
        }
        return range;
      }

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push("...", totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-white rounded-lg border">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Hiển thị</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>trên {totalItems} kết quả</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border"
            title="Trang đầu"
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border"
            title="Trang trước"
          >
            <ChevronLeft size={16} />
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={page === "..."}
              className={`px-3 py-2 rounded text-sm border min-w-[40px] ${
                page === currentPage
                  ? "bg-blue-600 text-white border-blue-600"
                  : page === "..."
                    ? "cursor-default border-gray-200"
                    : "hover:bg-gray-100 border-gray-200"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border"
            title="Trang sau"
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border"
            title="Trang cuối"
          >
            <ChevronsRight size={16} />
          </button>
        </div>

        <div className="text-sm text-gray-600">Trang {currentPage} / {totalPages}</div>
      </div>
    );
  }
);

// Component FilterBar được gộp vào
const FilterBar = React.memo(({ filters, onFiltersChange, onClearFilters, resultCount, loading }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState({});

  // Hàm kiểm tra lỗi cho từng trường
      const validateField = useCallback((name, value) => {
        const newErrors = { ...errors };

        switch (name) {
          case "name":
            if (!value.trim()) {
              newErrors.name = "Tên kho không được để trống";
            } else if (value.length > 100) {
              newErrors.name = "Tên kho không được vượt quá 100 ký tự";
            } else {
              delete newErrors.name;
            }
            break;
          case "address":
            if (value && value.length > 255) {
              newErrors.address = "Địa chỉ không được vượt quá 255 ký tự";
            } else {
              delete newErrors.address;
            }
            break;
          case "phone":
            if (value && value.length > 20) {
              newErrors.phone = "Số điện thoại không được vượt quá 20 ký tự";
            } else if (value && !/^\+84\d{9}$/.test(value)) {
              newErrors.phone = "Số điện thoại phải bắt đầu bằng +84 và có 9 chữ số";
            } else {
              delete newErrors.phone;
            }
            break;
          case "status":
            if (!value) {
              newErrors.status = "Trạng thái không được để trống";
            } else if (value.length > 30) {
              newErrors.status = "Trạng thái không được vượt quá 30 ký tự";
            } else if (!["AVAILABLE", "ACTIVE", "INACTIVE"].includes(value)) {
              newErrors.status = "Trạng thái không hợp lệ";
            } else {
              delete newErrors.status;
            }
            break;
          case "note":
            if (value && value.length > 255) {
              newErrors.note = "Ghi chú không được vượt quá 255 ký tự";
            } else {
              delete newErrors.note;
            }
            break;
          case "managerId":
            if (value && (isNaN(value) || Number(value) <= 0)) {
              newErrors.managerId = "ID quản lý phải là số dương";
            } else {
              delete newErrors.managerId;
            }
            break;
          case "image":
            if (value && value.length > 500) {
              newErrors.image = "Đường dẫn ảnh không được vượt quá 500 ký tự";
            } else if (value && !/\.(png|jpg|jpeg)$/i.test(value)) {
              newErrors.image = "Link ảnh phải có dạng .png, .jpg hoặc .jpeg";
            } else {
              delete newErrors.image;
            }
            break;
          default:
            break;
        }

        return newErrors;
      }, [errors]);

  const handleFilterChange = useCallback(
    (name, value) => {
      validateField(name, value);
      onFiltersChange({ ...filters, [name]: value });
    },
    [filters, onFiltersChange, validateField]
  );

  const handleClearAll = useCallback(() => {
    setErrors({});
    onClearFilters();
  }, [onClearFilters]);

  const hasActiveFilters = Object.values(filters).some((value) => value !== "" && value !== null);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên kho..."
              value={filters.name || ""}
              onChange={(e) => handleFilterChange("name", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="w-full lg:w-48">
          <select
            value={filters.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="AVAILABLE">Có sẵn</option>
            <option value="INACTIVE">Ngừng hoạt động</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
              showAdvanced ? "bg-blue-50 border-blue-300 text-blue-700" : "hover:bg-gray-50"
            }`}
          >
            <Filter size={16} />
            Lọc nâng cao
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <input
                    type="text"
                    placeholder="Nhập địa chỉ..."
                    value={filters.address || ""}
                    onChange={(e) => handleFilterChange("address", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên quản lý</label>
                  <input
                    type="text"
                    placeholder="Nhập tên quản lý..."
                    value={filters.managerName || ""}
                    onChange={(e) => handleFilterChange("managerName", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Quản lý</label>
                  <input
                    type="number"
                    placeholder="Nhập ID..."
                    value={filters.managerId || ""}
                    onChange={(e) => handleFilterChange("managerId", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors.managerId ? "border-red-500" : ""
                    }`}
                  />
                  {errors.managerId && <p className="text-red-500 text-xs mt-1">{errors.managerId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại..."
                    value={filters.phone || ""}
                    onChange={(e) => handleFilterChange("phone", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors.phone ? "border-red-500" : ""
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

// Component Header
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

// Component Sidebar
const Sidebar = React.memo(({ currentPage, onPageChange }) => {
  const pageLabels = {
    overview: "Tổng Quan",
    view: "Danh Sách",
    add: "Thêm Mới",
    search: "Tìm Kiếm",
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
        {["overview", "view", "add", "search"].map((page) => (
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
            {page === "add" && <Plus className="mr-2" size={20} />}
            {page === "search" && <Search className="mr-2" size={20} />}
            {pageLabels[page]}
          </motion.button>
        ))}
      </nav>
    </motion.div>
  );
});

// Component LoadingSpinner
const LoadingSpinner = React.memo(() => (
  <div className="flex items-center justify-center py-8">
    <Loader className="animate-spin mr-2" size={20} />
    <span>Đang tải dữ liệu...</span>
  </div>
));

// Component ErrorMessage
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

// Component SearchBar
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
    <div className="text-sm text-gray-600">Tìm thấy {resultCount} kết quả{value && ` cho "${value}"`}</div>
  </div>
));

// Cập nhật StorageUnitForm để xử lý lỗi 403 và ReferenceError
const StorageUnitForm = React.memo(
  ({
    storageUnit,
    onSubmit,
    onCancel,
    loading,
    isEdit = false,
    uploadingImage,
    setUploadingImage,
    getAuthHeaders,
  }) => {
    const [formData, setFormData] = useState({
      name: storageUnit?.name || "",
      address: storageUnit?.address || "",
      managerId: storageUnit?.managerId || "",
      phone: storageUnit?.phone || "",
      status: storageUnit?.status || "AVAILABLE",
      note: storageUnit?.note || "",
      image: storageUnit?.image || "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    };

    const validateForm = () => {
      const newErrors = {};
      if (!formData.name.trim()) newErrors.name = "Tên kho là bắt buộc";
      if (!formData.status) newErrors.status = "Trạng thái là bắt buộc";
      if (formData.phone && !/^[0-9+\-\s()]*$/.test(formData.phone)) {
        newErrors.phone = "Số điện thoại không hợp lệ";
      }
      if (formData.managerId && isNaN(Number.parseInt(formData.managerId))) {
        newErrors.managerId = "ID quản lý phải là số";
      }
      if (formData.image && !/^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/.test(formData.image)) {
        newErrors.image = "URL ảnh không hợp lệ";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (validateForm()) {
        const submitData = {
          name: formData.name.trim(),
          address: formData.address ? formData.address.trim() : null,
          phone: formData.phone ? formData.phone.trim() : null,
          status: formData.status,
          note: formData.note ? formData.note.trim() : null,
          managerId: formData.managerId ? Number.parseInt(formData.managerId) : null,
          image: formData.image || null, // Đảm bảo image luôn được gửi
        };
        onSubmit(submitData, setErrors);
      }
    };

    const handleImageUpload = async (fileOrUrl) => {
      setUploadingImage(true);

      try {
        let imageUrl = formData.image;
        if (typeof fileOrUrl === "object" && fileOrUrl) { // Trường hợp chọn tệp
          const formDataUpload = new FormData();
          formDataUpload.append("file", fileOrUrl);

          const headers = getAuthHeaders ? getAuthHeaders() : {};
          const response = await axios.post(`${API_BASE}/upload`, formDataUpload, {
            headers: {
              "Content-Type": "multipart/form-data",
              ...headers,
            },
          });

          if (!response.data.imageUrl) {
            throw new Error("Không nhận được URL ảnh từ server");
          }
          imageUrl = response.data.imageUrl;
        } else if (typeof fileOrUrl === "string" && fileOrUrl.trim()) { // Trường hợp nhập URL
          const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
          if (!urlPattern.test(fileOrUrl)) {
            throw new Error("URL không hợp lệ");
          }
          imageUrl = fileOrUrl;
          // Gửi URL lên backend để lưu (nếu cần endpoint mới)
          // await axios.post(`${API_BASE}/update-image`, { imageUrl }, { headers: getAuthHeaders() });
        }

        setFormData((prev) => ({ ...prev, image: imageUrl }));
        toast.success("Cập nhật ảnh thành công!");
      } catch (err) {
        console.error("Upload ảnh lỗi:", err.response?.data || err.message);
        if (err.response?.status === 403) {
          toast.error("Không có quyền tải ảnh lên. Vui lòng kiểm tra vai trò hoặc đăng nhập lại.");
        } else {
          toast.error(`Không thể cập nhật ảnh: ${err.response?.data?.message || err.message}`);
        }
        setFormData((prev) => ({ ...prev, image: "" }));
      } finally {
        setUploadingImage(false);
      }
    };
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">{isEdit ? "Cập Nhật Kho" : "Thêm Kho Mới"}</h3>
          <button onClick={onCancel} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên Kho *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tên kho"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  errors.status ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="AVAILABLE">Có sẵn</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Ngừng hoạt động</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa Chỉ</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  errors.address ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập địa chỉ"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số Điện Thoại</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập số điện thoại"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager ID</label>
              <input
                type="number"
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  errors.managerId ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập ID quản lý"
              />
              {errors.managerId && <p className="text-red-500 text-sm mt-1">{errors.managerId}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi Chú</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                errors.note ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nhập ghi chú"
            />
            {errors.note && <p className="text-red-500 text-sm mt-1">{errors.note}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh kho</label>
            {formData.image && (
              <img
                src={formData.image}
                alt="Ảnh kho preview"
                className="w-32 h-32 object-cover rounded mb-2 border"
              />
            )}
            <div className="flex gap-4 mb-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files?.[0])}
                disabled={uploadingImage}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <input
                type="text"
                placeholder="Nhập URL ảnh..."
                value={formData.image || ""}
                onChange={(e) => handleImageUpload(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={uploadingImage}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2" size={16} />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={16} />
                  {isEdit ? "Cập Nhật" : "Thêm Mới"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    );
  }
);

// Component DailyStorageChart
const DailyStorageChart = React.memo(({ storages }) => {
  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return format(date, "yyyy-MM-dd");
    });

    const dailyCounts = last30Days.map((date) => {
      const count = storages.filter((storage) => {
        if (!storage.createdAt) return false;
        const storageDate = format(parseISO(storage.createdAt), "yyyy-MM-dd");
        return storageDate === date;
      }).length;
      return count;
    });

    return {
      labels: last30Days.map((date) => format(parseISO(date), "dd/MM", { locale: vi })),
      datasets: [
        {
          label: "Số kho được thêm",
          data: dailyCounts,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [storages]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Số Lượng Kho Được Thêm Mỗi Ngày (30 ngày gần nhất)",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div style={{ height: "400px" }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
});

// Component StorageStatusChart
const StorageStatusChart = React.memo(({ storages }) => {
  const chartData = useMemo(() => {
    const statusCounts = storages.reduce((acc, storage) => {
      const status = storage.status || "UNKNOWN";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusColors = {
      ACTIVE: "#10B981",
      AVAILABLE: "#F59E0B",
      INACTIVE: "#EF4444",
      UNKNOWN: "#6B7280",
    };

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);
    const backgroundColor = labels.map((label) => statusColors[label] || statusColors.UNKNOWN);

    return {
      labels: labels.map((label) => {
        switch (label) {
          case "ACTIVE":
            return "Đang hoạt động";
          case "AVAILABLE":
            return "Có sẵn";
          case "INACTIVE":
            return "Ngừng hoạt động";
          default:
            return label;
        }
      }),
      datasets: [
        {
          data,
          backgroundColor,
          borderColor: backgroundColor.map((color) => color),
          borderWidth: 2,
        },
      ],
    };
  }, [storages]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: "Phân Bố Trạng Thái Kho",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} kho (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div style={{ height: "400px" }}>
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
});

// Cập nhật StorageTable để hỗ trợ pagination và filtering
const StorageTable = React.memo(
  ({
    storages,
    showSearchBar = false,
    searchProps,
    loading,
    error,
    onRetry,
    onEdit,
    onDelete,
    onView,
    showActions = false,
    showPagination = false,
    paginationProps,
    showFilters = false,
    filterProps,
  }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      {showFilters && filterProps && <FilterBar {...filterProps} />}
      {showSearchBar && searchProps && <SearchBar {...searchProps} />}

      {error ? (
        <ErrorMessage error={error} onRetry={onRetry} />
      ) : (
        <>
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
                  {showActions && <th className="border p-3 text-left text-gray-700 font-semibold">Thao Tác</th>}
                </tr>
              </thead>
              <tbody>
                {storages.length === 0 ? (
                  <tr>
                    <td
                      colSpan={showActions ? "9" : "8"}
                      className="border p-8 text-center text-gray-500"
                    >
                      {loading
                        ? "Đang tải..."
                        : filterProps?.filters && Object.values(filterProps.filters).some((v) => v)
                          ? "Không tìm thấy kết quả phù hợp với bộ lọc"
                          : searchProps?.value
                            ? "Không tìm thấy kết quả phù hợp"
                            : "Không có dữ liệu"}
                    </td>
                  </tr>
                ) : (
                  storages.map((storage) => (
                    <motion.tr
                      key={storage.storageId}
                      whileHover={{ backgroundColor: "#f3f4f6" }}
                      transition={{ duration: 0.2 }}
                      className="hover:shadow-sm"
                    >
                      <td className="border p-3 font-medium">{storage.storageId}</td>
                      <td className="border p-3">{storage.name}</td>
                      <td className="border p-3">{storage.address || "N/A"}</td>
                      <td className="border p-3">{storage.managerName || "N/A"}</td>
                      <td className="border p-3">{storage.phone || "N/A"}</td>
                      <td className="border p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            storage.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : storage.status === "AVAILABLE"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {storage.status}
                        </span>
                      </td>
                      <td className="border p-3">{storage.note || "N/A"}</td>
                      <td className="border p-3">
                        {storage.createdAt ? storage.createdAt.replace("T", " ").slice(0, 19) : "N/A"}
                      </td>
                      {showActions && (
                        <td className="border p-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => onView(storage)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => onEdit(storage)}
                              className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => onDelete(storage)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {showPagination && paginationProps && <Pagination {...paginationProps} />}
        </>
      )}
    </div>
  )
);

// Component StatsCards
const StatsCards = React.memo(({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {[
      { label: "Tổng số kho", value: stats.total, color: "blue" },
      { label: "Kho đang hoạt động", value: stats.active, color: "green" },
      { label: "Kho có sẵn", value: stats.available, color: "yellow" },
      { label: "Kho ngừng hoạt động", value: stats.inactive, color: "red" },
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

// Component Footer
const Footer = React.memo(() => (
  <footer className="bg-gray-800 text-white py-8 mt-16">
    <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
      <p>© 2025 Hệ Thống Quản Lý Kho Lưu Trữ. Mọi quyền được bảo lưu.</p>
    </div>
  </footer>
));

// Cập nhật StorageUnitManagement để truyền getAuthHeaders
export default function StorageUnitManagement() {
  const [storages, setStorages] = useState([]);
  const [currentPage, setCurrentPage] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingStorage, setEditingStorage] = useState(null);
  const [viewingStorage, setViewingStorage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    name: "",
    status: "",
    address: "",
    managerName: "",
    managerId: "",
    phone: "",
  });

  const [allStorages, setAllStorages] = useState([]);

  const getAuthHeaders = () => {
    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return match ? match[2] : null;
    };
    const token = getCookie("authToken");
    if (!token) {
      setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  };

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_BASE, {
        headers: getAuthHeaders(),
      });
      const data = response.data || [];
      // Nối base URL một cách linh hoạt
      const processedData = data.map((item) => ({
        ...item,
        image: item.image
          ? item.image.startsWith("http")
            ? item.image
            : `http://localhost:8083${item.image}`
          : null,
      }));
      setAllStorages(processedData);
      setStorages(processedData);

      setPagination((prev) => ({
        ...prev,
        totalItems: processedData.length,
        totalPages: Math.ceil(processedData.length / prev.itemsPerPage),
      }));
    } catch (err) {
      console.error("Chi tiết lỗi:", err.response?.status, err.response?.data);
      const errorMessage = err.response?.data?.message || err.message;
      setError(`Lỗi khi tải dữ liệu: ${errorMessage}`);
      if (err.response?.status === 403) {
        setError("Không có quyền truy cập. Vui lòng kiểm tra vai trò hoặc đăng nhập lại.");
      } else if (err.response?.status === 401) {
        setError("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getFilteredAndPaginatedData = useMemo(() => {
    let filtered = allStorages;

    if (filters.name) {
      filtered = filtered.filter((storage) =>
        storage.name?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.status) {
      filtered = filtered.filter((storage) => storage.status === filters.status);
    }
    if (filters.address) {
      filtered = filtered.filter((storage) =>
        storage.address?.toLowerCase().includes(filters.address.toLowerCase())
      );
    }
    if (filters.managerName) {
      filtered = filtered.filter((storage) =>
        storage.managerName?.toLowerCase().includes(filters.managerName.toLowerCase())
      );
    }
    if (filters.managerId) {
      filtered = filtered.filter(
        (storage) => storage.managerId?.toString() === filters.managerId.toString()
      );
    }
    if (filters.phone) {
      filtered = filtered.filter((storage) => storage.phone?.includes(filters.phone));
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);

    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      totalItems,
      totalPages,
      filteredData: filtered,
    };
  }, [allStorages, filters, pagination.currentPage, pagination.itemsPerPage]);

  useEffect(() => {
    const result = getFilteredAndPaginatedData;
    setPagination((prev) => ({
      ...prev,
      totalItems: result.totalItems,
      totalPages: result.totalPages,
      currentPage: 1,
    }));
  }, [filters]);

  const handlePageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const handleItemsPerPageChange = useCallback((itemsPerPage) => {
    setPagination((prev) => ({
      ...prev,
      itemsPerPage,
      currentPage: 1,
      totalPages: Math.ceil(prev.totalItems / itemsPerPage),
    }));
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      name: "",
      status: "",
      address: "",
      managerName: "",
      managerId: "",
      phone: "",
    });
  }, []);

  const handleCreate = async (formData, setErrors) => {
    setLoading(true);
    try {
      console.log("Dữ liệu gửi đi:", JSON.stringify(formData, null, 2));
      const response = await axios.post(API_BASE, formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      if (response.data) {
        setAllStorages((prev) => [...prev, response.data]);
        setStorages((prev) => [...prev, response.data]);
        setCurrentPage("view");
        toast.success("Thêm kho thành công!");
      }
    } catch (err) {
      console.error("Lỗi khi tạo kho:", err.response?.status, err.response?.data);
      if (err.response?.status === 400) {
        const errorData = err.response.data;
        if (typeof errorData === "object" && !Array.isArray(errorData)) {
          setErrors(errorData);
        } else {
          toast.error(
            "Dữ liệu không hợp lệ: " + (typeof errorData === "string" ? errorData : JSON.stringify(errorData))
          );
        }
      } else if (err.response?.status === 403) {
        toast.error("Không có quyền truy cập. Vui lòng kiểm tra vai trò hoặc đăng nhập lại.");
        window.location.href = "/login";
      } else {
        toast.error("Không thể thêm kho: " + (err.response?.data?.error || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    if (!editingStorage?.storageId) return;

    setLoading(true);
    try {
      const response = await axios.put(`${API_BASE}/${editingStorage.storageId}`, formData, {
        headers: getAuthHeaders(),
      });

      if (response.data) {
        // Cập nhật dữ liệu cục bộ ngay lập tức
        setAllStorages((prev) =>
          prev.map((s) => (s.storageId === editingStorage.storageId ? response.data : s))
        );
        setStorages((prev) =>
          prev.map((s) => (s.storageId === editingStorage.storageId ? response.data : s))
        );
        setEditingStorage(null);
        setCurrentPage("view");
        toast.success("Cập nhật kho thành công!");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Không thể cập nhật kho");
    } finally {
      setLoading(false);
      // Tải lại dữ liệu để đảm bảo đồng bộ
      await fetchInitialData();
    }
  };

  const handleDelete = async (storage) => {
    if (!storage.storageId) return;

    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/${storage.storageId}`, {
        headers: getAuthHeaders(),
      });

      setAllStorages((prev) => prev.filter((s) => s.storageId !== storage.storageId));
      setStorages((prev) => prev.filter((s) => s.storageId !== storage.storageId));
      setShowDeleteConfirm(null);
      toast.success("Xóa kho thành công!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Không thể xóa kho");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (storage) => {
    setEditingStorage(storage);
    setCurrentPage("edit");
  };

  const handleView = (storage) => {
    setViewingStorage(storage);
    setCurrentPage("detail");
  };

  const handleDeleteClick = (storage) => {
    setShowDeleteConfirm(storage);
  };

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const filteredStorages = useMemo(() => {
    if (!searchTerm.trim()) {
      return storages;
    }
    const term = searchTerm.toLowerCase().trim();
    return storages.filter((storage) => {
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

  const handlePageChangeMain = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const stats = useMemo(() => {
    const total = allStorages.length;
    const active = allStorages.filter((r) => r.status === "ACTIVE").length;
    const available = allStorages.filter((r) => r.status === "AVAILABLE").length;
    const inactive = allStorages.filter((r) => r.status === "INACTIVE").length;
    return { total, active, available, inactive };
  }, [allStorages]);

  const searchProps = useMemo(
    () => ({
      value: searchTerm,
      onChange: handleSearchChange,
      onClear: clearSearch,
      resultCount: filteredStorages.length,
    }),
    [searchTerm, handleSearchChange, clearSearch, filteredStorages.length]
  );

  const OverviewStorages = useMemo(
    () => (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
          <BarChart className="mr-2" /> Tổng Quan Kho Lưu Trữ
        </h2>
        <StatsCards stats={stats} />

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage error={error} onRetry={fetchInitialData} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DailyStorageChart storages={allStorages} />
            <StorageStatusChart storages={allStorages} />
          </div>
        )}
      </motion.div>
    ),
    [stats, loading, allStorages, error, fetchInitialData]
  );

  const ViewStorages = useMemo(() => {
    const result = getFilteredAndPaginatedData;

    const paginationProps = {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalItems: result.totalItems,
      itemsPerPage: pagination.itemsPerPage,
      onPageChange: handlePageChange,
      onItemsPerPageChange: handleItemsPerPageChange,
    };

    const filterProps = {
      filters,
      onFiltersChange: handleFiltersChange,
      onClearFilters: handleClearFilters,
      resultCount: result.totalItems,
      loading,
    };

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
          <List className="mr-2" /> Danh Sách Kho Lưu Trữ
        </h2>
        <StorageTable
          storages={result.data}
          loading={loading}
          error={error}
          onRetry={fetchInitialData}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onView={handleView}
          showActions={true}
          showPagination={true}
          paginationProps={paginationProps}
          showFilters={true}
          filterProps={filterProps}
        />
      </motion.div>
    );
  }, [getFilteredAndPaginatedData, pagination, filters, loading, error, fetchInitialData]);

  const AddStorage = useMemo(
    () => (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
          <Plus className="mr-2" /> Thêm Kho Mới
        </h2>
        <StorageUnitForm
          onSubmit={handleCreate}
          onCancel={() => setCurrentPage("view")}
          loading={loading}
          uploadingImage={uploadingImage}
          setUploadingImage={setUploadingImage}
          getAuthHeaders={getAuthHeaders}
        />
      </motion.div>
    ),
    [loading, uploadingImage, setUploadingImage, getAuthHeaders]
  );

  const EditStorage = useMemo(
    () => (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
          <Edit className="mr-2" /> Cập Nhật Kho
        </h2>
        <StorageUnitForm
          storageUnit={editingStorage}
          onSubmit={handleUpdate}
          onCancel={() => {
            setEditingStorage(null);
            setCurrentPage("view");
          }}
          loading={loading}
          isEdit={true}
          uploadingImage={uploadingImage}
          setUploadingImage={setUploadingImage}
          getAuthHeaders={getAuthHeaders}
        />
      </motion.div>
    ),
    [editingStorage, loading, uploadingImage, setUploadingImage, getAuthHeaders]
  );

  const SearchStorages = useMemo(
    () => (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onView={handleView}
          showActions={true}
        />
      </motion.div>
    ),
    [filteredStorages, searchProps, loading, error, fetchInitialData]
  );

  const DetailStorage = useMemo(
    () => (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-4xl font-bold flex items-center text-gray-800">
            <Eye className="mr-2" /> Chi Tiết Kho
          </h2>
          <button
            onClick={() => {
              setViewingStorage(null);
              setCurrentPage("view");
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
          >
            <ArrowLeft className="mr-2" size={16} />
            Quay Lại
          </button>
        </div>

        {viewingStorage && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {viewingStorage.image && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh Kho</label>
                  <img
                    src={viewingStorage.image}
                    alt={`${viewingStorage.name} - Ảnh kho`}
                    className="w-full max-w-md h-auto object-cover rounded-lg mb-4 border"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã Kho</label>
                <p className="text-lg font-semibold text-gray-900">{viewingStorage.storageId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Kho</label>
                <p className="text-lg font-semibold text-gray-900">{viewingStorage.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa Chỉ</label>
                <p className="text-lg text-gray-900">{viewingStorage.address || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số Điện Thoại</label>
                <p className="text-lg text-gray-900">{viewingStorage.phone || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng Thái</label>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    viewingStorage.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : viewingStorage.status === "AVAILABLE"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {viewingStorage.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quản Lý</label>
                <p className="text-lg text-gray-900">{viewingStorage.managerName || "N/A"}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi Chú</label>
                <p className="text-lg text-gray-900">{viewingStorage.note || "Không có ghi chú"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày Tạo</label>
                <p className="text-lg text-gray-900">
                  {viewingStorage.createdAt
                    ? new Date(viewingStorage.createdAt).toLocaleString("vi-VN")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    ),
    [viewingStorage]
  );

  if (error && allStorages.length === 0) {
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
        <Sidebar currentPage={currentPage} onPageChange={handlePageChangeMain} />
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
            {currentPage === "add" && (
              <motion.div
                key="add"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {AddStorage}
              </motion.div>
            )}
            {currentPage === "edit" && (
              <motion.div
                key="edit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {EditStorage}
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
            {currentPage === "detail" && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {DetailStorage}
                {viewingStorage && <SlotGrid storageId={viewingStorage.storageId} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
            >
              <div className="flex items-center mb-4">
                <AlertCircle className="text-red-500 mr-3" size={24} />
                <h3 className="text-lg font-bold text-gray-800">Xác Nhận Xóa</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa kho "{showDeleteConfirm.name}"? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin mr-2" size={16} />
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2" size={16} />
                      Xóa
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}