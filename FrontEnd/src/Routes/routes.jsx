// src/routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Signin from "../Pages/Login_Register_yen/Login.jsx";
import Register from "../Pages/Login_Register_yen/Register.jsx";
import ForgotPassword from "../Pages/Login_Register_yen/ForgotPassword.jsx";
import HomePage from "../Pages/HomePage_phong/homepage.jsx";  // Đổi tên import cho rõ ràng
import Staff from "../Pages/Staff_phong/Staff.jsx";  // Đổi tên import cho rõ ràng

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />  {/* Trang chủ */}

            <Route path="/signin" element={<Signin />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            {/* Thêm các route khác nếu cần */}
            <Route path="/staff" element={<Staff />} />
        </Routes>
    );
}
