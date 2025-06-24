import React, { useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import Cookies from "js-cookie"
import { apiCall } from "../../utils/api.js"
import Header from "../../Components/FormLogin_yen/Header.jsx"
import Footer from "../../Components/FormLogin_yen/Footer.jsx"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [statusMessage, setStatusMessage] = useState("")
    const [showStatusRequest, setShowStatusRequest] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const backgroundStyle = useMemo(() => ({
        backgroundImage:
            "url('https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
    }), [])

    const handleChange = useCallback((e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setError("")
    }, [])

    const handleSubmit = useCallback(async (e) => {
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
                localStorage.setItem("loginEmail", formData.email)
                Cookies.set("loginEmail", formData.email, { expires: 7 })
                setStatusMessage(message)
                setTimeout(() => navigate("/otp"), 1000)
            } else {
                const m = message.toUpperCase()
                if (response.status === 401 || response.status === 403) {
                    if (m.includes("INACTIVE") || m.includes("PENDING")) {
                        setShowStatusRequest(true)
                        setError(message)
                    } else {
                        setError("Email hoặc mật khẩu không đúng.")
                    }
                } else {
                    setError("Email hoặc mật khẩu không tồn tại.")
                }
            }
        } catch (err) {
            console.error(err)
            setError("Không thể kết nối đến server.")
        } finally {
            setIsLoading(false)
        }
    }, [formData, navigate])

    const handleRequestStatusChange = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await apiCall("/api/auth/request-status-change", {
                method: "POST",
                body: JSON.stringify({ email: formData.email }),
            })

            if (response.ok) {
                setStatusMessage("Yêu cầu kích hoạt đã được gửi!")
                setShowStatusRequest(false)
                setError("")
            } else {
                setError("Không thể gửi yêu cầu.")
            }
        } catch (err) {
            console.error(err)
            setError("Lỗi kết nối.")
        } finally {
            setIsLoading(false)
        }
    }, [formData.email])

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            {/* Background */}
            <div className="fixed inset-0 bg-cover bg-center -z-10" style={backgroundStyle}>
                <div className="absolute inset-0 bg-black/30" />
            </div>

            <main className="flex-grow flex items-center justify-center px-4 py-10">
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
                            <p className="text-yellow-800 text-sm mb-3">
                                Tài khoản chưa kích hoạt. Gửi yêu cầu?
                            </p>
                            <button
                                onClick={handleRequestStatusChange}
                                disabled={isLoading}
                                className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition"
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
                            <label className="block text-gray-700 font-medium mb-1">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                    placeholder="Nhập mật khẩu"
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>
                            <div className="text-right mt-2">
                                <a href="/forgot" className="text-blue-600 text-sm hover:underline">
                                    Quên mật khẩu?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
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

            <Footer />
        </div>
    )
}

export default Login
