import React, { useState } from 'react';
import Header from '../../Components/FormLogin_yen/Header.jsx';
import Footer from '../../Components/FormLogin_yen/Footer.jsx';


const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Email: ${formData.email}, Mật khẩu: ${formData.password}`);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            {/* Nền ảnh */}
            <div
                className="absolute inset-0 bg-cover bg-center z-[-1]"
                style={{
                    backgroundImage: "url('https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
                }}
            >
                <div className="absolute inset-0 bg-black opacity-30"></div>
            </div>
            <main className="flex-grow flex items-center justify-center py-20 px-4 bg-gray-50/10">
                <div className="w-full max-w-md bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Đăng Nhập</h2>
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
                    </form>
                    <div className="mt-6 text-center text-sm text-gray-600">
                        Chưa có tài khoản? <a href="/register" className="text-blue-600 hover:underline">Đăng ký</a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Login;
