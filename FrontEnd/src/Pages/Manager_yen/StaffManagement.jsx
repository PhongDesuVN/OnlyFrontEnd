import React, { useEffect, useState } from 'react';
import {
    Truck, Users, User, Edit, Eye, Trash2,
    MessageCircle, PlusCircle, PieChart,
    Activity, Lightbulb, CheckCheck
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion'; // ✅ đã thêm motion
import { jwtDecode } from 'jwt-decode';

const Header = () => (
    <header className="fixed w-full top-0 bg-white shadow z-10">
        <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                <Truck /> Vận Chuyển Nhà
            </div>
            <a href="/" className="text-blue-600 border border-blue-600 px-4 py-1 rounded hover:bg-blue-600 hover:text-white transition">
                Trang Chủ
            </a>
        </div>
    </header>
);

const Sidebar = () => (
    <aside className="w-64 bg-gradient-to-b from-blue-900 to-purple-600 text-white pt-24 px-6 h-screen shadow-xl">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <Users /> Quản Lý Nhân Viên
        </h2>
        <nav className="space-y-4">
            <button className="w-full text-left px-4 py-3 rounded-xl bg-blue-500 shadow-lg flex items-center gap-2 font-medium">
                <PieChart size={18} /> Tổng Quan
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-600 flex items-center gap-2">
                <Eye size={18} /> Danh Sách
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-600 flex items-center gap-2">
                <MessageCircle size={18} /> Phản Hồi
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-600 flex items-center gap-2">
                <Edit size={18} /> Cập Nhật
            </button>
        </nav>
        <div className="mt-20 bg-white text-black p-4 rounded-xl">
            <div className="flex items-center gap-2">
                <User className="text-blue-600" size={24} />
                <div>
                    <p className="font-semibold">Staff User</p>
                    <p className="text-sm text-gray-500">Nhân viên</p>
                </div>
            </div>
        </div>
    </aside>
);

const StaffList = ({ staff }) => (
    <div className="bg-white rounded-xl shadow-xl border p-6">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Quản lý nhân viên</h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
                <PlusCircle size={18} /> Thêm nhân viên
            </button>
        </div>
        <table className="w-full text-left">
            <thead className="bg-gray-100 text-sm text-gray-700">
            <tr>
                <th className="p-3">Họ tên</th>
                <th className="p-3">Email</th>
                <th className="p-3">SĐT</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Hành động</th>
            </tr>
            </thead>
            <tbody>
            {staff.map((s) => (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 whitespace-nowrap">{s.name}</td>
                    <td className="p-3">{s.email}</td>
                    <td className="p-3">{s.phone}</td>
                    <td className="p-3"><StatusBadge status={s.status} /></td>
                    <td className="p-3 space-x-2">
                        <button className="text-gray-600 hover:text-blue-600"><Eye size={16} /></button>
                        <button className="text-gray-600 hover:text-green-600"><MessageCircle size={16} /></button>
                        <button className="text-gray-600 hover:text-yellow-600"><Edit size={16} /></button>
                        <button className="text-gray-600 hover:text-red-600"><Trash2 size={16} /></button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

const StatusBadge = ({ status }) => {
    const base = 'text-sm px-3 py-1 rounded-full font-semibold';
    switch (status) {
        case 'ACTIVE': return <span className={`${base} bg-green-100 text-green-600`}>ACTIVE</span>;
        case 'INACTIVE': return <span className={`${base} bg-yellow-100 text-yellow-600`}>INACTIVE</span>;
        case 'BLOCKED': return <span className={`${base} bg-red-100 text-red-600`}>BLOCKED</span>;
        default: return <span className={base}>{status}</span>;
    }
};

const Dashboard = () => {
    const [staffList, setStaffList] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decoded = jwtDecode(token);
        const managerId = decoded.userId;

        fetch(`/api/v1/manager/${managerId}/staff`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStaffList(data.data.content || []);
                } else {
                    console.error('Invalid response:', data);
                }
            })
            .catch(err => {
                console.error('Fetch failed:', err);
            });
    }, []);

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Header />
            <Sidebar />
            <main className="flex-1 px-6 pt-24">
                <AnimatePresence mode="wait">
                    <motion.div key="staff" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <StaffList staff={staffList} />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Dashboard;
