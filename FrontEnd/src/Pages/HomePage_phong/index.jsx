import React, { useState, useEffect } from 'react';
import { Truck, Home, Users, Shield, Phone, Mail, MapPin, Star, CheckCircle } from 'lucide-react'; // Các biểu tượng từ thư viện Lucide React

// Thành phần tiêu đề với hình ảnh động mượt mà và trải nghiệm người dùng tốt hơn
const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50); // nếu cuộn xuống > 50px thì đổi trạng thái
        };
        window.addEventListener('scroll', handleScroll); // gắn sự kiện cuộn
        return () => window.removeEventListener('scroll', handleScroll); // hủy khi component bị xoá
    }, []);

    return ( //Nếu đã cuộn xuống (isScrolled === true), thì header có nền trắng, đổ bóng, và chữ tối.Nếu ở đầu trang, thì nền trong suốt và chữ màu trắng.

        <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg text-gray-800' : 'bg-transparent text-white'
            }`}>
            <div className="container mx-auto px-4 py-4"> {/* Thêm padding và căn giữa nội dung */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Truck className="w-8 h-8 text-blue-600" /> {/* Biểu tượng xe tải */}
                        <h1 className="text-xl font-bold">Vận Chuyển Nhà</h1>
                    </div>
                    <nav className="hidden md:flex space-x-8"> {/* Các liên kết đến các phần của trang như Trang Chủ, Dịch Vụ, Giới Thiệu, Liên Hệ. */}
                        <a href="#home" className="hover:text-blue-600 transition-colors">Trang Chủ</a>
                        <a href="#services" className="hover:text-blue-600 transition-colors">Hệ Thống</a>
                        <a href="#about" className="hover:text-blue-600 transition-colors">Giới Thiệu</a>
                        <a href="#contact" className="hover:text-blue-600 transition-colors">Hỗ Trợ</a>
                    </nav>
                    <div className="flex space-x-3">  {/* Nút đăng nhập và đăng ký với hiệu ứng hover */}
                        <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                            Đăng Nhập
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                            Đăng Ký
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

// Thành phần Hero với nền chuyển màu và hoạt ảnh
const Hero = () => { // Nền chuyển màu với các hình tròn nổi bật và hiệu ứng hoạt ảnh
    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Nền gradient với các hình tròn hoạt ảnh */}
            <div>
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.pexels.com/photos/2757549/pexels-photo-2757549.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }} // Thêm ảnh nền nếu cần
                >
                    <div className="absolute inset-0 bg-black opacity-20"></div> {/* lớp mờ phủ lên ảnh */}
                </div>
                {/* Các hình tròn với hiệu ứng hoạt ảnh */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-white opacity-10 rounded-full animate-pulse"></div>
                <div className="absolute top-40 right-20 w-16 h-16 bg-white opacity-10 rounded-full animate-pulse delay-300"></div>
                <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white opacity-10 rounded-full animate-pulse delay-700"></div>
            </div>
            {/* Nội dung Hero với tiêu đề, mô tả và nút hành động */}
            <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                <h2 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in"> {/* Tiêu đề chính với hiệu ứng hoạt ảnh */}
                    Hệ Thống
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        Quản Lý Chuyên Sâu
                    </span>
                </h2>
                <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in-delay">
                    "Giải pháp quản lý tối ưu, an toàn và hiệu quả cho hệ thống vận hành."
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
                    {/*phóng to khi hover, và chuyển động mượt.*/}
                    <button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all">
                        Bắt Đầu Quản Lý
                    </button>
                    <button className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-all">
                        Tư Vấn Hệ Thống
                    </button>
                </div>
            </div>
        </section>
    );
};

// Thẻ dịch vụ nâng cao với các biểu tượng và hiệu ứng di chuột
const ServiceCard = ({ icon: Icon, title, description, features }) => {
    return (
        <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <Icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">{title}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
            <ul className="space-y-2">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Thành phần dịch vụ có bố cục và hoạt ảnh tốt hơn
const Services = () => {
    const services = [
        {
            icon: Home,
            title: "Chuyển Nhà Trọn Gói",
            description: "Dịch vụ chuyển nhà toàn diện từ đóng gói đến sắp xếp tại nơi mới",
            features: ["Đóng gói chuyên nghiệp", "Vận chuyển an toàn", "Sắp xếp lại đồ đạc", "Bảo hiểm hàng hóa"]
        },
        {
            icon: Users,
            title: "Tháo Lắp Đồ Đạc",
            description: "Đội ngũ thợ lành nghề tháo lắp các thiết bị, nội thất phức tạp",
            features: ["Tháo lắp nội thất", "Lắp đặt điện tử", "Bảo quản cẩn thận", "Đảm bảo nguyên vẹn"]
        },
        {
            icon: Shield,
            title: "Vận Chuyển An Toàn",
            description: "Cam kết vận chuyển đồ đạc nhanh chóng và không hư hỏng",
            features: ["Xe chuyên dụng", "Đội ngũ có kinh nghiệm", "Theo dõi hành trình", "Hỗ trợ 24/7"]
        }
    ];

    return (
        <section id="services" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                        Dịch Vụ Của Chúng Tôi
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Chúng tôi cung cấp các dịch vụ chuyển nhà chuyên nghiệp với chất lượng hàng đầu
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <ServiceCard key={index} {...service} />
                    ))}
                </div>
            </div>
        </section>
    );
};

// Về Thành phần có số liệu thống kê và lời chứng thực
const About = () => {
    const stats = [
        { number: "1000+", label: "Khách Hàng Hài Lòng" },
        { number: "5+", label: "Năm Kinh Nghiệm" },
        { number: "24/7", label: "Hỗ Trợ Khách Hàng" },
        { number: "100%", label: "Cam Kết Chất Lượng" }
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
                            Với hơn 5 năm kinh nghiệm trong lĩnh vực vận chuyển nhà, chúng tôi đã phục vụ
                            hàng nghìn khách hàng với sự chuyên nghiệp và tận tâm. Đội ngũ của chúng tôi
                            được đào tạo bài bản, sử dụng thiết bị hiện đại để đảm bảo an toàn tuyệt đối
                            cho tài sản của bạn.
                        </p>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                                    <div className="text-gray-600">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                            <div className="flex items-center mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                ))}
                            </div>
                            <p className="text-lg mb-4 italic">
                                "Dịch vụ tuyệt vời! Đội ngũ chuyên nghiệp, nhanh chóng và cẩn thận.
                                Tôi rất hài lòng với chất lượng dịch vụ."
                            </p>
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                                    N
                                </div>
                                <div>
                                    <div className="font-semibold">Nguyễn Văn An</div>
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

// Thành phần liên hệ được cải tiến với biểu mẫu và thông tin liên hệ tốt hơn
const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
        alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');
        setFormData({ name: '', email: '', phone: '', message: '' });
    };

    return (
        <section id="contact" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                        Liên Hệ Với Chúng Tôi
                    </h2>
                    <p className="text-xl text-gray-600">
                        Sẵn sàng hỗ trợ bạn 24/7 với dịch vụ tư vấn miễn phí
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Thông tin liên lạc */}
                    <div className="space-y-8">
                        <div className="flex items-start space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
                                <Phone className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Điện Thoại</h3>
                                <p className="text-gray-600">+84 901 234 567</p>
                                <p className="text-gray-600">+84 901 234 568</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Email</h3>
                                <p className="text-gray-600">info@vanchuyennha.com</p>
                                <p className="text-gray-600">support@vanchuyennha.com</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Địa Chỉ</h3>
                                <p className="text-gray-600">123 Đường ABC, Quận 1</p>
                                <p className="text-gray-600">TP. Hồ Chí Minh, Việt Nam</p>
                            </div>
                        </div>
                    </div>

                    {/* Biểu mẫu liên hệ */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Họ và Tên *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nhập họ và tên của bạn"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nhập email của bạn"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Số Điện Thoại
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Tin Nhắn *
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Mô tả nhu cầu của bạn..."
                                ></textarea>
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                            >
                                Gửi Liên Hệ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Chân trang được cải tiến với các liên kết xã hội và nhiều thông tin hơn
const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Truck className="w-8 h-8 text-blue-400" />
                            <h3 className="text-xl font-bold">Vận Chuyển Nhà</h3>
                        </div>
                        <p className="text-gray-400 mb-4">
                            Dịch vụ chuyển nhà chuyên nghiệp, an toàn và đáng tin cậy.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-4">Dịch Vụ</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>Chuyển nhà trọn gói</li>
                            <li>Tháo lắp đồ đạc</li>
                            <li>Vận chuyển an toàn</li>
                            <li>Tư vấn miễn phí</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-4">Liên Hệ</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>+84 901 234 567</li>
                            <li>info@vanchuyennha.com</li>
                            <li>123 Đường ABC, Quận 1</li>
                            <li>TP. Hồ Chí Minh</li>
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

// Thành phần ứng dụng chính với chức năng cuộn mượt mà
const App = () => {
    useEffect(() => {
        // Cuộn mượt mà cho các liên kết điều hướng
        const handleSmoothScroll = (e) => {
            if (e.target.getAttribute('href')?.startsWith('#')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerHeight = 80;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        };

        document.addEventListener('click', handleSmoothScroll);
        return () => document.removeEventListener('click', handleSmoothScroll);
    }, []);

    return (
        <div className="min-h-screen">
            <style jsx>{`
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
            <Header />
            <Hero />
            <Services />
            <About />
            <Contact />
            <Footer />
        </div>
    );
};

export default App;