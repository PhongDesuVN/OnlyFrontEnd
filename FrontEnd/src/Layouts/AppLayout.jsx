// src/Layouts/AppLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import ChatboxAI from "../Pages/ChatboxAI_TrungTran/ChatboxAI";


/**
 * Layout bao toàn bộ giao diện người dùng. ChatboxAI chỉ hiển thị nếu role là CUSTOMER.
 */
const AppLayout = () => {
    return (
        <>
            <Outlet />
            <ChatboxAI />
        </>
    );
};

export default AppLayout;
