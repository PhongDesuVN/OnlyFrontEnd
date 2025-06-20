"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { apiCall } from "../../utils/api.js"
import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"

const Otp = () => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [countdown, setCountdown] = useState(0)
    const [isSuccess, setIsSuccess] = useState(false)
    const [userEmail, setUserEmail] = useState("")
    const inputRefs = useRef([])
    const navigate = useNavigate()

    // Memoize background image để tránh re-render
    const backgroundStyle = useMemo(
        () => ({
            backgroundImage:
                "url('https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
        }),
        [],
    )

    useEffect(() => {
        const email = Cookies.get("loginEmail")
        if (!email) {
            navigate("/login")
            return
        }
        setUserEmail(email)
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }, [navigate])

    useEffect(() => {
        let timer
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        }
        return () => clearTimeout(timer)
    }, [countdown])

    // Optimize handleChange với useCallback
    const handleChange = useCallback((index, value) => {
        if (value !== "" && isNaN(value)) {
            setError("Vui lòng nhập số")
            return
        }

        setOtp((prev) => {
            const newOtp = [...prev]
            newOtp[index] = value
            return newOtp
        })
        setError("")

        if (value && index < 5) {
            // Delay focus để smooth hơn
            setTimeout(() => inputRefs.current[index + 1]?.focus(), 10)
        }
    }, [])

    // Optimize handleKeyDown với useCallback
    const handleKeyDown = useCallback(
        (index, e) => {
            if (e.key === "Backspace" && !otp[index] && index > 0) {
                setTimeout(() => inputRefs.current[index - 1]?.focus(), 10)
            }
        },
        [otp],
    )

    // Optimize handleSubmit với xử lý lỗi 403
    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault()
            const otpValue = otp.join("")

            if (otpValue.length !== 6) {
                setError("Vui lòng nhập đầy đủ 6 chữ số")
                return
            }

            setIsLoading(true)
            setError("")

            try {
                console.log("🔐 OTP Verification Request:", {
                    email: userEmail,
                    otp: otpValue,
                    otpLength: otpValue.length,
                })

                const response = await apiCall("/api/auth/login/verify-otp", {
                    method: "POST",
                    body: JSON.stringify({ email: userEmail, otp: otpValue }),
                })

                console.log("📨 OTP Response Status:", response.status)

                if (response.ok) {
                    const authResponse = await response.json()
                    console.log("✅ OTP Success Response:", authResponse)

                    Cookies.set("authToken", authResponse.accessToken, { expires: 7 })
                    Cookies.set("userRole", authResponse.role, { expires: 7 })
                    if (authResponse.accessToken) {
                        try {
                            const decoded = jwtDecode(authResponse.accessToken)
                            console.log("DECODED TOKEN:", decoded)
                            if (decoded.username) {
                                Cookies.set("username", decoded.username, {
                                    expires: 7,
                                    path: '/',
                                    secure: true,
                                    sameSite: 'strict'
                                })
                                console.log("USERNAME LƯU VÀO COOKIES:", decoded.username)
                                console.log("USERNAME TRONG COOKIES:", Cookies.get("username"))
                            } else {
                                console.log("No username found in token")
                            }
                        } catch (decodeErr) {
                            console.error("Lỗi decode JWT:", decodeErr)
                        }
                    }
                    Cookies.remove("loginEmail")

                    setIsSuccess(true)
                    setTimeout(() => {
                        if (authResponse.role && authResponse.role.toUpperCase() === "ROLE_MANAGER") {
                            navigate("/manager-dashboard")
                        } else {
                            navigate("/staff")
                        }
                    }, 1000)
                } else {
                    let errorMessage = "Mã OTP không đúng"

                    try {
                        const errorText = await response.text()
                        console.log("❌ OTP Error Response:", {
                            status: response.status,
                            statusText: response.statusText,
                            errorText: errorText,
                        })

                        if (response.status === 401) {
                            if (errorText.includes("expired") || errorText.includes("hết hạn")) {
                                errorMessage = "Mã OTP đã hết hạn. Vui lòng gửi lại mã mới."
                                // Clear the OTP input and reset countdown
                                setOtp(["", "", "", "", "", ""])
                                setCountdown(0)
                            } else if (errorText.includes("invalid") || errorText.includes("không đúng")) {
                                errorMessage = "Mã OTP không đúng. Vui lòng kiểm tra lại."
                            } else if (errorText.includes("session") || errorText.includes("phiên")) {
                                errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                                Cookies.remove("loginEmail")
                                setTimeout(() => navigate("/login"), 2000)
                                return
                            } else {
                                errorMessage = errorText || "Mã OTP không hợp lệ"
                            }
                        } else if (response.status === 403) {
                            errorMessage = "Không có quyền truy cập. Vui lòng liên hệ quản trị viên."
                            setTimeout(() => navigate("/login"), 2000)
                            return
                        } else if (response.status === 404) {
                            errorMessage = "Không tìm thấy endpoint. Vui lòng kiểm tra cấu hình server."
                        } else if (response.status >= 500) {
                            errorMessage = "Lỗi server. Vui lòng thử lại sau."
                        } else {
                            errorMessage = errorText || `Lỗi ${response.status}: ${response.statusText}`
                        }
                    } catch (parseError) {
                        console.error("Error parsing response:", parseError)
                        errorMessage = `Lỗi ${response.status}: Không thể xác thực OTP`
                    }

                    setError(errorMessage)
                    setOtp(["", "", "", "", "", ""])
                    setTimeout(() => inputRefs.current[0]?.focus(), 100)
                }
            } catch (error) {
                console.error("❌ Network Error:", error)
                setError("Không thể kết nối server. Vui lòng kiểm tra kết nối mạng.")
                setOtp(["", "", "", "", "", ""])
                setTimeout(() => inputRefs.current[0]?.focus(), 100)
            } finally {
                setIsLoading(false)
            }
        },
        [otp, userEmail, navigate],
    )

    // Optimize handleResendOtp
    const handleResendOtp = useCallback(async () => {
        if (countdown > 0) return

        try {
            setIsLoading(true)
            console.log("📤 Resending OTP for:", userEmail)

            const response = await apiCall("/api/auth/sendOTP", {
                method: "POST",
                body: JSON.stringify({ email: userEmail }),
            })

            if (response.ok) {
                setOtp(["", "", "", "", "", ""])
                setError("")
                setCountdown(60)
                setTimeout(() => inputRefs.current[0]?.focus(), 100)
                console.log("✅ OTP resent successfully")
            } else {
                const errorText = await response.text()
                console.log("❌ Resend OTP Error:", errorText)
                setError("Không thể gửi lại mã. Vui lòng thử lại sau.")
            }
        } catch (error) {
            console.error("❌ Resend OTP Network Error:", error)
            setError("Lỗi kết nối khi gửi lại mã")
        } finally {
            setIsLoading(false)
        }
    }, [countdown, userEmail])

    // Optimize handleBackToLogin
    const handleBackToLogin = useCallback(() => {
        Cookies.remove("loginEmail")
        navigate("/login")
    }, [navigate])

    // Memoize button disabled state
    const isSubmitDisabled = useMemo(() => isLoading || otp.some((digit) => !digit), [isLoading, otp])

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative">
                <div className="absolute inset-0 bg-cover bg-center" style={backgroundStyle}>
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>
                <div className="relative z-10 text-center">
                    <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">Xác thực thành công!</h2>
                    <p className="text-xl text-gray-200">Chào mừng bạn quay trở lại</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
            <div className="absolute inset-0 bg-cover bg-center" style={backgroundStyle}>
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Giảm số lượng animated elements */}
            <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-20 w-12 h-12 bg-white/10 rounded-full animate-pulse"></div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M12 2L3 7V12.5C3 16.09 5.91 19.5 9.5 20.5L12 21L14.5 20.5C18.09 19.5 21 16.09 21 12.5V7L12 2Z"
                                    fill="white"
                                />
                                <path d="M9 12L11 14L15 10" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-3">Xác thực OTP</h1>
                        <p className="text-gray-600">
                            Nhập mã 6 chữ số gửi đến: <br />
                            <span className="font-semibold text-blue-600">{userEmail}</span>
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-center space-x-3 mb-6">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    disabled={isLoading}
                                    className={`w-12 h-12 text-center text-xl font-bold rounded-xl border-2 focus:ring-2 focus:ring-blue-500 transition-colors
                       ${error ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-blue-400"}
                       ${digit ? "bg-blue-50 border-blue-500" : ""}`}
                                />
                            ))}
                        </div>

                        {error && (
                            <div className="text-center p-3 bg-red-50 border border-red-300 rounded-xl">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitDisabled}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold rounded-xl hover:shadow-xl disabled:opacity-50 transition-all duration-200"
                        >
                            {isLoading ? "Đang xác thực..." : "Xác nhận"}
                        </button>

                        <div className="flex justify-center items-center space-x-6 pt-4">
                            <button
                                onClick={handleResendOtp}
                                disabled={countdown > 0 || isLoading}
                                className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 transition-colors duration-200"
                            >
                                {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại mã"}
                            </button>
                            <button
                                onClick={handleBackToLogin}
                                disabled={isLoading}
                                className="text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 transition-colors duration-200"
                            >
                                Quay lại đăng nhập
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Otp