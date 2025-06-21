// src/routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Signin from "../Pages/Login_Register_trung/Login.jsx";
import Register from "../Pages/Login_Register_trung/Register.jsx";
import ForgotPassword from "../Pages/Login_Register_trung/ForgotPassword.jsx";
import HomePage from "../Pages/HomePage_phong/homepage.jsx";
import Staff from "../Pages/Staff_phong/staff.jsx";
import ManageOrder from "../Pages/ManageOrder_phong/manageorder.jsx";
import Otp from "../Pages/Login_Register_trung/Otp.jsx";
import ResetPassword from "../Pages/Login_Register_trung/ResetPassword";
import CustomerLogin from "../Pages/Customer_thai/C_Login.jsx";
import C_Register from "../Pages/Customer_thai/C_Register.jsx";
import C_HomePage from "../Pages/Customer_thai/C_HomePage.jsx";
import C_CustomerInfo from "../Pages/Customer_thai/C_CustomerInfo.jsx";
import ManagerDashboard from "../Pages/Manager_yen/ManagerDashboard.jsx";
import StaffManagement from "../Pages/Manager_yen/StaffManagement.jsx";
import TransportUnitManagement from "../Pages/TransportUnit_TrungTran/TransportUnitManagement.jsx";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />  {/* Trang chủ */}
            <Route path="/login" element={<Signin />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/otp" element={<Otp />} />  {/* Route cho trang OTP */}
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/c_login" element={<CustomerLogin />} />
            <Route path="/c_register" element={<C_Register/>}/>
            <Route path="/c_homepage" element={<C_HomePage/>}/>
            <Route path="/c_customerinfo" element={<C_CustomerInfo/>}/>
            {/* Thêm các route khác nếu cần */}
            <Route path="/staff" element={<Staff />} />
            <Route path="/manageorder" element={<ManageOrder />} />  {/* Quản lý đơn hàng */}
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/managestaff" element={<StaffManagement />} />
            <Route path="/manager-dashboard" element={<ManagerDashboard />} />
            <Route path="/transport-units" element={<TransportUnitManagement />} />
        </Routes>
    );
}