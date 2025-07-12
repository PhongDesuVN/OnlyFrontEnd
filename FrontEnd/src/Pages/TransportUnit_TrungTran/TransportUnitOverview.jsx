"use client"

import { useState, useEffect, useMemo } from "react"
import Cookies from "js-cookie"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from "recharts"
import { jsPDF } from "jspdf"
import { Download, TrendingUp, Users, Clock, CheckCircle, AlertCircle, XCircle, BarChart3 } from "lucide-react"
import { API_BASE_URL } from "../../utils/api";

let fontLoaded = false

const loadFont = async () => {
    if (fontLoaded) return
    try {
        const res = await fetch("/fonts/Roboto-Regular.txt")
        const RobotoRegular = await res.text()
        jsPDF.API.events.push([
            "addFonts",
            function () {
                this.addFileToVFS("Roboto-Regular.ttf", RobotoRegular)
                this.addFont("Roboto-Regular.ttf", "Roboto-Regular", "normal")
                this.addFont("Roboto-Regular.ttf", "Roboto-Regular", "bold")
            },
        ])
        fontLoaded = true
    } catch (error) {
        console.error("Lỗi khi tải font Roboto:", error)
    }
}

const exportToPDF = (
    dashboardStats,
    performanceMetrics,
    total,
    historicalData,
    weeklyActivity,
    managerPerformance,
    approvalTrends,
) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    let yPosition = 20

    const setFont = (bold = false, size = 12) => {
        doc.setFontSize(size)
        doc.setFont("Roboto-Regular", bold ? "bold" : "normal")
    }

    const checkPageBreak = (height) => {
        if (yPosition + height > pageHeight - 20) {
            doc.addPage()
            yPosition = 20
        }
    }

    const addText = (text, x = 20, options = {}) => {
        const fontSize = options.fontSize || 12
        const bold = options.bold || false
        const maxWidth = options.maxWidth || pageWidth - 40
        setFont(bold, fontSize)
        const lines = doc.splitTextToSize(text, maxWidth)
        doc.text(lines, x, yPosition)
        yPosition += lines.length * fontSize * 0.5 + 2
    }

    setFont(true, 20)
    doc.text("BÁO CÁO DASHBOARD ĐƠN VỊ VẬN TẢI", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 12
    setFont(false, 10)
    doc.text(`Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 15

    if (dashboardStats) {
        checkPageBreak(80)
        setFont(true, 14)
        doc.text("1. THỐNG KÊ TỔNG QUAN", 20, yPosition)
        yPosition += 10
        setFont(false, 12)
        const stats = [
            ["Tổng số đơn vị", dashboardStats.totalUnits],
            ["Đang chờ duyệt", dashboardStats.pendingApprovals],
            ["Đơn vị hoạt động", dashboardStats.activeUnits],
            ["Đơn vị không hoạt động", dashboardStats.inactiveUnits],
            ["Tỷ lệ duyệt", `${dashboardStats.approvalRate?.toFixed(2)}%`],
            ["Thời gian xử lý trung bình", `${dashboardStats.avgProcessingTime?.toFixed(2)} giờ`],
            ["Duyệt hôm nay", dashboardStats.todayApprovals],
            ["Từ chối hôm nay", dashboardStats.todayRejections],
        ]
        stats.forEach(([label, value]) => addText(`${label}: ${value}`, 30))
    }

    if (performanceMetrics) {
        checkPageBreak(60)
        setFont(true, 14)
        doc.text("2. CHỈ SỐ HIỆU SUẤT", 20, yPosition)
        yPosition += 10
        const perf = [
            ["Thời gian duyệt trung bình", `${performanceMetrics.avgApprovalTime?.toFixed(2)} giờ`],
            ["Thời gian từ chối trung bình", `${performanceMetrics.avgRejectionTime?.toFixed(2)} giờ`],
            ["Số lượng bottleneck (>48h)", performanceMetrics.bottleneckCount],
            ["Hiệu suất hệ thống", `${performanceMetrics.systemEfficiency?.toFixed(2)}%`],
        ]
        setFont(false, 12)
        perf.forEach(([label, value]) => addText(`${label}: ${value}`, 30))
        if (performanceMetrics.topRejectionReasons?.length > 0) {
            yPosition += 5
            addText("Lý do từ chối phổ biến:", 30, { bold: true })
            performanceMetrics.topRejectionReasons.forEach((reason, index) => addText(`${index + 1}. ${reason}`, 35))
        }
    }

    checkPageBreak(40)
    setFont(true, 14)
    doc.text("3. PHÂN BỐ TRẠNG THÁI", 20, yPosition)
    yPosition += 10
    setFont(false)
    addText(`Đang chờ: ${total.pending}`, 30)
    addText(`Hoạt động: ${total.active}`, 30)
    addText(`Không hoạt động: ${total.inactive}`, 30)

    if (historicalData?.length > 0) {
        checkPageBreak(60)
        setFont(true, 14)
        doc.text("4. DỮ LIỆU LỊCH SỬ (3 THÁNG GẦN NHẤT)", 20, yPosition)
        yPosition += 10
        setFont(false)
        historicalData.slice(-3).forEach((item) => {
            addText(`Tháng ${item.period}:`, 30, { bold: true })
            addText(`  - Tổng đơn vị: ${item.totalUnits || "N/A"}`, 35)
            addText(`  - Đơn vị hoạt động: ${item.activeUnits || "N/A"}`, 35)
            addText(`  - Đang chờ: ${item.pendingUnits || "N/A"}`, 35)
            yPosition += 4
        })
    }

    if (managerPerformance?.length > 0) {
        checkPageBreak(80)
        setFont(true, 14)
        doc.text("5. HIỆU SUẤT QUẢN LÝ", 20, yPosition)
        yPosition += 10
        managerPerformance.slice(0, 5).forEach((manager) => {
            addText(`${manager.managerName || "Không rõ"}:`, 30, { bold: true })
            addText(`  - Đã duyệt: ${manager.approvedCount || 0}`, 35)
            addText(`  - Đã từ chối: ${manager.rejectedCount || 0}`, 35)
            addText(`  - Đang chờ: ${manager.pendingCount || 0}`, 35)
            yPosition += 5
        })
    }

    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        setFont(false, 8)
        doc.text(`Trang ${i}/${totalPages}`, pageWidth - 30, pageHeight - 10)
        doc.text("Dashboard Đơn vị Vận tải - Báo cáo tự động", 20, pageHeight - 10)
    }

    const fileName = `Dashboard_Report_${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)
}

const apiRoot = API_BASE_URL + "/api";


const TransportUnitOverview = () => {
    const [allUnits, setAllUnits] = useState([])
    const [dashboardStats, setDashboardStats] = useState(null)
    const [performanceMetrics, setPerformanceMetrics] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [historicalData, setHistoricalData] = useState([])
    const [weeklyActivity, setWeeklyActivity] = useState([])
    const [managerPerformance, setManagerPerformance] = useState([])
    const [statusDistribution, setStatusDistribution] = useState([])
    const [approvalTrends, setApprovalTrends] = useState([])

    const COLORS = ["#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6", "#06B6D4"]

    useEffect(() => {
        const loadFont = async () => {
            try {
                const res = await fetch("/fonts/Roboto-Regular.txt")
                const RobotoRegular = await res.text()
                jsPDF.API.events.push([
                    "addFonts",
                    function () {
                        this.addFileToVFS("Roboto-Regular.ttf", RobotoRegular)
                        this.addFont("Roboto-Regular.ttf", "Roboto-Regular", "normal")
                        this.addFont("Roboto-Regular.ttf", "Roboto-Regular", "bold")
                    },
                ])
            } catch (error) {
                console.error("Lỗi khi tải font Roboto:", error)
            }
        }
        loadFont()
    }, [])

    useEffect(() => {
        const token = Cookies.get("authToken")
        if (!token) return
        const controller = new AbortController()
        const fetchAllData = async () => {
            try {
                setLoading(true)
                const headers = { Authorization: `Bearer ${token}` }
                const now = new Date()
                const oneYearAgo = new Date()
                oneYearAgo.setFullYear(now.getFullYear() - 1)
                const formatDate = (date) => date.toISOString().split("T")[0]
                const startDate = formatDate(oneYearAgo)
                const endDate = formatDate(now)

                const [unitRes, statsRes, perfRes, histRes, weeklyRes, managerRes, statusRes, trendsRes] = await Promise.all([
                    fetch(`${apiRoot}/transport-units?page=0&size=1000`, { headers, signal: controller.signal }),
                    fetch(`${apiRoot}/transport-unit-analytics/dashboard-stats`, { headers, signal: controller.signal }),
                    fetch(`${apiRoot}/transport-unit-analytics/performance-metrics`, { headers, signal: controller.signal }),
                    fetch(
                        `${apiRoot}/transport-unit-analytics/historical-data?startDate=${startDate}&endDate=${endDate}&groupBy=MONTH`,
                        { headers, signal: controller.signal },
                    ),
                    fetch(`${apiRoot}/transport-unit-analytics/weekly-activity`, { headers, signal: controller.signal }),
                    fetch(`${apiRoot}/transport-unit-analytics/manager-performance`, { headers, signal: controller.signal }),
                    fetch(`${apiRoot}/transport-unit-analytics/status-distribution`, { headers, signal: controller.signal }),
                    fetch(`${apiRoot}/transport-unit-analytics/approval-trends?days=30`, { headers, signal: controller.signal }),
                ])

                const responses = [unitRes, statsRes, perfRes, histRes, weeklyRes, managerRes, statusRes, trendsRes]
                if (responses.some((res) => !res.ok)) {
                    throw new Error("Một hoặc nhiều API trả về lỗi")
                }

                const [
                    unitData,
                    dashboardData,
                    performanceData,
                    historicalData,
                    weeklyData,
                    managerData,
                    statusData,
                    trendsData,
                ] = await Promise.all(responses.map((res) => res.json()))

                setAllUnits(Array.isArray(unitData) ? unitData : (unitData.content ?? []))
                setDashboardStats(dashboardData)
                setPerformanceMetrics(performanceData)
                setHistoricalData(historicalData)
                setWeeklyActivity(weeklyData)
                setManagerPerformance(managerData)
                setStatusDistribution(statusData)
                setApprovalTrends(trendsData)
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error(err)
                    setError("Lỗi tải dữ liệu: " + err.message)
                }
            } finally {
                setLoading(false)
            }
        }
        fetchAllData()
        return () => controller.abort()
    }, [])

    const total = useMemo(
        () =>
            allUnits.reduce(
                (acc, u) => {
                    if (u.status === "PENDING_APPROVAL") acc.pending++
                    else if (u.status === "ACTIVE") acc.active++
                    else if (u.status === "INACTIVE") acc.inactive++
                    return acc
                },
                { pending: 0, active: 0, inactive: 0 },
            ),
        [allUnits],
    )

    const statusChartData = [
        { name: "Đang chờ", value: total.pending, color: "#F59E0B" },
        { name: "Hoạt động", value: total.active, color: "#10B981" },
        { name: "Không hoạt động", value: total.inactive, color: "#EF4444" },
    ]

    const overviewBarData = dashboardStats
        ? [
            { name: "Tổng đơn vị", value: dashboardStats.totalUnits },
            { name: "Đang chờ", value: dashboardStats.pendingApprovals },
            { name: "Hoạt động", value: dashboardStats.activeUnits },
            { name: "Không hoạt động", value: dashboardStats.inactiveUnits },
        ]
        : []

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
                <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-2xl border border-blue-200">
                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-6 text-blue-700 text-xl font-semibold">Đang tải dữ liệu dashboard...</p>
                    <p className="mt-2 text-blue-500">Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        )
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
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Enhanced Header */}
                <div className="mb-12 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 via-blue-600 to-blue-800 bg-clip-text text-transparent">
                            Dashboard Đơn Vị Vận Tải
                        </h1>
                        <p className="mt-3 text-blue-600 text-lg font-medium">Tổng quan hiệu suất và phân tích dữ liệu chi tiết</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-blue-500">
                            <Clock className="w-4 h-4" />
                            Cập nhật lần cuối: {new Date().toLocaleString("vi-VN")}
                        </div>
                    </div>
                    <button
                        onClick={async () => {
                            await loadFont()
                            exportToPDF(
                                dashboardStats,
                                performanceMetrics,
                                total,
                                historicalData,
                                weeklyActivity,
                                managerPerformance,
                                approvalTrends,
                            )
                        }}
                        className="inline-flex items-center px-6 py-4 border-2 border-blue-300 text-sm font-bold rounded-2xl shadow-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 transform hover:scale-105"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Xuất báo cáo PDF
                    </button>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Users className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div className="ml-5">
                                <p className="text-sm font-bold text-blue-700 uppercase tracking-wider">Tổng đơn vị</p>
                                <p className="text-3xl font-bold text-blue-900">{dashboardStats ? dashboardStats.totalUnits : 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <AlertCircle className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div className="ml-5">
                                <p className="text-sm font-bold text-blue-700 uppercase tracking-wider">Đang chờ duyệt</p>
                                <p className="text-3xl font-bold text-blue-900">{dashboardStats ? dashboardStats.pendingApprovals : 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <CheckCircle className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div className="ml-5">
                                <p className="text-sm font-bold text-blue-700 uppercase tracking-wider">Tỷ lệ duyệt</p>
                                <p className="text-3xl font-bold text-blue-900">{dashboardStats ? dashboardStats.approvalRate?.toFixed(1) : 0}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-blue-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Clock className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div className="ml-5">
                                <p className="text-sm font-bold text-blue-700 uppercase tracking-wider">Thời gian xử lý TB</p>
                                <p className="text-3xl font-bold text-blue-900">{dashboardStats ? dashboardStats.avgProcessingTime?.toFixed(1) : 0}h</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Charts Grid */}
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
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-blue-100">
                        <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                            Tổng quan đơn vị
                        </h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={overviewBarData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="name" stroke="#374151" />
                                <YAxis stroke="#374151" />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Historical Data Chart */}
                {historicalData.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12 border-2 border-blue-100">
                        <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                            <BarChart3 className="w-6 h-6 text-blue-600" />
                            Dữ liệu lịch sử theo tháng
                        </h3>
                        <ResponsiveContainer width="100%" height={450}>
                            <AreaChart data={historicalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="period" stroke="#374151" />
                                <YAxis stroke="#374151" />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="totalUnits"
                                    stackId="1"
                                    stroke="#3B82F6"
                                    fill="#3B82F6"
                                    fillOpacity={0.6}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="activeUnits"
                                    stackId="1"
                                    stroke="#10B981"
                                    fill="#10B981"
                                    fillOpacity={0.6}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="pendingUnits"
                                    stackId="1"
                                    stroke="#F59E0B"
                                    fill="#F59E0B"
                                    fillOpacity={0.6}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Weekly Activity Chart */}
                {weeklyActivity.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12 border-2 border-blue-100">
                        <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                            Hoạt động theo tuần
                        </h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={weeklyActivity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="week" stroke="#374151" />
                                <YAxis stroke="#374151" />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="approvals" stroke="#10B981" strokeWidth={3} />
                                <Line type="monotone" dataKey="rejections" stroke="#EF4444" strokeWidth={3} />
                                <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Performance Metrics Table */}
                {performanceMetrics && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl mb-12 border-2 border-blue-100 overflow-hidden">
                        <div className="px-8 py-6 border-b-2 border-blue-100 bg-gradient-to-r from-blue-100 to-blue-50">
                            <h3 className="text-xl font-bold text-blue-900 flex items-center gap-3">
                                <BarChart3 className="w-6 h-6 text-blue-600" />
                                Chỉ số hiệu suất hệ thống
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y-2 divide-blue-100">
                                <thead className="bg-gradient-to-r from-blue-100 to-blue-50">
                                <tr>
                                    <th className="px-8 py-4 text-left text-sm font-bold text-blue-800 uppercase tracking-wider">
                                        Chỉ số
                                    </th>
                                    <th className="px-8 py-4 text-left text-sm font-bold text-blue-800 uppercase tracking-wider">
                                        Giá trị
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white/50 divide-y divide-blue-100">
                                <tr className="hover:bg-blue-50/50 transition-colors duration-200">
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-blue-900">
                                        Thời gian duyệt trung bình
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-blue-700 font-medium">
                                        {performanceMetrics.avgApprovalTime?.toFixed(2)} giờ
                                    </td>
                                </tr>
                                <tr className="hover:bg-blue-50/50 transition-colors duration-200">
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-blue-900">
                                        Thời gian từ chối trung bình
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-blue-700 font-medium">
                                        {performanceMetrics.avgRejectionTime?.toFixed(2)} giờ
                                    </td>
                                </tr>
                                <tr className="hover:bg-blue-50/50 transition-colors duration-200">
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-blue-900">
                                        Bottleneck (&gt; 48h)
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-blue-700 font-medium">
                                        {performanceMetrics.bottleneckCount}
                                    </td>
                                </tr>
                                <tr className="hover:bg-blue-50/50 transition-colors duration-200">
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-blue-900">
                                        Hiệu suất hệ thống
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-blue-700 font-medium">
                                        {performanceMetrics.systemEfficiency?.toFixed(2)}%
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Manager Performance Chart */}
                {managerPerformance.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12 border-2 border-blue-100">
                        <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                            <Users className="w-6 h-6 text-blue-600" />
                            Hiệu suất quản lý
                        </h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={managerPerformance}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="managerName" stroke="#374151" />
                                <YAxis stroke="#374151" />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="approvedCount" fill="#10B981" name="Đã duyệt" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="rejectedCount" fill="#EF4444" name="Đã từ chối" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="pendingCount" fill="#F59E0B" name="Đang chờ" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Approval Trends Chart */}
                {approvalTrends.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12 border-2 border-blue-100">
                        <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                            Xu hướng duyệt (30 ngày gần nhất)
                        </h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={approvalTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="date" stroke="#374151" />
                                <YAxis stroke="#374151" />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="approvals" stroke="#10B981" strokeWidth={3} name="Duyệt" />
                                <Line type="monotone" dataKey="rejections" stroke="#EF4444" strokeWidth={3} name="Từ chối" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Top Rejection Reasons */}
                {performanceMetrics?.topRejectionReasons && performanceMetrics.topRejectionReasons.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-blue-100 overflow-hidden">
                        <div className="px-8 py-6 border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-white">
                            <h3 className="text-xl font-bold text-blue-900 flex items-center gap-3">
                                <XCircle className="w-6 h-6 text-red-600" />
                                Lý do từ chối phổ biến
                            </h3>
                        </div>
                        <div className="p-8">
                            <div className="space-y-6">
                                {performanceMetrics.topRejectionReasons.map((reason, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center p-4 bg-gradient-to-r from-red-50 to-red-100/50 rounded-xl border border-red-200"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-sm font-bold text-white">{index + 1}</span>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-red-900">{reason}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TransportUnitOverview