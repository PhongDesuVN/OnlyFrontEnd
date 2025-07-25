// src/Layouts/AppLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import ChatboxAI from "../Pages/ChatboxAI_TrungTran/ChatboxAI";

const AppLayout = () => {
    const token = sessionStorage.getItem("authToken");
    let role = null;

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            role = payload.role;
        } catch (e) {
            console.error("Lỗi phân tích token:", e);
        }
    }

    return (
        <>
            <Outlet />
            {role === "CUSTOMER" && <ChatboxAI />}
        </>
    );
};

export default AppLayout;
