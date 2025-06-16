// src/routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Signin from "../Pages/Login_Register_yen/Login.jsx";
import Register from "../Pages/Login_Register_yen/Register.jsx";
import ForgotPassword from "../Pages/Login_Register_yen/ForgotPassword.jsx";
import HomePage from "../Pages/HomePage_phong/homepage.jsx";  // Đổi tên import cho rõ ràng
import Staff from "../Pages/Staff_phong/staff.jsx";  // Đổi tên import cho rõ ràng
import Signin from "../Pages/Login_Register_trung/Login.jsx";
import Register from "../Pages/Login_Register_trung/Register.jsx";
import ForgotPassword from "../Pages/Login_Register_trung/ForgotPassword.jsx";
import HomePage from "../Pages/HomePage_phong/homepage.jsx";
import Staff from "../Pages/Staff_phong/staff.jsx";
import ManageOrder from "../Pages/ManageOrder_phong/manageorder.jsx";
import ManageUser from "../Pages/ManageUser_trung/manageuser.jsx";  // Import trang quản lý user mới
import ManageRevenue from "../Pages/ManageRevenue_trung/managerevenue.jsx";  // Import trang quản lý doanh thu

import Signin from "../Pages/Login_Register_trung/Login.jsx";
import Register from "../Pages/Login_Register_trung/Register.jsx";
import ForgotPassword from "../Pages/Login_Register_trung/ForgotPassword.jsx";
import HomePage from "../Pages/HomePage_phong/homepage.jsx";
import Staff from "../Pages/Staff_phong/staff.jsx";
import ManageOrder from "../Pages/ManageOrder_phong/manageorder.jsx";

import Dashboard from "../Pages/Staff_phong/DashBoard.jsx";
import Otp from "../Pages/Login_Register_trung/Otp.jsx";
import ResetPassword from "../Pages/Login_Register_trung/ResetPassword";

import ManagerDashboard from "../Pages/Manager_yen/ManagerDashboard";
import StaffManagement from "../Pages/Manager_yen/StaffManagement.jsx";
import Otp from "../Pages/Login_Register_trung/Otp.jsx";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />  {/* Trang chủ */}

            <Route path="/login" element={<Signin />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/otp" element={<Otp />} />  {/* Route cho trang OTP */}
            <Route path="/otp" element={<Otp />} />  {/* Route cho trang OTP */}
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* Thêm các route khác nếu cần */}
            <Route path="/staff" element={<Staff />} />
            <Route path="/dashboard" element={<Dashboard />} />  {/* Trang Dashboard, có thể là trang chủ hoặc một trang khác */}
            <Route path="/manageorder" element={<ManageOrder />} />  {/* Quản lý đơn hàng */}
            <Route path="/manageuser" element={<ManageUser />} />  {/* Quản lý user */}
            <Route path="/managerevenue" element={<ManageRevenue />} />  {/* Quản lý doanh thu */}
            <Route path="/dashboard" element={<Dashboard />} />  {/* Trang Dashboard, có thể là trang chủ hoặc một trang khác */}
            <Route path="/manageorder" element={<ManageOrder />} />  {/* Quản lý đơn hàng */}
            <Route path="/managestaff" element={<StaffManagement />} />
            <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        </Routes>
    );
}
