"use client"

import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import SidebarStaff from "../../Components/Sidebar_Trung/SidebarStaff";
import Header from "../../Components/FormLogin_yen/Header.jsx";
import Footer from "../../Components/FormLogin_yen/Footer.jsx";

const TABS = {
  PENDING: "pending",
  HISTORY: "history",
};

const PAGE_SIZE = 6;

// Spinner component
function Spinner() {
  return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      </div>
  );
}

export default function PendingStaffManagement() {
  const [tab, setTab] = useState(TABS.PENDING);
  const navigate = useNavigate();

  // PENDING
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingSearch, setPendingSearch] = useState({
    email: "",
    fullName: "",
    gender: "",
    address: "",
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

  // Fetch pending users
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

  // Fetch history
  useEffect(() => {
    if (tab === TABS.HISTORY) {
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
    const cleanSearch = {
      ...search,
      status: search.status || null,
      fromDate: search.fromDate ? search.fromDate + "T00:00:00" : null,
      toDate: search.toDate ? search.toDate + "T23:59:59.999" : null,
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
          { newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingUsers(0);
    } catch (e) {
      alert("Có lỗi xảy ra!");
    }
  };

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
    setPendingSearch({ email: "", fullName: "", gender: "", address: "" });
    fetchPendingUsers(0);
  };

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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="flex min-h-screen">
          <SidebarStaff />
          <div className="flex-1 min-h-screen">
            <Header />
            <main className="flex-grow pt-20 bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-blue-100 m-4 p-4 pb-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex gap-4">
                    <button
                        className={`px-5 py-2 rounded-2xl font-bold shadow-xl border-2 border-blue-300 text-base transition-all duration-300 transform hover:scale-105 ${
                            tab === TABS.PENDING
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                                : "bg-white text-blue-800 hover:bg-blue-100"
                        }`}
                        onClick={() => setTab(TABS.PENDING)}
                    >
                      Nhân viên chờ xác nhận
                    </button>
                    <button
                        className={`px-5 py-2 rounded-2xl font-bold shadow-xl border-2 border-blue-300 text-base transition-all duration-300 transform hover:scale-105 ${
                            tab === TABS.HISTORY
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                                : "bg-white text-blue-800 hover:bg-blue-100"
                        }`}
                        onClick={() => setTab(TABS.HISTORY)}
                    >
                      Lịch sử duyệt
                    </button>
                  </div>
                  <button
                      className="px-6 py-2 rounded-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-xl border-2 border-blue-300 transition-all duration-300 transform hover:scale-105"
                      onClick={() => navigate("/manager-dashboard")}
                  >
                    Về trang quản lý
                  </button>
                </div>

                {/* PENDING TAB */}
                {tab === TABS.PENDING && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 flex flex-col border-2 border-blue-100">
                      <h2 className="text-xl font-bold mb-6 text-blue-900 flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-blue-600" />
                        Danh sách nhân viên chờ xác nhận
                      </h2>
                      {/* Search form for pending users */}
                      <form
                          className="mb-6 flex flex-wrap gap-4 items-end bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-xl border-2 border-blue-100"
                          onSubmit={handlePendingSearch}
                      >
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-blue-700">Email</label>
                          <input
                              className="border-2 border-blue-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
                              value={pendingSearch.email}
                              onChange={(e) => setPendingSearch((s) => ({ ...s, email: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-blue-700">Tên</label>
                          <input
                              className="border-2 border-blue-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
                              value={pendingSearch.fullName}
                              onChange={(e) => setPendingSearch((s) => ({ ...s, fullName: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-blue-700">Giới tính</label>
                          <select
                              className="border-2 border-blue-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
                              value={pendingSearch.gender}
                              onChange={(e) => setPendingSearch((s) => ({ ...s, gender: e.target.value }))}
                          >
                            <option value="">Tất cả</option>
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-blue-700">Địa chỉ</label>
                          <input
                              className="border-2 border-blue-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
                              value={pendingSearch.address}
                              onChange={(e) => setPendingSearch((s) => ({ ...s, address: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                              type="submit"
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
                          >
                            Tìm kiếm
                          </button>
                          <button
                              type="button"
                              className="px-4 py-2 bg-white text-blue-800 rounded-2xl font-semibold shadow-xl border-2 border-blue-300 hover:bg-blue-100 transition-all duration-300 transform hover:scale-105"
                              onClick={handleResetPendingSearch}
                          >
                            Đặt lại
                          </button>
                        </div>
                      </form>
                      <div className="relative">
                        {pendingLoading && (
                            <div className="absolute inset-0 flex justify-center items-center bg-white/60 backdrop-blur-sm z-10">
                              <Spinner />
                            </div>
                        )}
                        <table className="w-full border-2 border-blue-100 rounded-2xl overflow-hidden shadow-xl bg-white/80 backdrop-blur-sm text-sm">
                          <thead className="bg-gradient-to-r from-blue-100 to-blue-50">
                          <tr className="font-bold text-blue-900">
                            <th className="py-4 px-6">Email</th>
                            <th className="py-4 px-6">Tên</th>
                            <th className="py-4 px-6">Giới tính</th>
                            <th className="py-4 px-6">Địa chỉ</th>
                            <th className="py-4 px-6">Trạng thái</th>
                            <th className="py-4 px-6">Hành động</th>
                          </tr>
                          </thead>
                          <tbody>
                          {pendingUsers.map((u, idx) => (
                              <tr
                                  key={u.email}
                                  className={`h-12 ${idx % 2 === 1 ? "bg-blue-50" : ""} hover:bg-blue-50/50 transition-colors duration-200`}
                              >
                                <td className="py-4 px-6">{u.email}</td>
                                <td className="py-4 px-6">{u.fullName}</td>
                                <td className="py-4 px-6">{u.gender}</td>
                                <td className="py-4 px-6">{u.address}</td>
                                <td className="py-4 px-6">{statusToVietnamese(u.status)}</td>
                                <td className="py-4 px-6 flex gap-2">
                                  <button
                                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-2xl font-semibold shadow-xl transition-all duration-300 transform hover:scale-105"
                                      onClick={() => handleAction(u.email, "ACTIVE")}
                                  >
                                    <CheckCircle className="w-4 h-4 inline mr-1" /> Duyệt
                                  </button>
                                  <button
                                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-2xl font-semibold shadow-xl transition-all duration-300 transform hover:scale-105"
                                      onClick={() => handleAction(u.email, "REJECTED")}
                                  >
                                    <XCircle className="w-4 h-4 inline mr-1" /> Từ chối
                                  </button>
                                </td>
                              </tr>
                          ))}
                          {pendingUsers.length < PAGE_SIZE &&
                              Array.from({ length: PAGE_SIZE - pendingUsers.length }).map((_, idx) => (
                                  <tr
                                      key={`empty-${idx}`}
                                      className={`h-12 ${idx % 2 === 1 ? "bg-blue-50" : ""}`}
                                  >
                                    <td className="py-4 px-6" colSpan={6}></td>
                                  </tr>
                              ))}
                          {pendingUsers.length === 0 && !pendingLoading && (
                              <tr>
                                <td colSpan={6} className="text-center py-4 text-blue-700">
                                  Không có nhân viên nào cần xác nhận.
                                </td>
                              </tr>
                          )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                )}

                {/* HISTORY TAB */}
                {tab === TABS.HISTORY && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 flex flex-col border-2 border-blue-100">
                      <h2 className="text-xl font-bold mb-6 text-blue-900 flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-blue-600" />
                        Lịch sử duyệt nhân viên
                      </h2>
                      {/* Search form */}
                      <form
                          className="mb-6 flex flex-wrap gap-4 items-end bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-xl border-2 border-blue-100"
                          onSubmit={handleHistorySearch}
                      >
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-blue-700">Email nhân viên</label>
                          <input
                              className="border-2 border-blue-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
                              value={historySearch.userEmail}
                              onChange={(e) => setHistorySearch((s) => ({ ...s, userEmail: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-blue-700">Email người duyệt</label>
                          <input
                              className="border-2 border-blue-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
                              value={historySearch.approvedByEmail}
                              onChange={(e) => setHistorySearch((s) => ({ ...s, approvedByEmail: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-blue-700">Trạng thái</label>
                          <select
                              className="border-2 border-blue-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
                              value={historySearch.status}
                              onChange={(e) => setHistorySearch((s) => ({ ...s, status: e.target.value }))}
                          >
                            <option value="">Tất cả</option>
                            <option value="APPROVED">Duyệt</option>
                            <option value="REJECTED">Từ chối</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-blue-700">Từ ngày</label>
                          <input
                              type="date"
                              className="border-2 border-blue-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
                              value={historySearch.fromDate}
                              onChange={(e) => setHistorySearch((s) => ({ ...s, fromDate: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-blue-700">Đến ngày</label>
                          <input
                              type="date"
                              className="border-2 border-blue-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
                              value={historySearch.toDate}
                              onChange={(e) => setHistorySearch((s) => ({ ...s, toDate: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                              type="submit"
                              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
                          >
                            Tìm kiếm
                          </button>
                          <button
                              type="button"
                              className="px-4 py-2 bg-white text-blue-800 rounded-2xl font-semibold shadow-xl border-2 border-blue-300 hover:bg-blue-100 transition-all duration-300 transform hover:scale-105"
                              onClick={handleResetHistorySearch}
                          >
                            Đặt lại
                          </button>
                        </div>
                      </form>
                      <div className="relative">
                        {historyLoading && (
                            <div className="absolute inset-0 flex justify-center items-center bg-white/60 backdrop-blur-sm z-10">
                              <Spinner />
                            </div>
                        )}
                        <table className="w-full border-2 border-blue-100 rounded-2xl overflow-hidden shadow-xl bg-white/80 backdrop-blur-sm text-sm">
                          <thead className="bg-gradient-to-r from-blue-100 to-blue-50">
                          <tr className="font-bold text-blue-900">
                            <th className="py-4 px-6">Email nhân viên</th>
                            <th className="py-4 px-6">Email người duyệt</th>
                            <th className="py-4 px-6">Trạng thái</th>
                            <th className="py-4 px-6">Ghi chú</th>
                            <th className="py-4 px-6">Thời gian</th>
                            <th className="py-4 px-6">Trạng thái cũ</th>
                            <th className="py-4 px-6">Trạng thái mới</th>
                            <th className="py-4 px-6">IP duyệt</th>
                          </tr>
                          </thead>
                          <tbody>
                          {history.map((h, idx) => (
                              <tr
                                  key={idx}
                                  className={`h-12 ${idx % 2 === 1 ? "bg-blue-50" : ""} hover:bg-blue-50/50 transition-colors duration-200`}
                              >
                                <td className="py-4 px-6">{h.userEmail}</td>
                                <td className="py-4 px-6">{h.approvedByEmail}</td>
                                <td className="py-4 px-6">{statusToVietnamese(h.status)}</td>
                                <td className="py-4 px-6">{h.note}</td>
                                <td className="py-4 px-6">{h.approvedAt ? h.approvedAt.slice(0, 16).replace("T", " ") : ""}</td>
                                <td className="py-4 px-6">{statusToVietnamese(h.fromStatus)}</td>
                                <td className="py-4 px-6">{statusToVietnamese(h.toStatus)}</td>
                                <td className="py-4 px-6">{h.approvedByIp}</td>
                              </tr>
                          ))}
                          {history.length < PAGE_SIZE &&
                              Array.from({ length: PAGE_SIZE - history.length }).map((_, idx) => (
                                  <tr
                                      key={`empty-history-${idx}`}
                                      className={`h-12 ${idx % 2 === 1 ? "bg-blue-50" : ""}`}
                                  >
                                    <td className="py-4 px-6" colSpan={8}></td>
                                  </tr>
                              ))}
                          {history.length === 0 && !historyLoading && (
                              <tr>
                                <td colSpan={8} className="text-center py-4 text-blue-700">
                                  Không có lịch sử duyệt.
                                </td>
                              </tr>
                          )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                )}

                {/* Pagination */}
                <div className="w-full flex gap-4 items-center justify-center py-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-blue-100 mt-8">
                  {tab === TABS.PENDING && (
                      <>
                        <button
                            className="px-4 py-2 border-2 border-blue-300 rounded-2xl bg-white text-blue-800 font-semibold shadow-xl hover:bg-blue-100 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={pendingPage === 0}
                            onClick={() => handlePendingPageChange(pendingPage - 1)}
                        >
                          {"<"}
                        </button>
                        <span className="font-semibold text-base text-blue-900">
                      Trang {pendingPage + 1} / {pendingTotalPages}
                    </span>
                        <button
                            className="px-4 py-2 border-2 border-blue-300 rounded-2xl bg-white text-blue-800 font-semibold shadow-xl hover:bg-blue-100 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className="px-4 py-2 border-2 border-blue-300 rounded-2xl bg-white text-blue-800 font-semibold shadow-xl hover:bg-blue-100 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={historyPage === 0}
                            onClick={() => setHistoryPage((p) => Math.max(0, p - 1))}
                        >
                          {"<"}
                        </button>
                        <span className="font-semibold text-base text-blue-900">
                      Trang {historyPage + 1} / {historyTotalPages}
                    </span>
                        <button
                            className="px-4 py-2 border-2 border-blue-300 rounded-2xl bg-white text-blue-800 font-semibold shadow-xl hover:bg-blue-100 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={historyPage + 1 >= historyTotalPages}
                            onClick={() => setHistoryPage((p) => Math.min(historyTotalPages - 1, p + 1))}
                        >
                          {">"}
                        </button>
                      </>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
        <footer className="w-full">
          <Footer />
        </footer>
      </div>
  );
}