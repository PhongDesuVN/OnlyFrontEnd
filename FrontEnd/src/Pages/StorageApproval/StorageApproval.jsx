import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import SidebarStorageApproval from "./SidebarStorageApproval";
import { Warehouse } from "lucide-react";

const TABS = { PENDING: "pending", HISTORY: "history" };
const PAGE_SIZE = 6;

function Spinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default function StorageUnitApprovalManager({ storageUnitId }) {
  const [tab, setTab] = useState(TABS.PENDING);
  const navigate = useNavigate();

  // Pending
  const [pendingUnits, setPendingUnits] = useState([]);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [pendingLoading, setPendingLoading] = useState(false);

  // History
  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);

  const token = Cookies.get("authToken");

  // Tổng quan cho sidebar
  const totalPending = pendingUnits.length;
  const totalApproved = history.filter(h => h.status === "APPROVED").length;
  const totalRejected = history.filter(h => h.status === "REJECTED").length;
  const totalProcessed = history.length;

  // Fetch pending units
  useEffect(() => {
    if (tab === TABS.PENDING) fetchPendingUnits(0);
  }, [tab]);

  // Fetch history
  useEffect(() => {
    if (tab === TABS.HISTORY) fetchHistory(historyPage);
  }, [tab, historyPage]);

  // API: GET /api/storage-unit-approvals/pending
  const fetchPendingUnits = async (page = 0) => {
    setPendingLoading(true);
    try {
      const res = await axiosInstance.get(
        `/api/storage-unit-approvals/pending?page=${page}&size=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingUnits(res.data?.content || []);
      setPendingTotalPages(res.data?.totalPages || 1);
      setPendingPage(page);
    } catch {
      setPendingUnits([]);
      setPendingTotalPages(1);
    }
    setPendingLoading(false);
  };

  // API: GET /api/storage-unit-approvals/history/all-paged
  const fetchHistory = async (page = 0) => {
    setHistoryLoading(true);
    try {
      const res = await axiosInstance.get(
        `/api/storage-unit-approvals/history/all-paged?page=${page}&size=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory(res.data?.content || []);
      setHistoryTotalPages(res.data?.totalPages || 1);
      setHistoryPage(page);
    } catch {
      setHistory([]);
      setHistoryTotalPages(1);
    }
    setHistoryLoading(false);
  };

  // API: POST approve/reject
  const handleAction = async (approvalId, newStatus) => {
    try {
      if (newStatus === "APPROVED") {
        await axiosInstance.post(
          `/api/storage-unit-approvals/${approvalId}/approve`,
          null,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (newStatus === "REJECTED") {
        await axiosInstance.post(
          `/api/storage-unit-approvals/${approvalId}/reject`,
          null,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchPendingUnits(0);
    } catch {
      alert("Có lỗi xảy ra khi xử lý duyệt kho!");
    }
  };

  const statusToVietnamese = (status) => {
    switch (status) {
      case "PENDING":
      case "PENDING_APPROVAL":
        return "Chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Từ chối";
      case "ACTIVE":
        return "Đang hoạt động";
      case "INACTIVE":
        return "Ngưng hoạt động";
      default:
        return status;
    }
  };

  return (
    <div className="flex min-h-screen bg-blue-50">
      <SidebarStorageApproval
        overview={{
          totalPending,
          totalApproved,
          totalRejected,
          totalProcessed
        }}
      />
      <div className="ml-72 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-start">
          <div className="p-4 w-full max-w-full">
            {/* Header giống bên quản lý vận chuyển */}
            <header className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-lg flex justify-between items-center shadow-md mb-8">
              <div className="flex items-center gap-3">
                <Warehouse size={24} className="text-blue-600" />
                <span className="font-semibold text-blue-900 text-xl">Quản Lý Kho Lưu Trữ</span>
              </div>
              <span className="text-sm text-blue-700">Hệ thống quản lý kho</span>
            </header>
            {/* Header with 3 tabs */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex gap-4">
                <button
                  className={`px-5 py-2 rounded-lg font-bold shadow-sm transition text-base ${
                    tab === TABS.PENDING ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-blue-100"
                  }`}
                  onClick={() => setTab(TABS.PENDING)}
                >
                  Kho chờ duyệt
                </button>
                <button
                  className={`px-5 py-2 rounded-lg font-bold shadow-sm transition text-base ${
                    tab === TABS.HISTORY ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-blue-100"
                  }`}
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

            {/* Pending Tab */}
            {tab === TABS.PENDING && (
              <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                <h2 className="text-xl font-bold mb-2 text-blue-700">Danh sách kho chờ duyệt</h2>
                {pendingLoading ? (
                  <Spinner />
                ) : (
                  <table className="w-full border mb-0 rounded-lg overflow-hidden shadow-sm bg-gray-50 text-sm">
                    <thead className="bg-blue-100">
                      <tr className="font-bold text-blue-900">
                        <th className="py-3 px-5">Tên kho</th>
                        <th className="py-3 px-5">Email người gửi</th>
                        <th className="py-3 px-5">Trạng thái</th>
                        <th className="py-3 px-5">Ghi chú</th>
                        <th className="py-3 px-5">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingUnits.length > 0 ? (
                        pendingUnits.map((unit, idx) => (
                          <tr
                            key={unit.approvalId}
                            className={`${idx % 2 === 1 ? "bg-blue-50" : ""} hover:bg-blue-100 transition`}
                          >
                            <td className="py-3 px-5">{unit.storageUnitName}</td>
                            <td className="py-3 px-5">{unit.senderEmail}</td>
                            <td className="py-3 px-5">{statusToVietnamese(unit.status)}</td>
                            <td className="py-3 px-5">{unit.managerNote || "-"}</td>
                            <td className="py-3 px-5">
                              <button
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-lg font-semibold mr-2 shadow-sm transition"
                                onClick={() => handleAction(unit.approvalId, "APPROVED")}
                              >
                                Duyệt
                              </button>
                              <button
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg font-semibold shadow-sm transition"
                                onClick={() => handleAction(unit.approvalId, "REJECTED")}
                              >
                                Từ chối
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-4">
                            Không có kho chờ duyệt.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* History Tab */}
            {tab === TABS.HISTORY && (
              <div className="bg-white rounded-lg shadow p-2 pb-0 flex flex-col">
                <h2 className="text-xl font-bold mb-2 text-blue-700">Lịch sử duyệt kho</h2>
                {historyLoading ? (
                  <Spinner />
                ) : (
                  <table className="w-full border mb-4 rounded-lg overflow-hidden shadow-sm bg-gray-50 text-sm">
                    <thead className="bg-blue-100">
                      <tr className="font-bold text-blue-900">
                        <th className="py-2 px-3">Tên kho</th>
                        <th className="py-2 px-3">Email người gửi</th>
                        <th className="py-2 px-3">Email người duyệt</th>
                        <th className="py-2 px-3">Trạng thái</th>
                        <th className="py-2 px-3">Ghi chú</th>
                        <th className="py-2 px-3">Thời gian duyệt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.length > 0 ? (
                        history.map((h, idx) => (
                          <tr
                            key={idx}
                            className={`${idx % 2 === 1 ? "bg-blue-50" : ""} hover:bg-blue-100 transition`}
                          >
                            <td className="py-2 px-3">{h.storageUnitName}</td>
                            <td className="py-2 px-3">{h.senderEmail}</td>
                            <td className="py-2 px-3">{h.approvedByManagerEmail || "-"}</td>
                            <td className="py-2 px-3">{statusToVietnamese(h.status)}</td>
                            <td className="py-2 px-3">{h.managerNote || "-"}</td>
                            <td className="py-2 px-3">{h.processedAt ? h.processedAt.slice(0,16).replace('T',' ') : ""}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-4">
                            Không có lịch sử duyệt kho.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="w-full flex gap-2 items-center justify-center py-4 bg-white shadow" style={{ minHeight: "64px" }}>
          {tab === TABS.PENDING && (
            <>
              <button
                className="px-3 py-1 border rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                disabled={pendingPage === 0}
                onClick={() => fetchPendingUnits(pendingPage - 1)}
              >
                {"<"}
              </button>
              <span className="font-semibold text-base">
                Trang {pendingPage + 1} / {pendingTotalPages}
              </span>
              <button
                className="px-3 py-1 border rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                disabled={pendingPage + 1 >= pendingTotalPages}
                onClick={() => fetchPendingUnits(pendingPage + 1)}
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
                onClick={() => setHistoryPage(p => Math.max(0, p - 1))}
              >
                {"<"}
              </button>
              <span className="font-semibold text-base">
                Trang {historyPage + 1} / {historyTotalPages}
              </span>
              <button
                className="px-3 py-1 border rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                disabled={historyPage + 1 >= historyTotalPages}
                onClick={() => setHistoryPage(p => Math.min(historyTotalPages - 1, p + 1))}
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
