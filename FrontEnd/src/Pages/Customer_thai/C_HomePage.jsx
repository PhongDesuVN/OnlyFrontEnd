import React, { useEffect, useState, useRef } from 'react';
import {Mail, MapPin, Phone, Star, Truck, Home, Users, Shield, CheckCircle, Calendar, Package, MapPinIcon} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
        promotionId: null,
        itemCounts: {
            small: 0,
            medium: 0,
            large: 0,
            extraLarge: 0
        },
        total: 0,
        distance: 0
    });
    const [loading, setLoading] = useState(false);
    const [transportUnits, setTransportUnits] = useState([]);
    const [storageUnits, setStorageUnits] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);
        const [promotions, setPromotions] = useState([]);
        const [dropdownOpen, setDropdownOpen] = useState({ transport: false, storage: false, staff: false, promotion: false });
    const [mapData, setMapData] = useState({
        pickupCoords: null,
        deliveryCoords: null,
        route: []
    });

    useEffect(() => {
        const fetchOptions = async () => {
            if (!isLoggedIn || !selectedService) return;

            try {
                const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
                const [transportRes, storageRes, staffRes, promoRes] = await Promise.all([
                    fetch('http://localhost:8083/api/customer/transport-units', { headers }),
                    fetch('http://localhost:8083/api/customer/storage-units', { headers }),
                    fetch('http://localhost:8083/api/customer/operator-staff', { headers }),
                    fetch('http://localhost:8083/api/customer/promotions', { headers })
                ]);

                if (transportRes.ok) setTransportUnits(await transportRes.json());
                if (storageRes.ok) setStorageUnits(await storageRes.json());
                if (staffRes.ok) setStaffMembers(await staffRes.json());
                if (promoRes.ok) setPromotions(await promoRes.json());

            } catch (error) {
                console.error("Lỗi khi tải tùy chọn đặt xe:", error);
            }
        };

        fetchOptions();
    }, [isLoggedIn, selectedService]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('item_')) {
            const itemType = name.replace('item_', '');
            setBookingData(prev => ({
                ...prev,
                itemCounts: {
                    ...prev.itemCounts,
                    [itemType]: parseInt(value) || 0
                }
            }));
        } else {
            setBookingData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    
    const handleSelect = (type, value) => {
        setBookingData(prev => ({ ...prev, [type]: value }));
        setDropdownOpen(prev => ({ 
            ...prev, 
            [type === 'transportId' ? 'transport' : type === 'storageId' ? 'storage' : type === 'operatorId' ? 'staff' : type === 'promotionId' ? 'promotion' : type]: false 
        }));
    };

    // Hàm tính toán tổng tiền dựa trên số lượng hàng hóa và quãng đường
    const calculateTotal = async (pickupLocation, deliveryLocation, itemCounts) => {
        try {
            // Bước 1: Geocoding - chuyển địa chỉ thành tọa độ
            const pickupCoords = await geocodeAddress(pickupLocation);
            const deliveryCoords = await geocodeAddress(deliveryLocation);
            
            if (!pickupCoords || !deliveryCoords) {
                throw new Error('Không thể xác định tọa độ địa chỉ');
            }
            
            // Bước 2: Tính quãng đường bằng OSRM
            const distance = await calculateDistance(pickupCoords, deliveryCoords);
            
            // Bước 3: Tính tổng tiền
            const itemCost = (itemCounts.small * 50000) + 
                           (itemCounts.medium * 100000) + 
                           (itemCounts.large * 200000) + 
                           (itemCounts.extraLarge * 400000);
            const distanceCost = distance * 15000;
            const total = itemCost + distanceCost;
            
            return { total, distance };
        } catch (error) {
            console.error('Lỗi tính toán:', error);
            throw error;
        }
    };

    // Hàm geocoding sử dụng OpenStreetMap Nominatim
    const geocodeAddress = async (address) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon)
                };
            }
            return null;
        } catch (error) {
            console.error('Lỗi geocoding:', error);
            return null;
        }
    };

    // Hàm tính quãng đường sử dụng OSRM
    const calculateDistance = async (pickup, delivery) => {
        try {
            const response = await fetch(
                `http://router.project-osrm.org/route/v1/driving/${pickup.lon},${pickup.lat};${delivery.lon},${delivery.lat}?overview=false`
            );
            const data = await response.json();
            
            if (data && data.routes && data.routes.length > 0) {
                // Chuyển đổi từ mét sang km
                return data.routes[0].distance / 1000;
            }
            return 0;
        } catch (error) {
            console.error('Lỗi tính quãng đường:', error);
            return 0;
        }
    };

    // Hàm tính toán tự động khi thay đổi địa chỉ hoặc số lượng hàng hóa
    const updateTotal = async () => {
        if (bookingData.pickupLocation && bookingData.deliveryLocation) {
            try {
                const { total, distance } = await calculateTotal(
                    bookingData.pickupLocation,
                    bookingData.deliveryLocation,
                    bookingData.itemCounts
                );
                setBookingData(prev => ({
                    ...prev,
                    total,
                    distance
                }));
            } catch (error) {
                console.error('Lỗi cập nhật tổng tiền:', error);
            }
        }
    };

    // Theo dõi thay đổi để tính toán lại tổng tiền
    useEffect(() => {
        if (bookingData.pickupLocation && bookingData.deliveryLocation) {
            const timeoutId = setTimeout(updateTotal, 1000); // Delay 1 giây để tránh gọi API quá nhiều
            return () => clearTimeout(timeoutId);
        }
    }, [bookingData.pickupLocation, bookingData.deliveryLocation, bookingData.itemCounts]);

    // Cập nhật mapData khi địa chỉ thay đổi
    useEffect(() => {
        const updateMap = async () => {
            if (bookingData.pickupLocation && bookingData.deliveryLocation) {
                const pickup = await geocodeAddress(bookingData.pickupLocation);
                const delivery = await geocodeAddress(bookingData.deliveryLocation);
                let route = [];
                if (pickup && delivery) {
                    // Lấy route từ OSRM
                    try {
                        const res = await fetch(`http://router.project-osrm.org/route/v1/driving/${pickup.lon},${pickup.lat};${delivery.lon},${delivery.lat}?overview=full&geometries=geojson`);
                        const data = await res.json();
                        if (data && data.routes && data.routes[0]) {
                            route = data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
                        }
                    } catch (e) { route = []; }
                }
                setMapData({ pickupCoords: pickup, deliveryCoords: delivery, route });
            } else {
                setMapData({ pickupCoords: null, deliveryCoords: null, route: [] });
            }
        };
        updateMap();
    }, [bookingData.pickupLocation, bookingData.deliveryLocation]);

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
            total: bookingData.total || 0,
            distance: bookingData.distance || 0
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
            setBookingData({ 
                pickupLocation: '', 
                deliveryLocation: '', 
                deliveryDate: '', 
                note: '', 
                transportId: null, 
                storageId: null, 
                operatorId: null, 
                promotionId: null,
                itemCounts: { small: 0, medium: 0, large: 0, extraLarge: 0 },
                total: 0,
                distance: 0
            });
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
            if (type === 'promotion') return opt.id === selectedId;
            return false;
        });
        const displayField = type === 'transport' ? 'nameCompany' : type === 'storage' ? 'name' : type === 'staff' ? 'fullName' : type === 'promotion' ? 'name' : '';
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
                        <div
                            className="fixed inset-0 z-0"
                            onClick={() => setDropdownOpen(prev => ({ ...prev, [type]: false }))}
                            style={{ background: 'transparent' }}
                        />
                        <div
                            className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border"
                        >
                            <ul className="py-1" style={{ maxHeight: '8.5rem', overflowY: 'auto' }}>
                                {options.length > 0 ? options.map(option => (
                                    <li
                                        key={option[type === 'transport' ? 'transportId' : type === 'storage' ? 'storageId' : type === 'staff' ? 'operatorId' : type === 'promotion' ? 'id' : 'id']}
                                        onClick={() => handleSelect(type === 'transport' ? 'transportId' : type === 'storage' ? 'storageId' : type === 'staff' ? 'operatorId' : type === 'promotion' ? 'promotionId' : type, option[type === 'transport' ? 'transportId' : type === 'storage' ? 'storageId' : type === 'staff' ? 'operatorId' : type === 'promotion' ? 'id' : 'id'])}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800"
                                    >
                                        {option[displayField]}
                                    </li>
                                )) : <li className="px-4 py-2 text-gray-500">Không có lựa chọn nào</li>}
                            </ul>
                        </div>
                    </>
                )}
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
            <section id="booking" className="py-20 bg-yellow-50 relative overflow-hidden">
                <div className="w-full mx-auto px-[50px]">
                    <div className="text-center mb-16 relative">
                        <h2 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-lg mb-4 flex items-center justify-center gap-3">
                            <span>
                                <svg className="inline w-12 h-12 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
                            </span>
                            Đặt Xe Vận Chuyển
                        </h2>
                        <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
                            Vui lòng nhập thông tin vận chuyển
                        </p>
                        <div className="absolute right-0 top-0 opacity-10 pointer-events-none select-none">
                            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="60" cy="60" r="60" fill="url(#paint0_radial)" />
                                <defs>
                                    <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(60 60) scale(60)" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#FDE68A" />
                                        <stop offset="1" stopColor="#F59E42" stopOpacity="0.5" />
                                    </radialGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 w-full mx-auto px-2">
                    {/* Form booking 1/2 */}
                        <div className="md:w-1/2 w-full relative">
                            <div className="bg-white p-10 rounded-3xl shadow-2xl border border-yellow-100 relative">
                                {/* Icon trang trí */}
                                <div className="absolute -top-8 -left-8 opacity-20 text-yellow-300 text-[120px] pointer-events-none select-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-32 h-32">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
                                    </svg>
                                </div>
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

                                    {/* Thông tin kích cỡ đồ đạc */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">
                                                Đồ đạc kích cỡ bé (50.000 VNĐ)
                                            </label>
                                            <input
                                                type="number"
                                                name="item_small"
                                                value={bookingData.itemCounts.small}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Số lượng"
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">
                                                Đồ đạc kích cỡ vừa (100.000 VNĐ)
                                            </label>
                                            <input
                                                type="number"
                                                name="item_medium"
                                                value={bookingData.itemCounts.medium}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Số lượng"
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">
                                                Đồ đạc kích cỡ lớn (200.000 VNĐ)
                                            </label>
                                            <input
                                                type="number"
                                                name="item_large"
                                                value={bookingData.itemCounts.large}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Số lượng"
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">
                                                Đồ đạc kích cỡ cực lớn (400.000 VNĐ)
                                            </label>
                                            <input
                                                type="number"
                                                name="item_extraLarge"
                                                value={bookingData.itemCounts.extraLarge}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Số lượng"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Hiển thị thông tin tính toán */}
                                    {(bookingData.total > 0 || bookingData.distance > 0) && (
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                            <h4 className="font-semibold text-blue-800 mb-2">Thông tin tính toán:</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Quãng đường:</span>
                                                    <span className="font-semibold text-blue-800 ml-2">{bookingData.distance.toFixed(1)} km</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Tổng tiền:</span>
                                                    <span className="font-semibold text-green-600 ml-2">{bookingData.total.toLocaleString()} VNĐ</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

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
                                        label="Chọn nhân viên hỗ trợ (tùy chọn)"
                                        type="staff"
                                        options={staffMembers}
                                        selectedId={bookingData.operatorId}
                                        placeholder="Bắt buộc chọn một nhân viên"
                                        isRequired={true}
                                    />

                                    <CustomSelect
                                        label="Chọn khuyến mãi (tùy chọn)"
                                        type="promotion"
                                        options={promotions}
                                        selectedId={bookingData.promotionId}
                                        placeholder="Không áp dụng khuyến mãi"
                                        isRequired={false}
                                    />

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
                                            className={`flex-1 ${isLoggedIn ? 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 shadow-lg' : 'bg-gray-300 text-white cursor-not-allowed'} py-3 px-6 rounded-xl font-semibold transition-all ${loading ? 'opacity-60' : ''}`}
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
                        {/* Thông tin chi tiết hoặc Map */}
                        <div className="md:w-1/2 w-full flex flex-col gap-6">
                            <div className="bg-white rounded-2xl shadow-lg overflow-auto p-6 flex flex-col gap-4">
                                {/* Luôn hiện map ở trên */}
                                {mapData.pickupCoords && mapData.deliveryCoords ? (
                                    <MapContainer
                                        center={mapData.pickupCoords ? [mapData.pickupCoords.lat, mapData.pickupCoords.lon] : [21.0285, 105.8542]}
                                        zoom={13}
                                        style={{ height: '300px', width: '100%' }}
                                        scrollWheelZoom={true}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution="&copy; OpenStreetMap contributors"
                                        />
                                        <Marker position={[mapData.pickupCoords.lat, mapData.pickupCoords.lon]} icon={L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize: [32, 32], iconAnchor: [16, 32] })} />
                                        <Marker position={[mapData.deliveryCoords.lat, mapData.deliveryCoords.lon]} icon={L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize: [32, 32], iconAnchor: [16, 32] })} />
                                        {mapData.route.length > 0 && (
                                            <Polyline positions={mapData.route} color="blue" />
                                        )}
                                    </MapContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-[300px] text-gray-400 text-lg">Nhập địa chỉ để xem bản đồ</div>
                                )}
                            </div>
                            {/* Container mới cho thông tin chi tiết, nằm ngoài map */}
                            <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-4 border border-yellow-100">
                                {bookingData.transportId && (() => {
                                    const t = transportUnits.find(x => x.transportId === bookingData.transportId);
                                    return t ? (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2 flex flex-row gap-4 items-center">
                                            <div className="flex-1">
                                                <div className="font-semibold text-blue-800 mb-1">Thông tin phương tiện:</div>
                                                <div className="text-gray-800"><strong>Công ty:</strong> {t.nameCompany}</div>
                                                <div className="text-gray-800"><strong>Liên hệ:</strong> {t.namePersonContact}</div>
                                                <div className="text-gray-800"><strong>SĐT:</strong> {t.phone}</div>
                                                <div className="text-gray-800"><strong>Biển số:</strong> {t.licensePlate}</div>
                                                <div className="text-gray-800"><strong>Trạng thái:</strong> {t.status}</div>
                                            </div>
                                            {t.imageTransportUnit || t.image ? (
                                                <div className="flex-shrink-0 w-32 h-32 flex items-center justify-center">
                                                    <img src={t.imageTransportUnit || t.image} alt="Ảnh phương tiện" className="object-cover w-32 h-32 rounded shadow border bg-white" />
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : null;
                                })()}
                                {bookingData.storageId && (() => {
                                    const s = storageUnits.find(x => x.storageId === bookingData.storageId);
                                    return s ? (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-2 flex flex-row gap-4 items-center">
                                            <div className="flex-1">
                                                <div className="font-semibold text-green-800 mb-1">Thông tin kho:</div>
                                                <div className="text-gray-800"><strong>Tên kho:</strong> {s.name}</div>
                                                <div className="text-gray-800"><strong>Địa chỉ:</strong> {s.address}</div>
                                                <div className="text-gray-800"><strong>SĐT:</strong> {s.phone}</div>
                                                <div className="text-gray-800"><strong>Trạng thái:</strong> {s.status}</div>
                                            </div>
                                            {s.imageStorageUnit || s.image ? (
                                                <div className="flex-shrink-0 w-32 h-32 flex items-center justify-center">
                                                    <img src={s.imageStorageUnit || s.image} alt="Ảnh kho" className="object-cover w-32 h-32 rounded shadow border bg-white" />
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : null;
                                })()}
                                {bookingData.promotionId && (() => {
                                    const promo = promotions.find(p => p.id === bookingData.promotionId);
                                    return promo ? (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-2">
                                            <div className="font-semibold text-yellow-800 mb-1">Thông tin khuyến mãi:</div>
                                            <div className="text-gray-800"><strong>Tên:</strong> {promo.name}</div>
                                            <div className="text-gray-800"><strong>Mô tả:</strong> {promo.description}</div>
                                            <div className="text-gray-800">
                                                <strong>Áp dụng đến:</strong> {promo.endDate ? new Date(promo.endDate).toLocaleDateString('vi-VN') : 'Không xác định'}
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                                {bookingData.operatorId && (() => {
                                    const st = staffMembers.find(x => x.operatorId === bookingData.operatorId);
                                    return st ? (
                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-2">
                                            <div className="font-semibold text-purple-800 mb-1">Thông tin nhân viên:</div>
                                            <div className="text-gray-800"><strong>Họ tên:</strong> {st.fullName}</div>
                                            <div className="text-gray-800"><strong>Email:</strong> {st.email}</div>
                                            <div className="text-gray-800"><strong>SĐT:</strong> {st.phone}</div>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="booking" className="py-20 bg-yellow-50 relative overflow-hidden">
            <div className="w-full mx-auto px-[100px]">
                <div className="text-center mb-16 relative">
                    <h2 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-lg mb-4 flex items-center justify-center gap-3">
                        <span>
                            <svg className="inline w-12 h-12 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
                        </span>
                        Đặt Xe Vận Chuyển
                    </h2>
                    <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
                        Vui lòng nhập thông tin vận chuyển
                    </p>
                    <div className="absolute right-0 top-0 opacity-10 pointer-events-none select-none">
                        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="60" cy="60" r="60" fill="url(#paint0_radial)" />
                            <defs>
                                <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(60 60) scale(60)" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#FDE68A" />
                                    <stop offset="1" stopColor="#F59E42" stopOpacity="0.5" />
                                </radialGradient>
                            </defs>
                        </svg>
                    </div>
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
