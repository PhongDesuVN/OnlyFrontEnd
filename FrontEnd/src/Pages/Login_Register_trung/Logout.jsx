import { useState } from "react"
import Cookies from "js-cookie"
import { useNavigate } from "react-router-dom"
import { Settings } from "lucide-react"

const [showMenu, setShowMenu] = useState(false)
const navigate = useNavigate()

const handleLogout = async () => {
    try {
        const token = Cookies.get("authToken")
        if (token) {
            await fetch("http://localhost:8083/api/auth/logout", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                credentials: "include",
            })
        }
    } catch (e) {
        // Có thể log lỗi nếu muốn
    }
    // Xóa cookies
    Cookies.remove("authToken")
    Cookies.remove("userRole")
    Cookies.remove("username")
    // Chuyển về trang login
    navigate("/login")
}