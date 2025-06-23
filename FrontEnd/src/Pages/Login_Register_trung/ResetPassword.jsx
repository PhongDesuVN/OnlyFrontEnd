import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) {
      setMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (password.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirm) {
      setMessage("Mật khẩu nhập lại không khớp.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8083/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.text();
      if (res.ok) {
        setSuccess(true);
        setMessage("Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data);
      }
    } catch (error) {
      console.error("Lỗi reset mật khẩu:", error); // <-- Sử dụng biến `error`
      setMessage("Có lỗi xảy ra, vui lòng thử lại!");
    }

  };

  if (!token) return <div className="text-center mt-20 text-red-600 font-bold">Token không hợp lệ!</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Đặt lại mật khẩu</h2>
        <p className="mb-6 text-center text-gray-600">Nhập mật khẩu mới cho tài khoản của bạn.</p>
        <input
          type="password"
          placeholder="Mật khẩu mới"
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Nhập lại mật khẩu"
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />
        <button
          type="submit"
          className={`w-full py-2 rounded-lg font-semibold transition-all ${
            success
              ? "bg-emerald-500 text-white"
              : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
          }`}
          disabled={success}
        >
          Đặt lại mật khẩu
        </button>
        {message && (
          <div className={`mt-4 text-center ${success ? "text-emerald-600" : "text-red-600"}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;