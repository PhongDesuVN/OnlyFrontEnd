import React, { useEffect, useState, useRef } from 'react';
import {Mail, MapPin, Phone, Star, Truck, Home, Users, Shield, CheckCircle, Calendar, Package, MapPinIcon} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import NotificationBell from '../../components/NotificationBell';
import FurnitureSelector from '../../Components/FurnitureSelector';

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
            {isLoggedIn && (
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2" style={{ right: '40px' }}>
                    <NotificationBell />
                </div>
            )}
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
        promotionName: '',
        homeType: '',
        slotIndex: null,
        total: 0,
        distance: 0,
        totalVolume: 0,
        vehicleType: null
    });
    const [loading, setLoading] = useState(false);
    const [transportUnits, setTransportUnits] = useState([]);
    const [storageUnits, setStorageUnits] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);
        const [promotions, setPromotions] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState({ transport: false, storage: false, staff: false, promotion: false });
    const [selectedFurniture, setSelectedFurniture] = useState([]);
    const [slotStatus, setSlotStatus] = useState(null);
    const [showSlotSelector, setShowSlotSelector] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [mapData, setMapData] = useState({
        pickupCoords: null,
        deliveryCoords: null,
        route: []
    });
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [deliverySuggestions, setDeliverySuggestions] = useState([]);
    const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
    const [showDeliverySuggestions, setShowDeliverySuggestions] = useState(false);
    const [loadingDistance, setLoadingDistance] = useState(false);
    const [distanceError, setDistanceError] = useState(null);

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
        setBookingData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSelect = (type, value) => {
        if (type === 'storageId') {
            handleStorageSelect(value);
        } else {
            setBookingData(prev => ({ ...prev, [type]: value }));
            setDropdownOpen(prev => ({ 
                ...prev, 
                [type === 'transportId' ? 'transport' : type === 'operatorId' ? 'staff' : type === 'promotionId' ? 'promotion' : type]: false 
            }));
        }
    };

    // Hàm tính toán tổng tiền dựa trên đồ đạc được chọn và quãng đường thực tế
    const calculateTotal = async (pickupLocation, deliveryLocation, furniture) => {
        try {
            // Tổng thể tích
            let totalVolume = 0;
            if (furniture && furniture.length > 0) {
                totalVolume = furniture.reduce((sum, item) => sum + (item.volume * item.quantity), 0);
            }

            // Chọn loại xe
            let vehicleType = 'Xe ba gác';
            let vehicleFactor = 1;
            if (totalVolume > 7 && totalVolume <= 11) {
                vehicleType = 'Xe Tải Mini';
                vehicleFactor = 1.4;
            } else if (totalVolume > 11 && totalVolume <= 15) {
                vehicleType = 'Xe tải tiêu chuẩn';
                vehicleFactor = 1.8;
            } else if (totalVolume > 15 && totalVolume <= 20) {
                vehicleType = 'Xe tải lớn';
                vehicleFactor = 2.1;
            } else if (totalVolume > 20) {
                vehicleType = 'Xe container';
                vehicleFactor = 2.5;
            }

            // Tính quãng đường thực tế từ địa chỉ
            let distance = 0;
            let geocodingError = null;
            
            if (pickupLocation && deliveryLocation) {
                const pickupCoords = await geocodeAddress(pickupLocation);
                const deliveryCoords = await geocodeAddress(deliveryLocation);
                
                if (!pickupCoords) {
                    geocodingError = `Không tìm thấy địa chỉ pickup: "${pickupLocation}". Vui lòng nhập địa chỉ chi tiết hơn.`;
                } else if (!deliveryCoords) {
                    geocodingError = `Không tìm thấy địa chỉ delivery: "${deliveryLocation}". Vui lòng nhập địa chỉ chi tiết hơn.`;
                } else {
                    distance = await calculateDistance(pickupCoords, deliveryCoords);
                    if (!distance || distance <= 0) {
                        geocodingError = 'Không thể tính được khoảng cách giữa hai địa chỉ.';
                    }
                }
            }

            // Tính total theo công thức mới
            const total = distance * 10 * vehicleFactor;

            return { total, distance, vehicleType, totalVolume, geocodingError };
        } catch (error) {
            console.error('Lỗi tính toán:', error);
            throw error;
        }
    };

    // Hàm tính toán tự động khi thay đổi địa chỉ hoặc đồ đạc
    const updateTotal = async () => {
        if (bookingData.pickupLocation && bookingData.deliveryLocation) {
            setLoadingDistance(true);
            setDistanceError(null);
            try {
                const { total, distance, vehicleType, totalVolume, geocodingError } = await calculateTotal(
                    bookingData.pickupLocation,
                    bookingData.deliveryLocation,
                    selectedFurniture
                );
                
                if (geocodingError) {
                    setDistanceError(geocodingError);
                    setBookingData(prev => ({ ...prev, total: 0, distance: 0, vehicleType: null, totalVolume: 0 }));
                } else if (!distance || distance <= 0) {
                    setDistanceError('Không thể tính được khoảng cách giữa hai địa chỉ.');
                    setBookingData(prev => ({ ...prev, total: 0, distance: 0, vehicleType: null, totalVolume: 0 }));
                } else {
                    setDistanceError(null);
                    setBookingData(prev => ({
                        ...prev,
                        total,
                        distance,
                        vehicleType,
                        totalVolume
                    }));
                }
            } catch (error) {
                setDistanceError('Lỗi khi tính toán khoảng cách.');
                setBookingData(prev => ({ ...prev, total: 0, distance: 0, vehicleType: null, totalVolume: 0 }));
            } finally {
                setLoadingDistance(false);
            }
        }
    };

    // Theo dõi thay đổi để tính toán lại tổng tiền (debounce)
    useEffect(() => {
        if (bookingData.pickupLocation && bookingData.deliveryLocation) {
            setLoadingDistance(true);
            setDistanceError(null);
            const timeoutId = setTimeout(updateTotal, 800); // debounce 800ms
            return () => clearTimeout(timeoutId);
        }
    }, [bookingData.pickupLocation, bookingData.deliveryLocation, selectedFurniture]);

    // Cache cho geocoding để tránh gọi API nhiều lần
    const geocodingCache = useRef(new Map());
    
    // Hàm geocoding sử dụng OpenStreetMap Nominatim với cache và email
    const geocodeAddress = async (address) => {
        if (!address || address.trim().length === 0) return null;
        
        // Kiểm tra cache trước
        const cacheKey = address.trim().toLowerCase();
        if (geocodingCache.current.has(cacheKey)) {
            return geocodingCache.current.get(cacheKey);
        }
        
        const maxRetries = 2;
        let lastError;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                // Thêm delay để tuân thủ giới hạn 1 request/giây
                if (attempt > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Tăng delay cho retry
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                // Tạo AbortController để timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout
                
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&email=huynguyenthai2112@gmail.com`,
                    {
                        signal: controller.signal
                    }
                );
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data && data.length > 0) {
                    const result = {
                        lat: parseFloat(data[0].lat),
                        lon: parseFloat(data[0].lon)
                    };
                    
                    // Lưu vào cache
                    geocodingCache.current.set(cacheKey, result);
                    
                    return result;
                } else {
                    // Lưu null vào cache để tránh gọi lại địa chỉ không tìm thấy
                    geocodingCache.current.set(cacheKey, null);
                    return null;
                }
            } catch (error) {
                lastError = error;
                console.error(`Lỗi geocoding (attempt ${attempt + 1}):`, error);
                
                if (attempt === maxRetries) {
                    // Lưu lỗi vào cache để tránh gọi lại liên tục
                    geocodingCache.current.set(cacheKey, { error: true });
                    return null;
                }
            }
        }
        
        return null;
    };

    // Hàm tính quãng đường sử dụng OSRM
    const calculateDistance = async (pickup, delivery) => {
        try {
            // Tạo AbortController để timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout
            
            const response = await fetch(
                `http://router.project-osrm.org/route/v1/driving/${pickup.lon},${pickup.lat};${delivery.lon},${delivery.lat}?overview=false`,
                {
                    signal: controller.signal
                }
            );
            
            clearTimeout(timeoutId);
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

    // Cache cho address suggestions
    const suggestionsCache = useRef(new Map());
    
    // Hàm tìm kiếm địa chỉ gợi ý với cache và email
    const searchAddressSuggestions = async (query) => {
        if (!query || query.length < 3) return [];
        
        // Kiểm tra cache trước
        const cacheKey = query.trim().toLowerCase();
        if (suggestionsCache.current.has(cacheKey)) {
            return suggestionsCache.current.get(cacheKey);
        }
        
        const maxRetries = 2;
        let lastError;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                // Thêm delay để tuân thủ giới hạn 1 request/giây
                if (attempt > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Tăng delay cho retry
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                // Tạo AbortController để timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout
                
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=vn&email=huynguyenthai2112@gmail.com`,
                    {
                        signal: controller.signal
                    }
                );
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                const suggestions = data.map(item => ({
                    display_name: item.display_name,
                    lat: item.lat,
                    lon: item.lon
                }));
                
                // Lưu vào cache
                suggestionsCache.current.set(cacheKey, suggestions);
                
                return suggestions;
            } catch (error) {
                lastError = error;
                console.error(`Lỗi tìm kiếm địa chỉ (attempt ${attempt + 1}):`, error);
                
                if (attempt === maxRetries) {
                    // Lưu lỗi vào cache để tránh gọi lại liên tục
                    suggestionsCache.current.set(cacheKey, []);
                    return [];
                }
            }
        }
        
        return [];
    };

    // Xử lý thay đổi đồ đạc được chọn
    const handleFurnitureChange = (furniture) => {
        setSelectedFurniture(furniture);
    };

    // Xử lý thay đổi địa chỉ pickup (chỉ cập nhật state, không tìm kiếm)
    const handlePickupLocationChange = (e) => {
        const value = e.target.value;
        setBookingData(prev => ({ ...prev, pickupLocation: value }));
        setPickupSuggestions([]);
        setShowPickupSuggestions(false);
    };
    // Xử lý nhấn Enter để tìm kiếm gợi ý pickup
    const handlePickupLocationKeyDown = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (bookingData.pickupLocation.length >= 3) {
                try {
                    const suggestions = await searchAddressSuggestions(bookingData.pickupLocation);
                    setPickupSuggestions(suggestions);
                    setShowPickupSuggestions(true);
                    
                    if (suggestions.length === 0) {
                        alert('Không tìm thấy địa chỉ. Vui lòng nhập địa chỉ chi tiết hơn (ví dụ: "số 10 Trần Duy Hưng, Cầu Giấy, Hà Nội")');
                    }
                } catch (error) {
                    if (error.name === 'AbortError') {
                        alert('Kết nối bị timeout. Vui lòng kiểm tra mạng và thử lại sau.');
                    } else {
                        alert('Có lỗi khi tìm kiếm địa chỉ. Vui lòng thử lại sau.');
                    }
                }
            } else {
                alert('Vui lòng nhập ít nhất 3 ký tự để tìm kiếm địa chỉ.');
            }
        }
    };

    // Xử lý thay đổi địa chỉ delivery (chỉ cập nhật state, không tìm kiếm)
    const handleDeliveryLocationChange = (e) => {
        const value = e.target.value;
        setBookingData(prev => ({ ...prev, deliveryLocation: value }));
        setDeliverySuggestions([]);
        setShowDeliverySuggestions(false);
    };
    // Xử lý nhấn Enter để tìm kiếm gợi ý delivery
    const handleDeliveryLocationKeyDown = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (bookingData.deliveryLocation.length >= 3) {
                try {
                    const suggestions = await searchAddressSuggestions(bookingData.deliveryLocation);
                    setDeliverySuggestions(suggestions);
                    setShowDeliverySuggestions(true);
                    
                    if (suggestions.length === 0) {
                        alert('Không tìm thấy địa chỉ. Vui lòng nhập địa chỉ chi tiết hơn (ví dụ: "số 10 Trần Duy Hưng, Cầu Giấy, Hà Nội")');
                    }
                } catch (error) {
                    if (error.name === 'AbortError') {
                        alert('Kết nối bị timeout. Vui lòng kiểm tra mạng và thử lại sau.');
                    } else {
                        alert('Có lỗi khi tìm kiếm địa chỉ. Vui lòng thử lại sau.');
                    }
                }
            } else {
                alert('Vui lòng nhập ít nhất 3 ký tự để tìm kiếm địa chỉ.');
            }
        }
    };

    // Xử lý chọn gợi ý địa chỉ pickup
    const handlePickupSuggestionSelect = (suggestion) => {
        setBookingData(prev => ({ ...prev, pickupLocation: suggestion.display_name }));
        setShowPickupSuggestions(false);
        setPickupSuggestions([]);
    };

    // Xử lý chọn gợi ý địa chỉ delivery
    const handleDeliverySuggestionSelect = (suggestion) => {
        setBookingData(prev => ({ ...prev, deliveryLocation: suggestion.display_name }));
        setShowDeliverySuggestions(false);
        setDeliverySuggestions([]);
    };

    // Hàm chuyển đổi room sang RoomType enum
    const mapRoomToRoomType = (room) => {
        switch (room) {
            case 'Phòng khách':
                return 'LIVING_ROOM';
            case 'Phòng ngủ':
                return 'BEDROOM';
            case 'Phòng ăn':
                return 'DINING_ROOM';
            case 'Phòng tắm':
                return 'BATHROOM';
            default:
                return 'LIVING_ROOM';
        }
    };

    // Hàm lấy trạng thái slot của kho
    const fetchSlotStatus = async (storageId) => {
        try {
            const response = await fetch(`http://localhost:8083/api/customer/storage-units/${storageId}/slots`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSlotStatus(data);
            }
        } catch (error) {
            console.error('Lỗi khi lấy trạng thái slot:', error);
        }
    };

    // Xử lý chọn kho
    const handleStorageSelect = (storageId) => {
        setBookingData(prev => ({ ...prev, storageId }));
        setDropdownOpen(prev => ({ ...prev, storage: false }));
        if (storageId) {
            fetchSlotStatus(storageId);
            setShowSlotSelector(true);
        } else {
            setShowSlotSelector(false);
            setSlotStatus(null);
            setSelectedSlot(null);
        }
    };

    // Xử lý chọn slot
    const handleSlotSelect = (slotIndex) => {
        setSelectedSlot(slotIndex);
        setBookingData(prev => ({ ...prev, slotIndex }));
    };

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

    // Ẩn gợi ý khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.relative')) {
                setShowPickupSuggestions(false);
                setShowDeliverySuggestions(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

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

        if (!bookingData.homeType) {
            alert('Vui lòng chọn loại nhà.');
            return;
        }

        if (bookingData.storageId && !bookingData.slotIndex) {
            alert('Vui lòng chọn vị trí cất giữ trong kho.');
            return;
        }

        setLoading(true);

        // Chuẩn bị payload theo cấu trúc backend mới
        const selectedPromotion = promotions.find(p => p.id === bookingData.promotionId);
        
        // Chuyển đổi furniture thành items theo format backend
        const items = selectedFurniture.map(item => ({
            name: item.name,
            quantity: item.quantity,
            weight: item.weight,
            volume: item.volume,
            modular: item.modular,
            bulky: item.bulky,
            room: mapRoomToRoomType(item.room)
        }));

        const payload = {
            storageId: bookingData.storageId,
            transportId: bookingData.transportId,
            operatorId: bookingData.operatorId,
            pickupLocation: bookingData.pickupLocation,
            deliveryLocation: bookingData.deliveryLocation,
            deliveryDate: bookingData.deliveryDate ? `${bookingData.deliveryDate}T00:00:00` : null,
            note: bookingData.note,
            total: bookingData.total || 0,
            promotionName: selectedPromotion ? selectedPromotion.name : null,
            homeType: bookingData.homeType,
            slotIndex: bookingData.slotIndex,
            items: items
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

            const result = await response.json();
            alert('Đặt xe thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.');
            
            // Reset state
            setBookingData({ 
                pickupLocation: '', 
                deliveryLocation: '', 
                deliveryDate: '', 
                note: '', 
                transportId: null, 
                storageId: null, 
                operatorId: null, 
                promotionId: null,
                promotionName: '',
                homeType: '',
                slotIndex: null,
                total: 0,
                distance: 0,
                totalVolume: 0,
                vehicleType: null
            });
            setSelectedFurniture([]);
            setSelectedService(null);
            setShowSlotSelector(false);
            setSlotStatus(null);
            setSelectedSlot(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    // Dropdown tùy chỉnh với thông tin hiển thị bên dưới
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
                
                {/* Hiển thị thông tin chi tiết bên dưới dropdown */}
                {selectedOption && (
                    <div className="mt-3 p-4 rounded-lg border">
                        {type === 'transport' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-row gap-4 items-center">
                                <div className="flex-1">
                                    <div className="font-semibold text-blue-800 mb-1">Thông tin phương tiện:</div>
                                    <div className="text-gray-800"><strong>Công ty:</strong> {selectedOption.nameCompany}</div>
                                    <div className="text-gray-800"><strong>Liên hệ:</strong> {selectedOption.namePersonContact}</div>
                                    <div className="text-gray-800"><strong>SĐT:</strong> {selectedOption.phone}</div>
                                    <div className="text-gray-800"><strong>Biển số:</strong> {selectedOption.licensePlate}</div>
                                    <div className="text-gray-800"><strong>Trạng thái:</strong> {selectedOption.status}</div>
                                </div>
                                {selectedOption.imageTransportUnit || selectedOption.image ? (
                                    <div className="flex-shrink-0 w-32 h-32 flex items-center justify-center">
                                        <img src={selectedOption.imageTransportUnit || selectedOption.image} alt="Ảnh phương tiện" className="object-cover w-32 h-32 rounded shadow border bg-white" />
                                    </div>
                                ) : null}
                            </div>
                        )}
                        
                        {type === 'storage' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-row gap-4 items-center">
                                <div className="flex-1">
                                    <div className="font-semibold text-green-800 mb-1">Thông tin kho:</div>
                                    <div className="text-gray-800"><strong>Tên kho:</strong> {selectedOption.name}</div>
                                    <div className="text-gray-800"><strong>Địa chỉ:</strong> {selectedOption.address}</div>
                                    <div className="text-gray-800"><strong>SĐT:</strong> {selectedOption.phone}</div>
                                    <div className="text-gray-800"><strong>Trạng thái:</strong> {selectedOption.status}</div>
                                    <div className="text-gray-800"><strong>Số slot:</strong> {selectedOption.slotCount || 'N/A'}</div>
                                </div>
                                {selectedOption.imageStorageUnit || selectedOption.image ? (
                                    <div className="flex-shrink-0 w-32 h-32 flex items-center justify-center">
                                        <img src={selectedOption.imageStorageUnit || selectedOption.image} alt="Ảnh kho" className="object-cover w-32 h-32 rounded shadow border bg-white" />
                                    </div>
                                ) : null}
                                
                                {/* Nút chọn vị trí cất giữ */}
                                <div className="mt-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowSlotSelector(true)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Chọn vị trí cất giữ
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {type === 'staff' && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="font-semibold text-purple-800 mb-1">Thông tin nhân viên:</div>
                                <div className="text-gray-800"><strong>Họ tên:</strong> {selectedOption.fullName}</div>
                                <div className="text-gray-800"><strong>Email:</strong> {selectedOption.email}</div>
                                <div className="text-gray-800"><strong>SĐT:</strong> {selectedOption.phone}</div>
                            </div>
                        )}
                        
                        {type === 'promotion' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="font-semibold text-yellow-800 mb-1">Thông tin khuyến mãi:</div>
                                <div className="text-gray-800"><strong>Tên:</strong> {selectedOption.name}</div>
                                <div className="text-gray-800"><strong>Mô tả:</strong> {selectedOption.description}</div>
                                <div className="text-gray-800">
                                    <strong>Áp dụng đến:</strong> {selectedOption.endDate ? new Date(selectedOption.endDate).toLocaleDateString('vi-VN') : 'Không xác định'}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
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
                            Vui lòng nhập thông tin vận chuyển và chọn đồ đạc
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
                                    <div className="relative">
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Thông tin vị trí nhận *
                                        </label>
                                        <input
                                            type="text"
                                            name="pickupLocation"
                                            value={bookingData.pickupLocation}
                                            onChange={handlePickupLocationChange}
                                            onKeyDown={handlePickupLocationKeyDown}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Nhập địa chỉ nhận hàng (nhấn Enter để tìm kiếm)"
                                            required
                                        />
                                        <div className="text-xs text-gray-500 mt-1">
                                            💡 Nhấn Enter để tìm kiếm địa chỉ. Nhập địa chỉ chi tiết để có kết quả chính xác hơn.
                                        </div>
                                        {/* Gợi ý địa chỉ pickup */}
                                        {showPickupSuggestions && pickupSuggestions.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {pickupSuggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => handlePickupSuggestionSelect(suggestion)}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                                                    >
                                                        <div className="text-sm text-gray-800">{suggestion.display_name}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Thông tin vị trí đến *
                                        </label>
                                        <input
                                            type="text"
                                            name="deliveryLocation"
                                            value={bookingData.deliveryLocation}
                                            onChange={handleDeliveryLocationChange}
                                            onKeyDown={handleDeliveryLocationKeyDown}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Nhập địa chỉ giao hàng (nhấn Enter để tìm kiếm)"
                                            required
                                        />
                                        <div className="text-xs text-gray-500 mt-1">
                                            💡 Nhấn Enter để tìm kiếm địa chỉ. Nhập địa chỉ chi tiết để có kết quả chính xác hơn.
                                        </div>
                                        {/* Gợi ý địa chỉ delivery */}
                                        {showDeliverySuggestions && deliverySuggestions.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {deliverySuggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => handleDeliverySuggestionSelect(suggestion)}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                                                    >
                                                        <div className="text-sm text-gray-800">{suggestion.display_name}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Hiển thị thông tin tính toán */}
                                    {(loadingDistance || distanceError || bookingData.total > 0 || bookingData.distance > 0) && (
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                            <h4 className="font-semibold text-blue-800 mb-2">Thông tin tính toán:</h4>
                                            {loadingDistance && (
                                                <div className="text-blue-600 text-sm mb-2">Đang tính toán khoảng cách...</div>
                                            )}
                                            {distanceError && (
                                                <div className="text-red-600 text-sm mb-2">{distanceError}</div>
                                            )}
                                            {!loadingDistance && !distanceError && (
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">Quãng đường:</span>
                                                        <span className="font-semibold text-blue-800 ml-2">{bookingData.distance.toFixed(1)} km</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Tổng tiền:</span>
                                                        <span className="font-semibold text-green-600 ml-2">{bookingData.total.toLocaleString()} VNĐ</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Tổng thể tích:</span>
                                                        <span className="font-semibold text-blue-800 ml-2">{bookingData.totalVolume ? bookingData.totalVolume.toFixed(2) : 0} m³</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Loại xe:</span>
                                                        <span className="font-semibold text-orange-600 ml-2">{bookingData.vehicleType || 'Chưa xác định'}</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-blue-200">
                                                🔒 Sử dụng OpenStreetMap Nominatim API tuân thủ giới hạn 1 request/giây
                                                <br />
                                                ⚠️ Nếu gặp lỗi kết nối, vui lòng thử lại sau vài giây
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

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Loại nhà *
                                        </label>
                                        <div className="space-y-3">
                                            <label className="flex items-center space-x-3 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="homeType"
                                                    value="Chung cư"
                                                    checked={bookingData.homeType === 'Chung cư'}
                                                    onChange={handleInputChange}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700">Chung cư</span>
                                            </label>
                                            <label className="flex items-center space-x-3 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="homeType"
                                                    value="Nhà thường"
                                                    checked={bookingData.homeType === 'Nhà thường'}
                                                    onChange={handleInputChange}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700">Nhà thường</span>
                                            </label>
                                        </div>
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
                        {/* Component chọn đồ đạc và bản đồ */}
                        <div className="md:w-1/2 w-full flex flex-col gap-6">
                            {/* Bản đồ */}
                            <div className="bg-white rounded-2xl shadow-lg overflow-auto p-6 flex flex-col gap-4">
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
                            
                            {/* Component chọn đồ đạc */}
                            <FurnitureSelector onFurnitureChange={handleFurnitureChange} />
                            
                            {/* Tóm tắt đồ đạc đã chọn */}
                            {selectedFurniture.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Tóm tắt đồ đạc đã chọn:</h4>
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {selectedFurniture.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-800">{item.name}</div>
                                                    <div className="text-sm text-gray-600">
                                                        Phòng: {item.room} | SL: {item.quantity} | Thể tích: {item.volume}m³ | Khối lượng: {item.weight}kg
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    {item.modular && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Modular</span>}
                                                    {item.bulky && <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Bulky</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Tổng số lượng:</span>
                                            <span>{selectedFurniture.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Tổng thể tích:</span>
                                            <span>{selectedFurniture.reduce((sum, item) => sum + (item.volume * item.quantity), 0).toFixed(2)} m³</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Tổng khối lượng:</span>
                                            <span>{selectedFurniture.reduce((sum, item) => sum + (item.weight * item.quantity), 0).toFixed(2)} kg</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Slot Selector Component */}
                            {showSlotSelector && slotStatus && (
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-semibold text-gray-800">
                                            Chọn vị trí cất giữ - {slotStatus.storageName}
                                        </h4>
                                        <button
                                            onClick={() => setShowSlotSelector(false)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-green-500 rounded"></div>
                                                <span>Trống</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-red-500 rounded"></div>
                                                <span>Đã đặt</span>
                                            </div>
                                            {selectedSlot && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                                    <span>Đã chọn: Slot {selectedSlot}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-3">
                                        {slotStatus.slots.map((slot) => (
                                            <button
                                                key={slot.slotIndex}
                                                onClick={() => !slot.booked && handleSlotSelect(slot.slotIndex)}
                                                disabled={slot.booked}
                                                className={`
                                                    p-4 rounded-lg border-2 transition-all duration-200 text-center
                                                    ${slot.booked 
                                                        ? 'bg-red-100 border-red-300 text-red-700 cursor-not-allowed' 
                                                        : selectedSlot === slot.slotIndex
                                                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                                                        : 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200'
                                                    }
                                                `}
                                            >
                                                <div className="font-semibold">Slot {slot.slotIndex}</div>
                                                {slot.booked ? (
                                                    <div className="text-xs mt-1">
                                                        Đã có người đặt
                                                    </div>
                                                ) : (
                                                    <div className="text-xs mt-1">
                                                        Trống
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {selectedSlot && (
                                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="text-sm text-blue-800">
                                                <strong>Đã chọn:</strong> Slot {selectedSlot} trong kho {slotStatus.storageName}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
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
                        Vui lòng nhập thông tin vận chuyển và chọn đồ đạc
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
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
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