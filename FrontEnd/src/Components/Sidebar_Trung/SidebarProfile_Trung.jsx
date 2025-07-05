import { User, MonitorSmartphone, LayoutDashboard } from "lucide-react";

const SidebarProfile_Trung = ({ currentTab, setTab }) => {
    return (
        <aside className="w-64 min-h-screen bg-white rounded-r-3xl shadow-xl p-6 flex flex-col gap-6 border-0">
            {/* Nút Trang nhân viên */}
            <a
                href="/staff"
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-lg shadow hover:from-blue-600 hover:to-blue-800 transition mb-2"
            >
                <LayoutDashboard size={24} />
                <span>Trang nhân viên</span>
            </a>
            {/* Tiêu đề */}
            <h2 className="text-lg font-bold text-gray-500 tracking-wide mb-2 pl-1">Cá Nhân</h2>
            {/* Nhóm nút chức năng */}
            <nav className="flex flex-col gap-3 mt-2">
                <button
                    onClick={() => setTab("info")}
                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-base font-semibold transition-all shadow-sm
                        ${currentTab === "info"
                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-md"
                            : "text-gray-700 hover:bg-blue-100 hover:text-blue-700 border-l-4 border-transparent"}
                    `}
                >
                    <User size={22} />
                    <span>Thông tin cá nhân</span>
                </button>
                <button
                    onClick={() => setTab("monitor")}
                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-base font-semibold transition-all shadow-sm
                        ${currentTab === "monitor"
                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-md"
                            : "text-gray-700 hover:bg-blue-100 hover:text-blue-700 border-l-4 border-transparent"}
                    `}
                >
                    <MonitorSmartphone size={22} />
                    <span>Giám sát tài khoản</span>
                </button>
            </nav>
        </aside>
    );
};

export default SidebarProfile_Trung;
