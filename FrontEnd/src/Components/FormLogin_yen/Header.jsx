import React, { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import { Link } from "react-router-dom";

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow text-gray-800' : 'bg-transparent text-white'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                {/* Logo + Tiêu đề */}
                <div className="flex items-center space-x-3">
                    <Truck className="w-7 h-7 text-blue-600" />
                    <h1 className="text-lg font-semibold tracking-tight">Vận Chuyển Nhà</h1>
                </div>

                {/* Menu */}
                <nav className="hidden md:flex space-x-6 text-sm font-medium">
                    <Link to="/">
                        <a href="#home" className="hover:text-blue-600 transition-colors">Trang Chủ</a>
                    </Link>

                </nav>
            </div>
        </header>
    );
};

export default Header;
