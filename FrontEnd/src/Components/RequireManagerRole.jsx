import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

/**
 * Bọc quanh các trang chỉ dành cho MANAGER role.
 * Nếu không có authToken hoặc không phải MANAGER, tự động chuyển hướng về /login.
 */
const RequireManagerRole = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        // Decode token to get user role
        const decoded = jwtDecode(token);
        const userRole = decoded.role || Cookies.get("userRole");

        console.log("🔍 Checking authorization - User role:", userRole);

        if (userRole === "MANAGER") {
          setIsAuthorized(true);
        } else {
          console.log("❌ Access denied - User role is not MANAGER:", userRole);
          // Redirect to unauthorized page or show error
          navigate("/unauthorized", { replace: true });
        }
      } catch (error) {
        console.error("Error checking authorization:", error);
        navigate("/login", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Đang kiểm tra quyền truy cập...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return children;
};

export default RequireManagerRole; 