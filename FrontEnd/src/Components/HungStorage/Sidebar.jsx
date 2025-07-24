import { NavLink } from "react-router-dom";
import { BarChart, List, Plus, Search } from "lucide-react";
import PropTypes from "prop-types";

const Sidebar = ({ currentPage, onPageChange }) => {
  const navItems = [
    { key: "overview", label: "Tổng Quan", icon: BarChart },
    { key: "view", label: "Danh Sách", icon: List },
    { key: "add", label: "Thêm Mới", icon: Plus },
    { key: "search", label: "Tìm Kiếm", icon: Search },
  ];

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
      <nav className="px-4 space-y-3 mt-6">
        {navItems.map(({ key, label, icon: Icon }) => (
          <NavLink
            key={key}
            to="#"
            onClick={e => {
              e.preventDefault();
              onPageChange(key);
            }}
            className={({ isActive }) =>
              `group flex items-center gap-4 p-4 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${currentPage === key ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]" : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"}`
            }
          >
            {({ isActive }) => (
              <>
                {currentPage === key && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
                )}
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${currentPage === key ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"}`}>
                  <Icon className={`w-5 h-5 ${currentPage === key ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"}`} />
                </div>
                <div className="flex-1 relative z-10">
                  <span className="font-semibold">{label}</span>
                </div>
                {currentPage === key && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

Sidebar.propTypes = {
  currentPage: PropTypes.string.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Sidebar;