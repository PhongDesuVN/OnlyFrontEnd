// src/Routes/routes.jsx
import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import AppLayout from '../Layouts/AppLayout';
// --- Auth Pages ---
import Signin from '../Pages/Login_Register_trung/Login.jsx';
import Register from '../Pages/Login_Register_trung/Register.jsx';
import ForgotPassword from '../Pages/Login_Register_trung/ForgotPassword.jsx';
import Otp from '../Pages/Login_Register_trung/Otp.jsx';
import ResetPassword from '../Pages/Login_Register_trung/ResetPassword.jsx';
import Logout from "../Pages/Login_Register_trung/Logout.jsx"

// --- Common Pages ---
import HomePage from '../Pages/HomePage_phong/homepage.jsx';
import Staff from '../Pages/Staff_phong/staff.jsx';
import Dashboard from '../Pages/Staff_phong/DashBoard.jsx';
import ManageOrder from '../Pages/ManageOrder_phong/ManageOrder.jsx';
import ManageUser from '../Pages/ManageUser_trung/manageuser.jsx';
import ManageRevenue from '../Pages/ManageRevenue_trung/managerevenue.jsx';
import ProfileMainPage from '../Pages/Staff_phong/ProfileMainPage.jsx';


// --- Manager Pages ---
// --- Manager Pages ---
import ManagerDashboard from '../Pages/Manager_yen/ManagerDashboard.jsx';
import StaffManagement from '../Pages/Manager_yen/StaffManagement.jsx';
import PromotionManagement from '../Pages/Manager_yen/PromotionManagement.jsx';
import PromotionStatisticsDashboard from '../Pages/Manager_yen/PromotionStatisticsDashboard.jsx';

// --- Transport Unit Pages ---
import TransportLayout from '../Pages/TransportUnit_TrungTran/TransportLayout.jsx';
import TransportUnitManagement from '../Pages/TransportUnit_TrungTran/TransportUnitManagement.jsx';
import TransportUnitOverview from '../Pages/TransportUnit_TrungTran/TransportUnitOverview.jsx';

import CustomerLogin from "../Pages/Customer_thai/C_Login.jsx";
import C_Register from "../Pages/Customer_thai/C_Register.jsx";
import C_HomePage from "../Pages/Customer_thai/C_HomePage.jsx";
import C_Dashboard from "../Pages/Customer_thai/C_Dashboard.jsx";

import PaymentManagement from "../Pages/Receipts/PaymentManagement";
import StorageUnitManagement from "../Pages/HungStorage/StorageUnitManagement.jsx";
import StaffPerformance from "../Pages/Manager_yen/StaffPerformance.jsx";
import PendingStaffManagement from '../Pages/PendingStaffManagement/PendingStaffManagement.jsx';

import StorageApproval from '../Pages/StorageApproval/StorageApproval.jsx';
import StorageApprovalOverview from '../Pages/StorageApproval/StorageApprovalOverview.jsx';

export default function AppRoutes() {
    return (
        <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Signin/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/forgot" element={<ForgotPassword/>}/>
            <Route path="/otp" element={<Otp/>}/>
            <Route path="/reset-password" element={<ResetPassword/>}/>
            <Route path="/logout" element={<Logout/>}/>

            {/* General pages */}
            <Route path="/" element={<HomePage/>}/>
            <Route path="/staff" element={<Staff/>}/>
            <Route path="/dashboard" element={<Dashboard/>}/>

            <Route path="/profile/main" element={<ProfileMainPage/>}/>

            {/* Management */}
            <Route path="/manageorder" element={<ManageOrder/>}/>
            <Route path="/manageuser" element={<ManageUser/>}/>
            <Route path="/managerevenue" element={<ManageRevenue/>}/>

            {/* Manager */}

                <Route path="/manager" element={<ManagerDashboard />} />
                <Route path="/manager-dashboard" element={<ManagerDashboard />} />
                <Route path="/managerstaff" element={<StaffManagement />} />
                <Route path="/promotions" element={<PromotionManagement />} />
                <Route path="/staffperformance" element={<StaffPerformance />} />
                <Route path="//stats" element={<PromotionStatisticsDashboard/>} />

            {/* Transport Unit */}
            <Route path="/transport-units" element={<TransportLayout/>}>
                <Route index element={<TransportUnitManagement/>}/>
                <Route path="overview" element={<TransportUnitOverview/>}/>
            </Route>

            {/* Customer routes */}

            <Route path="/c_login" element={<CustomerLogin />} />
            <Route path="/c_register" element={<C_Register />} />

            <Route element={<AppLayout />}>
                <Route path="/c_homepage" element={<C_HomePage />} />
                <Route path="/c_dashboard" element={<C_Dashboard />} />
            </Route>






            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/receipts" element={<PaymentManagement />} />
            <Route path="/storage-units" element={<StorageUnitManagement />} />
            <Route path="/staffperformance" element={<StaffPerformance />} />
            <Route path="/manager/pending-staff" element={<PendingStaffManagement />} />
            <Route path="/manager/pending-storage-units" element={<StorageApproval />} />
            <Route path="/storage-approval/overview" element={<StorageApprovalOverview />} />

        </Routes>
    );
}
