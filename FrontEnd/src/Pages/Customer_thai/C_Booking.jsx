import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import FurnitureSelector from '../../Components/FurnitureSelector';
import { Home, Users } from 'lucide-react';
import { apiCall } from '../../utils/api';
const C_Booking = ({ isLoggedIn }) => {
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
                    apiCall('/api/customer/transport-units', { headers }),
                    apiCall('/api/customer/storage-units', { headers }),
                    apiCall('/api/customer/operator-staff', { headers }),
                    apiCall('/api/customer/promotions', { headers })
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

    const calculateTotal = async (pickupLocation, deliveryLocation, furniture) => {
        try {
            let totalVolume = 0;
            if (furniture && furniture.length > 0) {
                totalVolume = furniture.reduce((sum, item) => sum + (item.volume * item.quantity), 0);
            }

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

            const total = distance * 10 * vehicleFactor;

            return { total, distance, vehicleType, totalVolume, geocodingError };
        } catch (error) {
            console.error('Lỗi tính toán:', error);
            throw error;
        }
    };

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

    useEffect(() => {
        if (bookingData.pickupLocation && bookingData.deliveryLocation) {
            setLoadingDistance(true);
            setDistanceError(null);
            const timeoutId = setTimeout(updateTotal, 800);
            return () => clearTimeout(timeoutId);
        }
    }, [bookingData.pickupLocation, bookingData.deliveryLocation, selectedFurniture]);

    const geocodingCache = useRef(new Map());

    const geocodeAddress = async (address) => {
        if (!address || address.trim().length === 0) return null;

        const cacheKey = address.trim().toLowerCase();
        if (geocodingCache.current.has(cacheKey)) {
            return geocodingCache.current.get(cacheKey);
        }

        const maxRetries = 2;
        let lastError;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

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

                    geocodingCache.current.set(cacheKey, result);
                    return result;
                } else {
                    geocodingCache.current.set(cacheKey, null);
                    return null;
                }
            } catch (error) {
                lastError = error;
                console.error(`Lỗi geocoding (attempt ${attempt + 1}):`, error);

                if (attempt === maxRetries) {
                    geocodingCache.current.set(cacheKey, { error: true });
                    return null;
                }
            }
        }

        return null;
    };

    const calculateDistance = async (pickup, delivery) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(
                `http://router.project-osrm.org/route/v1/driving/${pickup.lon},${pickup.lat};${delivery.lon},${delivery.lat}?overview=false`,
                {
                    signal: controller.signal
                }
            );

            clearTimeout(timeoutId);
            const data = await response.json();

            if (data && data.routes && data.routes.length > 0) {
                return data.routes[0].distance / 1000;
            }
            return 0;
        } catch (error) {
            console.error('Lỗi tính quãng đường:', error);
            return 0;
        }
    };

    const suggestionsCache = useRef(new Map());

    const searchAddressSuggestions = async (query) => {
        if (!query || query.length < 3) return [];

        const cacheKey = query.trim().toLowerCase();
        if (suggestionsCache.current.has(cacheKey)) {
            return suggestionsCache.current.get(cacheKey);
        }

        const maxRetries = 2;
        let lastError;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

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

                suggestionsCache.current.set(cacheKey, suggestions);
                return suggestions;
            } catch (error) {
                lastError = error;
                console.error(`Lỗi tìm kiếm địa chỉ (attempt ${attempt + 1}):`, error);

                if (attempt === maxRetries) {
                    suggestionsCache.current.set(cacheKey, []);
                    return [];
                }
            }
        }

        return [];
    };

    const handleFurnitureChange = (furniture) => {
        setSelectedFurniture(furniture);
    };

    const handlePickupLocationChange = (e) => {
        const value = e.target.value;
        setBookingData(prev => ({ ...prev, pickupLocation: value }));
        setPickupSuggestions([]);
        setShowPickupSuggestions(false);
    };

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

    const handleDeliveryLocationChange = (e) => {
        const value = e.target.value;
        setBookingData(prev => ({ ...prev, deliveryLocation: value }));
        setDeliverySuggestions([]);
        setShowDeliverySuggestions(false);
    };

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

    const handlePickupSuggestionSelect = (suggestion) => {
        setBookingData(prev => ({ ...prev, pickupLocation: suggestion.display_name }));
        setShowPickupSuggestions(false);
        setPickupSuggestions([]);
    };

    const handleDeliverySuggestionSelect = (suggestion) => {
        setBookingData(prev => ({ ...prev, deliveryLocation: suggestion.display_name }));
        setShowDeliverySuggestions(false);
        setDeliverySuggestions([]);
    };

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

    const fetchSlotStatus = async (storageId) => {
        try {
            const response = await apiCall(`/api/customer/storage-units/${storageId}/slots`, {
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

    const handleSlotSelect = (slotIndex) => {
        setSelectedSlot(slotIndex);
        setBookingData(prev => ({ ...prev, slotIndex }));
    };

    useEffect(() => {
        const updateMap = async () => {
            if (bookingData.pickupLocation && bookingData.deliveryLocation) {
                const pickup = await geocodeAddress(bookingData.pickupLocation);
                const delivery = await geocodeAddress(bookingData.deliveryLocation);
                let route = [];
                if (pickup && delivery) {
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

        const selectedPromotion = promotions.find(p => p.id === bookingData.promotionId);

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
            const response = await apiCall('/api/customer/bookings', {
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
                        <div className="md:w-1/2 w-full relative">
                            <div className="bg-white p-10 rounded-3xl shadow-2xl border border-yellow-100 relative">
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
                        <div className="md:w-1/2 w-full flex flex-col gap-6">
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

                            <FurnitureSelector onFurnitureChange={handleFurnitureChange} />

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

export default C_Booking;