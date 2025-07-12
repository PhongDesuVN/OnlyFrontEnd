import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState(""); // Chỉ dùng khi không có token

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirm || (!token && !email)) {
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
      let response;

      if (token) {
        // Trường hợp có token (từ link email)
        response = await fetch("http://localhost:8083/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: password }),
        });
      } else {
        // Trường hợp không có token (gửi email reset)
        response = await fetch("/api/auth/request-reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      }

      const data = await response.text();

      if (response.ok) {
        setSuccess(true);
        setMessage(token
            ? "Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập…"
            : "Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.");

        if (token) {
          setTimeout(() => navigate("/login"), 2000);
        }
      } else {
        setMessage(data || "Có lỗi xảy ra.");
      }
    } catch (err) {
      console.error("Lỗi xử lý mật khẩu:", err);
      setMessage("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        <form
            onSubmit={handleSubmit}
            className="bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
            {token ? "Đặt lại mật khẩu" : "Yêu cầu đặt lại mật khẩu"}
          </h2>

          <p className="mb-6 text-center text-gray-600">
            {token
                ? "Nhập mật khẩu mới cho tài khoản của bạn."
                : "Nhập email của bạn để nhận link đặt lại mật khẩu."}
          </p>

          {!token && (
              <input
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
              />
          )}

          {/* Mật khẩu mới */}
          <div className="relative mb-4">
            <input
                type={showPass1 ? "text" : "password"}
                placeholder="Mật khẩu mới"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPass1(!showPass1)}
            >
            <FontAwesomeIcon icon={showPass1 ? faEyeSlash : faEye} />
          </span>
          </div>

          {/* Nhập lại mật khẩu */}
          <div className="relative mb-6">
            <input
                type={showPass2 ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
            />
            <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPass2(!showPass2)}
            >
            <FontAwesomeIcon icon={showPass2 ? faEyeSlash : faEye} />
          </span>
          </div>

          <button
              type="submit"
              disabled={success}
              className={`w-full py-2 rounded-lg font-semibold transition-all ${
                  success
                      ? "bg-emerald-500 text-white"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
              }`}
          >
            {token ? "Đặt lại mật khẩu" : "Gửi yêu cầu"}
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
