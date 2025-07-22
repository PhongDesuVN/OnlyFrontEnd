"use client"
import Header from '../../Components/FormLogin_yen/Header.jsx';
import Footer from '../../Components/FormLogin_yen/Footer.jsx';
import Sidebar from '../../Components/Sidebar_Trung/Sidebar.jsx'; // Đã cập nhật đường dẫn tới Sidebar của bạn
import { API_BASE_URL } from "../../utils/api";

import { useState, useEffect, useMemo } from "react"
import { Search, Eye, Pencil, Check, X, Filter, RefreshCw } from "lucide-react"
import Cookies from "js-cookie"

export default function TransportUnitManagement() {
    const apiRoot = API_BASE_URL + "/api";
    const pageSize = 9
    const [showEdit, setShowEdit] = useState(false)
    const [form, setForm] = useState({
        nameCompany: "",
        namePersonContact: "",
        phone: "",
        licensePlate: "",
        status: "ACTIVE",
        note: "",
        numberOfVehicles: 0,
        capacityPerVehicle: 0,
        availabilityStatus: "AVAILABLE",
    })

    /* ───── STATE ───── */
    const [allUnits, setAllUnits] = useState([])
    const [units, setUnits] = useState([])

    const [searchKeyword, setSearchKeyword] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    /* modal */
    const [showDetail, setShowDetail] = useState(false)
    const [approval, setApproval] = useState(null)
    const [selectedUnit, setSelectedUnit] = useState(null)
    const [managerNote, setManagerNote] = useState("") // Đã sửa lỗi thiếu useState()
    const openEditModal = async (unit) => {
        try {
            const res = await fetch(`${apiRoot}/transport-units/${unit.transportId}`, authHeader)
            if (!res.ok) throw new Error("Không thể lấy thông tin từ máy chủ")

            const data = await res.json()

            setSelectedUnit(data)
            setForm({
                nameCompany: data.nameCompany,
                namePersonContact: data.namePersonContact,
                phone: data.phone,
                licensePlate: data.licensePlate,
                status: data.status,
                note: data.note ?? "",
                numberOfVehicles: data.numberOfVehicles ?? 0,
                capacityPerVehicle: data.capacityPerVehicle ?? 0,
                availabilityStatus: data.availabilityStatus ?? "AVAILABLE",
            })
            setShowEdit(true)
        } catch (e) {
            alert(e.message || "Đã xảy ra lỗi khi tải thông tin đơn vị vận chuyển")
        }
    }


    const authHeader = { headers: { Authorization: `Bearer ${Cookies.get("authToken")}` } }

    /* ───── FETCH LIST ───── */
    const fetchUnits = async () => {
        try {
            setLoading(true)
            const res = await fetch(`${apiRoot}/transport-units?page=0&size=1000`, authHeader)
            if (!res.ok) throw new Error()
            const data = await res.json()
            setAllUnits(Array.isArray(data) ? data : (data.content ?? []))
            setError("")
        } catch {
            setError("Không thể tải dữ liệu.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUnits()
    }, [])
    const handleUpdate = async () => {
        try {
            const res = await fetch(`${apiRoot}/transport-units/update/${selectedUnit.transportId}`, {
                method: "PUT",
                ...authHeader,
                headers: { ...authHeader.headers, "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })
            if (!res.ok) throw new Error("Bạn phải để trang thái hoạt động để chỉnh sửa")
            await fetchUnits() // load lại danh sách
            setShowEdit(false) // đóng modal
        } catch (e) {
            alert(e.message)
        }
    }

    /* ───── FILTER + PAGINATE ───── */
    const filtered = useMemo(() => {
        return allUnits.filter((u) => {
            const matchStatus = statusFilter === "ALL" || u.status === statusFilter
            const matchKeyword =
                searchKeyword.trim() === "" ||
                u.nameCompany?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                u.namePersonContact?.toLowerCase().includes(searchKeyword.toLowerCase())
            return matchStatus && matchKeyword
        })
    }, [allUnits, statusFilter, searchKeyword])

    useEffect(() => {
        const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
        setTotalPages(pages)
        const start = (currentPage - 1) * pageSize
        setUnits(filtered.slice(start, start + pageSize))
    }, [filtered, currentPage])

    /* ───── DETAIL HANDLER ───── */
    const handleViewDetails = async (u) => {
        let data = {}
        try {
            const res = await fetch(`${apiRoot}/transport-unit-approvals/by-transport-unit/${u.transportId}`, authHeader)
            if (res.ok) data = await res.json()
        } finally {
            setApproval({
                approvalId: data.approvalId ?? "—",
                status: data.status ?? "CHƯA CÓ YÊU CẦU",
                requestedAt: data.requestedAt ?? null,
                processedAt: data.processedAt ?? null,
                senderEmail: data.senderEmail ?? u.senderEmail ?? u.email ?? u.contactEmail ?? "—",
                approvedByManagerId: data.approvedByManagerId ?? "—",
                certificateFrontBase64: u.certificateFrontBase64 ?? data.certificateFrontBase64 ?? null,
                certificateBackBase64: u.certificateBackBase64 ?? data.certificateBackBase64 ?? null,
                managerNote: data.managerNote ?? u.note ?? "—",
                numberOfVehicles: u.numberOfVehicles ?? 0,
                capacityPerVehicle: u.capacityPerVehicle ?? 0,
                availabilityStatus: u.availabilityStatus ?? "AVAILABLE",
            })
            setSelectedUnit(u)
            setManagerNote("")
            setShowDetail(true)
        }
    }

    /* ───── APPROVE / REJECT ───── */
    const handleApproveReject = async (type) => {
        if (!approval?.approvalId) return
        if (managerNote.trim() === "") {
            alert("Vui lòng nhập ghi chú trước khi xử lý.")
            return
        }
        try {
            const res = await fetch(`${apiRoot}/transport-unit-approvals/${approval.approvalId}/${type}`, {
                method: "POST",
                ...authHeader,
                headers: { ...authHeader.headers, "Content-Type": "application/json" },
                body: JSON.stringify({ managerNote }),
            })
            if (!res.ok) throw new Error()
            setShowDetail(false)
            fetchUnits()
        } catch {
            alert("Cập nhật thành công ")
        }
    }

    /* ───── REUSABLE UI PIECES ───── */
    const Label = ({ children }) => (
        <label className="text-xs font-semibold text-blue-700 uppercase tracking-wider">{children}</label>
    )

    const InfoCard = ({ label, value, mono = false, className = "" }) => (
        <div
            className={`bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
        >
            <Label>{label}</Label>
            <p className={`text-sm mt-1 font-medium ${mono ? "font-mono text-blue-800" : "text-blue-900"}`}>{value}</p>
        </div>
    )

    const ActionBtn = ({ color, children, onClick, disabled = false }) => {
        const base =
            "px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        const map = {
            green:
                "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-green-200",
            red: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-red-200",
            gray: "bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 shadow-gray-200",
            blue: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-blue-200",
        }
        return (
            <button onClick={onClick} disabled={disabled} className={`${base} ${map[color]}`}>
                {children}
            </button>
        )
    }

    /* ─────────────────────────────────────────────────────────── */
    return (
        <div className="min-h-screen flex flex-col">
        <div className="flex  min-h-screen bg-blue-50">
            <Sidebar />
            <div className="flex flex-col flex-1 min-h-screen">
                <Header />

                <main className="flex-grow pt-10 bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-blue-100 flex flex-col overflow-hidden m-4 p-4 pb-8"> {/* m-4 để tạo khoảng cách với sidebar và top */}

                    {/* ===== COMPACT HEADER ===== */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                                    Quản Lý Đơn Vị Vận Chuyển
                                </h1>
                                <p className="text-blue-600 text-sm font-medium">Hệ thống quản lý và phê duyệt đơn vị vận
                                    chuyển</p>
                            </div>
                            <div className="flex gap-2">
                                <ActionBtn color="blue" onClick={fetchUnits} disabled={loading}>
                                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}/>
                                    Làm mới
                                </ActionBtn>
                            </div>
                        </div>
                    </div>

                    {/* ===== COMPACT LIST CARD ===== */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-blue-100 flex flex-col flex-1 overflow-hidden">

                        <div
                            className="p-4 border-b border-blue-100 flex-shrink-0 bg-gradient-to-r from-blue-50 to-white rounded-t-xl">
                            {/* COMPACT SEARCH / FILTER */}
                            <div className="flex flex-wrap gap-3 items-center">
                                <div className="relative flex-1 min-w-[250px]">
                                    <input
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        placeholder="Tìm kiếm theo tên công ty hoặc người liên hệ..."
                                        className="w-full pl-10 pr-3 py-2 border-2 border-blue-200 rounded-lg text-sm bg-white/80 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 shadow-sm"
                                    />
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-400"/>
                                </div>

                                <div className="relative">
                                    <Filter className="absolute left-3 top-2.5 h-3 w-3 text-blue-400 z-10"/>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value)
                                            setCurrentPage(1)
                                        }}
                                        className="pl-8 pr-6 py-2 border-2 border-blue-200 rounded-lg text-sm bg-white/80 backdrop-blur-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 shadow-sm appearance-none cursor-pointer"
                                    >
                                        <option value="ALL">Tất cả trạng thái</option>
                                        <option value="ACTIVE">Hoạt động</option>
                                        <option value="INACTIVE">Không hoạt động</option>
                                        <option value="PENDING_APPROVAL">Đang chờ duyệt</option>
                                    </select>
                                </div>

                                <div className="text-sm text-blue-600 bg-blue-100 px-3 py-2 rounded-lg font-medium">
                                    Tổng: <span className="font-bold text-blue-800">{filtered.length}</span> đơn vị
                                </div>
                            </div>
                        </div>

                        {/* TABLE CONTAINER */}
                        <div className="flex-1 flex flex-col overflow-hidden h-full">
                            {loading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div
                                            className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="text-blue-600 mt-3 font-medium text-sm">Đang tải dữ liệu...</p>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="overflow-y-auto flex-1 min-h-[400px]">
                                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
                                        <div
                                            className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <X className="w-5 h-5 text-red-600"/>
                                        </div>
                                        <p className="text-red-700 font-medium text-sm">{error}</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Compact Table */}
                                    <div className="overflow-y-auto flex-1">
                                        <table className="w-full text-sm">
                                            <thead
                                                className="bg-gradient-to-r from-blue-100 to-blue-50 sticky top-0 z-10">
                                            <tr>
                                                {["Công ty", "Liên hệ", "SĐT", "Bằng cấp", "Trạng thái", "Thao tác"].map((h) => (
                                                    <th
                                                        key={h}
                                                        className="px-4 py-2 text-left font-bold text-blue-800 border-b border-blue-200 text-xs"
                                                    >
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {units.map((u, index) => (
                                                <tr
                                                    key={u.transportId}
                                                    className={`hover:bg-blue-50/50 border-b border-blue-100 transition-all duration-200 ${index % 2 === 0 ? "bg-white/50" : "bg-blue-50/20"}`}
                                                >
                                                    <td className="px-4 py-2 font-semibold text-blue-900 text-sm">{u.nameCompany}</td>
                                                    <td className="px-4 py-2 text-blue-700 text-sm">{u.namePersonContact}</td>
                                                    <td className="px-4 py-2 text-blue-700 text-sm">{u.phone}</td>
                                                    <td className="px-4 py-2 font-mono font-bold text-blue-800 bg-blue-50 rounded mx-1 text-center text-sm">
                                                        {u.licensePlate}
                                                    </td>
                                                    <td className="px-4 py-2">
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-bold shadow-sm ${
                                    u.status === "ACTIVE"
                                        ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300"
                                        : u.status === "INACTIVE"
                                            ? "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300"
                                            : "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300"
                                }`}
                            >
                              {u.status === "PENDING_APPROVAL"
                                  ? "Đang chờ duyệt"
                                  : u.status === "ACTIVE"
                                      ? "Hoạt động"
                                      : "Không hoạt động"}
                            </span>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex gap-1">
                                                            <button
                                                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-all duration-200 shadow-sm hover:shadow-md"
                                                                onClick={() => handleViewDetails(u)}
                                                                title="Xem chi tiết"
                                                            >
                                                                <Eye size={14}/>
                                                            </button>
                                                            <button
                                                                className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded transition-all duration-200 shadow-sm hover:shadow-md"
                                                                onClick={() => openEditModal(u)}
                                                                title="Chỉnh sửa"
                                                            >
                                                                <Pencil size={14}/>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* COMPACT PAGINATION */}
                                    <div
                                        className="border-t border-blue-100 bg-gradient-to-r from-blue-50 to-white p-2 flex-shrink-0 rounded-b-xl sticky bottom-0 z-10">
                                        <div className="flex justify-center items-center gap-1 text-xs">
                    <span className="text-sm text-blue-600 font-medium mr-3">
                      Trang {currentPage} / {totalPages}
                    </span>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className={`px-2 py-1 mx-0.5 rounded font-medium transition-all duration-200 ${
                                                    currentPage === 1
                                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                        : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md"
                                                }`}
                                            >
                                                Trái

                                            </button>

                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className={`px-2 py-1 mx-0.5 rounded font-medium transition-all duration-200 ${
                                                    currentPage === totalPages
                                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                        : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md"
                                                }`}
                                            >
                                                Phải

                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ===== ENHANCED MODAL CHI TIẾT ===== */}
                    {showDetail && approval && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
                            <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden border-2 border-blue-200">
                                {/* HEADER */}
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 border-b border-blue-200">
                                    <h3 className="text-base font-bold text-white text-center flex items-center justify-center gap-1">
                                        <Eye className="w-4 h-4" />
                                        Chi tiết phê duyệt đơn vị vận chuyển
                                    </h3>
                                </div>

                                {/* CONTENT */}
                                <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-blue-50/50 to-white">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                                        <InfoCard label="Mã phê duyệt" value={approval.approvalId} mono />
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-2.5 rounded-lg border border-blue-200/50 shadow-sm">
                                            <Label>Trạng thái phê duyệt</Label>
                                            <p className="mt-0.5">
              <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-lg ${
                      approval.status === "PENDING"
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white"
                          : approval.status === "APPROVED"
                              ? "bg-gradient-to-r from-green-400 to-green-500 text-white"
                              : "bg-gradient-to-r from-red-400 to-red-500 text-white"
                  }`}
              >
                {approval.status === "PENDING"
                    ? "⏳ Đang chờ xử lý"
                    : approval.status === "APPROVED"
                        ? "✅ Đã phê duyệt"
                        : "❌ Đã từ chối"}
              </span>
                                            </p>
                                        </div>

                                        <InfoCard
                                            label="Thời gian yêu cầu"
                                            value={
                                                approval.requestedAt
                                                    ? new Date(approval.requestedAt).toLocaleString("vi-VN")
                                                    : "—"
                                            }
                                        />
                                        <InfoCard
                                            label="Thời gian xử lý"
                                            value={
                                                approval.processedAt
                                                    ? new Date(approval.processedAt).toLocaleString("vi-VN")
                                                    : "—"
                                            }
                                        />

                                        <InfoCard label="Email người gửi" value={approval.senderEmail} className="break-all" />
                                        <InfoCard label="ID quản lý phê duyệt" value={approval.approvedByManagerId} mono />
                                        <InfoCard label="Số lượng xe" value={approval.numberOfVehicles ?? "—"} />
                                        <InfoCard label="Thể tích mỗi xe (m³)" value={approval.capacityPerVehicle ?? "—"} />

                                        {/* ẢNH GIẤY PHÉP - hiển thị song song */}
                                        {(selectedUnit?.certificateFrontUrl || selectedUnit?.certificateBackUrl) && (
                                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                {selectedUnit?.certificateFrontUrl && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Ảnh mặt trước giấy phép
                                                        </label>
                                                        <img
                                                            src={selectedUnit.certificateFrontUrl}
                                                            alt="Certificate Front"
                                                            className="rounded-lg border border-gray-300 shadow-sm w-full h-auto"
                                                        />
                                                    </div>
                                                )}
                                                {selectedUnit?.certificateBackUrl && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Ảnh mặt sau giấy phép
                                                        </label>
                                                        <img
                                                            src={selectedUnit.certificateBackUrl}
                                                            alt="Certificate Back"
                                                            className="rounded-lg border border-gray-300 shadow-sm w-full h-auto"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <InfoCard
                                            label="Ghi chú hiện tại"
                                            value={approval.managerNote}
                                            className="md:col-span-2 whitespace-pre-wrap"
                                        />

                                        {/* IMAGE BASE64 nếu có */}
                                        {approval.certificateFrontBase64 && (
                                            <div className="md:col-span-2">
                                                <Label>Ảnh mặt trước (giấy phép)</Label>
                                                <img
                                                    src={`data:image/jpeg;base64,${approval.certificateFrontBase64}`}
                                                    alt="Ảnh mặt trước"
                                                    className="mt-2 rounded-lg border border-blue-200 shadow-sm max-w-full h-auto"
                                                />
                                            </div>
                                        )}
                                        {approval.certificateBackBase64 && (
                                            <div className="md:col-span-2">
                                                <Label>Ảnh mặt sau (giấy phép)</Label>
                                                <img
                                                    src={`data:image/jpeg;base64,${approval.certificateBackBase64}`}
                                                    alt="Ảnh mặt sau"
                                                    className="mt-2 rounded-lg border border-blue-200 shadow-sm max-w-full h-auto"
                                                />
                                            </div>
                                        )}

                                        {/* GHI CHÚ XỬ LÝ */}
                                        {approval.status === "PENDING" && (
                                            <div className="md:col-span-2 border-t-2 border-blue-200 pt-2 mt-2">
                                                <label className="block text-sm font-bold text-blue-800 mb-1">
                                                    Nhập ghi chú xử lý <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    value={managerNote}
                                                    onChange={(e) => setManagerNote(e.target.value)}
                                                    rows={2}
                                                    placeholder="Nhập lý do phê duyệt hoặc từ chối chi tiết..."
                                                    className="w-full border-2 border-blue-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-100 focus:border-blue-400 resize-none bg-white/80 backdrop-blur-sm shadow-sm"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* FOOTER */}
                                <div className="px-4 py-3 border-t-2 border-blue-100 flex justify-end gap-2 bg-gradient-to-r from-blue-50 to-white">
                                    {approval.status === "PENDING" && (
                                        <>
                                            <ActionBtn color="green" onClick={() => handleApproveReject("approve")}>
                                                <Check size={12} /> Phê duyệt
                                            </ActionBtn>
                                            <ActionBtn color="red" onClick={() => handleApproveReject("reject")}>
                                                <X size={12} /> Từ chối
                                            </ActionBtn>
                                        </>
                                    )}
                                    <ActionBtn color="gray" onClick={() => setShowDetail(false)}>
                                        Đóng
                                    </ActionBtn>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== ENHANCED EDIT MODAL ===== */}
                    {showEdit && (
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
                            <div
                                className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 border-2 border-blue-200"> {/* Thay đổi max-w-2xl thành max-w-xl và p-8 thành p-6 */}
                                <h3 className="text-xl font-bold text-center bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center justify-center gap-2"> {/* Thay đổi text-2xl thành text-xl và mb-8 thành mb-6, gap-3 thành gap-2 */}
                                    <Pencil className="w-5 h-5 text-blue-600"/> {/* Thay đổi w-6 h-6 thành w-5 h-5 */}
                                    Chỉnh sửa thông tin đơn vị
                                </h3>

                                <div
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"> {/* Thay đổi gap-6 thành gap-4 và mb-8 thành mb-6 */}
                                    <div>
                                        <Label>Tên công ty</Label>
                                        <input
                                            value={form.nameCompany}
                                            onChange={(e) => setForm({...form, nameCompany: e.target.value})}
                                            className="w-full mt-1 border-2 border-blue-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white/80 backdrop-blur-sm shadow-sm"
                                            placeholder="Nhập tên công ty"
                                        />
                                    </div>
                                    <div>
                                        <Label>Người liên hệ</Label>
                                        <input
                                            value={form.namePersonContact}
                                            onChange={(e) => setForm({...form, namePersonContact: e.target.value})}
                                            className="w-full mt-1 border-2 border-blue-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white/80 backdrop-blur-sm shadow-sm"
                                            placeholder="Nhập tên người liên hệ"
                                        />
                                    </div>
                                    <div>
                                        <Label>Số điện thoại</Label>
                                        <input
                                            value={form.phone}
                                            onChange={(e) => setForm({...form, phone: e.target.value})}
                                            className="w-full mt-1 border-2 border-blue-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white/80 backdrop-blur-sm shadow-sm"
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                    <div>
                                        <Label>Biển số xe</Label>
                                        <input
                                            value={form.licensePlate}
                                            onChange={(e) => setForm({...form, licensePlate: e.target.value})}
                                            className="w-full mt-1 border-2 border-blue-200 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white/80 backdrop-blur-sm shadow-sm"
                                            placeholder="Nhập biển số xe"
                                        />
                                    </div>
                                    <div>
                                        <Label>Trạng thái</Label>
                                        <select
                                            value={form.status}
                                            onChange={(e) => setForm({...form, status: e.target.value})}
                                            className="w-full mt-1 border-2 border-blue-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white/80 backdrop-blur-sm shadow-sm"
                                        >
                                            <option value="ACTIVE">Hoạt động</option>
                                            <option value="INACTIVE">Không hoạt động</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Số lượng xe</Label>
                                        <input
                                            type="number"
                                            value={form.numberOfVehicles}
                                            onChange={(e) => setForm({
                                                ...form,
                                                numberOfVehicles: parseInt(e.target.value) || 0
                                            })}
                                            className="w-full mt-1 border-2 border-blue-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white/80 backdrop-blur-sm shadow-sm"
                                            placeholder="Nhập số lượng xe"
                                        />
                                    </div>

                                    <div>
                                        <Label>Thể tích mỗi xe (m³)</Label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={form.capacityPerVehicle}
                                            onChange={(e) => setForm({
                                                ...form,
                                                capacityPerVehicle: parseFloat(e.target.value) || 0
                                            })}
                                            className="w-full mt-1 border-2 border-blue-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white/80 backdrop-blur-sm shadow-sm"
                                            placeholder="Nhập thể tích mỗi xe"
                                        />
                                    </div>

                                    <div>
                                        <Label>Trạng thái khả dụng</Label>
                                        <input
                                            type="text"
                                            value={
                                                form.availabilityStatus === "AVAILABLE"
                                                    ? "Sẵn sàng"
                                                    : form.availabilityStatus === "INSUFFICIENT"
                                                        ? "Không đủ xe"
                                                        : form.availabilityStatus === "FULLY_BUSY"
                                                            ? "Đã sử dụng hết xe"
                                                            : "Không xác định"
                                            }
                                            readOnly
                                            className="w-full mt-1 border-2 border-blue-200 rounded-lg p-2.5 text-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                                        />
                                    </div>


                                    <div className="md:col-span-2">
                                        <Label>Ghi chú</Label>
                                        <textarea
                                            rows={3}
                                            value={form.note}
                                            onChange={(e) => setForm({...form, note: e.target.value})}
                                            className="w-full mt-1 border-2 border-blue-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white/80 backdrop-blur-sm shadow-sm resize-none"
                                            placeholder="Nhập ghi chú (tùy chọn)"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3"> {/* Thay đổi gap-4 thành gap-3 */}
                                    <ActionBtn color="green" onClick={handleUpdate}>
                                        <Check size={14}/> {/* Thay đổi size={16} thành size={14} */}
                                        Cập nhật
                                    </ActionBtn>
                                    <ActionBtn color="gray" onClick={() => setShowEdit(false)}>
                                        <X size={14}/> {/* Thay đổi size={16} thành size={14} */}
                                        Hủy bỏ
                                    </ActionBtn>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
            <footer className="w-full ">
                <Footer />
            </footer>
        </div>
    )
}