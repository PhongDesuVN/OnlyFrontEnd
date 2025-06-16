"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiCall } from "../../utils/api.js"
import Header from "../../Components/FormLogin_yen/Header.jsx"
import Footer from "../../Components/FormLogin_yen/Footer.jsx"

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
        gender: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setError("")
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setSuccess("")

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("❌ Mật khẩu xác nhận không khớp.")
            setIsLoading(false)
            return
        }

        if (formData.password.length < 6) {
            setError("❌ Mật khẩu phải có ít nhất 6 ký tự.")
            setIsLoading(false)
            return
        }

        try {
            console.log("📝 Register Request:", formData.email)

            const response = await apiCall("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    password: formData.password,
                    gender: formData.gender,
                }),
            })

            console.log("📨 Register Response:", response.status)

            if (response.ok) {
                const responseData = await response.text()
                setSuccess("✅ Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.")

                // Reset form
                setFormData({
                    fullName: "",
                    email: "",
                    phone: "",
                    address: "",
                    password: "",
                    confirmPassword: "",
                    gender: "",
                })

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate("/login")
                }, 3000)
            } else if (response.status === 403) {
                setError("❌ Lỗi 403: Backend từ chối kết nối. Vui lòng kiểm tra cấu hình CORS.")
            } else if (response.status === 409) {
                setError("❌ Email đã được sử dụng. Vui lòng chọn email khác.")
            } else {
                const errorText = await response.text()
                setError(errorText || "Đăng ký thất bại. Vui lòng thử lại.")
            }
        } catch (error) {
            console.error("❌ Register Error:", error)
            setError("Không thể kết nối đến server. Vui lòng kiểm tra backend.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col relative">
            <Header />

            <div
                className="absolute inset-0 bg-cover bg-center z-[-1]"
                style={{
                    backgroundImage:
                        "url('https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
                }}
            >
                <div className="absolute inset-0 bg-black opacity-30"></div>
            </div>

            <main className="flex-grow flex items-center justify-center px-4 min-h-[calc(100vh-80px)]">
                <div className="w-full max-w-md bg-white bg-opacity-90 backdrop-blur-md p-6 rounded-2xl shadow-lg my-6">
                    <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Đăng Ký</h2>

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-lg">
                            <p className="text-green-700 text-sm">{success}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                        <InputField
                            label="Họ tên"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Nhập họ và tên"
                            required
                            disabled={isLoading}
                        />
                        <InputField
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Nhập email"
                            required
                            type="email"
                            disabled={isLoading}
                        />
                        <InputField
                            label="Số điện thoại"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Nhập số điện thoại"
                            required
                            disabled={isLoading}
                        />
                        <InputField
                            label="Địa chỉ"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Nhập địa chỉ"
                            disabled={isLoading}
                        />
                        <InputField
                            label="Mật khẩu"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                            required
                            type="password"
                            disabled={isLoading}
                        />
                        <InputField
                            label="Xác nhận mật khẩu"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Nhập lại mật khẩu"
                            required
                            type="password"
                            disabled={isLoading}
                        />

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Giới tính</label>
                            <div className="flex items-center gap-6">
                                <Radio
                                    name="gender"
                                    label="Nam"
                                    value="Nam"
                                    checked={formData.gender === "Nam"}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <Radio
                                    name="gender"
                                    label="Nữ"
                                    value="Nữ"
                                    checked={formData.gender === "Nữ"}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                        </button>
                    </form>

                    <div className="mt-4 text-center text-gray-600 text-sm">
                        Đã có tài khoản?{" "}
                        <a href="/login" className="text-blue-600 hover:underline">
                            Đăng nhập
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

// InputField component
const InputField = ({
                        label,
                        name,
                        value,
                        onChange,
                        placeholder,
                        required = false,
                        type = "text",
                        disabled = false,
                    }) => (
    <div>
        <label className="block text-gray-700 font-medium mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
            placeholder={placeholder}
        />
    </div>
)

// Radio component
const Radio = ({ name, value, label, checked, onChange, disabled = false }) => (
    <label className="flex items-center text-sm">
        <input
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="mr-2"
        />
        {label}
    </label>
)

export default Register
