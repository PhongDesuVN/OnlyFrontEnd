import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../Components/FormLogin_yen/Layout";
import Tab from "../../Components/FormLogin_yen/Tab";
import Input from "../../Components/FormLogin_yen/Input";
import logo from '../../assets/logo1.png';

export default function Signin() {
    const [activeTab, setActiveTab] = useState("login");

    return (
        <Layout>
            <img src={logo} alt="Logo" className="mb-4 w-24 mx-auto" />
            <Tab activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="w-full max-w-md mx-auto">
                {activeTab === "login" ? (
                    <>
                        <Input label="Email" type="email" />
                        <Input label="Mật khẩu" type="password" />

                        <div className="text-right mb-4">
                            <Link to="/forgot" className="text-sm text-orange-500 hover:underline">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <button className="w-full bg-orange-500 text-white py-2 rounded mt-4 transition duration-200 hover:bg-orange-600 hover:shadow-md">
                            Đăng nhập
                        </button>
                    </>
                ) : (
                    <>
                        <Input label="Tên" />
                        <Input label="Email" type="email" />
                        <Input label="Mật khẩu" type="password" />
                        <Input label="Số điện thoại" type="tel" />
                        <Input label="Địa chỉ" type="text" />

                        {/* Ô chọn giới tính */}
                        <div className="mb-4">
                            <select className="w-full border p-3 rounded focus:outline-none">
                                <option value="">Chọn giới tính</option>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                            </select>
                        </div>

                        <button className="w-full bg-orange-500 text-white py-2 rounded mt-4 transition duration-200 hover:bg-orange-600 hover:shadow-md">
                            Đăng ký
                        </button>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Bằng việc đăng ký, bạn đã đồng ý với{" "}
                            <a href="#" className="text-orange-500 underline hover:text-orange-600">
                                Chính sách của HAHAHAHA
                            </a>
                        </p>
                    </>
                )}
            </div>
        </Layout>
    );
}
