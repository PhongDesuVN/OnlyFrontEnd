import React, { useEffect, useState, useRef } from 'react';
import {Mail, MapPin, Phone, Star, Truck, Home, Users, Shield, CheckCircle, Calendar, Package, MapPinIcon} from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ isLoggedIn, handleLogout }) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg text-gray-800' : 'bg-transparent text-white'}`}>
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Truck className="w-8 h-8 text-blue-600" />
                        <h1 className="text-xl font-bold">Vận Chuyển Nhà</h1>
                    </div>
                    <nav className="hidden md:flex space-x-8">
                        <a href="#home" className="hover:text-blue-600 transition-colors">Trang Chủ</a>
                        <a href="#booking" className="hover:text-blue-600 transition-colors">Đặt xe</a>
                        <a href="#about" className="hover:text-blue-600 transition-colors">Về chúng tôi</a>
                        <a href="#promotion" className="hover:text-blue-600 transition-colors">Ưu đãi</a>
                    </nav>
                    <div className="flex items-center space-x-3">
                        {!isLoggedIn && (
                            <>
                                <Link to="/c_login">
                                    <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                                        Đăng Nhập
                                    </button>
                                </Link>
                                {/* <Link to="/c_register">
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                                        Đăng Ký
                                    </button>
                                </Link> */}
                            </>
                        )}
                        {isLoggedIn && (
                            <Link to="/c_customerinfo">
                                <button className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all">
                                    Info
                                </button>
                            </Link>
                        )}
                        <Link to="/">
                            <button className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all">
                                Operator
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

const Hero = () => {
    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div>
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')"
                    }}
                >
                    <div className="absolute inset-0 bg-black opacity-20"></div>
                </div>
                <div className="absolute top-20 left-10 w-20 h-20 bg-white opacity-10 rounded-full animate-pulse"></div>
                <div className="absolute top-40 right-20 w-16 h-16 bg-white opacity-10 rounded-full animate-pulse delay-300"></div>
                <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white opacity-10 rounded-full animate-pulse delay-700"></div>
            </div>
            <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                <h2 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
                    Hệ Thống
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Quản Lý Khách Hàng
          </span>
                </h2>
                <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in-delay">
                    Trải nghiệm tiện lợi – nhanh chóng – an toàn cùng dịch vụ giao nhận chuyên nghiệp.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
                    <button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all">
                        Dịch vụ của chúng tôi
                    </button>
                    <button className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-all">
                        Tìm hiểu thêm
                    </button>
                </div>
            </div>
        </section>
    );
};

// Thành phần đặt xe với chức năng chọn loại dịch vụ
const Booking = ({ isLoggedIn }) => {
    const [selectedService, setSelectedService] = useState(null);
    const [bookingData, setBookingData] = useState({
        pickupLocation: '',
        deliveryLocation: '',
        deliveryDate: '',
        note: '',
        transportId: null,
        storageId: null,
        operatorId: null,
        total: '',
    });
    const [loading, setLoading] = useState(false);
    const [transportUnits, setTransportUnits] = useState([]);
    const [storageUnits, setStorageUnits] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState({ transport: false, storage: false, staff: false });
    const [hoveredItem, setHoveredItem] = useState(null);
    const hoverTimeout = useRef(null);

    useEffect(() => {
        const fetchOptions = async () => {
            if (!isLoggedIn || !selectedService) return;

            try {
                const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
                const [transportRes, storageRes, staffRes] = await Promise.all([
                    fetch('http://localhost:8083/api/customer/transport-units', { headers }),
                    fetch('http://localhost:8083/api/customer/storage-units', { headers }),
                    fetch('http://localhost:8083/api/customer/operator-staff', { headers })
                ]);

                if (transportRes.ok) setTransportUnits(await transportRes.json());
                if (storageRes.ok) setStorageUnits(await storageRes.json());
                if (staffRes.ok) setStaffMembers(await staffRes.json());

            } catch (error) {
                console.error("Lỗi khi tải tùy chọn đặt xe:", error);
            }
        };

        fetchOptions();
    }, [isLoggedIn, selectedService]);

    const handleInputChange = (e) => {
        setBookingData({
            ...bookingData,
            [e.target.name]: e.target.value
        });
    };
    
    const handleSelect = (type, value) => {
        setBookingData(prev => ({ ...prev, [type]: value }));
        setDropdownOpen(prev => ({ 
            ...prev, 
            [type === 'transportId' ? 'transport' : type === 'storageId' ? 'storage' : 'staff']: false 
        }));
        setHoveredItem(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) return;

        if (!bookingData.transportId) {
            alert('Vui lòng chọn phương tiện vận chuyển.');
            return;
        }

        if (!bookingData.operatorId) {
            alert('Vui lòng chọn nhân viên hỗ trợ.');
            return;
        }

        setLoading(true);

        // Chuẩn bị payload, sử dụng operatorId từ form thay vì hardcode
        const payload = {
            ...bookingData,
            deliveryDate: bookingData.deliveryDate ? `${bookingData.deliveryDate}T00:00:00` : null,
            total: bookingData.total ? parseFloat(bookingData.total) : null, // Chuyển đổi total thành số
        };

        try {
            const response = await fetch('http://localhost:8083/api/customer/bookings', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Lỗi đặt xe:", errorText);
                throw new Error('Đặt xe thất bại!');
            }

            alert('Đặt xe thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.');
            // Reset state với tên mới
            setBookingData({ pickupLocation: '', deliveryLocation: '', deliveryDate: '', note: '', transportId: null, storageId: null, operatorId: null, total: '' });
            setSelectedService(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    // Dropdown tùy chỉnh
    const CustomSelect = ({ label, type, options, selectedId, placeholder, isRequired }) => {
        const selectedOption = options.find(opt => {
            if (type === 'transport') return opt.transportId === selectedId;
            if (type === 'storage') return opt.storageId === selectedId;
            if (type === 'staff') return opt.operatorId === selectedId;
            return false;
        });
        
        const displayField = type === 'transport' ? 'nameCompany' : type === 'storage' ? 'name' : 'fullName';

        return (
            <div className="relative">
                <label className="block text-gray-700 font-medium mb-2">
                    {label} {isRequired && <span className="text-red-500">*</span>}
                </label>
                <div
                    onClick={() => setDropdownOpen(prev => ({ ...prev, [type]: !prev[type] }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white cursor-pointer flex justify-between items-center"
                >
                    <span className={selectedOption ? 'text-gray-800' : 'text-gray-400'}>{selectedOption ? selectedOption[displayField] : placeholder}</span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                {dropdownOpen[type] && (
                    <>
                        {/* Overlay toàn màn hình để bắt sự kiện click/hover ra ngoài */}
                        <div
                            className="fixed inset-0 z-0"
                            onMouseMove={() => setHoveredItem(null)}
                            onClick={() => setDropdownOpen(prev => ({ ...prev, [type]: false }))}
                            style={{ background: 'transparent' }}
                        />
                        <div
                            className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border"
                            onMouseLeave={() => setHoveredItem(null)}
                            onMouseEnter={() => { if (hoverTimeout.current) clearTimeout(hoverTimeout.current); }}
                        >
                            <ul className="py-1" style={{ maxHeight: '8.5rem', overflowY: 'auto' }}>
                                {options.length > 0 ? options.map(option => (
                                    <li
                                        key={option[type === 'transport' ? 'transportId' : type === 'storage' ? 'storageId' : 'operatorId']}
                                        onClick={() => handleSelect(type === 'transport' ? 'transportId' : type === 'storage' ? 'storageId' : 'operatorId', option[type === 'transport' ? 'transportId' : type === 'storage' ? 'storageId' : 'operatorId'])}
                                        onMouseEnter={() => setHoveredItem({ type, data: option })}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800"
                                    >
                                        {option[displayField]}
                                    </li>
                                )) : <li className="px-4 py-2 text-gray-500">Không có lựa chọn nào</li>}
                            </ul>
                        </div>
                    </>
                )}
                {hoveredItem && hoveredItem.type === type && <InfoPopover item={hoveredItem} />}
            </div>
        );
    };

    const InfoPopover = ({ item }) => {
        if (!item) return null;
        let image = '';
        let content = null;
        if (item.type === 'transport') {
            const { data } = item;
            image = data.imageTransportUnit || data.image || '';
            content = (
                <div className="flex flex-col justify-center">
                    <p><strong>Công ty:</strong> {data.nameCompany}</p>
                    <p><strong>Liên hệ:</strong> {data.namePersonContact}</p>
                    <p><strong>SĐT:</strong> {data.phone}</p>
                    <p><strong>Biển số:</strong> {data.licensePlate}</p>
                    <p><strong>Trạng thái:</strong> <span className="font-semibold">{data.status}</span></p>
                </div>
            );
        }
        if (item.type === 'storage') {
            const { data } = item;
            image = data.imageStorageUnit || data.image || '';
            content = (
                <div className="flex flex-col justify-center">
                    <p><strong>Tên kho:</strong> {data.name}</p>
                    <p><strong>Địa chỉ:</strong> {data.address}</p>
                    <p><strong>SĐT:</strong> {data.phone}</p>
                    <p><strong>Trạng thái:</strong> <span className="font-semibold">{data.status}</span></p>
                </div>
            );
        }
        if (item.type === 'staff') {
            const { data } = item;
            image = data.img || data.image || '';
            content = (
                <div className="flex flex-col justify-center">
                    <p><strong>Họ tên:</strong> {data.fullName}</p>
                    <p><strong>Operator ID:</strong> {data.operatorId}</p>
                    <p><strong>Email:</strong> {data.email}</p>
                    <p><strong>SĐT:</strong> {data.phone}</p>
                </div>
            );
        }
        return (
            <div
                className="absolute left-0 z-50 w-full max-w-full -top-2 translate-y-[-100%] p-4 bg-white text-gray-800 rounded-lg shadow-2xl text-sm border border-gray-200 flex items-center"
                style={{ minWidth: '300px' }}
            >
                {image && (
                    <img
                        src={image}
                        alt="Hình ảnh"
                        className="mr-4 w-24 h-24 object-cover rounded shadow border"
                        style={{ background: '#fff' }}
                    />
                )}
                {content}
            </div>
        );
    };

    const ServiceCard = ({ title, description, icon: Icon, onClick }) => (
        <div 
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <Icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    );

    if (selectedService) {
        return (
            <section id="booking" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                            Đặt Xe Vận Chuyển
                        </h2>
                        <p className="text-xl text-gray-600">
                            Vui lòng nhập thông tin vận chuyển
                        </p>
                    </div>
                    
                    <div className="max-w-2xl mx-auto relative">
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Thông tin vị trí nhận *
                                    </label>
                                    <input
                                        type="text"
                                        name="pickupLocation"
                                        value={bookingData.pickupLocation}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nhập địa chỉ nhận hàng"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Thông tin vị trí đến *
                                    </label>
                                    <input
                                        type="text"
                                        name="deliveryLocation"
                                        value={bookingData.deliveryLocation}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nhập địa chỉ giao hàng"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Ngày xuất phát *
                                    </label>
                                    <input
                                        type="date"
                                        name="deliveryDate"
                                        value={bookingData.deliveryDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                
                                <CustomSelect
                                    label="Chọn phương tiện vận chuyển"
                                    type="transport"
                                    options={transportUnits}
                                    selectedId={bookingData.transportId}
                                    placeholder="Bắt buộc chọn một phương tiện"
                                    isRequired={true}
                                />

                                <CustomSelect
                                    label="Thuê kho (tùy chọn)"
                                    type="storage"
                                    options={storageUnits}
                                    selectedId={bookingData.storageId}
                                    placeholder="Không thuê kho"
                                    isRequired={false}
                                />

                                <CustomSelect
                                    label="Chọn nhân viên hỗ trợ"
                                    type="staff"
                                    options={staffMembers}
                                    selectedId={bookingData.operatorId}
                                    placeholder="Bắt buộc chọn một nhân viên"
                                    isRequired={true}
                                />

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Tổng tiền (VNĐ)
                                    </label>
                                    <input
                                        type="number"
                                        name="total"
                                        value={bookingData.total}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nhập tổng tiền vận chuyển"
                                        min="0"
                                        step="1000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Nội dung vận chuyển
                                    </label>
                                    <textarea
                                        name="note"
                                        value={bookingData.note}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Mô tả chi tiết hàng hóa cần vận chuyển..."
                                    ></textarea>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedService(null)}
                                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                                    >
                                        Quay lại
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!isLoggedIn || loading}
                                        className={`flex-1 ${isLoggedIn ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'} text-white py-3 px-6 rounded-lg font-semibold transition-all ${loading ? 'opacity-60' : ''}`}
                                    >
                                        {loading ? 'Đang gửi...' : 'Xác nhận'}
                                    </button>
                                </div>
                                {!isLoggedIn && (
                                    <div className="text-red-500 text-center font-semibold">Bạn cần đăng nhập để đặt xe!</div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="booking" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                        Đặt Xe Vận Chuyển
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Chọn loại dịch vụ vận chuyển phù hợp với nhu cầu của bạn
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <ServiceCard
                        title="Chuyển nhà cá nhân"
                        description="Dịch vụ vận chuyển đồ đạc, nội thất cho hộ gia đình với giá cả hợp lý và dịch vụ chuyên nghiệp"
                        icon={Home}
                        onClick={() => setSelectedService('personal')}
                    />
                    <ServiceCard
                        title="Chuyển nhà doanh nghiệp"
                        description="Dịch vụ vận chuyển văn phòng, thiết bị công ty với đội ngũ chuyên nghiệp và bảo hiểm đầy đủ"
                        icon={Users}
                        onClick={() => setSelectedService('business')}
                    />
                </div>
            </div>
        </section>
    );
};

const About = () => {
    const stats = [
        { number: "1000+", label: "Khách Hàng Hài Lòng" },
        { number: "5+", label: "Năm Kinh Nghiệm" },
        { number: "24/7", label: "Hỗ Trợ Kỹ Thuật" },
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
                            "Chúng tôi có hơn 5 năm kinh nghiệm trong lĩnh vực quản lý hệ thống,
                            mang đến giải pháp tối ưu cho vận hành doanh nghiệp.
                            Với đội ngũ chuyên gia giàu kinh nghiệm và công nghệ tiên tiến,
                            chúng tôi cam kết hỗ trợ khách hàng đạt hiệu quả cao nhất."
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
                                "Hệ thống vận hành ổn định, hỗ trợ kỹ thuật chuyên nghiệp. Rất hài lòng với dịch vụ!"

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

// Thành phần ưu đãi với mã giảm giá ngẫu nhiên
const Promotion = () => {
    const [promotions] = useState([
        {
            code: "WELCOME2025",
            discount: "20%",
            description: "Giảm giá cho khách hàng mới",
            validUntil: "31/12/2025",
            minOrder: "500,000 VNĐ"
        },
        {
            code: "MOVINGDAY",
            discount: "15%",
            description: "Ưu đãi chuyển nhà cuối tuần",
            validUntil: "28/02/2025",
            minOrder: "300,000 VNĐ"
        },
        {
            code: "BUSINESS25",
            discount: "25%",
            description: "Giảm giá cho doanh nghiệp",
            validUntil: "30/06/2025",
            minOrder: "1,000,000 VNĐ"
        },
        {
            code: "LOYALTY10",
            discount: "10%",
            description: "Ưu đãi khách hàng thân thiết",
            validUntil: "31/03/2025",
            minOrder: "200,000 VNĐ"
        }
    ]);

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        alert(`Đã sao chép mã ${code} vào clipboard!`);
    };

    return (
        <section id="promotion" className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                        Ưu Đãi Đặc Biệt
                    </h2>
                    <p className="text-xl text-gray-600">
                        Khám phá các mã giảm giá hấp dẫn dành riêng cho bạn
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {promotions.map((promo, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="text-center">
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-2xl font-bold py-2 px-4 rounded-lg mb-4">
                                    {promo.discount}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {promo.description}
                                </h3>
                                <div className="bg-gray-100 p-3 rounded-lg mb-4">
                                    <div className="text-sm text-gray-600 mb-1">Mã giảm giá:</div>
                                    <div className="text-xl font-mono font-bold text-blue-600">
                                        {promo.code}
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    <div>Hạn sử dụng: {promo.validUntil}</div>
                                    <div>Đơn hàng tối thiểu: {promo.minOrder}</div>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(promo.code)}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                                >
                                    Sao chép mã
                                </button>
                            </div>
                        </div>
                    ))}
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
                                <p className="text-gray-600">123 Đường ABC, Phố 1</p>
                                <p className="text-gray-600">TP. Hà Nội, Việt Nam</p>
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

// Thành phần ứng dụng chính với chức năng cuộn mượt mà
const C_HomePage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');

    useEffect(() => {
        const handleSmoothScroll = (e) => {
            if (e.target.getAttribute('href')?.startsWith('#')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerHeight = 80;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            }
        };
        document.addEventListener('click', handleSmoothScroll);
        // Theo dõi thay đổi localStorage từ các tab khác
        const handleStorage = () => {
            setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
        };
        window.addEventListener('storage', handleStorage);
        return () => {
            document.removeEventListener('click', handleSmoothScroll);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    // Hàm logout
    const handleLogout = () => {
        localStorage.setItem('isLoggedIn', 'false');
        setIsLoggedIn(false);
        window.location.reload();
    };

    return (
        <div className="min-h-screen">
            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .animate-fade-in-delay { animation: fade-in 1s ease-out 0.3s both; }
        .animate-fade-in-delay-2 { animation: fade-in 1s ease-out 0.6s both; }
      `}</style>
            <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
            <Hero />
            <Booking isLoggedIn={isLoggedIn} />
            <About />
            <Promotion />
            <Contact />
            <Footer />
        </div>
    );
};

export default C_HomePage;
