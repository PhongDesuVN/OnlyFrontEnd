import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import SidebarStaff from "../../Components/Sidebar_Trung/SidebarStaff";

const TABS = {
  PENDING: "pending",
  HISTORY: "history",
};

const PAGE_SIZE = 6;

// Add a spinner component at the top of the file
function Spinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default function PendingStaffManagement() {
  const [tab, setTab] = useState(TABS.PENDING);
  const navigate = useNavigate();

  // PENDING
  const [pendingUsers, setPendingUsers] = useState([]); // dữ liệu trang hiện tại
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingSearch, setPendingSearch] = useState({
    email: '',
    fullName: '',
    gender: '',
    address: '',
  });

  // HISTORY
  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState({
    userEmail: "",
    approvedByEmail: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  const token = Cookies.get("authToken");

  // Fetch pending users (client-side pagination)
  useEffect(() => {
    if (tab === TABS.PENDING) {
      fetchPendingUsers(0);
    }
    // eslint-disable-next-line
  }, [tab]);

  const fetchPendingUsers = async (page = 0) => {
    setPendingLoading(true);
    try {
      const res = await axiosInstance.get(
        `/api/pending-staff/manager/users-for-action?page=${page}&size=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingUsers(res.data?.content || []);
      setPendingTotalPages(res.data?.totalPages || 1);
      setPendingPage(page);
    } catch (e) {
      setPendingUsers([]);
      setPendingTotalPages(1);
    }
    setPendingLoading(false);
  };

  // Fetch history (server-side pagination & search)
  useEffect(() => {
    if (tab === TABS.HISTORY) {
      // Nếu không có filter, gọi all-paged
      if (
        !historySearch.userEmail &&
        !historySearch.approvedByEmail &&
        !historySearch.status &&
        !historySearch.fromDate &&
        !historySearch.toDate
      ) {
        fetchAllHistoryPaged(historyPage);
      } else {
        fetchHistory(historyPage, historySearch);
      }
    }
    // eslint-disable-next-line
  }, [tab, historyPage, historySearch]);

  const fetchHistory = async (page = 0, search = historySearch) => {
    setHistoryLoading(true);

    // Chuyển status "" thành null
    // Chuyển fromDate/toDate thành ISO string đầu ngày/cuối ngày nếu có
    const cleanSearch = {
      ...search,
      status: search.status || null,
      fromDate: search.fromDate
        ? search.fromDate + "T00:00:00"
        : null,
      toDate: search.toDate
        ? search.toDate + "T23:59:59.999"
        : null,
    };

    try {
      const res = await axiosInstance.post(
        `/api/pending-staff/manager/approval-history/search?page=${page}&size=${PAGE_SIZE}`,
        cleanSearch,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory(res.data?.content || []);
      setHistoryTotalPages(res.data?.totalPages || 1);
    } catch (e) {
      setHistory([]);
      setHistoryTotalPages(1);
    }
    setHistoryLoading(false);
  };

  const fetchAllHistoryPaged = async (page = 0) => {
    setHistoryLoading(true);
    try {
      const res = await axiosInstance.get(
        `/api/pending-staff/manager/approval-history/all-paged?page=${page}&size=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory(res.data?.content || []);
      setHistoryTotalPages(res.data?.totalPages || 1);
    } catch (e) {
      setHistory([]);
      setHistoryTotalPages(1);
    }
    setHistoryLoading(false);
  };

  const handleAction = async (email, newStatus) => {
    try {
      await axiosInstance.post(
        `/api/pending-staff/manager/update-status/${email}`,
        { newStatus }, // chỉ truyền newStatus
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingUsers(0);
    } catch (e) {
      alert("Có lỗi xảy ra!");
    }
  };

  // Handle search form submit
  const handleHistorySearch = (e) => {
    e.preventDefault();
    setHistoryPage(0);
    fetchHistory(0, historySearch);
  };

  const handleResetHistorySearch = () => {
    setHistorySearch({
      userEmail: "",
      approvedByEmail: "",
      status: "",
      fromDate: "",
      toDate: "",
    });
    setHistoryPage(0);
    fetchAllHistoryPaged(0);
  };

  // Search API for pending users
  const handlePendingSearch = async (e, page = 0) => {
    if (e) e.preventDefault();
    setPendingLoading(true);
    try {
      const res = await axiosInstance.post(
        `/api/pending-staff/manager/search-pending-users?page=${page}&size=${PAGE_SIZE}`,
        {
          email: pendingSearch.email || null,
          fullName: pendingSearch.fullName || null,
          gender: pendingSearch.gender || null,
          address: pendingSearch.address || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingUsers(res.data?.content || []);
      setPendingTotalPages(res.data?.totalPages || 1);
      setPendingPage(page);
    } catch (e) {
      setPendingUsers([]);
      setPendingTotalPages(1);
    }
    setPendingLoading(false);
  };

  const handleResetPendingSearch = () => {
    setPendingSearch({ email: '', fullName: '', gender: '', address: '' });
    fetchPendingUsers(0);
  };

  // Pagination helpers
  const handlePendingPageChange = (page) => {
    if (
      pendingSearch.email ||
      pendingSearch.fullName ||
      pendingSearch.gender ||
      pendingSearch.address
    ) {
      handlePendingSearch(null, page);
    } else {
      fetchPendingUsers(page);
    }
  };

  // Helper để đổi trạng thái sang tiếng Việt
  const statusToVietnamese = (status) => {
    switch (status) {
      case "PENDING_APPROVAL": return "Chờ duyệt";
      case "APPROVED": return "Đã duyệt";
      case "REJECTED": return "Từ chối";
      case "INACTIVE": return "Ngưng hoạt động";
      case "ACTIVE": return "Đang hoạt động";
      default: return status;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarStaff />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-start">
          <div className="p-4 w-full max-w-full">
            <div className="flex justify-between items-center mb-8">
              <div className="flex gap-4">
                <button
                  className={`px-5 py-2 rounded-lg font-bold shadow-sm transition text-base ${tab === TABS.PENDING ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-blue-100"}`}
                  onClick={() => setTab(TABS.PENDING)}
                >
                  Nhân viên chờ xác nhận
                </button>
                <button
                  className={`px-5 py-2 rounded-lg font-bold shadow-sm transition text-base ${tab === TABS.HISTORY ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-blue-100"}`}
                  onClick={() => setTab(TABS.HISTORY)}
                >
                  Lịch sử duyệt
                </button>
              </div>
              <button
                className="px-6 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 shadow transition text-base"
                onClick={() => navigate("/manager-dashboard")}
              >
                Về trang quản lý
              </button>
            </div>
            {/* PENDING TAB */}
            {tab === TABS.PENDING && (
              <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                <h2 className="text-xl font-bold mb-2 text-blue-700">Danh sách nhân viên chờ xác nhận</h2>
                {/* Search form for pending users */}
                <form className="mb-2 flex flex-wrap gap-2 items-end bg-gray-50 p-2 rounded-lg shadow-sm" onSubmit={handlePendingSearch}>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Email</label>
                    <input
                      className="border px-3 py-2 rounded-lg text-sm focus:outline-blue-400 shadow-sm"
                      value={pendingSearch.email}
                      onChange={e => setPendingSearch(s => ({ ...s, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Tên</label>
                    <input
                      className="border px-3 py-2 rounded-lg text-sm focus:outline-blue-400 shadow-sm"
                      value={pendingSearch.fullName}
                      onChange={e => setPendingSearch(s => ({ ...s, fullName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Giới tính</label>
                    <select
                      className="border px-3 py-2 rounded-lg text-sm focus:outline-blue-400 shadow-sm"
                      value={pendingSearch.gender}
                      onChange={e => setPendingSearch(s => ({ ...s, gender: e.target.value }))}
                    >
                      <option value="">Tất cả</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Địa chỉ</label>
                    <input
                      className="border px-3 py-2 rounded-lg text-sm focus:outline-blue-400 shadow-sm"
                      value={pendingSearch.address}
                      onChange={e => setPendingSearch(s => ({ ...s, address: e.target.value }))}
                    />
                  </div>
                
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-sm hover:bg-blue-700">Tìm kiếm</button>
                  <button type="button" className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold shadow-sm hover:bg-gray-400" onClick={handleResetPendingSearch}>Đặt lại</button>
                </form>
                <div className="relative mt-2 w-[1200px] mx-auto">
                  {pendingLoading && (
                    <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-60 z-10">
                      <Spinner />
                    </div>
                  )}
                  <table className="w-[1200px] border mb-0 rounded-lg overflow-hidden shadow-sm bg-gray-50 text-sm">
                    <thead className="bg-blue-100">
                      <tr className="font-bold text-blue-900">
                        <th className="py-3 px-5">Email</th>
                        <th className="py-3 px-5">Tên</th>
                        <th className="py-3 px-5">Giới tính</th>
                        <th className="py-3 px-5">Địa chỉ</th>
                        <th className="py-3 px-5">Trạng thái</th>
                        <th className="py-3 px-5">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingUsers.map((u, idx) => (
                        <tr key={u.email} className={`h-12 ${idx % 2 === 1 ? 'bg-blue-50' : ''} hover:bg-blue-100 transition`}>
                          <td className="py-3 px-5">{u.email}</td>
                          <td className="py-3 px-5">{u.fullName}</td>
                          <td className="py-3 px-5">{u.gender}</td>
                          <td className="py-3 px-5">{u.address}</td>
                          <td className="py-3 px-5">{statusToVietnamese(u.status)}</td>
                          <td className="py-3 px-5">
                            <button
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-lg font-semibold mr-2 shadow-sm transition"
                              onClick={() => handleAction(u.email, "ACTIVE")}
                            >
                              Duyệt
                            </button>
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg font-semibold shadow-sm transition"
                              onClick={() => handleAction(u.email, "REJECTED")}
                            >
                              Từ chối
                            </button>
                          </td>
                        </tr>
                      ))}
                      {pendingUsers.length < PAGE_SIZE &&
                        Array.from({ length: PAGE_SIZE - pendingUsers.length }).map((_, idx) => (
                          <tr key={`empty-${idx}`} className={`h-12 ${(pendingUsers.length + idx) % 2 === 1 ? 'bg-blue-50' : ''}`}>
                            <td className="py-3 px-5" colSpan={6}></td>
                          </tr>
                        ))}
                      {pendingUsers.length === 0 && !pendingLoading && (
                        <tr>
                          <td colSpan={6} className="text-center py-4">Không có nhân viên nào cần xác nhận.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* HISTORY TAB */}
            {tab === TABS.HISTORY && (
              <div className="bg-white rounded-lg shadow p-2 pb-0 flex flex-col">
                <h2 className="text-xl font-bold mb-2 text-blue-700">Lịch sử duyệt nhân viên</h2>
                {/* Search form */}
                <form className="mb-1 flex flex-wrap gap-1 items-end bg-gray-50 p-1 rounded-lg shadow-sm" onSubmit={handleHistorySearch}>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Email nhân viên</label>
                    <input
                      className="border px-3 py-2 rounded-lg text-sm focus:outline-blue-400 shadow-sm"
                      value={historySearch.userEmail}
                      onChange={e => setHistorySearch(s => ({ ...s, userEmail: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Email người duyệt</label>
                    <input
                      className="border px-3 py-2 rounded-lg text-sm focus:outline-blue-400 shadow-sm"
                      value={historySearch.approvedByEmail}
                      onChange={e => setHistorySearch(s => ({ ...s, approvedByEmail: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Trạng thái</label>
                    <select
                      className="border px-3 py-2 rounded-lg text-sm focus:outline-blue-400 shadow-sm"
                      value={historySearch.status}
                      onChange={e => setHistorySearch(s => ({ ...s, status: e.target.value }))}
                    >
                      <option value="">Tất cả</option>
                      <option value="APPROVED">Duyệt</option>
                      <option value="REJECTED">Từ chối</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Từ ngày</label>
                    <input
                      type="date"
                      className="border px-3 py-2 rounded-lg text-sm focus:outline-blue-400 shadow-sm"
                      value={historySearch.fromDate}
                      onChange={e => setHistorySearch(s => ({ ...s, fromDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Đến ngày</label>
                    <input
                      type="date"
                      className="border px-3 py-2 rounded-lg text-sm focus:outline-blue-400 shadow-sm"
                      value={historySearch.toDate}
                      onChange={e => setHistorySearch(s => ({ ...s, toDate: e.target.value }))}
                    />
                  </div>
                 
                
                </form>
                <div className="relative w-[1200px] mx-auto">
                  {historyLoading && (
                    <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-60 z-10">
                      <Spinner />
                    </div>
                  )}
                  <table className="w-[1200px] border mb-4 rounded-lg overflow-hidden shadow-sm bg-gray-50 text-sm">
                    <thead className="bg-blue-100">
                      <tr className="font-bold text-blue-900">
                        <th className="py-2 px-3">Email nhân viên</th>
                        <th className="py-2 px-3">Email người duyệt</th>
                        <th className="py-2 px-3">Trạng thái</th>
                        <th className="py-2 px-3">Ghi chú</th>
                        <th className="py-2 px-3">Thời gian</th>
                        <th className="py-2 px-3">Trạng thái cũ</th>
                        <th className="py-2 px-3">Trạng thái mới</th>
                        <th className="py-2 px-3">IP duyệt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, idx) => (
                        <tr key={idx} className={`h-12 ${idx % 2 === 1 ? 'bg-blue-50' : ''} hover:bg-blue-100 transition`}>
                          <td className="py-2 px-3">{h.userEmail}</td>
                          <td className="py-2 px-3">{h.approvedByEmail}</td>
                          <td className="py-2 px-3">{statusToVietnamese(h.status)}</td>
                          <td className="py-2 px-3">{h.note}</td>
                          <td className="py-2 px-3">{h.approvedAt ? h.approvedAt.slice(0,16).replace('T',' ') : ''}</td>
                          <td className="py-2 px-3">{statusToVietnamese(h.fromStatus)}</td>
                          <td className="py-2 px-3">{statusToVietnamese(h.toStatus)}</td>
                          <td className="py-2 px-3">{h.approvedByIp}</td>
                        </tr>
                      ))}
                      {history.length < PAGE_SIZE &&
                        Array.from({ length: PAGE_SIZE - history.length }).map((_, idx) => (
                          <tr key={`empty-history-${idx}`} className={`h-12 ${(history.length + idx) % 2 === 1 ? 'bg-blue-50' : ''}`}>
                            <td className="py-2 px-3" colSpan={8}></td>
                          </tr>
                        ))}
                      {history.length === 0 && !historyLoading && (
                        <tr>
                          <td colSpan={8} className="text-center py-4">Không có lịch sử duyệt.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Pagination luôn ở đáy màn hình khi ít data, sau bảng khi nhiều data */}
        <div className="w-full flex gap-2 items-center justify-center py-4 bg-white shadow" style={{minHeight: '64px'}}>
          {tab === TABS.PENDING && (
            <>
              <button
                className="px-3 py-1 border rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                disabled={pendingPage === 0}
                onClick={() => handlePendingPageChange(pendingPage - 1)}
              >
                {"<"}
              </button>
              <span className="font-semibold text-base">
                Trang {pendingPage + 1} / {pendingTotalPages}
              </span>
              <button
                className="px-3 py-1 border rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                disabled={pendingPage + 1 >= pendingTotalPages}
                onClick={() => handlePendingPageChange(pendingPage + 1)}
              >
                {">"}
              </button>
            </>
          )}
          {tab === TABS.HISTORY && (
            <>
              <button
                className="px-3 py-1 border rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                disabled={historyPage === 0}
                onClick={() => setHistoryPage((p) => Math.max(0, p - 1))}
              >
                {"<"}
              </button>
              <span className="font-semibold text-base">
                Trang {historyPage + 1} / {historyTotalPages}
              </span>
              <button
                className="px-3 py-1 border rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                disabled={historyPage + 1 >= historyTotalPages}
                onClick={() => setHistoryPage((p) => Math.min(historyTotalPages - 1, p + 1))}
              >
                {">"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
