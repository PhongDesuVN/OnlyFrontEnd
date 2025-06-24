import React      from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Truck, Search }     from 'lucide-react';

export default function Sidebar() {
    const { pathname } = useLocation();
    /** active khi URL BẮT ĐẦU bằng path menu */
    const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

    return (
        <aside className="w-64 bg-charcoal-800 text-white p-6 fixed h-full">
            <h2 className="text-2xl font-semibold mb-6 text-gold-200">Vận Chuyển Nhà</h2>

            <nav className="space-y-2">
                <Link
                    to="/transport-units/overview"
                    className={`flex items-center gap-2 p-2 rounded-md ${
                        isActive('/transport-units/overview')
                            ? 'bg-charcoal-700' : 'hover:bg-charcoal-700'
                    }`}
                >
                    <Truck size={20}/> Tổng Quan
                </Link>

                <Link
                    to="/transport-units"
                    className={`flex items-center gap-2 p-2 rounded-md ${
                        isActive('/transport-units') ? 'bg-charcoal-700' : 'hover:bg-charcoal-700'
                    }`}
                >
                    <Search size={20}/> Danh Sách
                </Link>
            </nav>
        </aside>
    );
}
