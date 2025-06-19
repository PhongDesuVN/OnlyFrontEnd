// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Header from '../../Components/FormLogin_yen/Header.jsx';
import Footer from '../../Components/FormLogin_yen/Footer.jsx';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '', otp: '' });
    const [step, setStep] = useState('LOGIN');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: formData.password })
            });

            const text = await res.text();
            setMessage(text);
            if (res.ok) setStep('OTP');
        } catch {
            setMessage('❌ Lỗi kết nối đến server.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp: formData.otp })
            });

            const data = await res.json();
            if (res.ok) {
                const token = data.accessToken;
                localStorage.setItem('token', token);

                const decoded = jwtDecode(token);
                const role = decoded.role || decoded.authorities?.[0]?.authority;
                const userId = decoded.userId || decoded.id || decoded.sub;
                if (role === 'MANAGER') localStorage.setItem('managerId', userId);

                setMessage('✅ Đăng nhập thành công!');
                setTimeout(() => {
                    if (role === 'MANAGER') navigate('/manager');
                    else if (role === 'STAFF') navigate('/staff');
                    else setMessage('❌ Không xác định được vai trò.');
                }, 1000);
            } else {
                setMessage(data.message || '❌ OTP không đúng');
            }
        } catch {
            setMessage('❌ Token không hợp lệ từ server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative">
            <Header />
            <div className="absolute inset-0 bg-cover bg-center z-[-1]" style={{ backgroundImage: "url('https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}>
                <div className="absolute inset-0 bg-black opacity-30" />
            </div>
            <main className="flex-grow flex items-center justify-center px-4 min-h-[calc(100vh-80px)]">
                <div className="w-full max-w-md bg-white bg-opacity-90 backdrop-blur-md p-6 rounded-2xl shadow-lg my-6">
                    <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Đăng nhập</h2>
                    <form className="space-y-4 text-sm" onSubmit={step === 'LOGIN' ? handleLogin : handleVerifyOtp}>
                        {step === 'LOGIN' ? (
                            <>
                                <InputField label="Email" name="email" value={formData.email} onChange={handleChange} placeholder="Nhập email" type="email" required />
                                <InputField label="Mật khẩu" name="password" value={formData.password} onChange={handleChange} placeholder="Nhập mật khẩu" type="password" required />
                                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-60">
                                    {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-gray-600">Đã gửi OTP đến email: <b>{formData.email}</b></p>
                                <InputField label="Mã OTP" name="otp" value={formData.otp} onChange={handleChange} placeholder="Nhập mã OTP" required />
                                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-60">
                                    {loading ? 'Đang xác minh...' : 'Xác minh OTP'}
                                </button>
                            </>
                        )}
                    </form>
                    {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
                    <div className="mt-4 text-center text-gray-600 text-sm">
                        Chưa có tài khoản? <a href="/register" className="text-blue-600 hover:underline">Đăng ký</a>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

const InputField = ({ label, name, value, onChange, placeholder, type = 'text', required = false }) => (
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

export default Login;