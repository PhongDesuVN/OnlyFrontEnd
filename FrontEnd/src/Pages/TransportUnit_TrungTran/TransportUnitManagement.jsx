import React, { useState, useEffect, useMemo } from 'react';
import { Search, Eye, Pencil, Check, X, Clock, Truck } from 'lucide-react';
import Footer from '../../Components/FormLogin_yen/Footer';
import Cookies from 'js-cookie';

const apiRoot = 'http://localhost:8083/api';

const emptyForm = {
    nameCompany: '',
    namePersonContact: '',
    phone: '',
    licensePlate: '',
    status: 'ACTIVE',
    note: '',
};

export default function TransportUnitManagement() {
    /* ──────────────────────────────── state ──────────────────────────────── */
    const [showMenu, setShowMenu] = useState(false);
    const [units, setUnits] = useState([]); // Dữ liệu đã lọc, sắp xếp và phân trang
    const [allUnits, setAllUnits] = useState([]); // Toàn bộ dữ liệu từ API
    const [approval, setApproval] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [secondaryFilter, setSecondaryFilter] = useState(''); // Lọc thứ hai
    const [managerNote, setManagerNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('transportId');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0); // Giữ lại vì cần cho logic phân trang

    const authHeader = {
        headers: { Authorization: `Bearer ${Cookies.get('authToken')}` },
    };

    /* ──────────────────────────────── API ──────────────────────────────── */
    const fetchUnits = async (url = `${apiRoot}/transport-units`) => {
        try {
            setLoading(true);
            const queryString = new URLSearchParams({
                page: currentPage - 1,
                size: pageSize,
            }).toString();
            const fullUrl = `${url}?${queryString}`;
            const res = await fetch(fullUrl, authHeader);
            if (!res.ok) {
                throw new Error(`Lỗi HTTP: ${res.status}`);
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                setAllUnits(data);
                setTotalItems(data.length);
                setTotalPages(Math.ceil(data.length / pageSize));
                setUnits(data.slice(0, pageSize));
            } else if (data && Array.isArray(data.content)) {
                setAllUnits(data.content);
                setTotalItems(data.totalElements || data.content.length);
                setTotalPages(Math.ceil(data.totalElements / pageSize));
                setUnits(data.content.slice(0, pageSize));
            } else {
                setError('Không có dữ liệu từ API hoặc định dạng không hợp lệ');
                setAllUnits([]);
                setUnits([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setError(`Hiện tại không có đơn mới: ${error.message}`);
            setAllUnits([]);
            setUnits([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const fetchAdvancedSearch = async (keyword, filterType) => {
        try {
            setLoading(true);
            const requestBody = {
                [filterType]: keyword, // Gán giá trị vào trường tương ứng với filterType
            };
            const res = await fetch(`${apiRoot}/transport-units/search-advanced`, {
                method: 'POST',
                ...authHeader,
                headers: { ...authHeader.headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });
            if (!res.ok) {
                throw new Error(`Lỗi HTTP: ${res.status}`);
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                setAllUnits(data);
                setTotalItems(data.length);
                setTotalPages(Math.ceil(data.length / pageSize));
                setUnits(data.slice(0, pageSize));
            } else if (data && Array.isArray(data.content)) {
                setAllUnits(data.content);
                setTotalItems(data.totalElements || data.content.length);
                setTotalPages(Math.ceil(data.totalElements / pageSize));
                setUnits(data.content.slice(0, pageSize));
            } else {
                setError('Không có dữ liệu từ API hoặc định dạng không hợp lệ');
                setAllUnits([]);
                setUnits([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Advanced search error:', error);
            setError(`Lỗi khi lọc nâng cao: ${error.message}`);
            setAllUnits([]);
            setUnits([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    // Fetch tổng quan dữ liệu khi component mount
    const fetchTotalUnits = async () => {
        try {
            const res = await fetch(`${apiRoot}/transport-units`, authHeader);
            if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
            const data = await res.json();
            if (data && Array.isArray(data.content)) {
                setAllUnits(data.content);
            } else {
                setAllUnits([]);
            }
        } catch (e) {
            console.error('Lỗi khi tải dữ liệu tổng quan:', e);
            setAllUnits([]);
        }
    };

    /* ───────────────────── helper: lọc, sắp xếp và phân trang ───────────────────── */
    const filteredAndSortedUnits = useMemo(() => {
        let filteredData = [...allUnits];

        // Bước 1: Lọc theo statusFilter
        if (statusFilter !== 'ALL') {
            filteredData = filteredData.filter((unit) => unit.status === statusFilter);
        }

        // Bước 2: Sắp xếp
        const statusRank = { PENDING_APPROVAL: 0, ACTIVE: 1, INACTIVE: 2 };
        filteredData.sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];
            if (sortBy === 'status') {
                valA = statusRank[valA] ?? 99;
                valB = statusRank[valB] ?? 99;
            } else if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }
            return sortOrder === 'asc' ? (valA < valB ? -1 : valA > valB ? 1 : 0) : (valA > valB ? -1 : valA < valB ? 1 : 0);
        });

        // Tính tổng số trang dựa trên dữ liệu đã lọc
        const totalFilteredItems = filteredData.length;
        setTotalPages(Math.ceil(totalFilteredItems / pageSize));
        setTotalItems(totalFilteredItems);

        // Áp dụng phân trang
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalFilteredItems);
        return filteredData.slice(startIndex, endIndex);
    }, [allUnits, statusFilter, sortBy, sortOrder, currentPage, pageSize]);

    /* ───────────────────── helper: xem chi tiết ──────────────────── */
    const handleViewDetails = async (u) => {
        let data = {};
        try {
            const res = await fetch(
                `${apiRoot}/transport-unit-approvals/by-transport-unit/${u.transportId}`,
                authHeader,
            );
            if (res.ok) data = await res.json();
        } catch {
            /* ignore */
        } finally {
            setApproval({
                approvalId: data.approvalId ?? '—',
                status: data.status ?? 'CHƯA CÓ YÊU CẦU',
                requestedAt: data.requestedAt ?? null,
                processedAt: data.processedAt ?? null,
                senderEmail: data.senderEmail ?? u.senderEmail ?? u.email ?? u.contactEmail ?? '—',
                approvedByManagerId: data.approvedByManagerId ?? '—',
                managerNote: data.managerNote ?? u.note ?? '—',
            });
            setSelectedUnit(u);
            setManagerNote('');
            setShowDetail(true);
        }
    };

    /* ───────────────────── duyệt / từ chối ──────────────────── */
    const handleApproveReject = async (type) => {
        if (!approval?.approvalId) return;
        if (managerNote.trim() === '') {
            alert('Vui lòng nhập ghi chú trước khi xử lý.');
            return;
        }
        try {
            const res = await fetch(
                `${apiRoot}/transport-unit-approvals/${approval.approvalId}/${type}`,
                {
                    method: 'POST',
                    ...authHeader,
                    headers: { ...authHeader.headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ managerNote }),
                },
            );
            if (!res.ok) throw new Error('Không thể xử lý phê duyệt');
            setShowDetail(false);
            fetchUnits(); // Cập nhật units sau khi phê duyệt/từ chối
            fetchTotalUnits(); // Cập nhật lại tổng quan
        } catch (e) {
            alert(e.message);
        }
    };

    /* ───────────────────── modal sửa ──────────────────── */
    const openEditModal = (u) => {
        if (u.status !== 'ACTIVE') {
            return alert('Chỉ đơn vị ở trạng thái ACTIVE mới được cập nhật.');
        }
        setSelectedUnit(u);
        setForm({
            nameCompany: u.nameCompany,
            namePersonContact: u.namePersonContact,
            phone: u.phone,
            licensePlate: u.licensePlate,
            status: u.status,
            note: u.note,
        });
        setShowEdit(true);
    };

    const Label = ({ children }) => (
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{children}</label>
    );

    const InfoCard = ({ label, value, icon }) => (
        <div className="bg-cream-50 p-4 rounded-lg shadow-md border border-gold-100 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
                {icon && <div className="text-gold-400">{icon}</div>}
                <Label>{label}</Label>
            </div>
            <p className="text-lg font-medium text-gray-900">{value}</p>
        </div>
    );

    const ActionBtn = ({ color, children, onClick, full = false }) => {
        const base = 'py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200';
        const map = {
            green: 'bg-green-100 hover:bg-green-200 text-green-800 focus:ring-2 focus:ring-green-300 focus:ring-offset-2',
            red: 'bg-red-100 hover:bg-red-200 text-red-800 focus:ring-2 focus:ring-red-300 focus:ring-offset-2',
            gray: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2',
        };
        return (
            <button onClick={onClick} className={`${full ? 'w-full' : 'flex-1'} ${base} ${map[color]}`}>
                {children}
            </button>
        );
    };

    const handleUpdate = async () => {
        try {
            const res = await fetch(
                `${apiRoot}/transport-units/update/${selectedUnit.transportId}`,
                {
                    method: 'PUT',
                    ...authHeader,
                    headers: { ...authHeader.headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                },
            );
            if (!res.ok) throw new Error('Cập nhật thất bại');
            await fetchUnits();
            fetchTotalUnits();
            setShowEdit(false);
        } catch (e) {
            alert(e.message);
        }
    };

    /* ───────────────────── search & filter & sort ──────────────────── */
    const handleSearch = () => {
        setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
        if (secondaryFilter && searchKeyword.trim()) {
            fetchAdvancedSearch(searchKeyword, secondaryFilter);
        } else {
            fetchUnits();
        }
    };

    const handleStatusFilter = (st) => {
        setStatusFilter(st);
        setCurrentPage(1);
        fetchUnits(); // Cập nhật khi thay đổi statusFilter
    };

    const handleSecondaryFilter = (value) => {
        setSecondaryFilter(value);
        setCurrentPage(1);
        if (value && searchKeyword.trim()) {
            fetchAdvancedSearch(searchKeyword, value);
        } else {
            fetchUnits();
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            fetchUnits(); // Cập nhật khi thay đổi trang
        }
    };

    /* ───────────────────── useEffect ───────────────────── */
    useEffect(() => {
        fetchUnits();
        fetchTotalUnits();
    }, []);

    useEffect(() => {
        setUnits(filteredAndSortedUnits);
    }, [filteredAndSortedUnits]);

    // Tính số lượng tổng quan từ allUnits
    const totalCountByStatus = useMemo(() => {
        return allUnits.reduce(
            (acc, unit) => {
                if (unit.status === 'PENDING_APPROVAL') acc.pending++;
                else if (unit.status === 'ACTIVE') acc.active++;
                else if (unit.status === 'INACTIVE') acc.inactive++;
                return acc;
            },
            { pending: 0, active: 0, inactive: 0 }
        );
    }, [allUnits]);

    /* ──────────────────────────────── UI ──────────────────────────────── */
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-charcoal-800 text-white p-6 fixed h-full">
                <h2 className="text-2xl font-semibold mb-6 text-gold-200">Vận Chuyển Nhà</h2>
                <nav>
                    <ul className="space-y-2">
                        {[
                            { name: 'Tổng Quan', icon: <Truck size={20} />, active: true },
                            { name: 'Danh Sách', icon: <Search size={20} /> },
                            { name: 'Thanh Toán', icon: <Check size={20} /> },
                            { name: 'Tìm Kiếm', icon: <Search size={20} /> },
                        ].map((item) => (
                            <li key={item.name}>
                                <a
                                    href="#"
                                    className={`flex items-center gap-2 p-2 rounded-md ${
                                        item.active ? 'bg-charcoal-700' : 'hover:bg-charcoal-700'
                                    }`}
                                >
                                    {item.icon}
                                    {item.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="ml-64 flex-1 p-6">
                <header className="bg-gradient-to-r from-cream-100 to-gold-50 text-gray-900 p-4 rounded-lg flex justify-between items-center mb-6 shadow-lg">
                    <div className="flex items-center gap-2">
                        <Truck size={24} />
                        <h3 className="text-xl font-semibold">Dịch vụ vận chuyển uy tín</h3>
                    </div>
                    <span className="text-base font-medium">Hoạt động 24/7</span>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <InfoCard
                        label="Đang chờ"
                        value={totalCountByStatus.pending}
                        icon={<Clock size={20} />}
                    />
                    <InfoCard
                        label="Hoạt động"
                        value={totalCountByStatus.active}
                        icon={<Check size={20} />}
                    />
                    <InfoCard
                        label="Không hoạt động"
                        value={totalCountByStatus.inactive}
                        icon={<X size={20} />}
                    />
                </div>
                <div className="bg-white p-8 rounded-xl shadow-xl border border-gold-100">
                    <h1 className="text-2xl font-bold text-gray-900 mb-8">Quản Lý Đơn Vị Vận Chuyển</h1>
                    {/* Search / Filter / Sort */}
                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                        <div className="relative flex-1">
                            <input
                                value={searchKeyword}
                                onChange={(e) => {
                                    setSearchKeyword(e.target.value);
                                    setCurrentPage(1);
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Tìm kiếm theo tên công ty, người liên hệ..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-200 focus:border-gold-200 text-gray-800"
                            />
                            <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            className="px-6 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-200 focus:border-gold-200 text-gray-800"
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="INACTIVE">Không hoạt động</option>
                            <option value="PENDING_APPROVAL">Đang chờ duyệt</option>
                        </select>
                        <select
                            value={secondaryFilter}
                            onChange={(e) => handleSecondaryFilter(e.target.value)}
                            className="px-6 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-200 focus:border-gold-200 text-gray-800"
                        >
                            <option value="">Lọc thêm...</option>
                            <option value="nameCompany">Tên công ty</option>
                            <option value="namePersonContact">Người liên hệ</option>
                            <option value="licensePlate">Biển số xe</option>
                        </select>
                        <button
                            onClick={handleSearch}
                            className="px-6 py-3 bg-gold-200 text-gray-900 rounded-lg hover:bg-gold-300 focus:ring-2 focus:ring-gold-200 focus:ring-offset-2 font-semibold"
                        >
                            Tìm kiếm
                        </button>
                    </div>

                    /* Table */
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-flex items-center gap-2 text-gray-600">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gold-200"></div>
                                    Đang tải dữ liệu...
                                </div>
                            </div>
                        ) : error ? (
                            <div className="p-12 text-center">
                                <p className="text-red-600 bg-red-50 px-6 py-3 rounded-lg inline-block">{error}</p>
                            </div>
                        ) : units.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-gray-600 bg-gray-50 px-6 py-3 rounded-lg inline-block">Không có dữ liệu</p>
                            </div>
                        ) : (
                            <>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        {['Công ty', 'Người liên hệ', 'Số điện thoại', 'Biển số xe', 'Trạng thái', 'Thao tác'].map((h) => (
                                            <th
                                                key={h}
                                                className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wide"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {units.map((u) => (
                                        <tr key={u.transportId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.nameCompany}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{u.namePersonContact}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{u.phone}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700 font-mono">{u.licensePlate}</td>
                                            <td className="px-6 py-4">
                        <span
                            className={`px-3 py-1 inline-flex text-sm font-medium rounded-full ${
                                u.status === 'ACTIVE'
                                    ? 'bg-green-100 text-green-800'
                                    : u.status === 'INACTIVE'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                          {u.status === 'PENDING_APPROVAL'
                              ? 'Đang chờ duyệt'
                              : u.status === 'ACTIVE'
                                  ? 'Hoạt động'
                                  : 'Không hoạt động'}
                        </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(u)}
                                                        className="p-2 text-gold-500 hover:text-gold-700 rounded-md"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(u)}
                                                        className="p-2 text-purple-500 hover:text-purple-700 rounded-md"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Pencil className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                {/* Pagination */}
                                <div className="flex justify-center mt-4">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`mx-1 px-3 py-1 rounded-lg ${
                                                currentPage === page
                                                    ? 'bg-gold-200 text-gray-900'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                            disabled={page > totalPages}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <Footer />
            </div>

            {/* Detail Modal */}
            {showDetail && selectedUnit && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-cream-100 to-gold-50 px-6 py-4">
                            <h3 className="text-xl font-semibold text-gray-900 text-center">Chi tiết phê duyệt</h3>
                        </div>
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoCard label="Mã phê duyệt" value={approval.approvalId} mono />
                                <div className="bg-cream-50 p-4 rounded-lg border border-gold-100">
                                    <Label>Trạng thái</Label>
                                    <p className="text-sm font-medium mt-1">
                    <span
                        className={`px-3 py-1 rounded-full text-sm ${
                            approval.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : approval.status === 'APPROVED'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {approval.status}
                    </span>
                                    </p>
                                </div>
                                <InfoCard
                                    label="Yêu cầu lúc"
                                    value={approval.requestedAt ? new Date(approval.requestedAt).toLocaleString('vi-VN') : '—'}
                                />
                                <InfoCard
                                    label="Xử lý lúc"
                                    value={approval.processedAt ? new Date(approval.processedAt).toLocaleString('vi-VN') : '—'}
                                />
                                <InfoCard label="Email gửi yêu cầu" value={approval.senderEmail} className="break-all" />
                                <InfoCard label="Quản lý duyệt (ID)" value={approval.approvedByManagerId} mono />
                                <InfoCard
                                    label="Ghi chú hiện tại"
                                    value={approval.managerNote}
                                    className="md:col-span-2 whitespace-pre-wrap"
                                />
                                {approval.status === 'PENDING' && (
                                    <div className="md:col-span-2 border-t border-gold-100 pt-6 mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nhập ghi chú của bạn <span className="text-red-600">*</span>
                                        </label>
                                        <textarea
                                            value={managerNote}
                                            onChange={(e) => setManagerNote(e.target.value)}
                                            rows={3}
                                            placeholder="Nhập lý do phê duyệt hoặc từ chối..."
                                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-gold-200 focus:border-gold-200"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Footer */}
                        <div className="px-6 pb-6">
                            <div className="flex gap-4">
                                {approval.status === 'PENDING' && (
                                    <>
                                        <ActionBtn color="green" onClick={() => handleApproveReject('approve')}>
                                            <Check className="h-4 w-4" /> Phê duyệt
                                        </ActionBtn>
                                        <ActionBtn color="red" onClick={() => handleApproveReject('reject')}>
                                            <X className="h-4 w-4" /> Từ chối
                                        </ActionBtn>
                                    </>
                                )}
                                <ActionBtn color="gray" full={approval.status !== 'PENDING'} onClick={() => setShowDetail(false)}>
                                    Đóng
                                </ActionBtn>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEdit && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-cream-100 to-gold-50 px-6 py-4 rounded-t-lg">
                            <h3 className="text-xl font-semibold text-gray-900 text-center">Cập nhật thông tin đơn vị</h3>
                        </div>
                        {/* Content */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    ['nameCompany', 'Tên công ty'],
                                    ['namePersonContact', 'Người liên hệ'],
                                    ['phone', 'Số điện thoại'],
                                    ['licensePlate', 'Biển số xe'],
                                ].map(([name, label]) => (
                                    <div key={name} className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">{label}</label>
                                        <input
                                            name={name}
                                            value={form[name]}
                                            onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-gold-200 focus:border-gold-200"
                                        />
                                    </div>
                                ))}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-gold-200 focus:border-gold-200"
                                    >
                                        {['ACTIVE', 'INACTIVE'].map((st) => (
                                            <option key={st} value={st}>
                                                {st === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                                    <textarea
                                        name="note"
                                        value={form.note}
                                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-gold-200 focus:border-gold-200 resize-none"
                                        rows={3}
                                        placeholder="Nhập ghi chú..."
                                    />
                                </div>
                            </div>
                        </div>
                        /* Actions */
                        <div className="px-6 pb-6">
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setShowEdit(false)}
                                    className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gold-200 focus:ring-offset-2"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-6 py-3 rounded-lg bg-gold-200 text-gray-900 hover:bg-gold-300 focus:ring-2 focus:ring-gold-200 focus:ring-offset-2 font-semibold"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close menus */}
            {showMenu && <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />}
        </div>
    );
}