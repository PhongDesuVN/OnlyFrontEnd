import React, { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import { Link } from "react-router-dom";

const Header = ({ dashboardHideHome }) => {
    const [isScrolled, setIsScrolled] = useState(false);
const Header = () => {
const Header = ({ dashboardHideHome }) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
                isScrolled 
                    ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm' 
                    : 'bg-transparent'
            }`}
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
                isScrolled 
                    ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm' 
                    : 'bg-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8" style={{position: 'relative'}}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8" style={{position: 'relative'}}>
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo + Brand */}
                    <Link
                        to="/"
                        className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105"
                    >
                        <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                            isScrolled 
                                ? 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25' 
                                : 'bg-white/20 backdrop-blur-sm border border-white/30'
                        }`}>
                            <Truck
                                size={24}
                                className={`transition-colors duration-300 ${
                                    isScrolled ? 'text-white' : 'text-white'
                                }`}
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-bold text-lg leading-tight transition-colors duration-300 ${
                                isScrolled ? 'text-gray-900' : 'text-white'
                            }`}>
                                Vận Chuyển Nhà
                            </span>
                            <span className={`text-xs font-medium transition-colors duration-300 ${
                                isScrolled ? 'text-gray-500' : 'text-white/80'
                            }`}>
                                Dịch vụ chuyển nhà uy tín
                            </span>
                        </div>
                    </Link>
                    {/* Nút Trang Chủ chỉ hiện nếu không có dashboardHideHome */}
                    {!dashboardHideHome && (
                        <Link
                            to="/"
                            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 ${
                                isScrolled 
                                    ? 'text-gray-700 hover:bg-gray-100 border border-gray-200' 
                                    : 'text-white/90 hover:bg-white/20 backdrop-blur-sm border border-white/30'
                            }`}
                        >
                            Trang Chủ
                        </Link>
                    )}
                </div>
                {/* Hoạt động 24/7, 3 chấm và divider căn giữa tuyệt đối */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    zIndex: 10,
                  }}
                >
                  {/* Animated dots */}
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-300 ${
                      isScrolled ? 'bg-blue-400' : 'bg-white/60'
                    }`}></div>
                    <div className={`w-2 h-2 rounded-full animate-pulse delay-100 transition-colors duration-300 ${
                      isScrolled ? 'bg-purple-400' : 'bg-white/60'
                    }`}></div>
                    <div className={`w-2 h-2 rounded-full animate-pulse delay-200 transition-colors duration-300 ${
                      isScrolled ? 'bg-blue-400' : 'bg-white/60'
                    }`}></div>
                  </div>
                  {/* Divider */}
                  <div className={`w-px h-8 transition-colors duration-300 ${
                    isScrolled ? 'bg-gray-200' : 'bg-white/30'
                  }`}></div>
                  {/* Hoạt động 24/7 */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-300 ${
                      isScrolled ? 'bg-green-500' : 'bg-green-400'
                    }`}></div>
                    <span className={`text-xs font-medium transition-colors duration-300 ${
                      isScrolled ? 'text-gray-600' : 'text-white/80'
                    }`}>
                      Hoạt động 24/7
                    </span>
                  </div>
                </div>
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                {/* Logo + Tiêu đề */}
                <div className="flex items-center space-x-3">
                    <Truck className="w-7 h-7 text-blue-600" />
                    <h1 className="text-lg font-semibold tracking-tight">Vận Chuyển Nhà</h1>
                </div>

                {/* Menu */}
                <nav className="hidden md:flex space-x-6 text-sm font-medium">
                    <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                        <Link to="/" className="text-black hover:text-blue-600 transition-colors">Trang Chủ</Link>
                    </button>
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo + Brand */}
                    <Link
                        to="/"
                        className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105"
                    >
                        <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                            isScrolled 
                                ? 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25' 
                                : 'bg-white/20 backdrop-blur-sm border border-white/30'
                        }`}>
                            <Truck
                                size={24}
                                className={`transition-colors duration-300 ${
                                    isScrolled ? 'text-white' : 'text-white'
                                }`}
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-bold text-lg leading-tight transition-colors duration-300 ${
                                isScrolled ? 'text-gray-900' : 'text-white'
                            }`}>
                                Vận Chuyển Nhà
                            </span>
                            <span className={`text-xs font-medium transition-colors duration-300 ${
                                isScrolled ? 'text-gray-500' : 'text-white/80'
                            }`}>
                                Dịch vụ chuyển nhà uy tín
                            </span>
                        </div>
                    </Link>

                    {/* Decorative Elements */}
                    <div className="hidden md:flex items-center space-x-6">
                        {/* Animated dots */}
                        <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-300 ${
                                isScrolled ? 'bg-blue-400' : 'bg-white/60'
                            }`}></div>
                            <div className={`w-2 h-2 rounded-full animate-pulse delay-100 transition-colors duration-300 ${
                                isScrolled ? 'bg-purple-400' : 'bg-white/60'
                            }`}></div>
                            <div className={`w-2 h-2 rounded-full animate-pulse delay-200 transition-colors duration-300 ${
                                isScrolled ? 'bg-blue-400' : 'bg-white/60'
                            }`}></div>
                        </div>

                        {/* Elegant divider */}
                        <div className={`w-px h-8 transition-colors duration-300 ${
                            isScrolled ? 'bg-gray-200' : 'bg-white/30'
                        }`}></div>

                        {/* Status indicator */}
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-300 ${
                                isScrolled ? 'bg-green-500' : 'bg-green-400'
                            }`}></div>
                            <span className={`text-xs font-medium transition-colors duration-300 ${
                                isScrolled ? 'text-gray-600' : 'text-white/80'
                            }`}>
                                Hoạt động 24/7
                            </span>
                        </div>
                    </div>

                    {/* Simple Home Link */}
                    <Link
                        to="/"
                        className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 ${
                            isScrolled 
                                ? 'text-gray-700 hover:bg-gray-100 border border-gray-200' 
                                : 'text-white/90 hover:bg-white/20 backdrop-blur-sm border border-white/30'
                        }`}
                    >
                        Trang Chủ
                    </Link>
                    {/* Nút Trang Chủ chỉ hiện nếu không có dashboardHideHome */}
                    {!dashboardHideHome && (
                        <Link
                            to="/"
                            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 ${
                                isScrolled 
                                    ? 'text-gray-700 hover:bg-gray-100 border border-gray-200' 
                                    : 'text-white/90 hover:bg-white/20 backdrop-blur-sm border border-white/30'
                            }`}
                        >
                            Trang Chủ
                        </Link>
                    )}
                </div>
                {/* Hoạt động 24/7, 3 chấm và divider căn giữa tuyệt đối */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    zIndex: 10,
                  }}
                >
                  {/* Animated dots */}
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-300 ${
                      isScrolled ? 'bg-blue-400' : 'bg-white/60'
                    }`}></div>
                    <div className={`w-2 h-2 rounded-full animate-pulse delay-100 transition-colors duration-300 ${
                      isScrolled ? 'bg-purple-400' : 'bg-white/60'
                    }`}></div>
                    <div className={`w-2 h-2 rounded-full animate-pulse delay-200 transition-colors duration-300 ${
                      isScrolled ? 'bg-blue-400' : 'bg-white/60'
                    }`}></div>
                  </div>
                  {/* Divider */}
                  <div className={`w-px h-8 transition-colors duration-300 ${
                    isScrolled ? 'bg-gray-200' : 'bg-white/30'
                  }`}></div>
                  {/* Hoạt động 24/7 */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-300 ${
                      isScrolled ? 'bg-green-500' : 'bg-green-400'
                    }`}></div>
                    <span className={`text-xs font-medium transition-colors duration-300 ${
                      isScrolled ? 'text-gray-600' : 'text-white/80'
                    }`}>
                      Hoạt động 24/7
                    </span>
                  </div>
                </div>
            </div>
        </header>
    );
};

export default Header;