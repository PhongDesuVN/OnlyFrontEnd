import React from "react"
import Cookies from "js-cookie"
import { useNavigate } from "react-router-dom"
// import { Settings } from "lucide-react" // 👈 Xoá nếu không dùng

export default function LogoutButton() {
    // const [showMenu, setShowMenu] = useState(false)
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            const token = Cookies.get("authToken")
            if (token) {
                await fetch("http://localhost:8083/api/auth/logout", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: "include",
                })
            }
        } catch (e) {
            console.error("Logout error:", e)
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
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
            Đăng xuất
        </button>
    )
}
