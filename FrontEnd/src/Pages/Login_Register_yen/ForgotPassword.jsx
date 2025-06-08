import React, { useState } from "react";
import Layout from "../../Components/FormLogin_yen/Layout";
import Input from "../../Components/FormLogin_yen/Input";

export default function ForgotPassword() {
    const [emailOrPhone, setEmailOrPhone] = useState("");

    return (
        <Layout>
            <img src="/logo.svg" alt="Logo" className="mb-4 w-24 mx-auto" />

            <h2 className="text-xl font-semibold text-center mb-4">Quên mật khẩu</h2>
            <p className="text-gray-600 text-sm text-center mb-6">
                Nhập email hoặc số điện thoại của bạn để đặt lại mật khẩu
            </p>

            <Input
                label="Email hoặc Số điện thoại"
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
            />

            <button
                className="w-full bg-orange-500 text-white py-2 rounded mt-4 transition duration-200 hover:bg-orange-600 hover:shadow-md"
            >
                Gửi mã xác nhận
            </button>

            <div className="text-center mt-4">
                <a href="/signin" className="text-sm text-orange-500 hover:underline">
                    Quay lại đăng nhập
                </a>
            </div>
        </Layout>
    );
}
