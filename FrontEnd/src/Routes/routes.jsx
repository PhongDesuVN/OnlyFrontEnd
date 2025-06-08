// src/routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Signin from "../Pages/Login_Register_yen/Signin.jsx";
import ForgotPassword from "../Pages/Login_Register_yen/ForgotPassword.jsx";
import HomePage from "../Pages/HomePage_phong/index.jsx";  // Đổi tên import cho rõ ràng

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />  {/* Trang chủ */}
            <Route path="/signin" element={<Signin />} />
            <Route path="/forgot" element={<ForgotPassword />} />
        </Routes>
    );
}
