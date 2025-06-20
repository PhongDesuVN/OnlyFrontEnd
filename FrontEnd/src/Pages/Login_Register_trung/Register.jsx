"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiCall } from "../../utils/api.js"
import Header from "../../Components/FormLogin_yen/Header.jsx"
import Footer from "../../Components/FormLogin_yen/Footer.jsx"

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
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
        setFormData((prev) => ({
            ...prev,
            [name]: name === "gender" ? value.toUpperCase() : value,
        }))
        setError("")
    }

    const validatePassword = (password) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setSuccess("")

        if (!validatePassword(formData.password)) {
            setError("❌ Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ thường, chữ in hoa và số.")
            return setIsLoading(false)
        }

        if (formData.password !== formData.confirmPassword) {
            setError("❌ Mật khẩu xác nhận không khớp.")
            return setIsLoading(false)
        }

        try {
            const response = await apiCall("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    username: formData.username,
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    password: formData.password,
                    gender: formData.gender,
                }),
                auth: false, // ⬅️ không gửi token
            })

            if (response.ok) {
                await response.text()
                setSuccess("✅ Đăng ký thành công! Vui lòng chờ được đồng ý từ quản lí")
                setFormData({
                    username: "",
                    fullName: "",
                    email: "",
                    phone: "",
                    address: "",
                    password: "",
                    confirmPassword: "",
                    gender: "",
                })
                setTimeout(() => navigate("/login"), 3000)
            } else if (response.status === 403) {
                setError("❌ Email hoặc username đã đuợc đăng kí ")
            } else if (response.status === 409) {
                setError("❌ Email hoặc username đã tồn tại.")
            } else {
                const errText = await response.text()
                setError(errText || "❌ Đăng ký thất bại. Vui lòng thử lại.")
            }
        } catch (err) {
            console.error("❌ Lỗi kết nối:", err)
            setError("❌ Email hoặc username đã đuợc đăng kí")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex flex-col overflow-y-auto" style={{ overflowX: "hidden" }}>
            <Header />

            {/* Background */}
            <div className="fixed inset-0 bg-cover bg-center -z-10"
                 style={{
                     backgroundImage: "url('https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg')"
                 }}>
                <div className="absolute inset-0 bg-black/30" />
            </div>

            <main className="flex-1 flex items-center justify-center pt-24 pb-8 px-2">
                <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-gray-100">
                    {/* Notification */}
                    <div className="mb-2 min-h-[48px] text-center text-sm">
                        {success && <div className="bg-green-50 border border-green-300 px-3 py-2 text-green-700 rounded-lg">{success}</div>}
                        {error && <div className="bg-red-50 border border-red-300 px-3 py-2 text-red-600 rounded-lg">{error}</div>}
                    </div>

                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Đăng ký</h2>

                    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField name="username" label="Tên đăng nhập" value={formData.username} onChange={handleChange} required />
                            <InputField name="fullName" label="Họ tên" value={formData.fullName} onChange={handleChange} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField name="email" type="email" label="Email" value={formData.email} onChange={handleChange} required />
                            <InputField name="phone" label="Số điện thoại" value={formData.phone} onChange={handleChange} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField name="address" label="Địa chỉ" value={formData.address} onChange={handleChange} required />
                            <InputField name="password" type="password" label="Mật khẩu" value={formData.password} onChange={handleChange} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField name="confirmPassword" type="password" label="Xác nhận mật khẩu" value={formData.confirmPassword} onChange={handleChange} required />
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Giới tính</label>
                                <div className="flex gap-6 mt-2">
                                    <Radio name="gender" label="Nam" value="MALE" checked={formData.gender === "MALE"} onChange={handleChange} />
                                    <Radio name="gender" label="Nữ" value="FEMALE" checked={formData.gender === "FEMALE"} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all">
                            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-gray-600 text-sm">
                        Đã có tài khoản?{" "}
                        <a href="/login" className="text-blue-600 hover:underline font-medium">Đăng nhập</a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

/* Component nhỏ dùng lại */
const InputField = ({ label, name, value, onChange, placeholder, required = false, type = "text", minLength, maxLength, disabled = false }) => (
    <div>
        <label className="block text-gray-700 font-medium mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            minLength={minLength}
            maxLength={maxLength}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
        />
    </div>
)

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
