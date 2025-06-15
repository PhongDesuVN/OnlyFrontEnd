import React, { useState } from 'react';
import Header from '../../Components/FormLogin_yen/Header.jsx';
import Footer from '../../Components/FormLogin_yen/Footer.jsx';

const existingEmails = ['test@example.com', 'admin@example.com']; // Email giả lập

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: '',
        gender: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (existingEmails.includes(formData.email)) {
            alert('❌ Email đã được sử dụng. Vui lòng nhập email khác.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('❌ Mật khẩu xác nhận không khớp.');
            return;
        }

        alert('✅ Đăng ký thành công.');
    };

    return (
        <div className="min-h-screen flex flex-col relative">
            <Header />

            {/* Nền ảnh */}
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
                    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                        <InputField label="Họ tên" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nhập họ và tên" required />
                        <InputField label="Email" name="email" value={formData.email} onChange={handleChange} placeholder="Nhập email" required type="email" />
                        <InputField label="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} placeholder="Nhập số điện thoại" required />
                        <InputField label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} placeholder="Nhập địa chỉ" />
                        <InputField label="Mật khẩu" name="password" value={formData.password} onChange={handleChange} placeholder="Nhập mật khẩu" required type="password" />
                        <InputField label="Xác nhận mật khẩu" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu" required type="password" />

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Giới tính</label>
                            <div className="flex items-center gap-6">
                                <Radio name="gender" label="Nam" value="Nam" checked={formData.gender === 'Nam'} onChange={handleChange} />
                                <Radio name="gender" label="Nữ" value="Nữ" checked={formData.gender === 'Nữ'} onChange={handleChange} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
                        >
                            Đăng ký
                        </button>
                    </form>

                    <div className="mt-4 text-center text-gray-600 text-sm">
                        Đã có tài khoản? <a href="/signin" className="text-blue-600 hover:underline">Đăng nhập</a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

// InputField component
const InputField = ({ label, name, value, onChange, placeholder, required = false, type = "text" }) => (
    <div>
        <label className="block text-gray-700 font-medium mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder={placeholder}
        />
    </div>
);

// Radio component
const Radio = ({ name, value, label, checked, onChange }) => (
    <label className="flex items-center text-sm">
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="mr-2" />
        {label}
    </label>
);

export default Register;
