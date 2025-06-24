import React, {useState, useEffect, useMemo} from 'react';
import {Search, Eye, Pencil, Check, X} from 'lucide-react';
import Footer from '../../Components/FormLogin_yen/Footer';
import Cookies from 'js-cookie';




export default function TransportUnitManagement() {
    const apiRoot = 'http://localhost:8083/api';
    const pageSize = 10;
    const [showEdit, setShowEdit] = useState(false);
    const [form, setForm] = useState({
        nameCompany: '',
        namePersonContact: '',
        phone: '',
        licensePlate: '',
        status: 'ACTIVE',
        note: '',
    });
    /* ───── STATE ───── */
    const [allUnits, setAllUnits] = useState([]);
    const [units, setUnits] = useState([]);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /* modal */
    const [showDetail, setShowDetail] = useState(false);
    const [approval, setApproval] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [managerNote, setManagerNote] = useState('');
    const openEditModal = (unit) => {
        setSelectedUnit(unit);
        setForm({
            nameCompany: unit.nameCompany,
            namePersonContact: unit.namePersonContact,
            phone: unit.phone,
            licensePlate: unit.licensePlate,
            status: unit.status,
            note: unit.note ?? '',
        });
        setShowEdit(true);
    };


    const authHeader = {headers: {Authorization: `Bearer ${Cookies.get('authToken')}`}};

    /* ───── FETCH LIST ───── */
    const fetchUnits = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${apiRoot}/transport-units?page=0&size=1000`, authHeader);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setAllUnits(Array.isArray(data) ? data : data.content ?? []);
            setError('');
        } catch {
            setError('Không thể tải dữ liệu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);
    const handleUpdate = async () => {
        try {
            const res = await fetch(`${apiRoot}/transport-units/update/${selectedUnit.transportId}`, {
                method: 'PUT',
                ...authHeader,
                headers: {...authHeader.headers, 'Content-Type': 'application/json'},
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error('Cập nhật thất bại');
            await fetchUnits(); // load lại danh sách
            setShowEdit(false); // đóng modal
        } catch (e) {
            alert(e.message);
        }
    };


    /* ───── FILTER + PAGINATE ───── */
    const filtered = useMemo(() => {
        return allUnits.filter(u => {
            const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
            const matchKeyword = searchKeyword.trim() === '' ||
                (u.nameCompany?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                    u.namePersonContact?.toLowerCase().includes(searchKeyword.toLowerCase()));
            return matchStatus && matchKeyword;
        });
    }, [allUnits, statusFilter, searchKeyword]);


    useEffect(() => {
        const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
        setTotalPages(pages);
        const start = (currentPage - 1) * pageSize;
        setUnits(filtered.slice(start, start + pageSize));
    }, [filtered, currentPage]);

    /* ───── DETAIL HANDLER ───── */
    const handleViewDetails = async (u) => {
        let data = {};
        try {
            const res = await fetch(
                `${apiRoot}/transport-unit-approvals/by-transport-unit/${u.transportId}`,
                authHeader
            );
            if (res.ok) data = await res.json();
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

    /* ───── APPROVE / REJECT ───── */
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
                }
            );
            if (!res.ok) throw new Error();
            setShowDetail(false);
            fetchUnits();
        } catch {
            alert('Không thể xử lý phê duyệt');
        }
    };

    /* ───── REUSABLE UI PIECES ───── */
    const Label = ({children}) => (
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{children}</label>
    );

    const InfoCard = ({label, value, mono = false, className = ''}) => (
        <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
            <Label>{label}</Label>
            <p className={`text-sm mt-1 ${mono ? 'font-mono' : 'text-gray-900'}`}>{value}</p>
        </div>
    );

    const ActionBtn = ({color, children, onClick}) => {
        const base = 'px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 text-sm transition-colors';
        const map = {
            green: 'bg-green-100 text-green-800 hover:bg-green-200',
            red: 'bg-red-100 text-red-700 hover:bg-red-200',
            gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        };
        return <button onClick={onClick} className={`${base} ${map[color]}`}>{children}</button>;
    };

    /* ─────────────────────────────────────────────────────────── */
    return (
        <div className="flex flex-col bg-gray-50">

            {/* NỘI DUNG CHÍNH */}
            <main className="flex-grow">

                {/* ===== LIST CARD ===== */}
                <div
                    className="bg-white rounded-xl shadow border border-gold-100  flex flex-col min-h-[calc(100vh-160px)]">
                    <div className="p-4 border-b border-gray-100 flex-shrink-0">
                        <h1 className="text-lg font-bold mb-3">Quản Lý Đơn Vị Vận Chuyển</h1>

                        {/* SEARCH / FILTER */}
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative w-[250px]">
                                <input
                                    value={searchKeyword}
                                    onChange={e => setSearchKeyword(e.target.value)}
                                    placeholder="Tìm kiếm..."
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"/>
                            </div>


                            <select
                                value={statusFilter}
                                onChange={e => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="ALL">Tất cả</option>
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="INACTIVE">Không hoạt động</option>
                                <option value="PENDING_APPROVAL">Đang chờ</option>
                            </select>
                        </div>
                    </div>

                    {/* TABLE CONTAINER */}
                    <div className="flex-grow overflow-auto flex flex-col">

                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-gray-600">Đang tải...</p>
                            </div>
                        ) : error ? (
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-red-600">{error}</p>
                            </div>
                        ) : (
                            <>
                                {/* Table with adjusted height and reduced spacing */}
                                <div className="flex-1 overflow-y-auto min-h-[calc(100vh-300px)]">

                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            {['Công ty', 'Liên hệ', 'SĐT', 'Biển số', 'Trạng thái', ''].map(h => (
                                                <th key={h}
                                                    className="px-4 py-2 text-left font-medium border-b"> {/* Change py-3 to py-2 */}
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {units.map(u => (
                                            <tr key={u.transportId} className="hover:bg-gray-50 border-b">
                                                <td className="px-4 py-2 font-medium">{u.nameCompany}</td>
                                                {/* Change py-3 to py-2 */}
                                                <td className="px-4 py-2">{u.namePersonContact}</td>
                                                {/* Change py-3 to py-2 */}
                                                <td className="px-4 py-2">{u.phone}</td>
                                                {/* Change py-3 to py-2 */}
                                                <td className="px-4 py-2 font-mono">{u.licensePlate}</td>
                                                {/* Change py-3 to py-2 */}
                                                <td className="px-4 py-2">
                                <span
                                    className={`px-2 py-0.5 rounded-full text-xs ${
                                        u.status === 'ACTIVE'
                                            ? 'bg-green-100 text-green-700'
                                            : u.status === 'INACTIVE'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                    }`}
                                >
                                  {u.status === 'PENDING_APPROVAL'
                                      ? 'Đang chờ'
                                      : u.status === 'ACTIVE'
                                          ? 'Hoạt động'
                                          : 'Không hoạt động'}
                                </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex gap-1">
                                                        <button className="p-1 text-gold-600 hover:text-gold-800"
                                                                onClick={() => handleViewDetails(u)}>
                                                            <Eye size={14}/>
                                                        </button>
                                                        <button
                                                            className="p-1 text-purple-600 hover:text-purple-800"
                                                            onClick={() => openEditModal(u)}
                                                        >
                                                            <Pencil size={14}/>
                                                        </button>

                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Fill empty rows */}
                                        {Array.from({length: Math.max(0, pageSize - units.length)}).map((_, i) => (
                                            <tr key={`empty-${i}`} className="border-b">
                                                <td className="px-4 py-2 h-[39px]"></td>
                                                {/* Change py-3 to py-2 */}
                                                <td className="px-4 py-2 h-[38px]"></td>
                                                {/* Change py-3 to py-2 */}
                                                <td className="px-4 py-2 h-[38px]"></td>
                                                {/* Change py-3 to py-2 */}
                                                <td className="px-4 py-2 h-[38px]"></td>
                                                {/* Change py-3 to py-2 */}
                                                <td className="px-4 py-2 h-[38px]"></td>
                                                {/* Change py-3 to py-2 */}
                                                <td className="px-4 py-2 h-[38px]"></td>
                                                {/* Change py-3 to py-2 */}
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* PAGINATION */}
                                <div className="border-t bg-white p-1 flex-shrink-0"> {/* Change p-3 to p-1 */}
                                    <div className="flex justify-center text-xs">
                                        {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setCurrentPage(p)}
                                                className={`px-2 py-1 mx-1 rounded ${p === currentPage ? 'bg-gold-200' : 'bg-gray-200 hover:bg-gray-300'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ===== MODAL CHI TIẾT ===== */}
                {showDetail && approval && (
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div
                            className="bg-white w-full max-w-3xl rounded-xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden border border-gold-100">
                            {/* HEADER */}
                            <div className="bg-yellow-100 px-6 py-3 border-b border-gold-200">
                                <h3 className="text-lg font-semibold text-yellow-800 text-center">Chi tiết phê
                                    duyệt</h3>
                            </div>

                            {/* CONTENT */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoCard label="Mã phê duyệt" value={approval.approvalId} mono/>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <Label>Trạng thái</Label>
                                        <p className="mt-1">
                          <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  approval.status === 'PENDING'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : approval.status === 'APPROVED'
                                          ? 'bg-green-100 text-green-700'
                                          : 'bg-red-100 text-red-700'
                              }`}
                          >
                            {approval.status === 'PENDING' ? 'Đang chờ' : approval.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
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
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoCard label="Email gửi yêu cầu" value={approval.senderEmail}
                                                  className="break-all"/>
                                        <InfoCard label="Quản lý duyệt (ID)" value={approval.approvedByManagerId}
                                                  mono/>
                                    </div>
                                    <InfoCard label="Ghi chú hiện tại" value={approval.managerNote}
                                              className="md:col-span-2 whitespace-pre-wrap"/>

                                    {approval.status === 'PENDING' && (
                                        <div className="md:col-span-2 border-t pt-4 mt-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nhập ghi chú <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={managerNote}
                                                onChange={e => setManagerNote(e.target.value)}
                                                rows={3}
                                                placeholder="Nhập lý do phê duyệt hoặc từ chối..."
                                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                                {approval.status === 'PENDING' && (
                                    <>
                                        <ActionBtn color="green" onClick={() => handleApproveReject('approve')}>
                                            <Check size={14}/> Phê duyệt
                                        </ActionBtn>
                                        <ActionBtn color="red" onClick={() => handleApproveReject('reject')}>
                                            <X size={14}/> Từ chối
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
            </main>
            {showEdit && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-xl rounded-xl shadow-xl p-6 border border-gold-100">
                        <h3 className="text-lg font-bold text-center text-yellow-800 mb-4">Chỉnh sửa đơn vị</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <Label>Công ty</Label>
                                <input
                                    value={form.nameCompany}
                                    onChange={e => setForm({...form, nameCompany: e.target.value})}
                                    className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm"
                                />
                            </div>
                            <div>
                                <Label>Liên hệ</Label>
                                <input
                                    value={form.namePersonContact}
                                    onChange={e => setForm({...form, namePersonContact: e.target.value})}
                                    className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm"
                                />
                            </div>
                            <div>
                                <Label>SĐT</Label>
                                <input
                                    value={form.phone}
                                    onChange={e => setForm({...form, phone: e.target.value})}
                                    className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm"
                                />
                            </div>
                            <div>
                                <Label>Biển số</Label>
                                <input
                                    value={form.licensePlate}
                                    onChange={e => setForm({...form, licensePlate: e.target.value})}
                                    className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm font-mono"
                                />
                            </div>
                            <div>
                                <Label>Trạng thái</Label>
                                <select
                                    value={form.status}
                                    onChange={e => setForm({...form, status: e.target.value})}
                                    className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm"
                                >
                                    <option value="ACTIVE">Hoạt động</option>
                                    <option value="INACTIVE">Không hoạt động</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <Label>Ghi chú</Label>
                                <textarea
                                    rows={3}
                                    value={form.note}
                                    onChange={e => setForm({...form, note: e.target.value})}
                                    className="w-full mt-1 border border-gray-300 rounded-lg p-2 text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <ActionBtn color="green" onClick={handleUpdate}>
                                <Check size={14}/> Cập nhật
                            </ActionBtn>
                            <ActionBtn color="gray" onClick={() => setShowEdit(false)}>
                                <X size={14}/> Hủy
                            </ActionBtn>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <Footer className="w-full"/>
        </div>

    );

}