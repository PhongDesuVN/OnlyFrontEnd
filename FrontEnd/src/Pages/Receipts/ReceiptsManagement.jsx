    import React, { useState, useEffect } from "react";
    import axios from "axios";
    import ReceiptSearchBar from "../../Components/Receipts/ReceiptSearchBar";
    import ReceiptList from "../../Components/Receipts/ReceiptList";
    import ReceiptDetailModal from "../../Components/Receipts/ReceiptDetailModal";
    import { motion, AnimatePresence } from "framer-motion";
    import { FileText, BarChart, List, Search } from "lucide-react";
    import { Link } from "react-router-dom";



    const initialReceipts = [];
    const API_BASE = "http://localhost:8083/api/payments";

    export default function ReceiptsManagement() {
      const [receipts, setReceipts] = useState(initialReceipts);
      const [currentPage, setCurrentPage] = useState("overview");
      const [searchTerm, setSearchTerm] = useState("");
      const [error, setError] = useState(null);

      useEffect(() => {
        axios.get("http://localhost:8083/api/payments/search?page=0&size=10")
          .then(res => {
            console.log('API data:', res.data);      // <-- DÒNG NÀY
            console.log('Content:', res.data.content); // <-- DÒNG NÀY
            setReceipts(res.data.content || []);
          })
          .catch(err => {
            setError("Không thể tải dữ liệu từ API (Lỗi 403)");
          });
      }, []);

      // Header
      const Header = () => (
        <header className="fixed w-full top-0 bg-white shadow-lg z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FileText className="w-8 h-8 text-blue-600" />
                <h1 className="text-xl font-bold text-black">Quản Lý Biên Lai</h1>
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                  <Link to="/" className="text-black hover:text-blue-600 transition-colors">
                    Trang Chủ
                  </Link>
                </button>
              </div>
            </div>
          </div>
        </header>
      );

      // Sidebar
      const Sidebar = () => {
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
                  className={`flex items-center w-full text-left py-3 px-4 mb-3 rounded-lg transition-all duration-300 ${currentPage === page ? "bg-blue-500 shadow-lg" : "hover:bg-blue-600"
                    }`}
                  onClick={() => setCurrentPage(page)}
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
      };
const handleSearchTermChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Gọi lại API để tìm kiếm (realtime)
    axios.get(`${API_BASE}/search`, {
      params: { keyword: value, page: 0, size: 10 }
    })
    .then(res => setReceipts(res.data.content || []))
    .catch(err => setError("Không thể tải dữ liệu từ API (Lỗi 403)"));
  };
      // Tổng quan biên lai
      const OverviewReceipts = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
            <BarChart className="mr-2" /> Tổng Quan Biên Lai
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Tổng số biên lai", value: receipts.length },
              { label: "Đã thanh toán", value: receipts.filter(r => r.status === "PAID").length },
              { label: "Chưa thanh toán", value: receipts.filter(r => r.status === "UNPAID").length }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
              >
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="text-2xl font-bold text-blue-600">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      );


      // Danh sách biên lai
const ViewReceipts = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
    <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
      <List className="mr-2" /> Danh Sách Biên Lai
    </h2>
    <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto border border-gray-100">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-3 text-left text-gray-700">Mã Biên Lai</th>
            <th className="border p-3 text-left text-gray-700">Khách Hàng</th>
            <th className="border p-3 text-left text-gray-700">Số Tiền</th>
            <th className="border p-3 text-left text-gray-700">Ngày Lập</th>
            <th className="border p-3 text-left text-gray-700">Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map(receipt => (
            <motion.tr key={receipt.paymentId} whileHover={{ backgroundColor: "#f3f4f6" }} transition={{ duration: 0.2 }}>
              <td className="border p-3">{receipt.paymentId}</td>
              <td className="border p-3">{receipt.customerName || "N/A"}</td>
              <td className="border p-3">{receipt.amount?.toLocaleString()} VNĐ</td>
              <td className="border p-3">{receipt.paidDate}</td>
              <td className="border p-3">
                <span className={`px-2 py-1 rounded-full text-sm
                  ${receipt.status === "PAID"
                    ? "bg-green-100 text-green-700"
                    : receipt.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                  {receipt.status}
                </span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);


      // Tìm kiếm biên lai
      const SearchReceipts = () => {
        const filteredReceipts = receipts.filter(receipt =>
          (receipt.paymentId && receipt.paymentId.toString().includes(searchTerm)) ||
          (receipt.customerName && receipt.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
        );


        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-4xl font-bold mb-6 flex items-center text-gray-800">
              <Search className="mr-2" /> Tìm Kiếm Biên Lai
            </h2>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <motion.div whileHover={{ scale: 1.02 }} className="flex items-center mb-6">
                <Search className="mr-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Nhập mã biên lai hoặc tên khách hàng..."
                  className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </motion.div> 
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-3 text-left text-gray-700">Mã Biên Lai</th>
                      <th className="border p-3 text-left text-gray-700">Khách Hàng</th>
                      <th className="border p-3 text-left text-gray-700">Số Tiền</th>
                      <th className="border p-3 text-left text-gray-700">Ngày Lập</th>
                      <th className="border p-3 text-left text-gray-700">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReceipts.map(receipt => (
                      <motion.tr key={receipt.paymentId} whileHover={{ backgroundColor: "#f3f4f6" }} transition={{ duration: 0.2 }}>
                        <td className="border p-3">{receipt.paymentId}</td>
                        <td className="border p-3">{receipt.customerName || "N/A"}</td>
                        <td className="border p-3">{receipt.amount?.toLocaleString()} VNĐ</td>
                        <td className="border p-3">{receipt.paidDate}</td>
                        <td className="border p-3">
                          <span className={`px-2 py-1 rounded-full text-sm
                            ${receipt.status === "PAID"
                              ? "bg-green-100 text-green-700"
                              : receipt.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                            {receipt.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          </motion.div>
        );
      };

      // Footer
      const Footer = () => (
        <footer className="bg-gray-800 text-white py-8 mt-16">
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>© 2025 Hệ Thống Quản Lý Biên Lai. Mọi quyền được bảo lưu.</p>
          </div>
        </footer>
      );

      // UI tổng thể
      if (error) {
        return (
          <div className="p-10 text-center text-red-500">
            {error} <br />
            Hãy đăng nhập lại hoặc kiểm tra quyền truy cập API!
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex pt-20">
            <Sidebar />
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
                    <OverviewReceipts />
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
                    <ViewReceipts />
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
                    <SearchReceipts />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <Footer />
        </div>
      );
    }