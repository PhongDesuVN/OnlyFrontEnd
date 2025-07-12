import React from "react"
import Cookies from "js-cookie"
import { useNavigate } from "react-router-dom"
import { apiCall } from "../../utils/api.js"
// import { Settings } from "lucide-react"

export default function LogoutButton() {
    // const [showMenu, setShowMenu] = useState(false)
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await apiCall("/api/auth/logout", {
                method: "POST",
                auth: true, // tự động lấy token từ Cookies hoặc localStorage
            });
        } catch (error) {
            console.error("❌ Lỗi khi logout:", error);
        }


        // Xoá cookie và chuyển hướng
        Cookies.remove("authToken")
        Cookies.remove("userRole")
        Cookies.remove("username")
        navigate("/login")
    }

    return (
        <button
            onClick={handleLogout}
            className="w-full px-4 py-2 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition"
        >
            Đăng xuất
        </button>
    )
}
