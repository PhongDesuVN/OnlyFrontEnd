import React from 'react';
import { Outlet } from 'react-router-dom';
import { Truck }  from 'lucide-react';
import Sidebar    from '../../Components/Sidebar_Trung/Sidebar';

export default function TransportLayout() {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />

            <div className="ml-64 flex-1 p-4">
                {/* Header cố định */}
                <header className="bg-gradient-to-r from-cream-100 to-gold-50 p-3 rounded-lg
                           flex justify-between items-center shadow">
                    <div className="flex items-center gap-2">
                        <Truck size={18}/>
                        <span className="font-medium">Dịch vụ vận chuyển uy tín</span>
                    </div>
                    <span className="text-sm">Hoạt động 24/7</span>
                </header>

                {/* Nội dung trang con */}
                <Outlet />
            </div>
        </div>
    );
}
