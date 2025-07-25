import React from "react";
import { BarChart3 } from "lucide-react";

export default function PaymentHeader() {
  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 text-white py-5 px-8 shadow-lg flex items-center justify-between z-30">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-white" />
        <h1 className="text-2xl font-bold tracking-wide">Hệ thống quản lý thanh toán</h1>
      </div>
    </header>
  );
} 