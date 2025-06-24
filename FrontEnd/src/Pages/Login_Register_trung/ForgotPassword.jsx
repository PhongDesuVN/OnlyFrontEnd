import React, { useState } from 'react'
import Header from '../../Components/FormLogin_yen/Header.jsx'
import Footer from '../../Components/FormLogin_yen/Footer.jsx'

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch("http://localhost:8083/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                throw new Error("Gửi thất bại");
            }

            await res.text();
            setSubmitted(true);
        } catch (err) {
            setError("❌ Có lỗi xảy ra, vui lòng thử lại!");
        }
    };

    const handleResend = () => {
        setSubmitted(false);
        setEmail('');
        setError('');
    };

    return (
        <div className="min-h-screen flex flex-col relative">
            <Header />

            {/* Background image */}
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
                <div className="w-full max-w-md bg-white bg-opacity-90 backdrop-blur-md p-6 rounded-2xl shadow-lg my-6 text-sm">
                    <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Quên mật khẩu?</h2>
                    <p className="text-center text-gray-600 mb-6">
                        Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập email của bạn"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
                        >
                            Gửi liên kết đặt lại
                        </button>
                    </form>

                    {submitted && (
                        <p className="mt-4 text-green-600 text-center">
                            ✅ Liên kết khôi phục đã được gửi! Vui lòng kiểm tra hộp thư.
                        </p>
                    )}

                    {error && (
                        <p className="mt-4 text-red-600 text-center">
                            {error}
                        </p>
                    )}

                    <div className="mt-6 text-center text-gray-600">
                        Chưa nhận được email?{' '}
                        <button
                            onClick={handleResend}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Gửi lại
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ForgotPassword;
