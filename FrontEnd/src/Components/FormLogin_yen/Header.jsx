import React, { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ dashboardHideHome = false, backgroundClass = '' }) => {
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
                    : backgroundClass || 'bg-blue-700 shadow-sm border-b border-blue-100'
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo + Brand */}
                    <Link
                        to="/"
                        className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105"
                    >
                        <div
                            className={`p-2.5 rounded-xl transition-all duration-300 ${
                                isScrolled
                                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25'
                                    : 'bg-white/20 backdrop-blur-sm border border-white/30'
                            }`}
                        >
                            <Truck
                                size={24}
                                className={`transition-colors duration-300 ${
                                    isScrolled ? 'text-white' : 'text-white'
                                }`}
                            />
                        </div>
                        <div className="flex flex-col">
                            <span
                                className={`font-bold text-lg leading-tight transition-colors duration-300 ${
                                    isScrolled ? 'text-gray-900' : 'text-white'
                                }`}
                            >
                                Vận Chuyển Nhà
                            </span>
                            <span
                                className={`text-xs font-medium transition-colors duration-300 ${
                                    isScrolled ? 'text-gray-500' : 'text-white/80'
                                }`}
                            >
                                Dịch vụ chuyển nhà uy tín
                            </span>
                        </div>
                    </Link>

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

                {/* Animated dots + Hoạt động 24/7 ở giữa */}
                <div
                    className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-5 z-10"
                >
                    {/* Dots */}
                    <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isScrolled ? 'bg-blue-400' : 'bg-white/60'}`}></div>
                        <div className={`w-2 h-2 rounded-full animate-pulse delay-100 ${isScrolled ? 'bg-purple-400' : 'bg-white/60'}`}></div>
                        <div className={`w-2 h-2 rounded-full animate-pulse delay-200 ${isScrolled ? 'bg-blue-400' : 'bg-white/60'}`}></div>
                    </div>

                    {/* Divider */}
                    <div className={`w-px h-8 ${isScrolled ? 'bg-gray-200' : 'bg-white/30'}`}></div>

                    {/* Status */}
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isScrolled ? 'bg-green-500' : 'bg-green-400'}`}></div>
                        <span className={`text-xs font-medium ${isScrolled ? 'text-gray-600' : 'text-white/80'}`}>
                            Hoạt động 24/7
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
