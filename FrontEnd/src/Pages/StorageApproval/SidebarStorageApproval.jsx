import { Link, useLocation } from "react-router-dom";
import { Truck, LayoutDashboard, BarChart3 } from "lucide-react";

export default function SidebarStorageApproval({ overview = {} }) {
  const { pathname } = useLocation();
  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <aside className="w-72 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white fixed h-full shadow-2xl border-r border-blue-700/30 backdrop-blur-sm">
      {/* Header giống sidebar gốc */}
      <div className="mb-10 p-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-blue-300/5 to-transparent blur-2xl rounded-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-50 tracking-wide">Vận Chuyển Nhà</h2>
              <p className="text-blue-300 text-sm font-medium">Hệ thống quản lý</p>
            </div>
          </div>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-400 via-blue-300 to-transparent rounded-full"></div>
        </div>
      </div>
      <nav className="px-4 space-y-3">
        <Link
          to="/storage-approval/overview"
          className={`group flex items-center gap-4 p-4 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
            isActive("/storage-approval/overview")
              ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]"
              : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"
          }`}
        >
          {isActive("/storage-approval/overview") && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
          )}
          <div
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              isActive("/storage-approval/overview") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"
            }`}
          >
            <BarChart3
              size={22}
              className={`transition-all duration-300 ${
                isActive("/storage-approval/overview") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"
              }`}
            />
          </div>
          <div className="flex-1 relative z-10">
            <span className="font-semibold">Tổng Quan</span>
            <p className="text-xs opacity-75 mt-0.5">Thống kê kho lưu trữ</p>
          </div>
          {isActive("/storage-approval/overview") && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
          )}
        </Link>
        <Link
          to="/manager-dashboard"
          className={`group flex items-center gap-4 p-4 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
            isActive("/manager-dashboard")
              ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/40 scale-[1.02]"
              : "text-blue-100 hover:bg-blue-800/60 hover:text-white hover:scale-[1.01]"
          }`}
        >
          {isActive("/manager-dashboard") && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-pulse"></div>
          )}
          <div
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              isActive("/manager-dashboard") ? "bg-blue-500/40 shadow-lg" : "group-hover:bg-blue-700/50"
            }`}
          >
            <LayoutDashboard
              size={22}
              className={`transition-all duration-300 ${
                isActive("/manager-dashboard") ? "text-blue-100" : "text-blue-300 group-hover:text-blue-100"
              }`}
            />
          </div>
          <div className="flex-1 relative z-10">
            <span className="font-semibold">Dashboard Quản Lý</span>
            <p className="text-xs opacity-75 mt-0.5">Tổng quan quản lý</p>
          </div>
          {isActive("/manager-dashboard") && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-300 via-blue-200 to-blue-300 rounded-l-full shadow-lg"></div>
          )}
        </Link>
      </nav>
      <div className="absolute bottom-8 left-6 right-6">
        <div className="relative">
          <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent blur-sm"></div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-blue-400 text-xs font-medium">© 2025 Made By TrungTran</p>
        </div>
      </div>
    </aside>
  );
}