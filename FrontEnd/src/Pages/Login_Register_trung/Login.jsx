"use client"

import { useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import Cookies from "js-cookie"
import { apiCall } from "../../utils/api.js"
import Header from "../../Components/FormLogin_yen/Header.jsx"
import Footer from "../../Components/FormLogin_yen/Footer.jsx"

const Login = () => {
    /* ------------------------------ state ------------------------------ */
    const [formData, setFormData] = useState({ email: "", password: "" })
    const [isLoading, setIsLoading]   = useState(false)
    const [error, setError]           = useState("")
    const [statusMessage, setStatusMessage] = useState("")
    const [showStatusRequest, setShowStatusRequest] = useState(false)
    const navigate = useNavigate()

    /* ------------------------- memoised bg style ----------------------- */
    const backgroundStyle = useMemo(
        () => ({
            backgroundImage:
                "url('https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
        }),
        [],
    )

    /* --------------------------- handlers ----------------------------- */
    const handleChange = useCallback((e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setError("")
    }, [])

    /** gửi request đăng nhập */
    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault()
            setIsLoading(true)
            setError("")
            setShowStatusRequest(false)
            setStatusMessage("")

            try {
                const response = await apiCall("/api/auth/login", {
                    method: "POST",
                    body: JSON.stringify(formData),
                })

                const message = await response.text()
                if (response.ok) {
                    Cookies.set("loginEmail", formData.email, { expires: 7 })
                    setStatusMessage(message)
                    setTimeout(() => navigate("/otp"), 1000)
                } else {
                    setIsLoading(false)                // mở lại form
                    const m = message.toUpperCase()

                    // INACTIVE
                    if (
                        response.status === 401 || response.status === 403
                    ) {
                        if (m.includes("INACTIVE")) {
                            setShowStatusRequest(true);
                        } else if (m.includes("PENDING") || m.includes("PENDING_APPROVAL")) {
                            setShowStatusRequest(true);
                        } else {
                            setError("Email hoặc mật khẩu không đúng.");
                        }
                    } else {
                        setError("Email hoặc mật khẩu không đúng.");
                    }
                }
            } catch (_err) {                       // _err -> không bị ESLint cảnh báo
                console.error(_err)
                setIsLoading(false)
                setError("Không thể kết nối đến server.")
            }
        },
        [formData, navigate],
    )

    /** gửi yêu cầu kích hoạt / duyệt tài khoản */
    const handleRequestStatusChange = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await apiCall("/api/auth/request-status-change", {
                method: "POST",
                body: JSON.stringify({ email: formData.email }),
            })

            if (res.ok) {
                setStatusMessage("Yêu cầu kích hoạt đã được gửi!")
                setShowStatusRequest(false)
                setError("")
            } else {
                setError("Không thể gửi yêu cầu.")
            }
        } catch (_err) {
            console.error(_err)
            setError("Lỗi kết nối.")
        } finally {
            setIsLoading(false)
        }
    }, [formData.email])

    /* ----------------------------- UI --------------------------------- */
    return (
        <div className="relative min-h-screen h-screen w-screen flex flex-col overflow-x-hidden">
            <Header/>

            {/* bg */}
            <div className="fixed inset-0 bg-cover bg-center -z-10" style={backgroundStyle}>
                <div className="absolute inset-0 bg-black/30"/>
            </div>

            {/* form */}
            <main className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-lg">

                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Đăng Nhập</h2>

                    {statusMessage && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm">
                            {statusMessage}
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {showStatusRequest && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                            <button
                                onClick={handleRequestStatusChange}
                                disabled={isLoading}
                                className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                            >
                                {isLoading ? "Đang gửi..." : "Gửi yêu cầu kích hoạt"}
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                placeholder="Nhập email"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Mật Khẩu</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                placeholder="Nhập mật khẩu"
                            />
                            <div className="text-right mt-2">
                                <a href="/forgot" className="text-blue-600 text-sm hover:underline">
                                    Quên mật khẩu?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
                        >
                            {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Chưa có tài khoản?{" "}
                        <a href="/register" className="text-blue-600 hover:underline">
                            Đăng ký
                        </a>
                    </div>
                </div>
            </main>

            <Footer/>
        </div>
    )
}

export default Login
