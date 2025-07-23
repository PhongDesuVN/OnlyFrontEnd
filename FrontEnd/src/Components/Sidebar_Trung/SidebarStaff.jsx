import React from "react";
import { NavLink } from "react-router-dom";
import { FaUserClock, FaHistory } from "react-icons/fa";

export default function SidebarStaff() {
  return (
    <aside className="w-72 pt-20 min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl border-r border-blue-700/30 backdrop-blur-sm">

        <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full p-2 shadow">
            <FaUserClock className="text-blue-600 text-2xl" />
          </div>
          <span className="text-white text-2xl font-bold tracking-wide">Quản Lý Nhân Viên</span>
        </div>
      </div>
      <nav className="flex flex-col gap-3">

          <NavLink
              to="/manager-dashboard"
              className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-lg transition shadow-sm ${
                      isActive
                          ? "bg-blue-800 text-white"
                          : "text-white hover:bg-blue-600 hover:text-white bg-opacity-0"
                  }`
              }
          >
              <FaUserClock className="text-xl" />
              Về Trang Chủ
          </NavLink>

        <NavLink
          to="/manager/pending-staff"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-lg transition shadow-sm ${
              isActive
                ? "bg-blue-800 text-white"
                : "text-white hover:bg-blue-600 hover:text-white bg-opacity-0"
            }`
          }
        >
          <FaUserClock className="text-xl" />
          Quản lý nhân viên
        </NavLink>
      </nav>
    </aside>
  );
}
