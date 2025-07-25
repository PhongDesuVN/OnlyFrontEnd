import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Home, Users, Shield, Phone, Mail, MapPin, Star, CheckCircle, Edit3, Palette, Image, X, Download } from 'lucide-react';

// Danh sách hình nền mặc định
const defaultBackgrounds = [
    'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/906494/pexels-photo-906494.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/586687/pexels-photo-586687.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/842711/pexels-photo-842711.jpeg',
    'https://images.pexels.com/photos/1525041/pexels-photo-1525041.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/1643409/pexels-photo-1643409.jpeg',
    'https://images.pexels.com/photos/1229042/pexels-photo-1229042.jpeg',
    'https://images.pexels.com/photos/1632780/pexels-photo-1632780.jpeg'
];

// Danh sách màu chủ đề
const themeColors = [
    { name: 'Xanh Dương', primary: 'blue', gradient: 'from-blue-500 to-purple-600' },
    { name: 'Xanh Lá', primary: 'green', gradient: 'from-green-500 to-blue-500' },
    { name: 'Đỏ', primary: 'red', gradient: 'from-red-500 to-pink-500' },
    { name: 'Cam', primary: 'orange', gradient: 'from-orange-500 to-red-500' },
    { name: 'Tím', primary: 'purple', gradient: 'from-purple-500 to-indigo-600' },
    { name: 'Hồng', primary: 'pink', gradient: 'from-pink-500 to-rose-500' }
];

// Cài đặt mặc định
const defaultSettings = {
    backgroundImage: defaultBackgrounds[0],
    theme: themeColors[0],
    fontSettings: {
        fontFamily: 'Arial',
        fontSize: '16px',
        fontColor: '#000000',
    },
};

// Hàm xác thực cài đặt
const sanitizeSettings = (savedSettings) => {
    try {
        const parsed = JSON.parse(savedSettings);
        // Kiểm tra theme
        const validTheme = themeColors.find(theme => theme.name === parsed.theme?.name) || themeColors[0];
        // Kiểm tra backgroundImage
        const validBackground = defaultBackgrounds.includes(parsed.backgroundImage) || parsed.backgroundImage?.startsWith('data:image') || parsed.backgroundImage?.startsWith('https://') ? parsed.backgroundImage : defaultBackgrounds[0];
        // Kiểm tra fontSettings
        const validFontSettings = {
            fontFamily: ['Arial', 'Roboto'].includes(parsed.fontSettings?.fontFamily) ? parsed.fontSettings.fontFamily : 'Arial',
            fontSize: /^\d+px$/.test(parsed.fontSettings?.fontSize) ? parsed.fontSettings.fontSize : '16px',
            fontColor: /^#[0-9A-Fa-f]{6}$/.test(parsed.fontSettings?.fontColor) ? parsed.fontSettings.fontColor : '#000000',
        };

        return {
            backgroundImage: validBackground,
            theme: validTheme,
            fontSettings: validFontSettings,
        };
    } catch (error) {
        console.warn('Lỗi khi phân tích localStorage, sử dụng cài đặt mặc định:', error);
        return defaultSettings;
    }
};

// Component Menu Tùy Chỉnh
const CustomizationMenu = ({ isOpen, onClose, settings, onSettingsChange }) => {
    const [activeTab, setActiveTab] = useState('background');
    const [customImageUrl, setCustomImageUrl] = useState('');

    const handleBackgroundChange = (imageUrl) => {
        onSettingsChange({ ...settings, backgroundImage: imageUrl });
    };

    const handleThemeChange = (theme) => {
        onSettingsChange({ ...settings, theme });
    };

    const handleFontChange = (newFontSettings) => {
        onSettingsChange({ ...settings, fontSettings: newFontSettings });
    };

    const handleCustomImage = () => {
        if (customImageUrl.trim()) {
            handleBackgroundChange(customImageUrl);
            setCustomImageUrl('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-20 right-4 bg-white rounded-2xl w-full max-w-sm shadow-2xl z-[100] p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Tùy Chỉnh Giao Diện</h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
            <div className="flex border-b border-gray-200 mb-4">
                <button
                    onClick={() => setActiveTab('background')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'background'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                >
                    <Image className="w-5 h-5 inline mr-2" />
                    Hình Nền
                </button>
                <button
                    onClick={() => setActiveTab('theme')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'theme'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                >
                    <Palette className="w-5 h-5 inline mr-2" />
                    Màu Chủ Đề
                </button>
                <button
                    onClick={() => setActiveTab('font')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'font'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                        }`}
                >
                    <Edit3 className="w-5 h-5 inline mr-2" />
                    Phông Chữ
                </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
                {activeTab === 'background' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Tải Lên Hình Nền</h3>
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <input
                                        type="url"
                                        placeholder="Nhập URL hình ảnh..."
                                        value={customImageUrl}
                                        onChange={(e) => setCustomImageUrl(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleCustomImage}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    handleBackgroundChange(event.target.result);
                                                };
                                                reader.readAsDataURL(e.target.files[0]);
                                            }
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Hình Nền Có Sẵn</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {defaultBackgrounds.map((bg, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleBackgroundChange(bg)}
                                        className={`relative cursor-pointer rounded-lg overflow-hidden transition-all transform hover:scale-105 hover:shadow-lg ${settings.backgroundImage === bg ? 'ring-4 ring-blue-500' : ''
                                            }`}
                                    >
                                        <img
                                            src={bg}
                                            alt={`Background ${index + 1}`}
                                            className="w-full h-24 object-cover"
                                        />
                                        {settings.backgroundImage === bg && (
                                            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                                                <CheckCircle className="w-8 h-8 text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'theme' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Chọn Màu Chủ Đề</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {themeColors.map((theme, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleThemeChange(theme)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all transform hover:scale-105 hover:shadow-lg ${settings.theme.name === theme.name ? 'ring-4 ring-gray-400' : ''
                                            }`}
                                    >
                                        <div className={`w-full h-20 rounded-lg bg-gradient-to-r ${theme.gradient} mb-3`}></div>
                                        <p className="text-center font-medium text-gray-700">{theme.name}</p>
                                        {settings.theme.name === theme.name && (
                                            <div className="flex justify-center mt-2">
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'font' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold mb-4">Tùy Chỉnh Phông Chữ</h3>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Kiểu chữ</label>
                            <select
                                value={settings.fontSettings.fontFamily}
                                onChange={(e) => handleFontChange({ ...settings.fontSettings, fontFamily: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Arial">Arial</option>
                                <option value="Roboto">Roboto</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Kích thước chữ</label>
                            <input
                                type="number"
                                value={parseInt(settings.fontSettings.fontSize)}
                                onChange={(e) => handleFontChange({ ...settings.fontSettings, fontSize: `${e.target.value}px` })}
                                min="12"
                                max="50"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                    </div>
                )}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Xong
                    </button>
                </div>
            </div>
        </div>
    );
};

// Thành phần tiêu đề với nút tùy chỉnh và các link
const Header = ({ onCustomizeClick, settings }) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg text-gray-800' : 'bg-transparent text-white'}`}>
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Truck className={`w-8 h-8 text-${settings.theme.primary}-600`} />
                        <h1 className="text-xl font-bold">Vận Chuyển Nhà</h1>
                    </div>
                    <nav className="hidden md:flex space-x-8">
                        <a href="#home" className={`hover:text-${settings.theme.primary}-600 transition-colors`}>Trang Chủ</a>
                        <a href="#services" className={`hover:text-${settings.theme.primary}-600 transition-colors`}>Hệ Thống</a>
                        <a href="#about" className={`hover:text-${settings.theme.primary}-600 transition-colors`}>Giới Thiệu</a>

                    </nav>

                    <div className="flex space-x-3">
                        <button
                            onClick={onCustomizeClick}
                            className={`p-2 border border-${settings.theme.primary}-600 text-${settings.theme.primary}-600 rounded-lg hover:bg-${settings.theme.primary}-600 hover:text-white transition-all group`}
                            title="Tùy chỉnh giao diện"
                        >
                            <Edit3 className="w-5 h-5" />
                        </button>
                        <Link to="/login">
                            <button className={`px-4 py-2 border border-${settings.theme.primary}-600 text-${settings.theme.primary}-600 rounded-lg hover:bg-${settings.theme.primary}-600 hover:text-white transition-all`}>
                                Đăng Nhập
                            </button>
                        </Link>
                        <Link to="/Register">
                            <button className={`px-4 py-2 bg-${settings.theme.primary}-600 text-white rounded-lg hover:bg-${settings.theme.primary}-700 transition-all`}>
                                Đăng Ký
                            </button>
                        </Link>
                        <Link to="/c_login">
                            <button className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all">
                                Customer
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

// Thành phần Hero với hình nền có thể tùy chỉnh
const Hero = ({ settings }) => {
    // Áp dụng cài đặt phông chữ cho phần tử Hero
    const style = {
        backgroundImage: `url('${settings.backgroundImage}')`,
        fontFamily: settings.fontSettings.fontFamily,
        fontSize: settings.fontSettings.fontSize,
        color: settings.fontSettings.fontColor,
    };

    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden" style={style}>
            <div>
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
                    style={{ backgroundImage: `url('${settings.backgroundImage}')` }}
                >
                    <div className="absolute inset-0 bg-black opacity-20"></div>
                </div>
                <div className="absolute top-20 left-10 w-20 h-20 bg-white opacity-10 rounded-full animate-pulse"></div>
                <div className="absolute top-40 right-20 w-16 h-16 bg-white opacity-10 rounded-full animate-pulse delay-300"></div>
                <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white opacity-10 rounded-full animate-pulse delay-700"></div>
            </div>
            <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                <h2 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
                    Dịch Vụ
                    <span className={`block text-transparent bg-clip-text bg-gradient-to-r ${settings.theme.gradient}`}>
                        Vận Chuyển Nhà
                    </span>
                </h2>
                <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in-delay">
                    "Giải pháp quản lý tối ưu, an toàn và hiệu quả cho hệ thống vận hành."
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
                    <button className={`px-8 py-4 bg-gradient-to-r ${settings.theme.gradient} text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all`}>
                        Hệ thống
                    </button>
                    <button className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-all">
                        Tư Vấn Hệ Thống
                    </button>
                </div>
            </div>
        </section>
    );
};

// ServiceCard với màu chủ đề tùy chỉnh
const ServiceCard = ({ icon: Icon, title, description, features, settings }) => {
    return (
        <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-r ${settings.theme.gradient} rounded-xl mb-6 group-hover:scale-110 transition-transform`}>
                <Icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">{title}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
            <ul className="space-y-2">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className={`w-4 h-4 text-${settings.theme.primary}-500 mr-2`} />
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Services với màu chủ đề
const Services = ({ settings }) => {
    const services = [
        {
            icon: Home,
            title: "Quản Lý Hệ Thống",
            description: "Giải pháp quản lý hệ thống toàn diện với công nghệ tiên tiến",
            features: ["Giám sát và điều hành hệ thống vận hành 24/7", "Tích hợp dữ liệu thời gian thực", "Giám sát hiệu suất máy chủ", "Giảm thiểu thời gian chết"],
        },
        {
            icon: Users,
            title: "Tối Ưu Hiệu Suất",
            description: "Đội ngũ chuyên gia phân tích và tối ưu hóa quy trình làm việc",
            features: ["Phân tích dữ liệu hiệu suất", "Tối ưu hóa quy trình làm việc", "Giảm thiểu lãng phí", "Tăng cường hiệu quả"],
        },
        {
            icon: Shield,
            title: "Hỗ Trợ Kỹ Thuật",
            description: "Cam kết hỗ trợ kỹ thuật nhanh chóng và hiệu quả",
            features: ["Đội ngũ kỹ thuật viên chuyên nghiệp", "Hỗ trợ 24/7", "Giải quyết sự cố nhanh chóng", "Bảo trì định kỳ"],
        },
    ];

    return (
        <section id="services" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                        Hệ Thống Của Chúng Tôi
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Chúng tôi cung cấp các giải pháp quản lý hệ thống tối ưu, đảm bảo vận hành hiệu quả và an toàn hàng đầu.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <ServiceCard key={index} {...service} settings={settings} />
                    ))}
                </div>
            </div>
        </section>
    );
};

// About với màu chủ đề
const About = ({ settings }) => {
    const stats = [
        { number: "1000+", label: "Khách Hàng Hài Lòng" },
        { number: "5+", label: "Năm Kinh Nghiệm" },
        { number: "24/7", label: "Hỗ Trợ Kỹ Thuật" },
        { number: "100%", label: "Cam Kết Chất Lượng" },
    ];

    return (
        <section id="about" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                            Về Chúng Tôi
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            "Chúng tôi có hơn 5 năm kinh nghiệm trong lĩnh vực quản lý hệ thống, mang đến giải pháp tối ưu cho vận hành doanh nghiệp. Với đội ngũ chuyên gia giàu kinh nghiệm và công nghệ tiên tiến, chúng tôi cam kết hỗ trợ khách hàng đạt hiệu quả cao nhất."
                        </p>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className={`text-3xl font-bold text-${settings.theme.primary}-600 mb-2`}>{stat.number}</div>
                                    <div className="text-gray-600">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className={`bg-gradient-to-r ${settings.theme.gradient} rounded-2xl p-8 text-white`}>
                            <div className="flex items-center mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                ))}
                            </div>
                            <p className="text-lg mb-4 italic">
                                "Hệ thống vận hành ổn định, hỗ trợ kỹ thuật chuyên nghiệp. Rất hài lòng với dịch vụ!"
                            </p>
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                                    N
                                </div>
                                <div>
                                    <div className="font-semibold">Nguyễn Văn Phong</div>
                                    <div className="text-blue-200">Khách hàng</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Footer với màu chủ đề
const Footer = ({ settings }) => {
    return (
        <footer className="bg-gray-900 text-white py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Truck className={`w-8 h-8 text-${settings.theme.primary}-400`} />
                            <h3 className="text-xl font-bold">Vận Chuyển Nhà</h3>
                        </div>
                        <p className="text-gray-400 mb-4">
                            Dịch vụ quản lý hệ thống chuyên sâu, an toàn và hiệu quả. Chúng tôi cam kết mang đến giải pháp tối ưu cho mọi nhu cầu vận hành của bạn.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Dịch Vụ</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>Quản lý hệ thống trọn gói</li>
                            <li>Tối ưu hóa hiệu suất</li>
                            <li>Vận hành an toàn</li>
                            <li>Tư vấn miễn phí</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Liên Hệ</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>+84 901 234 567</li>
                            <li>info@vanchuyennha.com</li>
                            <li>123 Đường ABC, Phố 1</li>
                            <li>TP. Hà Nội</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Giờ Làm Việc</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>Thứ 2 - Thứ 6: 8:00 - 18:00</li>
                            <li>Thứ 7 - Chủ nhật: 8:00 - 17:00</li>
                            <li>Hotline 24/7</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
                    <p>© 2025 Hệ Thống Quản Lý Vận Chuyển Nhà. Mọi quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
    );
};

// Thành phần chính App
const App = () => {
    const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
    const [settings, setSettings] = useState(() => {
        // Tải cài đặt từ localStorage ngay khi khởi tạo state
        const savedSettings = localStorage.getItem('customSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                console.log('Cài đặt đã tải từ localStorage:', parsed); // Gỡ lỗi
                return sanitizeSettings(savedSettings);
            } catch (error) {
                console.warn('Lỗi khi phân tích localStorage, sử dụng cài đặt mặc định:', error);
                return defaultSettings;
            }
        }
        return defaultSettings;
    });

    // Áp dụng cài đặt phông chữ ngay khi component được mount
    useEffect(() => {
        console.log('Áp dụng cài đặt:', settings); // Gỡ lỗi
        document.body.style.fontFamily = settings.fontSettings.fontFamily;
        document.body.style.fontSize = settings.fontSettings.fontSize;
        document.body.style.color = settings.fontSettings.fontColor;
    }, []); // Chạy một lần khi mount

    // Lưu cài đặt vào localStorage mỗi khi settings thay đổi
    useEffect(() => {
        console.log('Lưu cài đặt vào localStorage:', settings); // Gỡ lỗi
        localStorage.setItem('customSettings', JSON.stringify(settings));
        document.body.style.fontFamily = settings.fontSettings.fontFamily;
        document.body.style.fontSize = settings.fontSettings.fontSize;
        document.body.style.color = settings.fontSettings.fontColor;
    }, [settings]);

    // Xử lý cuộn mượt
    useEffect(() => {
        const handleSmoothScroll = (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        };

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', handleSmoothScroll);
        });

        return () => {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.removeEventListener('click', handleSmoothScroll);
            });
        };
    }, []);

    const handleSettingsChange = (newSettings) => {
        setSettings(newSettings);
    };

    return (
        <div className="min-h-screen" style={{ fontFamily: settings.fontSettings.fontFamily, fontSize: settings.fontSettings.fontSize, color: settings.fontSettings.fontColor }}>
            <style>{`
                    @keyframes fade-in {
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in {
                        animation: fade-in 1s ease-out;
                    }
                    .animate-fade-in-delay {
                        animation: fade-in 1s ease-out 0.3s both;
                    }
                    .animate-fade-in-delay-2 {
                        animation: fade-in 1s ease-out 0.6s both;
                    }
                `}</style>
            <Header
                onCustomizeClick={() => setIsCustomizationOpen(true)}
                settings={settings}
            />
            <Hero settings={settings} />
            <Services settings={settings} />
            <About settings={settings} />
            <Footer settings={settings} />
            <CustomizationMenu
                isOpen={isCustomizationOpen}
                onClose={() => setIsCustomizationOpen(false)}
                settings={settings}
                onSettingsChange={handleSettingsChange}
            />
        </div>
    );
};

export default App;