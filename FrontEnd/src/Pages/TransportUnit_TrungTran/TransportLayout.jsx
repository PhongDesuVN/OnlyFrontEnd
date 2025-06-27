import React from 'react';
import { Outlet } from 'react-router-dom';
import { Truck } from 'lucide-react';
import Sidebar from '../../Components/Sidebar_Trung/Sidebar';

export default function TransportLayout() {
    return (
        <div className="flex min-h-screen bg-blue-50">
            <Sidebar />
            <div className="ml-64 flex-1 p-6">
                <header className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-lg flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-3">
                        <Truck size={20} className="text-blue-600" />
                        <span className="font-semibold text-blue-900">Dịch Vụ Vận Chuyển Uy Tín</span>
                    </div>
                    <span className="text-sm text-blue-700">Hoạt động 24/7</span>
                </header>
                <Outlet />
            </div>
        </div>
    );
}