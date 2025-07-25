import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Check, Home, Bed, Utensils, Bath, Camera } from 'lucide-react';
import ImageUpload from './ImageUpload';

const FurnitureSelector = ({ onFurnitureChange }) => {
    const [furnitureData, setFurnitureData] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFurniture, setSelectedFurniture] = useState(null);
    const [isAddingFurniture, setIsAddingFurniture] = useState(false);
    const [furnitureForm, setFurnitureForm] = useState({
        quantity: 1,
        volume: 0,
        weight: 0
    });
    const [userFurniture, setUserFurniture] = useState([]);
    const [editingFurniture, setEditingFurniture] = useState(null);
    const [showImageUpload, setShowImageUpload] = useState(false);

    // New state for manual adding
    const [isManualAdding, setIsManualAdding] = useState(false);
    const [manualFurnitureForm, setManualFurnitureForm] = useState({
        name: '',
        quantity: 1,
        volume: 0,
        weight: 0
    });
    const [manualFormErrors, setManualFormErrors] = useState({});

    // Load dữ liệu đồ đạc từ database.json
    useEffect(() => {
        const loadFurnitureData = async () => {
            try {
                const response = await fetch('/database.json');
                const data = await response.json();
                setFurnitureData(data);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu đồ đạc:', error);
            }
        };
        loadFurnitureData();
    }, []);

    // Lọc đồ đạc theo phòng và từ khóa tìm kiếm
    const filteredFurniture = furnitureData.filter(item => {
        if (selectedRoom && item.Phong !== selectedRoom) return false;
        if (searchTerm && !item.VatDung.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    // Xử lý chọn phòng
    const handleRoomSelect = (room) => {
        setSelectedRoom(room);
        setSearchTerm('');
        setSelectedFurniture(null);
        setIsAddingFurniture(false);
        setShowImageUpload(false);
        setIsManualAdding(false); // Reset manual adding when room changes
        setManualFormErrors({});
    };

    // Xử lý chọn đồ đạc
    const handleFurnitureSelect = (furniture) => {
        setSelectedFurniture(furniture);
        setIsAddingFurniture(true);
        setIsManualAdding(false); // Close manual add form if selecting from list
        setFurnitureForm({
            quantity: 1,
            volume: 0,
            weight: 0
        });
    };

    // Xử lý thêm đồ đạc từ danh sách có sẵn
    const handleAddFurniture = () => {
        if (!selectedFurniture) return;

        const newFurniture = {
            id: Date.now(),
            name: selectedFurniture.VatDung,
            room: selectedRoom,
            quantity: furnitureForm.quantity,
            volume: furnitureForm.volume,
            weight: furnitureForm.weight,
            modular: selectedFurniture.Modular,
            bulky: selectedFurniture.Bulky
        };

        setUserFurniture(prev => [...prev, newFurniture]);
        setIsAddingFurniture(false);
        setSelectedFurniture(null);
        setFurnitureForm({ quantity: 1, volume: 0, weight: 0 });
        
        // Gọi callback để cập nhật dữ liệu cho component cha
        if (onFurnitureChange) {
            onFurnitureChange([...userFurniture, newFurniture]);
        }
    };

    // Validate manual furniture form
    const validateManualForm = () => {
        let errors = {};
        let isValid = true;

        if (!manualFurnitureForm.name.trim()) {
            errors.name = 'Tên đồ đạc không được để trống.';
            isValid = false;
        } else if (!/^[a-zA-Z0-9À-ỹ\s]+$/.test(manualFurnitureForm.name.trim())) { // Allows letters, numbers, Vietnamese characters, and spaces
            errors.name = 'Tên đồ đạc chỉ được chứa chữ cái, chữ số và khoảng trắng.';
            isValid = false;
        } else if (manualFurnitureForm.name.trim().length > 100) { // Example max length
            errors.name = 'Tên đồ đạc quá dài.';
            isValid = false;
        }

        if (manualFurnitureForm.quantity <= 0 || !Number.isInteger(manualFurnitureForm.quantity)) {
            errors.quantity = 'Số lượng phải là số nguyên dương.';
            isValid = false;
        }

        if (manualFurnitureForm.volume < 0) {
            errors.volume = 'Thể tích không được âm.';
            isValid = false;
        }

        setManualFormErrors(errors);
        return isValid;
    };

    // Xử lý thêm đồ đạc thủ công
    const handleManualAddFurniture = () => {
        if (!validateManualForm()) {
            return;
        }

        const newFurniture = {
            id: Date.now(),
            name: manualFurnitureForm.name.trim(),
            room: selectedRoom,
            quantity: manualFurnitureForm.quantity,
            volume: manualFurnitureForm.volume,
            weight: manualFurnitureForm.weight,
            modular: false, // Default for manually added items
            bulky: manualFurnitureForm.volume > 1 || manualFurnitureForm.weight > 50 // Example bulky logic
        };

        setUserFurniture(prev => [...prev, newFurniture]);
        setIsManualAdding(false);
        setManualFurnitureForm({ name: '', quantity: 1, volume: 0, weight: 0 });
        setManualFormErrors({});

        if (onFurnitureChange) {
            onFurnitureChange([...userFurniture, newFurniture]);
        }
    };

    // Xử lý xóa đồ đạc
    const handleDeleteFurniture = (id) => {
        const updatedFurniture = userFurniture.filter(item => item.id !== id);
        setUserFurniture(updatedFurniture);
        if (onFurnitureChange) {
            onFurnitureChange(updatedFurniture);
        }
    };

    // Xử lý chỉnh sửa đồ đạc
    const handleEditFurniture = (furniture) => {
        setEditingFurniture(furniture);
        setIsAddingFurniture(false); // Close add form if editing
        setIsManualAdding(false); // Close manual add form if editing
        setFurnitureForm({
            quantity: furniture.quantity,
            volume: furniture.volume,
            weight: furniture.weight
        });
    };

    // Xử lý cập nhật đồ đạc
    const handleUpdateFurniture = () => {
        if (!editingFurniture) return;

        const updatedFurniture = userFurniture.map(item => 
            item.id === editingFurniture.id 
                ? { ...item, ...furnitureForm }
                : item
        );

        setUserFurniture(updatedFurniture);
        setEditingFurniture(null);
        setFurnitureForm({ quantity: 1, volume: 0, weight: 0 });
        
        if (onFurnitureChange) {
            onFurnitureChange(updatedFurniture);
        }
    };

    // Xử lý nhận đồ đạc được phát hiện từ hình ảnh
    const handleFurnitureDetected = (furnitureItems) => {
        // Tạo ID mới cho mỗi món đồ
        const newFurnitureItems = furnitureItems.map(item => ({
            ...item,
            id: Date.now() + Math.random()
        }));
        
        const updatedFurniture = [...userFurniture, ...newFurnitureItems];
        setUserFurniture(updatedFurniture);
        
        if (onFurnitureChange) {
            onFurnitureChange(updatedFurniture);
        }
        
        setShowImageUpload(false);
    };

    // Xử lý hủy thao tác
    const handleCancel = () => {
        setIsAddingFurniture(false);
        setSelectedFurniture(null);
        setEditingFurniture(null);
        setIsManualAdding(false); // Cancel manual adding
        setFurnitureForm({ quantity: 1, volume: 0, weight: 0 });
        setManualFurnitureForm({ name: '', quantity: 1, volume: 0, weight: 0 });
        setManualFormErrors({});
    };

    // Icon cho từng phòng
    const getRoomIcon = (room) => {
        switch (room) {
            case 'Phòng khách': return <Home className="w-5 h-5" />;
            case 'Phòng ngủ': return <Bed className="w-5 h-5" />;
            case 'Phòng ăn': return <Utensils className="w-5 h-5" />;
            case 'Phòng tắm': return <Bath className="w-5 h-5" />;
            default: return <Home className="w-5 h-5" />;
        }
    };

    // Tính tổng số lượng và tổng thể tích cho toàn bộ userFurniture
    const totalQuantity = userFurniture.reduce((sum, item) => sum + item.quantity, 0);
    const totalVolume = userFurniture.reduce((sum, item) => sum + (item.quantity * item.volume), 0);

    const InfoBox = () => (
        <div className="text-xs text-left p-0 bg-transparent border-none shadow-none min-w-[160px]">
            <div><span className="font-semibold">Tổng số lượng:</span> <span>{totalQuantity}</span></div>
            <div><span className="font-semibold">Tổng thể tích:</span> <span>{totalVolume.toFixed(2)} m³</span></div>
        </div>
    );

    // Render giao diện chọn phòng
    if (!selectedRoom) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6 relative">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 text-left mb-0">
                        Chọn Phòng Để Thêm Đồ Đạc Cần Vận Chuyển
                    </h3>
                    <InfoBox />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {['Phòng khách', 'Phòng ngủ', 'Phòng ăn', 'Phòng tắm'].map((room) => (
                        <button
                            key={room}
                            onClick={() => handleRoomSelect(room)}
                            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                        >
                            {getRoomIcon(room)}
                            <span className="mt-2 font-medium text-gray-700">{room}</span>
                        </button>
                    ))}
                </div>
                <div className="w-full mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-800 text-center">
                        💡 Chọn phòng để thêm đồ đạc cần vận chuyển
                    </div>
                </div>
            </div>
        );
    }

    // Hiển thị giao diện chụp và upload ảnh
    if (showImageUpload) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6 relative">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowImageUpload(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            {getRoomIcon(selectedRoom)}
                            <h3 className="text-xl font-semibold text-gray-800 text-left mb-0">
                                Nhận diện đồ đạc {selectedRoom}
                            </h3>
                        </div>
                    </div>
                </div>

                <ImageUpload onFurnitureDetected={handleFurnitureDetected} room={selectedRoom} />
            </div>
        );
    }

    // Render giao diện chọn đồ đạc trong phòng
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 relative">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSelectedRoom(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        {getRoomIcon(selectedRoom)}
                        <h3 className="text-xl font-semibold text-gray-800 text-left mb-0">Đồ đạc {selectedRoom}</h3>
                    </div>
                </div>
                <InfoBox />
            </div>

            <div className="flex items-center justify-between mb-6">
                {/* Thanh tìm kiếm */}
                <div className="relative flex-1 mr-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Nút thêm mới thủ công */}
                <button
                    onClick={() => {
                        setIsManualAdding(true);
                        setIsAddingFurniture(false); // Close default add form
                        setSelectedFurniture(null); // Deselect any furniture
                        setEditingFurniture(null); // Close edit form
                        setManualFurnitureForm({ name: '', quantity: 1, volume: 0, weight: 0 }); // Reset manual form
                        setManualFormErrors({}); // Clear errors
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mr-2"
                >
                    <Plus className="w-4 h-4" />
                    Thêm
                </button>

                {/* Nút nhận diện qua hình ảnh */}
                <button
                    onClick={() => setShowImageUpload(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Camera className="w-4 h-4" />
                    Nhận diện từ hình ảnh
                </button>
            </div>

            {/* Form thêm đồ đạc từ danh sách có sẵn */}
            {isAddingFurniture && selectedFurniture && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3">
                        Thêm: {selectedFurniture.VatDung}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số lượng
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={furnitureForm.quantity}
                                onChange={(e) => setFurnitureForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thể tích (m³)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={furnitureForm.volume}
                                onChange={(e) => setFurnitureForm(prev => ({ ...prev, volume: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.0"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddFurniture}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Check className="w-4 h-4" />
                            Xác nhận
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}

            {/* Form thêm đồ đạc thủ công */}
            {isManualAdding && (
                <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-indigo-800 mb-3">
                        Thêm đồ đạc thủ công
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên đồ đạc
                            </label>
                            <input
                                type="text"
                                value={manualFurnitureForm.name}
                                onChange={(e) => {
                                    setManualFurnitureForm(prev => ({ ...prev, name: e.target.value }));
                                    setManualFormErrors(prev => ({ ...prev, name: '' })); // Clear error on change
                                }}
                                className={`w-full px-3 py-2 border ${manualFormErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                placeholder="Ví dụ: Bàn làm việc"
                            />
                            {manualFormErrors.name && <p className="text-red-500 text-xs mt-1">{manualFormErrors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số lượng
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={manualFurnitureForm.quantity}
                                onChange={(e) => {
                                    setManualFurnitureForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }));
                                    setManualFormErrors(prev => ({ ...prev, quantity: '' }));
                                }}
                                className={`w-full px-3 py-2 border ${manualFormErrors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                            />
                            {manualFormErrors.quantity && <p className="text-red-500 text-xs mt-1">{manualFormErrors.quantity}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thể tích (m³)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={manualFurnitureForm.volume}
                                onChange={(e) => {
                                    setManualFurnitureForm(prev => ({ ...prev, volume: parseFloat(e.target.value) || 0 }));
                                    setManualFormErrors(prev => ({ ...prev, volume: '' }));
                                }}
                                className={`w-full px-3 py-2 border ${manualFormErrors.volume ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                placeholder="0.0"
                            />
                            {manualFormErrors.volume && <p className="text-red-500 text-xs mt-1">{manualFormErrors.volume}</p>}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleManualAddFurniture}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Check className="w-4 h-4" />
                            Thêm
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}

            {/* Form chỉnh sửa đồ đạc */}
            {editingFurniture && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-3">
                        Chỉnh sửa: {editingFurniture.name}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số lượng
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={furnitureForm.quantity}
                                onChange={(e) => setFurnitureForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thể tích (m³)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={furnitureForm.volume}
                                onChange={(e) => setFurnitureForm(prev => ({ ...prev, volume: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.0"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleUpdateFurniture}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                            <Check className="w-4 h-4" />
                            Cập nhật
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}

            {/* Danh sách đồ đạc đã thêm */}
            {userFurniture.filter(item => item.room === selectedRoom).length > 0 && (
                <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Đồ đạc đã thêm:</h4>
                    <div className="space-y-2">
                        {userFurniture
                            .filter(item => item.room === selectedRoom)
                            .map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-800">{item.name}</div>
                                        <div className="text-sm text-gray-600">
                                            SL: {item.quantity} | Thể tích: {item.volume}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditFurniture(item)}
                                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteFurniture(item.id)}
                                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Danh sách đồ đạc có thể chọn */}
            <div>
                <h4 className="font-semibold text-gray-800 mb-3">Chọn đồ đạc:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {filteredFurniture.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => handleFurnitureSelect(item)}
                            disabled={isAddingFurniture || editingFurniture || isManualAdding}
                            className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="font-medium text-gray-800 text-sm">{item.VatDung}</div>
                            <div className="text-xs text-gray-500 mt-1">
                                {item.Modular && <span className="inline-block bg-green-100 text-green-800 px-1 rounded mr-1">Modular</span>}
                                {item.Bulky && <span className="inline-block bg-orange-100 text-orange-800 px-1 rounded">Bulky</span>}
                            </div>
                        </button>
                    ))}
                </div>
                {filteredFurniture.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        Không tìm thấy đồ đạc phù hợp
                    </div>
                )}
            </div>
        </div>
    );
};

export default FurnitureSelector;