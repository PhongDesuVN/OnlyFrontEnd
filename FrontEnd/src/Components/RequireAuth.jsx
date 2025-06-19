import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

/**
 * Bọc quanh các trang/private route cần bảo vệ.
 * Nếu không có authToken, tự động chuyển hướng về /login.
 */
const RequireAuth = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return children;
};

export default RequireAuth;
