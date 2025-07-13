import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const RequireAuth = ({ allowedRoles = ["CUSTOMER", "STAFF", "MANAGER"], children }) => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [checked, setChecked] = useState(false); // đảm bảo không return null quá sớm

  useEffect(() => {
    const tokenRaw = Cookies.get("authToken") || localStorage.getItem("authToken");

    // Nếu không có token → không bắt buộc đăng nhập, chỉ đánh dấu đã kiểm tra
    if (!tokenRaw) {
      setChecked(true);
      return;
    }

    const token = tokenRaw.startsWith("Bearer ") ? tokenRaw.slice(7) : tokenRaw;
    const parts = token.split(".");

    if (parts.length !== 3) {
      console.warn("❌ Token không hợp lệ (không đúng định dạng JWT)");
      navigate("/", { replace: true });
      return;
    }

    try {
      const payload = JSON.parse(atob(parts[1]));
      if (allowedRoles.includes(payload.role)) {
        setAuthorized(true);
      } else {
        console.warn(`⛔ Vai trò '${payload.role}' không được phép truy cập`);
        navigate("/", { replace: true }); // không phải /unauthorized
      }
    } catch (err) {
      console.error("❌ Token decode lỗi:", err.message);
      navigate("/", { replace: true });
    } finally {
      setChecked(true);
    }
  }, [allowedRoles, navigate]);

  // Nếu chưa kiểm tra xong → không render gì (tránh nhấp nháy)
  if (!checked) return null;

  return authorized || !Cookies.get("authToken") ? children : null;
};

export default RequireAuth;
