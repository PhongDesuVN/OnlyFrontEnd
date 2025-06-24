import React, { useState, useEffect, useRef, useMemo } from 'react';
import Cookies from 'js-cookie';
import Chart from 'chart.js/auto';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { jsPDF } from 'jspdf';

// PDF Export utilities
const exportToPDF = (dashboardStats, performanceMetrics, total, historicalData, weeklyActivity, managerPerformance, approvalTrends) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Helper function to add new page if needed
    const checkPageBreak = (height) => {
        if (yPosition + height > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
        }
    };

    // Helper function to add text with word wrap
    const addText = (text, x, y, options = {}) => {
        const fontSize = options.fontSize || 12;
        doc.setFontSize(fontSize);
        if (options.bold) doc.setFont(undefined, 'bold');
        else doc.setFont(undefined, 'normal');

        const lines = doc.splitTextToSize(text, options.maxWidth || pageWidth - 40);
        doc.text(lines, x, y);
        return lines.length * fontSize * 0.5; // Return height used
    };

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('BÁO CÁO DASHBOARD ĐƠN VỊ VẬN TẢI', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Date
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Dashboard Stats Section
    if (dashboardStats) {
        checkPageBreak(60);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('1. THỐNG KÊ TỔNG QUAN', 20, yPosition);
        yPosition += 15;

        const stats = [
            ['Tổng số đơn vị:', dashboardStats.totalUnits],
            ['Đang chờ duyệt:', dashboardStats.pendingApprovals],
            ['Đơn vị hoạt động:', dashboardStats.activeUnits],
            ['Đơn vị không hoạt động:', dashboardStats.inactiveUnits],
            ['Tỷ lệ duyệt:', `${dashboardStats.approvalRate?.toFixed(2)}%`],
            ['Thời gian xử lý trung bình:', `${dashboardStats.avgProcessingTime?.toFixed(2)} giờ`],
            ['Duyệt hôm nay:', dashboardStats.todayApprovals],
            ['Từ chối hôm nay:', dashboardStats.todayRejections]
        ];

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        stats.forEach(([label, value]) => {
            doc.text(`${label} ${value}`, 30, yPosition);
            yPosition += 8;
        });
        yPosition += 10;
    }

    // Performance Metrics Section
    if (performanceMetrics) {
        checkPageBreak(60);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('2. CHỈ SỐ HIỆU SUẤT', 20, yPosition);
        yPosition += 15;

        const perfStats = [
            ['Thời gian duyệt trung bình:', `${performanceMetrics.avgApprovalTime?.toFixed(2)} giờ`],
            ['Thời gian từ chối trung bình:', `${performanceMetrics.avgRejectionTime?.toFixed(2)} giờ`],
            ['Số lượng bottleneck (>48h):', performanceMetrics.bottleneckCount],
            ['Hiệu suất hệ thống:', `${performanceMetrics.systemEfficiency?.toFixed(2)}%`]
        ];

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        perfStats.forEach(([label, value]) => {
            doc.text(`${label} ${value}`, 30, yPosition);
            yPosition += 8;
        });

        // Top rejection reasons
        if (performanceMetrics.topRejectionReasons?.length > 0) {
            yPosition += 5;
            doc.setFont(undefined, 'bold');
            doc.text('Lý do từ chối phổ biến:', 30, yPosition);
            yPosition += 8;
            doc.setFont(undefined, 'normal');
            performanceMetrics.topRejectionReasons.forEach((reason, index) => {
                checkPageBreak(10);
                doc.text(`${index + 1}. ${reason}`, 35, yPosition);
                yPosition += 8;
            });
        }
        yPosition += 10;
    }

    // Status Distribution
    checkPageBreak(40);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('3. PHÂN BỐ TRẠNG THÁI', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Đang chờ: ${total.pending}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Hoạt động: ${total.active}`, 30, yPosition);
    yPosition += 8;
    doc.text(`Không hoạt động: ${total.inactive}`, 30, yPosition);
    yPosition += 15;

    // Historical Data Summary
    if (historicalData?.length > 0) {
        checkPageBreak(60);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('4. DỮ LIỆU LỊCH SỬ (3 THÁNG GẦN NHẤT)', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        historicalData.slice(-3).forEach((item) => {
            checkPageBreak(15);
            doc.text(`Tháng ${item.period}:`, 30, yPosition);
            yPosition += 8;
            doc.text(`  - Tổng đơn vị: ${item.totalUnits || 'N/A'}`, 35, yPosition);
            yPosition += 6;
            doc.text(`  - Đơn vị hoạt động: ${item.activeUnits || 'N/A'}`, 35, yPosition);
            yPosition += 6;
            doc.text(`  - Đang chờ: ${item.pendingUnits || 'N/A'}`, 35, yPosition);
            yPosition += 10;
        });
    }

    // Manager Performance Summary
    if (managerPerformance?.length > 0) {
        checkPageBreak(60);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('5. HIỆU SUẤT QUẢN LÝ', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        managerPerformance.slice(0, 5).forEach((manager) => {
            checkPageBreak(20);
            doc.text(`${manager.managerName || 'Không rõ'}:`, 30, yPosition);
            yPosition += 8;
            doc.text(`  - Đã duyệt: ${manager.approvedCount || 0}`, 35, yPosition);
            yPosition += 6;
            doc.text(`  - Đã từ chối: ${manager.rejectedCount || 0}`, 35, yPosition);
            yPosition += 6;
            doc.text(`  - Đang chờ: ${manager.pendingCount || 0}`, 35, yPosition);
            yPosition += 10;
        });
    }

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(`Trang ${i}/${totalPages}`, pageWidth - 30, pageHeight - 10);
        doc.text('Dashboard Đơn vị Vận tải - Báo cáo tự động', 20, pageHeight - 10);
    }

    // Save the PDF
    const fileName = `Dashboard_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};

const apiRoot = 'http://localhost:8083/api';

const TransportUnitOverview = () => {
    const [allUnits, setAllUnits] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [performanceMetrics, setPerformanceMetrics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [historicalData, setHistoricalData] = useState([]);
    const [weeklyActivity, setWeeklyActivity] = useState([]);
    const [managerPerformance, setManagerPerformance] = useState([]);
    const [statusDistribution, setStatusDistribution] = useState([]);
    const [approvalTrends, setApprovalTrends] = useState([]);

    // Colors for charts
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

    useEffect(() => {
        const token = Cookies.get('authToken');
        if (!token) return;

        const controller = new AbortController();

        const fetchAllData = async () => {
            try {
                setLoading(true);
                const headers = { Authorization: `Bearer ${token}` };

                const now = new Date();
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(now.getFullYear() - 1);
                const formatDate = (date) => date.toISOString().split('T')[0];
                const startDate = formatDate(oneYearAgo);
                const endDate = formatDate(now);

                const [
                    unitRes,
                    statsRes,
                    perfRes,
                    histRes,
                    weeklyRes,
                    managerRes,
                    statusRes,
                    trendsRes
                ] = await Promise.all([
                    fetch(`${apiRoot}/transport-units?page=0&size=1000`, { headers, signal: controller.signal }),
                    fetch(`${apiRoot}/transport-unit-analytics/dashboard-stats`, { headers, signal: controller.signal }),
                    fetch(`${apiRoot}/transport-unit-analytics/performance-metrics`, { headers, signal: controller.signal }),
                    fetch(`${apiRoot}/transport-unit-analytics/historical-data?startDate=${startDate}&endDate=${endDate}&groupBy=MONTH`, { headers, signal: controller.signal }),
                    fetch(`${apiRoot}/transport-unit-analytics/weekly-activity`, { headers, signal: controller.signal }),
                    fetch(`${apiRoot}/transport-unit-analytics/manager-performance`, { headers, signal: controller.signal }),
                    fetch(`${apiRoot}/transport-unit-analytics/status-distribution`, { headers, signal: controller.signal }),
                    fetch(`${apiRoot}/transport-unit-analytics/approval-trends?days=30`, { headers, signal: controller.signal })
                ]);

                const responses = [unitRes, statsRes, perfRes, histRes, weeklyRes, managerRes, statusRes, trendsRes];
                if (responses.some(res => !res.ok)) {
                    throw new Error('Một hoặc nhiều API trả về lỗi');
                }

                const [
                    unitData,
                    dashboardData,
                    performanceData,
                    historicalData,
                    weeklyData,
                    managerData,
                    statusData,
                    trendsData
                ] = await Promise.all(responses.map(res => res.json()));

                setAllUnits(Array.isArray(unitData) ? unitData : unitData.content ?? []);
                setDashboardStats(dashboardData);
                setPerformanceMetrics(performanceData);
                setHistoricalData(historicalData);
                setWeeklyActivity(weeklyData);
                setManagerPerformance(managerData);
                setStatusDistribution(statusData);
                setApprovalTrends(trendsData);

            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error(err);
                    setError('Lỗi tải dữ liệu: ' + err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();

        return () => controller.abort();
    }, []);

    const total = useMemo(() => allUnits.reduce((acc, u) => {
        if (u.status === 'PENDING_APPROVAL') acc.pending++;
        else if (u.status === 'ACTIVE') acc.active++;
        else if (u.status === 'INACTIVE') acc.inactive++;
        return acc;
    }, { pending: 0, active: 0, inactive: 0 }), [allUnits]);

    // Prepare chart data
    const statusChartData = [
        { name: 'Đang chờ', value: total.pending, color: '#F59E0B' },
        { name: 'Hoạt động', value: total.active, color: '#10B981' },
        { name: 'Không hoạt động', value: total.inactive, color: '#EF4444' }
    ];

    const overviewBarData = dashboardStats ? [
        { name: 'Tổng đơn vị', value: dashboardStats.totalUnits },
        { name: 'Đang chờ', value: dashboardStats.pendingApprovals },
        { name: 'Hoạt động', value: dashboardStats.activeUnits },
        { name: 'Không hoạt động', value: dashboardStats.inactiveUnits }
    ] : [];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-lg">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Lỗi tải dữ liệu</h3>
                            <div className="mt-2 text-sm text-red-700">{error}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard Đơn vị Vận tải</h1>
                        <p className="mt-2 text-gray-600">Tổng quan hiệu suất và phân tích dữ liệu</p>
                    </div>
                    <button
                        onClick={() => exportToPDF(dashboardStats, performanceMetrics, total, historicalData, weeklyActivity, managerPerformance, approvalTrends)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Xuất PDF
                    </button>
                </div>

                {/* Stats Cards */}
                {dashboardStats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Tổng đơn vị</p>
                                    <p className="text-2xl font-semibold text-gray-900">{dashboardStats.totalUnits}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Đang chờ duyệt</p>
                                    <p className="text-2xl font-semibold text-gray-900">{dashboardStats.pendingApprovals}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Tỷ lệ duyệt</p>
                                    <p className="text-2xl font-semibold text-gray-900">{dashboardStats.approvalRate?.toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Thời gian xử lý TB</p>
                                    <p className="text-2xl font-semibold text-gray-900">{dashboardStats.avgProcessingTime?.toFixed(1)}h</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Status Distribution Pie Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố trạng thái</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
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

                    {/* Overview Bar Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan đơn vị</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={overviewBarData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Historical Data Chart */}
                {historicalData.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dữ liệu lịch sử theo tháng</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={historicalData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="totalUnits" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                                <Area type="monotone" dataKey="activeUnits" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                                <Area type="monotone" dataKey="pendingUnits" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Weekly Activity Chart */}
                {weeklyActivity.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động theo tuần</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={weeklyActivity}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="week" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="approvals" stroke="#10B981" strokeWidth={2} />
                                <Line type="monotone" dataKey="rejections" stroke="#EF4444" strokeWidth={2} />
                                <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Performance Metrics Table */}
                {performanceMetrics && (
                    <div className="bg-white rounded-lg shadow mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Chỉ số hiệu suất</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chỉ số</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá trị</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Thời gian duyệt TB</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{performanceMetrics.avgApprovalTime?.toFixed(2)} giờ</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Thời gian từ chối TB</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{performanceMetrics.avgRejectionTime?.toFixed(2)} giờ</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Bottleneck (>48h)</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{performanceMetrics.bottleneckCount}</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Hiệu suất hệ thống</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{performanceMetrics.systemEfficiency?.toFixed(2)}%</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Manager Performance Chart */}
                {managerPerformance.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiệu suất quản lý</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={managerPerformance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="managerName" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="approvedCount" fill="#10B981" name="Đã duyệt" />
                                <Bar dataKey="rejectedCount" fill="#EF4444" name="Đã từ chối" />
                                <Bar dataKey="pendingCount" fill="#F59E0B" name="Đang chờ" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Approval Trends */}
                {approvalTrends.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng duyệt (30 ngày)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={approvalTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="approvals" stroke="#10B981" strokeWidth={2} name="Duyệt" />
                                <Line type="monotone" dataKey="rejections" stroke="#EF4444" strokeWidth={2} name="Từ chối" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Top Rejection Reasons */}
                {performanceMetrics?.topRejectionReasons && performanceMetrics.topRejectionReasons.length > 0 && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Lý do từ chối phổ biến</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                {performanceMetrics.topRejectionReasons.map((reason, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-red-600">{index + 1}</span>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-gray-900">{reason}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransportUnitOverview;