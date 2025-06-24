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
                body: JSON.stringify(formData),
                auth: false,
            })

            if (response.ok) {
                await response.text()
                setSuccess("✅ Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.")
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
                setError("❌ Email hoặc username đã được đăng ký")
            } else {
                const errText = await response.text()
                setError(errText || "❌ Đăng ký thất bại. Vui lòng thử lại.")
            }
        } catch (err) {
            setError("❌ Đã xảy ra lỗi khi kết nối đến máy chủ.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow flex justify-center items-center py-10 px-4">
                <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white p-8 rounded-xl shadow-lg space-y-4">
                    <h2 className="text-2xl font-bold text-center">Đăng ký</h2>

                    {success && <div className="bg-green-100 text-green-700 p-2 rounded text-sm text-center">{success}</div>}
                    {error && <div className="bg-red-100 text-red-700 p-2 rounded text-sm text-center">{error}</div>}

                    <InputField label="Tên đăng nhập" name="username" value={formData.username} onChange={handleChange} required />
                    <InputField label="Họ tên" name="fullName" value={formData.fullName} onChange={handleChange} required />
                    <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    <InputField label="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} required />
                    <InputField label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} required />

                    <PasswordInput label="Mật khẩu" name="password" value={formData.password} onChange={handleChange} show={showPassword} toggleShow={() => setShowPassword(!showPassword)} />
                    <PasswordInput label="Xác nhận mật khẩu" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} show={showConfirm} toggleShow={() => setShowConfirm(!showConfirm)} />

                    <div>
                        <label className="block text-gray-700 mb-1">Giới tính</label>
                        <div className="flex gap-4">
                            <Radio name="gender" value="MALE" label="Nam" checked={formData.gender === "MALE"} onChange={handleChange} />
                            <Radio name="gender" value="FEMALE" label="Nữ" checked={formData.gender === "FEMALE"} onChange={handleChange} />
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                        {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                    </button>

                    <div className="text-center text-sm mt-4">
                        Đã có tài khoản? <a href="/login" className="text-blue-600 hover:underline">Đăng nhập</a>
                    </div>
                </form>
            </main>
            <Footer />
        </div>
    )
}

const InputField = ({ label, name, value, onChange, required = false, type = "text" }) => (
    <div>
        <label className="block text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
        />
    </div>
)

const PasswordInput = ({ label, name, value, onChange, show, toggleShow }) => (
    <div className="relative">
        <label className="block text-gray-700 mb-1">{label}</label>
        <input
            type={show ? "text" : "password"}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded pr-10 focus:outline-none focus:ring focus:border-blue-500"
            required
        />
        <span onClick={toggleShow} className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500">
            <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
        </span>
    </div>
)

const Radio = ({ name, value, label, checked, onChange }) => (
    <label className="flex items-center gap-2 text-sm">
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
        {label}
    </label>
)

export default Register
