import { motion } from "framer-motion";
import { BarChart, List, LogOut, Home } from "lucide-react";
import PropTypes from "prop-types";

const PaymentSidebar = ({ currentPage, onPageChange, onBackToHome, onLogout }) => {
  const pageLabels = {
    overview: "Tổng Quan ",
    list: "Danh Sách ",
  };
  return (
    <aside className="w-64 pt-20 min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl border-r border-blue-700/30 backdrop-blur-sm fixed h-full z-20">
      <div className="p-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-blue-300/5 to-transparent blur-2xl rounded-2xl"></div>
        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-center">
            <h2 className="text-2xl font-bold text-blue-50 tracking-wide text-center w-full">Hệ thống quản lý</h2>
          </div>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-400 via-blue-300 to-transparent rounded-full ml-0"></div>
        </div>
      </div>
      <nav className="px-4 space-y-3">
        <button
          onClick={onBackToHome}
          className="group flex items-center gap-4 p-4 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01] w-full"
        >
          <div className="p-2.5 rounded-xl transition-all duration-300 group-hover:bg-blue-700/50">
            <Home className="w-5 h-5 text-blue-300 group-hover:text-blue-100" />
          </div>
          <div className="flex-1 relative z-10">
            <span className="font-semibold">Về trang chủ</span>
          </div>
        </button>
        {Object.keys(pageLabels).map((page) => (
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
            {page === "list" && <List className="mr-2" size={20} />}
            <span>{pageLabels[page]}</span>
          </motion.button>
        ))}
        <button
          onClick={onLogout}
          className="group flex items-center gap-4 p-4 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01] w-full"
        >
          <div className="p-2.5 rounded-xl transition-all duration-300 group-hover:bg-blue-700/50">
            <LogOut className="w-5 h-5 text-blue-300 group-hover:text-blue-100" />
          </div>
          <div className="flex-1 relative z-10">
            <span className="font-semibold">Đăng xuất</span>
          </div>
        </button>
      </nav>
      <div className="px-6 pb-6">
        <div className="relative">
          <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent blur-sm"></div>
        </div>
      </div>
    </aside>
  );
};

PaymentSidebar.propTypes = {
  currentPage: PropTypes.string.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onBackToHome: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default PaymentSidebar;