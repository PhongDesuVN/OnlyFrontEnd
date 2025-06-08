export default function Tab({ activeTab, setActiveTab }) {
    return (
        <div className="flex mb-4 border-b border-gray-300">
            <button
                onClick={() => setActiveTab("login")}
                className={`mr-4 pb-2 transition duration-200 ${
                    activeTab === "login"
                        ? "border-b-2 border-orange-500 font-semibold text-black"
                        : "text-gray-500 hover:text-black"
                }`}
            >
                Đăng nhập
            </button>
            <button
                onClick={() => setActiveTab("register")}
                className={`pb-2 transition duration-200 ${
                    activeTab === "register"
                        ? "border-b-2 border-orange-500 font-semibold text-black"
                        : "text-gray-500 hover:text-black"
                }`}
            >
                Đăng ký
            </button>
        </div>
    );
}
