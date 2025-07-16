import { motion } from "framer-motion";
import { BarChart, List, Search } from "lucide-react";
import PropTypes from "prop-types";

const PaymentSidebar = ({ currentPage, onPageChange }) => {
  const pageLabels = {
    overview: "Tổng Quan",
    list: "Danh Sách",

  };
  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-gradient-to-b from-blue-900 to-purple-600 text-white p-6 h-screen shadow-2xl"
    >
      <h1 className="text-2xl font-extrabold mb-8 flex items-center tracking-tight">
        <BarChart className="mr-2" /> Quản Lý Thanh Toán
      </h1>
      <nav>
        {["overview", "list", ].map((page) => (
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
            {page === "search" && <Search className="mr-2" size={20} />}
            {pageLabels[page]}
          </motion.button>
        ))}
      </nav>
    </motion.div>
  );    
};

PaymentSidebar.propTypes = {
  currentPage: PropTypes.string.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default PaymentSidebar;