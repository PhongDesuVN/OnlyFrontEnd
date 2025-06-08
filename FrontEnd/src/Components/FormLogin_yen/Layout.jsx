import loginImage from "../../assets/background.webp"; // HOẶC thay = ảnh mới vừa upload nếu bạn muốn

export default function Layout({ children }) {
    return (
        <div className="relative w-screen h-screen overflow-hidden">
            {/* Ảnh nền full màn */}
            <img
                src={loginImage}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />

            {/* Layer form nằm giữa*/}
            <div className="relative z-10 h-full flex items-center justify-center">
                <div className="ml-16 w-[90%] max-w-md bg-white rounded-xl shadow-xl p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
