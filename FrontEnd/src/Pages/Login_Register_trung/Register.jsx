"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiCall } from "../../utils/api.js"
import Header from "../../Components/FormLogin_yen/Header.jsx"
import Footer from "../../Components/FormLogin_yen/Footer.jsx"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"

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
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === "gender" ? value.toUpperCase() : value,
        }))
        setFormData((prev) => ({ ...prev, [name]: value }))
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'gender' ? value.toUpperCase() : value
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

        // Validation
        if (!validatePassword(formData.password)) {
            setError("❌ Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ thường, chữ in hoa và số.")
            return setIsLoading(false)
        }

        if (formData.password !== formData.confirmPassword) {
            setError("❌ Mật khẩu xác nhận không khớp.")
            return setIsLoading(false)
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
                    username: formData.username,
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    password: formData.password,
                    gender: formData.gender,
                    gender: formData.gender ? formData.gender.toUpperCase() : "",
                    gender: formData.gender,
                    gender: formData.gender ? formData.gender.toUpperCase() : "",
                }),
                auth: false,
            })


            console.log("📨 Register Response:", response.status)

            if (response.ok) {
                await response.text()
                setSuccess("✅ Đăng ký thành công! Vui lòng chờ được đồng ý từ quản lí")
                const responseData = await response.text()
                setSuccess("✅ Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.")

                // Reset form
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
            } else if (response.status === 403 || response.status === 409) {
                setError("❌ Email hoặc username đã được đăng kí")

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate("/login")
                }, 3000)
            } else if (response.status === 403) {
                setError("❌ Email đã đợc đăng kí ")
                setError("❌ Lỗi 403: Backend từ chối kết nối. Vui lòng kiểm tra cấu hình CORS hoặc dữ liệu gửi lên.")
                setError("❌ Lỗi 403: Backend từ chối kết nối. Vui lòng kiểm tra cấu hình CORS hoặc dữ liệu gửi lên.")
                setError("❌ Lỗi 403: Backend từ chối kết nối. Vui lòng kiểm tra cấu hình CORS.")
            } else if (response.status === 409) {
                setError("❌ Email hoặc username đã tồn tại.")
            } else {
                const errText = await response.text()
                setError(errText || "❌ Đăng ký thất bại. Vui lòng thử lại.")
            }
        } catch (err) {
            console.error("❌ Lỗi kết nối:", err)
            setError("❌ Email hoặc username đã được đăng kí")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex flex-col overflow-y-auto" style={{overflowX: 'hidden'}}>
        <div className="min-h-screen flex flex-col relative">
        <div className="relative min-h-screen flex flex-col overflow-y-auto" style={{overflowX: 'hidden'}}>
        <div className="relative min-h-screen flex flex-col overflow-y-auto" style={{ overflowX: "hidden" }}>
            <Header />
            {/* Background */}
            <div className="fixed inset-0 bg-cover bg-center -z-10"
                 style={{ backgroundImage: "url('https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg')" }}>
                <div className="absolute inset-0 bg-black/30" />
            {/* Background */}

            <div
                className="absolute inset-0 bg-cover bg-center z-[-1]"
                className="fixed inset-0 bg-cover bg-center z-[-1]"
                className="fixed inset-0 bg-cover bg-center z-[-1]"
                style={{
                    backgroundImage:
                        "url('https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
                }}
            >
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute inset-0 bg-black opacity-30"></div>
            </div>

            {/* Centered Register Form, always below header and above footer */}
            <main className="flex-1 flex items-center justify-center pt-24 pb-8 px-2">
                <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-gray-100 flex flex-col justify-center">
                    {/* Notification Area - fixed height, always present */}
                    <div className="mb-2 min-h-[48px] flex items-center justify-center">
                        {success && (
                            <div className="w-full bg-green-50 border border-green-300 rounded-lg px-3 py-2 text-green-700 text-sm text-center">
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="w-full bg-red-50 border border-red-300 rounded-lg px-3 py-2 text-red-600 text-sm text-center">
                                {error}
                            </div>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 tracking-tight">Đăng Ký</h2>

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

            {/* Centered Register Form, always below header and above footer */}
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
                            <InputField
                                label="Tên đăng nhập"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Nhập tên đăng nhập"
                                required
                                minLength={4}
                                maxLength={20}
                                disabled={isLoading}
                            />
                            <InputField
                                label="Họ tên"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Nhập họ và tên"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField name="address" label="Địa chỉ" value={formData.address} onChange={handleChange} required />
                            <PasswordInput name="password" label="Mật khẩu" value={formData.password} onChange={handleChange} show={showPassword} toggleShow={() => setShowPassword(!showPassword)} />
                            <InputField
                                label="Địa chỉ"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Nhập địa chỉ"
                                required
                                disabled={isLoading}
                            />
                            <InputField
                                label="Mật khẩu"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu (ít nhất 6 ký tự, chữ hoa, thường, số)"
                                required
                                type="password"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PasswordInput name="confirmPassword" label="Xác nhận mật khẩu" value={formData.confirmPassword} onChange={handleChange} show={showConfirm} toggleShow={() => setShowConfirm(!showConfirm)} />
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Giới tính</label>
                                <div className="flex gap-6 mt-2">
                                    <Radio name="gender" label="Nam" value="MALE" checked={formData.gender === "MALE"} onChange={handleChange} />
                                    <Radio name="gender" label="Nữ" value="FEMALE" checked={formData.gender === "FEMALE"} onChange={handleChange} />
                                </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Tên đăng nhập"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Nhập tên đăng nhập"
                                required
                                minLength={4}
                                maxLength={20}
                                disabled={isLoading}
                            />
                            <InputField
                                label="Họ tên"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Nhập họ và tên"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Địa chỉ"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Nhập địa chỉ"
                                required
                                disabled={isLoading}
                            />
                            <InputField
                                label="Mật khẩu"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu (ít nhất 6 ký tự, chữ hoa, thường, số)"
                                required
                                type="password"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <div className="flex items-center gap-6 mt-2">
                                    <Radio
                                        name="gender"
                                        label="Nam"
                                        value="MALE"
                                        checked={formData.gender === "MALE"}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                    <Radio
                                        name="gender"
                                        label="Nữ"
                                        value="FEMALE"
                                        checked={formData.gender === "FEMALE"}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all">

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all text-base mt-2"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all text-base mt-2"
                        >
                            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-gray-600 text-sm">
                        Đã có tài khoản?{" "}
                        <a href="/login" className="text-blue-600 hover:underline font-medium">Đăng nhập</a>
                        Đã có tài khoản?{' '}
                        <a href="/login" className="text-blue-600 hover:underline font-medium">

                    <div className="mt-4 text-center text-gray-600 text-sm">
                        Đã có tài khoản?{" "}
                        <a href="/login" className="text-blue-600 hover:underline">
                    <div className="mt-6 text-center text-gray-600 text-sm">
                        Đã có tài khoản?{' '}
                        <a href="/login" className="text-blue-600 hover:underline font-medium">
                            Đăng nhập
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

/* 🔄 Reusable components */
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
            placeholder={placeholder}
        />
    </div>
)

const PasswordInput = ({ label, name, value, onChange, show, toggleShow }) => (
    <div className="relative">
        <label className="block text-gray-700 font-medium mb-1">{label}</label>
        <input
            type={show ? "text" : "password"}
            name={name}
            value={value}
            onChange={onChange}
            required
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <span
            className="absolute right-3 top-1/2 translate-y-[2px] text-gray-500 cursor-pointer"
            onClick={toggleShow}
        >
            <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
        </span>
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
