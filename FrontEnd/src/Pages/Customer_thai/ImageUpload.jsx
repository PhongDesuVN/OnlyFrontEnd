import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { apiCall } from '../../utils/api';

const ImageUpload = ({ onFurnitureDetected, room }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [detectedObjects, setDetectedObjects] = useState([]);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            setError('Vui lòng chọn một tệp hình ảnh');
            setSelectedFile(null);
            setPreview(null);
        } else {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setError('Vui lòng chọn một tệp hình ảnh');
            return;
        }
        setLoading(true);
        setError(null);
        setDetectedObjects([]);
        
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        try {
            // Không cần lấy token và headers thủ công nữa
            const response = await apiCall('/api/customer/all-dimensions', {
                method: 'POST',
                body: formData,
                auth: true
            });
            
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                setError(errData.message || 'Lỗi khi phân tích hình ảnh');
                setLoading(false);
                return;
            }
            
            const result = await response.json();
            setDetectedObjects(result.objects || []);
            
            // Send detected furniture to parent component
            if (onFurnitureDetected && result.objects) {
                const furnitureItems = result.objects.map(obj => ({
                    name: obj.objectName,
                    room: room,
                    quantity: 1,
                    volume: (obj.length * obj.width * obj.height / 1000000).toFixed(2), // Calculate volume in m³
                    weight: 0, // Default weight
                    modular: false,
                    bulky: obj.length > 100 || obj.width > 100 || obj.height > 100
                }));
                onFurnitureDetected(furnitureItems);
            }
            
            setError(null);
        } catch (err) {
            setError('Lỗi khi phân tích hình ảnh: ' + (err.message || ''));
            setDetectedObjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAll = () => {
        if (onFurnitureDetected && detectedObjects.length > 0) {
            const furnitureItems = detectedObjects.map(obj => ({
                name: obj.objectName,
                room: room,
                quantity: 1,
                volume: (obj.length * obj.width * obj.height / 1000000).toFixed(2), // Calculate volume in m³
                weight: 0, // Default weight
                modular: false,
                bulky: obj.length > 100 || obj.width > 100 || obj.height > 100
            }));
            onFurnitureDetected(furnitureItems);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Nhận diện đồ đạc trong {room}</h2>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tải lên hình ảnh căn phòng
                </label>
                <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                />
            </div>

            {preview && (
                <div className="mb-4">
                    <img
                        src={preview}
                        alt="Preview"
                        className="max-w-full h-auto rounded-lg shadow-sm"
                    />
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={loading || !selectedFile}
                className={`w-full py-2 px-4 rounded-md text-white font-semibold
                ${loading || !selectedFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
                {loading ? 'Đang phân tích...' : 'Phân tích hình ảnh'}
            </button>

            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {detectedObjects.length > 0 && (
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Đồ đạc được phát hiện</h3>
                        <button 
                            onClick={handleAddAll}
                            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                        >
                            Thêm tất cả
                        </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {detectedObjects.map((object, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="font-medium">{object.objectName}</p>
                                <div className="text-sm text-gray-600 mt-1 grid grid-cols-3 gap-2">
                                    <span>Dài: {object.length} cm</span>
                                    <span>Rộng: {object.width} cm</span>
                                    <span>Cao: {object.height} cm</span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Độ tin cậy: {(object.confidence * 100).toFixed(2)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;