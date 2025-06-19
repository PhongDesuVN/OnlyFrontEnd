// src/routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Signin from "../Pages/Login_Register_yen/Login.jsx";
import Register from "../Pages/Login_Register_yen/Register.jsx";
import ForgotPassword from "../Pages/Login_Register_yen/ForgotPassword.jsx";
import HomePage from "../Pages/HomePage_phong/homepage.jsx";  // Đổi tên import cho rõ ràng
import Staff from "../Pages/Staff_phong/staff.jsx";  // Đổi tên import cho rõ ràng
import ManageOrder from "../Pages/ManageOrder_phong/manageorder.jsx";
import ReceiptsManagement from "../Pages/Receipts/ReceiptsManagement";
import StorageUnitManagement from "../Pages/HungStorage/StorageUnitManagement.jsx";


export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />  {/* Trang chủ */}

            <Route path="/signin" element={<Signin />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            {/* Thêm các route khác nếu cần */}
            <Route path="/staff" element={<Staff />} />
            <Route path="/manageorder" element={<ManageOrder />} />  {/* Quản lý đơn hàng */}
            <Route path="/receipts" element={<ReceiptsManagement />} />
<Route path="/storage-units" element={<StorageUnitManagement />} />

        </Routes>
    );
}
