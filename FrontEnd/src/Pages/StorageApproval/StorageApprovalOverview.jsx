import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../utils/axiosInstance";
import SidebarStorageApproval from "./SidebarStorageApproval";
import { BarChart3, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, LineChart, Line, Legend
} from "recharts";

const COLORS = ["#F59E0B", "#10B981", "#EF4444", "#3B82F6"];

export default function StorageApprovalOverview() {
  const [pendingUnits, setPendingUnits] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const pendingRes = await axiosInstance.get("/api/storage-unit-approvals/pending?page=0&size=1000");
        setPendingUnits(pendingRes.data?.content || []);
        const historyRes = await axiosInstance.get("/api/storage-unit-approvals/history/all-paged?page=0&size=1000");
        setHistory(historyRes.data?.content || []);
      } catch (e) {
        setError("Lỗi tải dữ liệu: " + (e.message || ""));
        setPendingUnits([]); setHistory([]);
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  // Cards
  const totalPending = pendingUnits.length;
  const totalApproved = history.filter(h => h.status === "APPROVED").length;
  const totalRejected = history.filter(h => h.status === "REJECTED").length;
  const totalProcessed = history.length;

  // Pie chart data
  const statusChartData = [
    { name: "Chờ duyệt", value: totalPending, color: COLORS[0] },
    { name: "Đã duyệt", value: totalApproved, color: COLORS[1] },
    { name: "Từ chối", value: totalRejected, color: COLORS[2] },
  ];

  // Bar chart tổng quan
  const overviewBarData = [
    { name: "Chờ duyệt", value: totalPending },
    { name: "Đã duyệt", value: totalApproved },
    { name: "Từ chối", value: totalRejected },
    { name: "Đã xử lý", value: totalProcessed },
  ];

  // Area chart lịch sử theo ngày
  const historyByDay = useMemo(() => {
    const map = {};
    history.forEach(h => {
      if (!h.processedAt) return;
      const d = h.processedAt.slice(0, 10);
      if (!map[d]) map[d] = { date: d, approved: 0, rejected: 0 };
      if (h.status === "APPROVED") map[d].approved++;
      if (h.status === "REJECTED") map[d].rejected++;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [history]);

  // Weekly activity (fake grouping by week for demo)
  const weeklyActivity = useMemo(() => {
    const map = {};
    history.forEach(h => {
      if (!h.processedAt) return;
      const d = new Date(h.processedAt);
      const week = `${d.getFullYear()}-W${Math.ceil((d.getDate() + 6 - d.getDay()) / 7)}`;
      if (!map[week]) map[week] = { week, approvals: 0, rejections: 0, pending: 0 };
      if (h.status === "APPROVED") map[week].approvals++;
      if (h.status === "REJECTED") map[week].rejections++;
    });
    // Add pending for current week
    if (pendingUnits.length > 0) {
      const now = new Date();
      const week = `${now.getFullYear()}-W${Math.ceil((now.getDate() + 6 - now.getDay()) / 7)}`;
      if (!map[week]) map[week] = { week, approvals: 0, rejections: 0, pending: 0 };
      map[week].pending = pendingUnits.length;
    }
    return Object.values(map).sort((a, b) => a.week.localeCompare(b.week));
  }, [history, pendingUnits]);

  // Approval trends (30 ngày gần nhất)
  const approvalTrends = useMemo(() => {
    const map = {};
    history.forEach(h => {
      if (!h.processedAt) return;
      const d = h.processedAt.slice(0, 10);
      if (!map[d]) map[d] = { date: d, approvals: 0, rejections: 0 };
      if (h.status === "APPROVED") map[d].approvals++;
      if (h.status === "REJECTED") map[d].rejections++;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  }, [history]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-2xl border border-blue-200">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-blue-700 text-xl font-semibold">Đang tải dữ liệu dashboard...</p>
          <p className="mt-2 text-blue-500">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md shadow-2xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-red-800">Lỗi tải dữ liệu</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
      <SidebarStorageApproval overview={{ totalPending, totalApproved, totalRejected, totalProcessed }} />
      <div className="ml-72 flex-1 p-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cards thống kê */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-bold text-blue-700 uppercase tracking-wider">Chờ duyệt</p>
                  <p className="text-3xl font-bold text-blue-900">{totalPending}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-bold text-blue-700 uppercase tracking-wider">Đã duyệt</p>
                  <p className="text-3xl font-bold text-blue-900">{totalApproved}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <XCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-bold text-blue-700 uppercase tracking-wider">Từ chối</p>
                  <p className="text-3xl font-bold text-blue-900">{totalRejected}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-bold text-blue-700 uppercase tracking-wider">Đã xử lý</p>
                  <p className="text-3xl font-bold text-blue-900">{totalProcessed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Biểu đồ phân bố trạng thái */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-blue-100">
              <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Phân bố trạng thái
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={statusChartData.length ? statusChartData : [{ name: 'Không có dữ liệu', value: 0 }]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#3B82F6"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ReTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-blue-100">
              <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Tổng quan kho lưu trữ
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={overviewBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#374151" />
                  <YAxis stroke="#374151" />
                  <ReTooltip />
                  <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Biểu đồ vùng lịch sử theo ngày */}
          {historyByDay.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12 border-2 border-blue-100">
              <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Lịch sử xử lý theo ngày
              </h3>
              <ResponsiveContainer width="100%" height={450}>
                <AreaChart data={historyByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#374151" />
                  <YAxis stroke="#374151" />
                  <ReTooltip />
                  <Area type="monotone" dataKey="approved" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Đã duyệt" />
                  <Area type="monotone" dataKey="rejected" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Từ chối" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Biểu đồ đường hoạt động theo tuần */}
          {weeklyActivity.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12 border-2 border-blue-100">
              <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Hoạt động theo tuần
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="week" stroke="#374151" />
                  <YAxis stroke="#374151" />
                  <ReTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="approvals" stroke="#10B981" strokeWidth={3} name="Duyệt" />
                  <Line type="monotone" dataKey="rejections" stroke="#EF4444" strokeWidth={3} name="Từ chối" />
                  <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={3} name="Chờ duyệt" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Biểu đồ đường xu hướng duyệt */}
          {approvalTrends.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12 border-2 border-blue-100">
              <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Xu hướng duyệt (30 ngày gần nhất)
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={approvalTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#374151" />
                  <YAxis stroke="#374151" />
                  <ReTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="approvals" stroke="#10B981" strokeWidth={3} name="Duyệt" />
                  <Line type="monotone" dataKey="rejections" stroke="#EF4444" strokeWidth={3} name="Từ chối" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bảng chi tiết lịch sử xử lý */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12 border-2 border-blue-100">
            <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Bảng chi tiết lịch sử xử lý
            </h3>
            <div className="overflow-x-auto rounded-lg border border-blue-100 bg-blue-50">
              <table className="min-w-full text-sm">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Tên kho</th>
                    <th className="px-3 py-2 text-left">Trạng thái</th>
                    <th className="px-3 py-2 text-left">Thời gian xử lý</th>
                    <th className="px-3 py-2 text-left">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 50).map((h, i) => (
                    <tr key={h.approvalId || i} className="even:bg-blue-50">
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">{h.storageUnitName || "-"}</td>
                      <td className="px-3 py-2">{h.status}</td>
                      <td className="px-3 py-2">{h.processedAt ? h.processedAt.slice(0, 16).replace('T', ' ') : ""}</td>
                      <td className="px-3 py-2">{h.managerNote || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}