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
import Unauthorized from '../Pages/Unauthorized.jsx';

// --- Manager Pages ---
import ManagerDashboard from '../Pages/Manager_yen/ManagerDashboard.jsx';
import StaffManagement from '../Pages/Manager_yen/StaffManagement.jsx';
import PromotionManagement from '../Pages/Manager_yen/PromotionManagement.jsx';
import StaffPerformance from '../Pages/Manager_yen/StaffPerformance.jsx';
import PromotionStatisticsDashboard from '../Pages/Manager_yen/PromotionStatisticsDashboard.jsx';
import StaffReportPage from '../Pages/Manager_yen/StaffReportPage.jsx'
// --- Transport Unit Pages ---
import TransportLayout from '../Pages/TransportUnit_TrungTran/TransportLayout.jsx';
import TransportUnitManagement from '../Pages/TransportUnit_TrungTran/TransportUnitManagement.jsx';
import TransportUnitOverview from '../Pages/TransportUnit_TrungTran/TransportUnitOverview.jsx';

// --- Customer Pages ---
import CustomerLogin from "../Pages/Customer_thai/C_Login.jsx";
import C_Register from "../Pages/Customer_thai/C_Register.jsx";
import C_HomePage from "../Pages/Customer_thai/C_HomePage.jsx";
import C_Dashboard from "../Pages/Customer_thai/C_Dashboard.jsx";
import C_BookingDetail from "../Pages/Customer_thai/C_BookingDetail.jsx";

// --- Other Pages ---
import PaymentManagement from "../Pages/Receipts/PaymentManagement";
import StorageUnitManagement from "../Pages/HungStorage/StorageUnitManagement.jsx";
import PendingStaffManagement from '../Pages/PendingStaffManagement/PendingStaffManagement.jsx';
// --- Auth Components ---
import RequireAuth from '../Components/RequireAuth.jsx';
import RequireManagerRole from '../Components/RequireManagerRole.jsx';
import StorageApproval from '../Pages/StorageApproval/StorageApproval.jsx';
import StorageApprovalOverview from '../Pages/StorageApproval/StorageApprovalOverview.jsx';

// --- Schedule Management Pages ---
import ScheduleCalendar from '../Pages/ScheduleManagement/ScheduleCalendar.jsx';
import ShiftManagement from '../Pages/ScheduleManagement/ShiftManagement.jsx';
import TimeOffRequests from '../Pages/ScheduleManagement/TimeOffRequests.jsx';
import ScheduleRouteProtection from '../Components/ScheduleRouteProtection.jsx';
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


            {/* Management - Protected routes */}
            <Route path="/manageorder" element={<RequireAuth><ManageOrder /></RequireAuth>} />
            <Route path="/manageuser" element={<RequireAuth><ManageUser /></RequireAuth>} />

            {/* Manager-only routes */}
            <Route path="/managerevenue" element={<RequireAuth><RequireManagerRole><ManageRevenue /></RequireManagerRole></RequireAuth>} />
            <Route path="/manager" element={<RequireAuth><RequireManagerRole><ManagerDashboard /></RequireManagerRole></RequireAuth>} />
            <Route path="/manager-dashboard" element={<RequireAuth><RequireManagerRole><ManagerDashboard /></RequireManagerRole></RequireAuth>} />
            <Route path="/managerstaff" element={<RequireAuth><RequireManagerRole><StaffManagement /></RequireManagerRole></RequireAuth>} />
            <Route path="/promotions" element={<RequireAuth><RequireManagerRole><PromotionManagement /></RequireManagerRole></RequireAuth>} />
            <Route path="/staffperformance" element={<RequireAuth><RequireManagerRole><StaffPerformance /></RequireManagerRole></RequireAuth>} />
            <Route path="/stats" element={<PromotionStatisticsDashboard/>} />
            <Route path="/report" element={<StaffReportPage/>} />
            {/* Transport Unit - Manager only */}
            <Route path="/transport-units" element={
                <RequireAuth>
                    <RequireManagerRole>
                        <TransportLayout />
                    </RequireManagerRole>
                </RequireAuth>
            }>
                <Route index element={<TransportUnitManagement />} />
                <Route path="overview" element={<TransportUnitOverview />} />
            </Route>

            {/* Customer routes */}

            <Route path="/c_login" element={<CustomerLogin />} />
            <Route path="/c_register" element={<C_Register />} />

            <Route element={<AppLayout />}>
                <Route path="/c_homepage" element={<C_HomePage />} />
                <Route path="/c_dashboard" element={<C_Dashboard />} />
                <Route path="/customer/booking/:bookingId" element={<C_BookingDetail />} />
            </Route>

            <Route path="/schedule" element={<ScheduleRouteProtection allowedRoles={["STAFF", "MANAGER"]}><ScheduleCalendar/></ScheduleRouteProtection>}/>
            <Route path="/schedule/calendar" element={<ScheduleRouteProtection allowedRoles={["STAFF", "MANAGER"]}><ScheduleCalendar/></ScheduleRouteProtection>}/>
            <Route path="/schedule/shifts" element={<ScheduleRouteProtection requiredRole="MANAGER"><ShiftManagement/></ScheduleRouteProtection>}/>
            <Route path="/schedule/timeoff" element={<ScheduleRouteProtection allowedRoles={["STAFF", "MANAGER"]}><TimeOffRequests/></ScheduleRouteProtection>}/>





            {/* Other routes */}

            <Route path="/storage-units" element={<RequireAuth><StorageUnitManagement /></RequireAuth>} />

            {/* Unauthorized page */}
            <Route path="/unauthorized" element={<Unauthorized />} />

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
