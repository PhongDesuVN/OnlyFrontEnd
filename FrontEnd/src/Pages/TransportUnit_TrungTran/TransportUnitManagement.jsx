// src/Pages/TransportUnit_TrungTran/TransportUnitManagement.jsx
import React, {useState, useEffect, useMemo} from 'react';
import {Search, Eye, Pencil, Check, X, ArrowUpDown, Settings, User, LogOut} from 'lucide-react';
import Header from '../../Components/FormLogin_yen/Header';
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

    const [units, setUnits] = useState([]);
    const [approval, setApproval] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);

    const [showDetail, setShowDetail] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    const [form, setForm] = useState(emptyForm);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [managerNote, setManagerNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /* NEW: thông tin sort */
    const [sortBy, setSortBy] = useState('status');
    const [sortOrder] = useState('asc');

    const authHeader = {
        headers: {Authorization: `Bearer ${Cookies.get('authToken')}`},
    };

    /* ──────────────────────────────── API ──────────────────────────────── */
    const fetchUnits = async (url = `${apiRoot}/transport-units`) => {
        try {
            setLoading(true);
            const res = await fetch(url, authHeader);
            if (!res.ok) throw new Error(res.status);
            setUnits(await res.json());
        } catch (e) {
            setError(`Không thể tải danh sách: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    /* ───────────────────── helper: sort local ───────────────────── */
    const sortedUnits = useMemo(() => {
        const orderMul = sortOrder === 'asc' ? 1 : -1;
        const statusRank = {PENDING_APPROVAL: 0, ACTIVE: 1, INACTIVE: 2};
        return [...units].sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];

            if (sortBy === 'status') {
                valA = statusRank[valA] ?? 99;
                valB = statusRank[valB] ?? 99;
            } else if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (valA < valB) return -1 * orderMul;
            if (valA > valB) return 1 * orderMul;
            return 0;
        });
    }, [units, sortBy, sortOrder]);

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
                senderEmail:
                    data.senderEmail ?? u.senderEmail ?? u.email ?? u.contactEmail ?? '—',
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
                    headers: {...authHeader.headers, 'Content-Type': 'application/json'},
                    body: JSON.stringify({managerNote}),
                },
            );
            if (!res.ok) throw new Error('Không thể xử lý phê duyệt');
            setShowDetail(false);
            fetchUnits();
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
    const Label = ({children}) => (
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{children}</label>
    );

    const InfoCard = ({label, value, mono, className = ''}) => (
        <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
            <Label>{label}</Label>
            <p className={`text-sm mt-1 ${mono ? 'font-mono' : 'text-gray-900'}`}>{value}</p>
        </div>
    );

    const ActionBtn = ({color, children, onClick, full = false}) => {
        const base = 'py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors';
        const map = {
            green: 'bg-green-600 hover:bg-green-700 text-white focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
            red: 'bg-red-600 hover:bg-red-700 text-white focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
            gray: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
        };
        return (
            <button
                onClick={onClick}
                className={`${full ? 'w-full' : 'flex-1'} ${base} ${map[color]}`}
            >
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
                    headers: {...authHeader.headers, 'Content-Type': 'application/json'},
                    body: JSON.stringify(form),
                },
            );
            if (!res.ok) throw new Error('Cập nhật thất bại');
            await fetchUnits();
            setShowEdit(false);
        } catch (e) {
            alert(e.message);
        }
    };

    /* ───────────────────── search & filter ──────────────────── */
    const handleSearch = () => {
        if (!searchKeyword.trim()) return fetchUnits();
        fetchUnits(
            `${apiRoot}/transport-units/search?keyword=${encodeURIComponent(
                searchKeyword,
            )}`,
        );
    };

    const handleStatusFilter = (st) => {
        setStatusFilter(st);
        if (st === 'ALL') return fetchUnits();
        fetchUnits(`${apiRoot}/transport-units/status/${st}`);
    };

    /* initial load */
    useEffect(() => {
        fetchUnits();
    }, []);

    /* ──────────────────────────────── UI ──────────────────────────────── */
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Fixed header */}
            <Header dashboardHideHome backgroundClass="bg-blue-500"/>

            {/* Fixed Settings Button */}
            <div className="fixed top-6 right-8 z-40">
                <div className="relative">
                    <button
                        onClick={() => setShowMenu((prev) => !prev)}
                        className="bg-white/95 backdrop-blur-sm text-gray-700 font-medium px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm hover:bg-white hover:shadow-md transition-all duration-200 flex items-center gap-2"
                    >
                        <Settings className="h-4 w-4"/>
                        Cài đặt
                    </button>

                    {showMenu && (
                        <div
                            className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        alert('Thông tin chi tiết sẽ hiện ở đây');
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-3 transition-colors"
                                >
                                    <User className="h-4 w-4"/>
                                    Thông tin chi tiết
                                </button>
                                <div className="border-t border-gray-100">
                                    <button
                                        onClick={() => {
                                            Cookies.remove('authToken');
                                            window.location.href = '/login';
                                        }}
                                        className="w-full px-4 py-3 text-left hover:bg-red-50 text-red-600 flex items-center gap-3 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4"/>
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <main className="flex-grow container mx-auto px-4 py-8 pt-24">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Quản Lý Đơn Vị Vận Chuyển</h1>

                    {/* search / filter / sort */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6 relative">
                        <div className="relative flex-1">
                            <input
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="Tìm kiếm theo tên công ty, người liên hệ..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400"/>
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="INACTIVE">Không hoạt động</option>
                            <option value="PENDING_APPROVAL">Đang chờ duyệt</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="status">Sắp xếp: Trạng thái</option>
                            <option value="nameCompany">Tên công ty</option>
                            <option value="licensePlate">Biển số xe</option>
                            <option value="namePersonContact">Người liên hệ</option>
                        </select>

                        <button
                            onClick={handleSearch}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                        >
                            Tìm kiếm
                        </button>
                    </div>

                    {/* table */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-flex items-center gap-2 text-gray-600">
                                    <div
                                        className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600"></div>
                                    Đang tải dữ liệu...
                                </div>
                            </div>
                        ) : error ? (
                            <div className="p-12 text-center">
                                <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg inline-block">{error}</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    {[
                                        'Công ty',
                                        'Người liên hệ',
                                        'Số điện thoại',
                                        'Biển số xe',
                                        'Trạng thái',
                                        'Thao tác',
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {sortedUnits.map((u) => (
                                    <tr key={u.transportId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.nameCompany}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{u.namePersonContact}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{u.phone}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700 font-mono">{u.licensePlate}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${
                                                    u.status === 'ACTIVE'
                                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                                        : u.status === 'INACTIVE'
                                                            ? 'bg-red-100 text-red-800 border border-red-200'
                                                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
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
                                                    className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="h-4 w-4"/>
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(u)}
                                                    className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Pencil className="h-4 w-4"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            {/* ----------------------------- REFINED DETAIL MODAL ----------------------------- */}
            {showDetail && selectedUnit && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    {/* KHUNG NGOÀI – KHÔNG CUỘN */}
                    <div className="bg-white w-full max-w-3xl   /* rộng hơn để 2 cột thoải mái */
                rounded-2xl shadow-2xl
                max-h-[90vh] flex flex-col overflow-hidden"> {/* flex-col & overflow-hidden */}

                        {/* ---------- HEADER ---------- */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                            <h3 className="text-xl font-semibold text-white text-center">
                                Chi tiết phê duyệt
                            </h3>
                        </div>

                        {/* ---------- CONTENT – CHỈ PHẦN NÀY CUỘN ---------- */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Mã phê duyệt */}
                                <InfoCard label="Mã phê duyệt" value={approval.approvalId} mono/>

                                {/* Trạng thái */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <Label>Trạng thái</Label>
                                    <p className="text-sm font-semibold mt-1">
              <span className={`px-2 py-1 rounded-full text-xs
                ${
                  approval.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : approval.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
              }`}>
                {approval.status}
              </span>
                                    </p>
                                </div>

                                {/* Yêu cầu lúc / Xử lý lúc */}
                                <InfoCard
                                       label="Yêu cầu lúc"
                                    value={approval.requestedAt ? new Date(approval.requestedAt).toLocaleString('vi-VN') : '—'}
                                />
                                <InfoCard
                                    label="Xử lý lúc"
                                    value={approval.processedAt ? new Date(approval.processedAt).toLocaleString('vi-VN') : '—'}
                                />

                                {/* Email – chiếm 2 cột */}
                                <InfoCard
                                    label="Email gửi yêu cầu"
                                    value={approval.senderEmail}
                                    className="break-all"
                                />

                                <InfoCard
                                    label="Quản lý duyệt (ID)"
                                    value={approval.approvedByManagerId}
                                    mono
                                />


                                {/* Ghi chú hiện tại – chiếm 2 cột */}
                                <InfoCard
                                    label="Ghi chú hiện tại"
                                    value={approval.managerNote}
                                    className="md:col-span-2 whitespace-pre-wrap"
                                />

                                {/* Ghi chú mới khi PENDING – chiếm 2 cột */}
                                {approval.status === 'PENDING' && (
                                    <div className="md:col-span-2 border-t pt-4 mt-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nhập ghi chú của bạn <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={managerNote}
                                            onChange={(e) => setManagerNote(e.target.value)}
                                            rows={3}
                                            placeholder="Nhập lý do phê duyệt hoặc từ chối..."
                                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ---------- FOOTER ---------- */}
                        <div className="px-6 pb-6">
                            <div className="flex gap-3">
                                {approval.status === 'PENDING' && (
                                    <>
                                        <ActionBtn color="green" onClick={() => handleApproveReject('approve')}>
                                            <Check className="h-4 w-4"/> Phê duyệt
                                        </ActionBtn>
                                        <ActionBtn color="red" onClick={() => handleApproveReject('reject')}>
                                            <X className="h-4 w-4"/> Từ chối
                                        </ActionBtn>
                                    </>
                                )}
                                <ActionBtn color="gray" full={!approval.status === 'PENDING'}
                                           onClick={() => setShowDetail(false)}>
                                    Đóng
                                </ActionBtn>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* ----------------------------- EDIT MODAL ----------------------------- */}
            {showEdit && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 rounded-t-2xl">
                            <h3 className="text-xl font-semibold text-white text-center">
                                Cập nhật thông tin đơn vị
                            </h3>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    ['nameCompany', 'Tên công ty'],
                                    ['namePersonContact', 'Người liên hệ'],
                                    ['phone', 'Số điện thoại'],
                                    ['licensePlate', 'Biển số xe'],
                                ].map(([name, label]) => (
                                    <div key={name} className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {label}
                                        </label>
                                        <input
                                            name={name}
                                            value={form[name]}
                                            onChange={(e) => setForm({...form, [name]: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                ))}

                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Trạng thái
                                    </label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={(e) => setForm({...form, status: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {['ACTIVE', 'INACTIVE'].map((st) => (
                                            <option key={st} value={st}>
                                                {st === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Ghi chú
                                    </label>
                                    <textarea
                                        name="note"
                                        value={form.note}
                                        onChange={(e) => setForm({...form, note: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                        rows={3}
                                        placeholder="Nhập ghi chú..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-6 pb-6">
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowEdit(false)}
                                    className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close menus */}
            {showMenu && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowMenu(false)}
                />
            )}

            <Footer/>
        </div>
    );
}