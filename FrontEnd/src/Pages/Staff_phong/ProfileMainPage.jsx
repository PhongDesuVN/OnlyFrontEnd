import { useState, useEffect } from "react";
import RequireAuth from "../../Components/RequireAuth";
import SidebarProfile_Trung from "../../Components/Sidebar_Trung/SidebarProfile_Trung";
import { apiCall } from "../../utils/api";
import Cookies from "js-cookie";
import {
    Mail, Briefcase, ShieldCheck, CalendarDays,
    Lock, Save, Upload, Image as ImageIcon, User, LogIn, Activity
} from "lucide-react";

const DEFAULT_AVATAR = "https://res.cloudinary.com/dkb5euwxe/image/upload/default-avatar.jpg";

const TABS = [
    { key: "info", label: "Thông tin cá nhân", icon: <User size={36} /> },
    { key: "monitor", label: "Giám sát tài khoản", icon: <Activity size={36} /> },
];

const ProfileMainPage = () => {
    const [tab, setTab] = useState("info");
    const [userInfo, setUserInfo] = useState(null);
    const [formData, setFormData] = useState({});
    const [avatarFile, setAvatarFile] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [usage, setUsage] = useState(null);
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchUserInfo();
        fetchMonitorData();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const res = await apiCall("/api/profile", { auth: true });
            const data = await res.json();
            setUserInfo(data);
            setFormData({
                fullName: data.fullName || "",
                username: data.username || "",
                phone: data.phone || "",
                address: data.address || "",
                gender: data.gender || ""
            });
        } catch {
            setError("Không thể tải thông tin cá nhân.");
        }
    };

    const fetchMonitorData = async () => {
        try {
            const [res1, res2, res3] = await Promise.all([
                apiCall("/api/sessions", { auth: true }),
                apiCall("/api/usage", { auth: true }),
                apiCall("/api/activity-log", { auth: true })
            ]);
            setSessions(await res1.json());
            setUsage(await res2.json());
            setLogs(await res3.json());
        } catch (e) {
            console.error("Lỗi monitor:", e);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setIsUpdating(true);
        try {
            const res = await apiCall("/api/profile", {
                method: "PUT",
                auth: true,
                body: JSON.stringify(formData)
            });
            const updated = await res.json();
            
            // Cập nhật state ngay lập tức với dữ liệu mới từ formData
            setUserInfo(prev => ({
                ...prev,
                ...formData, // Cập nhật với dữ liệu từ form ngay lập tức
                ...updated,  // Cập nhật với response từ backend
                // Đảm bảo giữ nguyên ảnh hiện tại nếu backend không trả về
                img: updated.img || prev.img
            }));
            
            alert("Cập nhật thành công.");
        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            alert("Lỗi khi cập nhật.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAvatarChange = (e) => {
        setAvatarFile(e.target.files[0]);
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return alert("Vui lòng chọn ảnh");

        setIsUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append("file", avatarFile);

        try {
            const res = await apiCall("/api/profile/upload-avatar", {
                method: "POST",
                auth: true,
                body: formDataUpload
            });
            console.log("Upload status:", res.status);
            const imageUrl = await res.text();
            console.log("Upload response body:", imageUrl);

            if (![200, 201, 204].includes(res.status)) throw new Error("Upload ảnh thất bại");
            
            // Cập nhật state ngay lập tức với ảnh mới
            const newImageUrl = imageUrl + '?t=' + Date.now();
            setUserInfo(prev => ({ ...prev, img: newImageUrl }));
            
            // Reset file input
            setAvatarFile(null);
            
            alert("Cập nhật ảnh đại diện thành công");
        } catch (err) {
            alert("Lỗi khi upload ảnh");
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRequestChangePassword = async () => {
        const confirmed = window.confirm("Bạn có chắc chắn muốn gửi email đổi mật khẩu?");
        if (!confirmed) return;

        try {
            const res = await apiCall("/api/auth/change-password-request", {
                method: "POST",
                auth: true
            });

            const text = await res.text();
            if (!res.ok) throw new Error(text);

            alert("Yêu cầu đổi mật khẩu đã được gửi. Vui lòng kiểm tra email.");
        } catch (err) {
            console.error("Lỗi gửi yêu cầu đổi mật khẩu:", err);
            alert("Gửi yêu cầu thất bại. Vui lòng thử lại.");
        }
    };

    const formatDate = (d) => {
        if (!d) return "Chưa cập nhật";
        return new Date(d).toLocaleString("vi-VN");
    };

    if (error) return <div className="p-8 text-red-500 text-center">{error}</div>;
    if (!userInfo) return <div className="p-8 text-gray-500 text-center">Đang tải thông tin cá nhân...</div>;

    return (
        <RequireAuth>
            <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-white">
                <SidebarProfile_Trung currentTab={tab} setTab={setTab} />
                <div className="flex-1 p-4 md:p-10 pt-0 mt-8" style={{paddingTop: 0, marginTop: '2rem', background: 'transparent', boxShadow: 'none', border: 'none'}}>
                    {/* Form 1: Tabs - icon */}
                    <form className="w-full flex justify-center mb-0 mt-0" autoComplete="off" style={{marginTop: 0}}>
                        <div className="flex gap-1 md:gap-3 border-b pb-0 transition-all duration-500 min-h-0 mt-0 pt-0">
                            {TABS.map(t => (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => setTab(t.key)}
                                    title={t.label}
                                    className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 border-b-4
                                        ${tab === t.key ? 'bg-white border-blue-600 text-blue-700 shadow-lg scale-110' : 'border-transparent text-gray-400 hover:text-blue-600 hover:bg-blue-50'}
                                    `}
                                    style={{ boxShadow: tab === t.key ? '0 4px 24px 0 rgba(59,130,246,0.10)' : undefined }}
                                >
                                    {t.icon}
                                </button>
                            ))}
                        </div>
                    </form>
                    {/* Form 2: Card thông tin cá nhân */}
                    <div className="mt-8 mt-6">
                        {tab === "info" && (
                            <form className="max-w-[1100px] mx-auto bg-white rounded-3xl shadow-2xl px-12 py-6 md:py-8 animate-fade-in relative overflow-visible flex flex-col gap-2 mt-0" autoComplete="off">
                                {/* Greeting */}
                                <div className="absolute -top-7 left-12 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-1 rounded-full shadow text-base font-semibold border-4 border-white z-10 animate-fade-in-down">
                                    Xin chào, {formData.fullName || userInfo.fullName || userInfo.username}!
                                </div>
                                <div className="flex flex-col lg:flex-row items-center gap-8 mb-2 mt-6 w-full">
                                    {/* Avatar */}
                                    <div className="relative group flex-shrink-0">
                                        <img
                                            src={userInfo.img || DEFAULT_AVATAR}
                                            className="w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-blue-300 object-cover shadow-xl transition-transform duration-300 group-hover:scale-110 group-hover:ring-4 group-hover:ring-blue-400/60"
                                            alt="avatar"
                                            style={{ boxShadow: '0 8px 32px 0 rgba(59,130,246,0.15)' }}
                                        />
                                        <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors border-2 border-white">
                                            <Upload size={20} />
                                            <input 
                                                type="file" 
                                                onChange={handleAvatarChange} 
                                                className="hidden" 
                                                key={avatarFile ? 'has-file' : 'no-file'} // Force re-render để reset input
                                            />
                                        </label>
                                        {avatarFile && (
                                            <button
                                                onClick={handleAvatarUpload}
                                                disabled={isUploading}
                                                className={`absolute left-1/2 -bottom-10 -translate-x-1/2 px-6 py-2 rounded-xl shadow-lg transition-all font-semibold animate-fade-in-up border-2 border-white ${
                                                    isUploading 
                                                        ? 'bg-gray-400 cursor-not-allowed' 
                                                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                                                }`}
                                            >
                                                {isUploading ? 'Đang tải...' : 'Tải lên'}
                                            </button>
                                        )}
                                    </div>
                                    {/* Info fields as cards, 2-3 columns */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
                                        {["fullName", "username", "phone", "address", "gender"].map((key, idx) => (
                                            <div key={idx} className="bg-blue-50 rounded-xl shadow-md p-3 flex flex-col gap-2 border border-blue-100 min-w-[180px]">
                                                <EditableRow
                                                    label={{ fullName: "Họ tên", username: "Tên đăng nhập", phone: "Số điện thoại", address: "Địa chỉ", gender: "Giới tính" }[key]}
                                                    name={key}
                                                    value={formData[key]}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* InfoRow as cards, 2 hàng ngang */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-2 mt-2">
                                    <InfoRow icon={<Mail />} label="Email" value={userInfo.email} card />
                                    <InfoRow icon={<Briefcase />} label="Vai trò" value={userInfo.role} card />
                                    <InfoRow icon={<ShieldCheck />} label="Trạng thái" value={userInfo.status} card />
                                    <InfoRow icon={<CalendarDays />} label="Ngày tạo" value={formatDate(userInfo.createdAt)} card />
                                    <InfoRow icon={<Lock />} label="Đổi mật khẩu gần nhất" value={formatDate(userInfo.lastPasswordResetDate)} card />
                                </div>
                                {/* Buttons in a row, right-aligned */}
                                <div className="flex flex-col md:flex-row gap-4 justify-end mt-2">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isUpdating}
                                        className={`px-8 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-all text-lg animate-fade-in-up ${
                                            isUpdating 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105 active:scale-95 text-white'
                                        }`}
                                    >
                                        <Save size={22} /> {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>
                                    <button
                                        onClick={handleRequestChangePassword}
                                        disabled={isUpdating}
                                        className={`px-6 py-3 rounded-xl font-semibold text-lg transition-colors animate-fade-in-up ${
                                            isUpdating 
                                                ? 'text-gray-400 cursor-not-allowed' 
                                                : 'text-blue-600 underline hover:text-blue-800'
                                        }`}
                                    >
                                        Đổi mật khẩu
                                    </button>
                                </div>
                            </form>
                        )}

                        {tab === "monitor" && (
                            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                                {/* Usage Stat */}
                                <section className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4">
                                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-2"><LogIn className="text-blue-500" size={20}/> Thống kê sử dụng</h3>
                                    {usage ? (
                                        <ul className="list-disc pl-6 text-gray-700 space-y-1">
                                            <li>Đăng nhập: <span className="font-bold text-blue-700">{usage.loginCount}</span></li>
                                            <li>Tổng giờ online: <span className="font-bold text-blue-700">{Math.round((usage.totalOnlineSeconds || 0)/3600)}h</span></li>
                                            <li>Lần đăng nhập cuối: <span className="font-bold">{formatDate(usage.lastLoginAt)}</span></li>
                                            <li>Số API hôm nay: <span className="font-bold text-blue-700">{usage.apiCallsToday}</span></li>
                                            <li>Ngày thống kê: <span className="font-bold">{usage.currentDate}</span></li>
                                            <li>User ID: <span className="font-bold">{usage.userId}</span></li>
                                        </ul>
                                    ) : <div className="text-gray-400">Đang tải...</div>}
                                </section>
                                {/* Sessions */}
                                <section className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4">
                                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-2"><User className="text-blue-500" size={20}/> Phiên đăng nhập</h3>
                                    <ul className="text-sm text-gray-700 space-y-3 max-h-56 overflow-y-auto pr-2">
                                        {sessions.length > 0 ? sessions.map((s, i) => (
                                            <li key={i} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                                                <div><strong>Device:</strong> {s.deviceInfo}</div>
                                                <div><strong>IP:</strong> {s.ipAddress}</div>
                                                <div><strong>User Agent:</strong> <span className="break-all">{s.userAgent}</span></div>
                                                <div><strong>Email:</strong> {s.email}</div>
                                                <div><strong>Role:</strong> {s.role}</div>
                                                <div><strong>Active:</strong> {s.active ? 'Đang hoạt động' : 'Không hoạt động'}</div>
                                                <div><strong>Thời gian tạo:</strong> {formatDate(s.createdAt)}</div>
                                                <div><strong>Truy cập gần nhất:</strong> {formatDate(s.lastAccessedAt)}</div>
                                            </li>
                                        )) : <li className="text-gray-400">Không có dữ liệu</li>}
                                    </ul>
                                </section>
                                {/* Activity Log */}
                                <section className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2 flex flex-col gap-4">
                                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-2"><Activity className="text-blue-500" size={20}/> Lịch sử hoạt động</h3>
                                    <ul className="text-sm text-gray-700 space-y-2 max-h-56 overflow-y-auto pr-2">
                                        {logs.length > 0 ? logs.map((log, i) => (
                                            <li key={i} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                                                <div><strong>Thời gian:</strong> {formatDate(log.timestamp)}</div>
                                                <div><strong>Hành động:</strong> {log.action}</div>
                                                {log.metadata && <div><strong>Metadata:</strong> <span className="break-all">{log.metadata}</span></div>}
                                            </li>
                                        )) : <li className="text-gray-400">Không có dữ liệu</li>}
                                    </ul>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RequireAuth>
    );
};

const EditableRow = ({ label, name, value, onChange }) => (
    <div className="flex flex-col gap-1">
        <label className="font-medium text-gray-700 mb-1">{label}:</label>
        <input
            name={name}
            value={value || ""}
            onChange={onChange}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-800 bg-gray-50 shadow-sm"
        />
    </div>
);

const InfoRow = ({ icon, label, value, card }) => (
    card ? (
        <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 shadow-md border border-blue-100">
            <div className="text-blue-600">{icon}</div>
            <p className="text-gray-700"><strong>{label}:</strong> {value || "Chưa cập nhật"}</p>
        </div>
    ) : (
        <div className="flex items-center gap-3 bg-blue-50 rounded-lg px-3 py-2">
            <div className="text-blue-600">{icon}</div>
            <p className="text-gray-700"><strong>{label}:</strong> {value || "Chưa cập nhật"}</p>
        </div>
    )
);

export default ProfileMainPage;
