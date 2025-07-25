import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import SidebarStorageApproval from "./SidebarStorageApproval";
import { Warehouse, X} from "lucide-react";
import Header from '../../Components/FormLogin_yen/Header.jsx';
import Footer from "../../Components/FormLogin_yen/Footer.jsx";

const TABS = { PENDING: "pending", HISTORY: "history" };
const PAGE_SIZE = 6;

function DetailsModal({ unit, onClose }) {
  if (!unit) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full relative transform transition-all animate-fade-in-down">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-blue-800 mb-6 border-b pb-3">
          Chi tiết yêu cầu duyệt kho
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-600">Tên kho:</p>
            <p className="text-lg text-gray-900">{unit.storageUnitName}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Người gửi yêu cầu:</p>
            <p className="text-lg text-gray-900">{unit.senderEmail}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Địa chỉ:</p>
            <p className="text-lg text-gray-900">{unit.address || "Chưa có thông tin"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Số điện thoại:</p>
            <p className="text-lg text-gray-900">{unit.phone || "Chưa có thông tin"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Số lượng ô chứa:</p>
            <p className="text-lg text-gray-900">{unit.slotCount || 0}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-gray-600 mb-2">Ảnh minh họa:</p>
            {unit.imageUrl ? (
              <img
                src={unit.image}
                alt={unit.storageUnitName}
                className="w-full h-48 object-cover rounded-md border"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-md border">
                <p className="text-gray-500">Không có ảnh</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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

  // Add missing state for modal and selected unit at the top of the component
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

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
  const handleAction = async (approvalId, newStatus, note = null) => {
      try {
          const requestBody = {
              status: newStatus === "APPROVED" ? "APPROVED" : "REJECTED",
              managerNote: note || ""
          };
          if (newStatus === "APPROVED") {
              await axiosInstance.post(
                  `/api/storage-unit-approvals/${approvalId}/approve`,
                  requestBody,
                  { headers: { Authorization: `Bearer ${token}` } }
              );
          } else if (newStatus === "REJECTED") {
              await axiosInstance.post(
                  `/api/storage-unit-approvals/${approvalId}/reject`,
                  requestBody,
                  { headers: { Authorization: `Bearer ${token}` } }
              );
          }
          fetchPendingUnits(0);
          setIsModalOpen(false);

    } catch {
      alert("Có lỗi xảy ra khi xử lý duyệt kho!");
    }
  };
  const handleRejectClick = (approvalId) => {
    const reason = window.prompt("Vui lòng nhập lý do từ chối:");
    // Nếu người dùng nhấn Cancel, reason sẽ là null
    if (reason !== null) {
      handleAction(approvalId, "REJECTED", reason);
    }
  };
  const handleApproveClick = (approvalId) => {
    const reason = window.prompt("Bạn có muốn thêm ghi chú cho lần duyệt này không? (Có thể bỏ trống)");
    // Nếu người dùng nhấn Cancel, reason sẽ là null. Chúng ta vẫn tiếp tục nếu họ nhấn OK (kể cả khi không nhập gì).
    if (reason !== null) {
      handleAction(approvalId, "APPROVED", reason);
    }
  };

//   Hàm để mở modal
    const handleViewDetails = (unit) => {
      setSelectedUnit(unit);
      setIsModalOpen(true);
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

  // Handler for sidebar home button
  const handleBackToHome = () => {
    navigate("/manager-dashboard");
  };
  // Handler for sidebar logout button
  const handleLogout = () => {
    Cookies.remove("authToken");
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <SidebarStorageApproval
          overview={{
            totalPending,
            totalApproved,
            totalRejected,
            totalProcessed
          }}
          onBackToHome={handleBackToHome}
          onLogout={handleLogout}
        />
        <main className="flex-1 ml-64 pt-20 pb-16 px-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-8">
            Quản Lý Kho Lưu Trữ
          </h1>
          <div className="flex flex-col items-center justify-start">
            <div className="p-4 w-full max-w-full">
              {/* Tabs and return button in one row */}
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
                {/*<button*/}
                {/*  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"*/}
                {/*  onClick={() => navigate('/manager')}*/}
                {/*>*/}
                {/*  Quay về trang quản lý*/}
                {/*</button>*/}
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
                              <td className="py-3 px-5 flex items-center justify-start gap-2">
                                <button
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg font-semibold shadow-sm transition"
                                  onClick={() => handleViewDetails(unit)}
                                >
                                  Xem
                                </button>
                                <button
                                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-lg font-semibold mr-2 shadow-sm transition"
                                  onClick={() => handleApproveClick(unit.approvalId)}
                                >
                                  Duyệt
                                </button>
                                <button
                                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg font-semibold shadow-sm transition"
                                  onClick={() => handleRejectClick(unit.approvalId)}
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
          {/* Pagination - Manager_Yen style */}
          <div className="w-full flex justify-center items-center gap-3 py-6">
            {tab === TABS.PENDING && pendingTotalPages > 1 && (
              <>
                <button
                  onClick={() => fetchPendingUnits(pendingPage - 1)}
                  disabled={pendingPage === 0}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${pendingPage === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'}`}
                  title="Trang trước"
                >
                  Trước
                </button>
                {Array.from({ length: pendingTotalPages }, (_, i) => i).map(page => (
                  <button
                    key={page}
                    onClick={() => fetchPendingUnits(page)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${pendingPage === page ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    title={`Trang ${page + 1}`}
                  >
                    {page + 1}
                  </button>
                ))}
                <button
                  onClick={() => fetchPendingUnits(pendingPage + 1)}
                  disabled={pendingPage + 1 >= pendingTotalPages}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${pendingPage + 1 >= pendingTotalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'}`}
                  title="Trang sau"
                >
                  Sau
                </button>
                <span className="text-sm text-gray-600 font-medium ml-2">
                  Trang {pendingPage + 1} / {pendingTotalPages}
                </span>
              </>
            )}
            {tab === TABS.HISTORY && historyTotalPages > 1 && (
              <>
                <button
                  onClick={() => setHistoryPage(p => Math.max(0, p - 1))}
                  disabled={historyPage === 0}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${historyPage === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'}`}
                  title="Trang trước"
                >
                  Trước
                </button>
                {Array.from({ length: historyTotalPages }, (_, i) => i).map(page => (
                  <button
                    key={page}
                    onClick={() => setHistoryPage(page)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${historyPage === page ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    title={`Trang ${page + 1}`}
                  >
                    {page + 1}
                  </button>
                ))}
                <button
                  onClick={() => setHistoryPage(p => Math.min(historyTotalPages - 1, p + 1))}
                  disabled={historyPage + 1 >= historyTotalPages}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${historyPage + 1 >= historyTotalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'}`}
                  title="Trang sau"
                >
                  Sau
                </button>
                <span className="text-sm text-gray-600 font-medium ml-2">
                  Trang {historyPage + 1} / {historyTotalPages}
                </span>
              </>
            )}
          </div>
          {/* Render modal nếu isModalOpen là true */}
          {isModalOpen && (
            <DetailsModal unit={selectedUnit} onClose={() => setIsModalOpen(false)} />
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
