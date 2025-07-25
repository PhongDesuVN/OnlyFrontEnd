import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import Cookies from 'js-cookie';

/**
 * Role-based route protection component for schedule management features
 * Ensures users can only access schedule features appropriate to their role
 */
const ScheduleRouteProtection = ({ children, allowedRoles = [], requiredRole = null }) => {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkUserRole = () => {
      try {
        // Get token from cookies or localStorage
        const tokenRaw = 
          Cookies.get("authToken") ||
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken");

        if (!tokenRaw) {
          setIsLoading(false);
          return;
        }

        // Extract token without Bearer prefix
        const token = tokenRaw.startsWith("Bearer ") ? tokenRaw.slice(7) : tokenRaw;
        const parts = token.split(".");

        if (parts.length !== 3) {
          console.warn("❌ Invalid token format");
          setIsLoading(false);
          return;
        }

        // Decode JWT payload
        const payload = JSON.parse(atob(parts[1]));
        const role = payload.role;
        
        setUserRole(role);

        // Check role authorization
        let authorized = false;
        
        if (requiredRole) {
          // Specific role required
          authorized = role === requiredRole;
        } else if (allowedRoles.length > 0) {
          // Multiple roles allowed
          authorized = allowedRoles.includes(role);
        } else {
          // Default: allow STAFF and MANAGER for schedule features
          authorized = ['STAFF', 'MANAGER'].includes(role);
        }

        setIsAuthorized(authorized);

        // Show appropriate message for unauthorized access
        if (!authorized) {
          const routeMessages = {
            '/schedule/shifts': 'Chỉ quản lý mới có thể truy cập trang quản lý ca làm việc',
            '/schedule/timeoff': 'Bạn cần quyền nhân viên hoặc quản lý để truy cập trang yêu cầu nghỉ phép',
            '/schedule/calendar': 'Bạn cần quyền nhân viên hoặc quản lý để truy cập lịch làm việc'
          };
          
          const currentPath = location.pathname;
          const errorMessage = routeMessages[currentPath] || 'Bạn không có quyền truy cập trang này';
          
          message.error(errorMessage);
        }

      } catch (error) {
        console.error("❌ Error checking user role:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [allowedRoles, requiredRole, location.pathname]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // No token - redirect to login
  if (!userRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Unauthorized - redirect to appropriate page based on role
  if (!isAuthorized) {
    const redirectPath = userRole === 'MANAGER' ? '/manager-dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // Authorized - render children
  return children;
};

export default ScheduleRouteProtection;