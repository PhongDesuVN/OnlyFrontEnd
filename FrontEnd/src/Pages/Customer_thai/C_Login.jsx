import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/FormLogin_yen/Header.jsx';
import Footer from '../../Components/FormLogin_yen/Footer.jsx';
import { apiCall } from '../../utils/api';
import Cookies from 'js-cookie';

const C_Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // ✨ Xóa tất cả token cũ khi vào trang login
    useEffect(() => {
        Cookies.remove("authToken");
        sessionStorage.removeItem("authToken");
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("isLoggedIn");
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Xóa tiếp lần nữa phòng trường hợp người dùng đang ở phiên khác
            Cookies.remove("authToken");
            sessionStorage.removeItem("authToken");
            localStorage.removeItem("authToken");
            sessionStorage.removeItem("isLoggedIn");

            const response = await apiCall('/api/auth/customer/login', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            const text = await response.text();

            if (!response.ok) {
                let message = 'Đăng nhập thất bại';
                try {
                    const errorData = JSON.parse(text);
                    message = errorData.message || message;
                } catch (err) {}
                throw new Error(message);
            }

            const data = JSON.parse(text);
            console.log('Đăng nhập thành công:', data);

            // ✅ Lưu lại token mới
            Cookies.set("authToken", data.accessToken, { expires: 7 });
            sessionStorage.setItem("authToken", data.accessToken);
            localStorage.setItem("authToken", data.accessToken);
            sessionStorage.setItem("isLoggedIn", "true");

            setErrorMessage('');
            navigate('/c_dashboard');
        } catch (error) {
            console.error('Đăng nhập thất bại:', error.message);
            setErrorMessage(error.message);
        }
    };

    const handleGoToRegister = () => {
        navigate('/c_register');
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header backgroundClass="bg-gray-900 text-white" />

            <div
                className="absolute inset-0 bg-cover bg-center z-[-1]"
                style={{
                    backgroundImage: "url('https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
                }}
            >
                <div className="absolute inset-0 bg-black opacity-30"></div>
            </div>

            <main className="flex-grow flex items-center justify-center py-20 px-4 bg-gray-50/10">
                <div className="w-full max-w-md bg-white bg-opacity-50 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Đăng Nhập Khách Hàng</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập email của bạn"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập mật khẩu"
                            />
                            <div className="text-right mt-2">
                                <a href="/forgot" className="text-blue-600 text-sm hover:underline">Quên mật khẩu?</a>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
                        >
                            Đăng Nhập
                        </button>

                        {errorMessage && (
                            <div className="mt-4 text-center text-red-600 font-semibold">
                                {errorMessage}
                            </div>
                        )}
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default C_Login;
