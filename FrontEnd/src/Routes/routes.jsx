import { Routes, Route } from "react-router-dom"

import Signin from "../Pages/Login_Register_trung/Login.jsx"
import Register from "../Pages/Login_Register_trung/Register.jsx"
import ForgotPassword from "../Pages/Login_Register_trung/ForgotPassword.jsx"
import HomePage from "../Pages/HomePage_phong/homepage.jsx"
import Staff from "../Pages/Staff_phong/staff.jsx"
import ManageOrder from "../Pages/ManageOrder_phong/manageorder.jsx"
import ManageUser from "../Pages/ManageUser_trung/manageuser.jsx" // Import trang quản lý user mới
import ManageRevenue from "../Pages/ManageRevenue_trung/managerevenue.jsx" // Import trang quản lý doanh thu

import Dashboard from "../Pages/Staff_phong/DashBoard.jsx"
import Otp from "../Pages/Login_Register_trung/Otp.jsx"
import ResetPassword from "../Pages/Login_Register_trung/ResetPassword"

import ManagerDashboard from "../Pages/Manager_yen/ManagerDashboard"
import StaffManagement from "../Pages/Manager_yen/StaffManagement.jsx"
import PromotionManagement from "../Pages/Manager_yen/PromotionManagement.jsx"

import ReceiptsManagement from "../Pages/Receipts/ReceiptsManagement";
import StorageUnitManagement from "../Pages/HungStorage/StorageUnitManagement.jsx";

export default function AppRoutes() {
        return (
            <Routes>
                    <Route path="/" element={<HomePage />} /> {/* Trang chủ */}
                    <Route path="/login" element={<Signin />} />
                    <Route path="/forgot" element={<ForgotPassword />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/otp" element={<Otp />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Staff routes */}
                    <Route path="/staff" element={<Staff />} />
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Management routes */}
                    <Route path="/manageorder" element={<ManageOrder />} />
                    <Route path="/manageuser" element={<ManageUser />} />
                    <Route path="/managerevenue" element={<ManageRevenue />} />

                    {/* Manager routes */}
                    <Route path="/manager" element={<ManagerDashboard />} />
                    <Route path="/managerstaff" element={<StaffManagement />} />
                    <Route path="/promotions" element={<PromotionManagement />} />

                    <Route path="/receipts" element={<ReceiptsManagement />} />
                    <Route path="/storage-units" element={<StorageUnitManagement />} />
            </Routes>
        )
}
