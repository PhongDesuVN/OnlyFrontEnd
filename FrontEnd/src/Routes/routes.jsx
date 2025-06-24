import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';

/* --- auth / chung --- */
import HomePage from '../Pages/HomePage_phong/homepage.jsx';
import Signin from '../Pages/Login_Register_trung/Login.jsx';
import Register from '../Pages/Login_Register_trung/Register.jsx';
import ForgotPassword from '../Pages/Login_Register_trung/ForgotPassword.jsx';
import Otp from '../Pages/Login_Register_trung/Otp.jsx';
import ResetPassword from '../Pages/Login_Register_trung/ResetPassword.jsx';

/* --- manager / staff --- */
import ManagerDashboard from '../Pages/Manager_yen/ManagerDashboard.jsx';
import StaffManagement from '../Pages/Manager_yen/StaffManagement.jsx';
import Staff from '../Pages/Staff_phong/staff.jsx';
import ManageOrder from '../Pages/ManageOrder_phong/manageorder.jsx';

/* --- vận chuyển --- */
import TransportLayout from '../Pages/TransportUnit_TrungTran/TransportLayout.jsx';
import TransportUnitManagement from '../Pages/TransportUnit_TrungTran/TransportUnitManagement.jsx';
import TransportUnitOverview from '../Pages/TransportUnit_TrungTran/TransportUnitOverview.jsx';

export default function AppRoutes() {
    return (
        <Routes>
            {/* Trang chính */}
            <Route path="/" element={<HomePage/>}/>

            {/* Auth */}
            <Route path="/login" element={<Signin/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/forgot" element={<ForgotPassword/>}/>
            <Route path="/otp" element={<Otp/>}/>
            <Route path="/reset-password" element={<ResetPassword/>}/>

            {/* Manager / Staff */}
            <Route path="/manager" element={<ManagerDashboard/>}/>
            <Route path="/manager-dashboard" element={<ManagerDashboard/>}/>
            <Route path="/managestaff" element={<StaffManagement/>}/>
            <Route path="/staff" element={<Staff/>}/>
            <Route path="/manageorder" element={<ManageOrder/>}/>

            {/* Đơn vị vận chuyển: layout + 2 trang con */}
            <Route path="/transport-units" element={<TransportLayout/>}>
                <Route index element={<TransportUnitManagement/>}/>
                <Route path="overview" element={<TransportUnitOverview/>}/>
            </Route>

            {/* fallback 404 → về danh sách */}
            <Route path="*" element={<Navigate to="/transport-units" replace/>}/>
        </Routes>
    );
}
