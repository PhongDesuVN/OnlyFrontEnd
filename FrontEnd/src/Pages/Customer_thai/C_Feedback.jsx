import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageCircle, User, Calendar, Truck, Package, Users, TrendingUp, Award, Eye, Heart, Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiCall } from '../../utils/api';
import {
    getTopStorages,
    getTopTransports,
    getAllStorageWithFeedbacks,
    getAllTransportWithFeedbacks,
    getFeedbacksByStorageId,
    getFeedbacksByTransportId
} from './feedbackDataService';

const RatingStars = ({ rating, size = "w-4 h-4" }) => {
    return (
        <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`${size} ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
            ))}
            <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
        </div>
    );
};

const FeedbackCard = ({ feedback, onLike, onDislike }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [likeCount, setLikeCount] = useState(feedback.likes || 0);
    const [dislikeCount, setDislikeCount] = useState(feedback.dislikes || 0);

    const handleLike = async () => {
        try {
            const response = await apiCall(`/api/customer/feedback/${feedback.feedbackId}/like`, { auth: true });

            if (response.ok) {
                const updatedFeedback = await response.json();
                setLikeCount(updatedFeedback.likes);
                setDislikeCount(updatedFeedback.dislikes);
                setIsLiked(!isLiked);
                if (isDisliked) setIsDisliked(false);
                if (onLike) onLike(updatedFeedback);
            }
        } catch (error) {
            console.error('Error liking feedback:', error);
        }
    };

    const handleDislike = async () => {
        try {
            const response = await apiCall(`/api/customer/feedback/${feedback.feedbackId}/dislike`, { auth: true });

            if (response.ok) {
                const updatedFeedback = await response.json();
                setLikeCount(updatedFeedback.likes);
                setDislikeCount(updatedFeedback.dislikes);
                setIsDisliked(!isDisliked);
                if (isLiked) setIsLiked(false);
                if (onDislike) onDislike(updatedFeedback);
            }
        } catch (error) {
            console.error('Error disliking feedback:', error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <img
                        src={feedback.customerImage || '/default-avatar.png'}
                        alt={feedback.customerFullName || 'Khách hàng'}
                        className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                        <h4 className="font-semibold text-gray-800">{feedback.customerFullName || 'Khách hàng'}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(feedback.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                    </div>
                </div>
                <RatingStars rating={feedback.rating} />
            </div>

            <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{feedback.content}</p>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleLike}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all ${isLiked
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-blue-50'
                            }`}
                    >
                        <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{likeCount}</span>
                    </button>

                    <button
                        onClick={handleDislike}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all ${isDisliked
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                            }`}
                    >
                        <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{dislikeCount}</span>
                    </button>
                </div>

                <div className="text-sm text-gray-500">
                    Đơn hàng: #{feedback.bookingId}
                </div>
            </div>
        </div>
    );
};

const RankingCard = ({ item, rank, type }) => {
    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <Award className="w-6 h-6 text-yellow-500" />;
            case 2: return <Award className="w-6 h-6 text-gray-400" />;
            case 3: return <Award className="w-6 h-6 text-orange-600" />;
            default: return <TrendingUp className="w-6 h-6 text-blue-500" />;
        }
    };

    const getTypeIcon = (type) => {
        return type === 'storage' ? <Package className="w-6 h-6 text-green-500" /> : <Truck className="w-6 h-6 text-orange-500" />;
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        {getRankIcon(rank)}
                        <span className="text-2xl font-bold text-gray-800">#{rank}</span>
                    </div>
                    {getTypeIcon(type)}
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">Tổng like</div>
                    <div className="text-2xl font-bold text-blue-600">{item.totalLikes}</div>
                </div>
            </div>

            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {type === 'storage' ? item.storageUnitName : item.transportUnitName}
                </h3>
                <p className="text-gray-600 text-sm">{item.address || 'Địa chỉ không có sẵn'}</p>
            </div>

            <div className="flex items-center justify-between">
                <RatingStars rating={Math.round(item.averageStar)} />
                <div className="text-sm text-gray-500">
                    {item.totalFeedbacks} đánh giá
                </div>
            </div>
        </div>
    );
};

const ServiceCard = ({ service, type, onClick }) => {
    const getTypeIcon = (type) => {
        return type === 'storage' ? <Package className="w-6 h-6 text-green-500" /> : <Truck className="w-6 h-6 text-orange-500" />;
    };

    return (
        <div
            className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={() => onClick(service, type)}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    {getTypeIcon(type)}
                    <h3 className="text-lg font-semibold text-gray-800">
                        {type === 'storage' ? service.storageUnitName : service.transportUnitName}
                    </h3>
                </div>
                <Eye className="w-5 h-5 text-gray-400" />
            </div>

            <div className="mb-4">
                <p className="text-gray-600 text-sm mb-2">{service.address || 'Địa chỉ không có sẵn'}</p>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Đánh giá trung bình:</span>
                    <div className="flex items-center">
                        <RatingStars rating={Math.round(service.averageStar)} size="w-3 h-3" />
                        <span className="ml-1 text-gray-600">({service.averageStar.toFixed(1)}/5)</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{service.totalFeedbacks} đánh giá</span>
                <span>{service.totalLikes} lượt thích</span>
            </div>
        </div>
    );
};

const FeedbackModal = ({ isOpen, onClose, service, type, feedbacks, onFeedbackCreated }) => {
    const navigate = useNavigate();
    if (!isOpen || !service) return null;
    const getTypeIcon = (type) => {
        return type === 'storage' ? <Package className="w-6 h-6 text-green-500" /> : <Truck className="w-6 h-6 text-orange-500" />;
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            {getTypeIcon(type)}
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    {type === 'storage' ? service.storageUnitName : service.transportUnitName}
                                </h3>
                                <p className="text-gray-600">{service.address || 'Địa chỉ không có sẵn'}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                        <div className="mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600">Đánh giá trung bình</div>
                                    <div className="text-2xl font-bold text-blue-600">{service.averageStar.toFixed(1)}/5</div>
                                    <RatingStars rating={Math.round(service.averageStar)} />
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600">Tổng đánh giá</div>
                                    <div className="text-2xl font-bold text-green-600">{service.totalFeedbacks}</div>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600">Tổng lượt thích</div>
                                    <div className="text-2xl font-bold text-orange-600">{service.totalLikes}</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-semibold text-gray-800">Tất cả đánh giá</h4>
                        {/* Đã xóa nút Tạo đánh giá */}
                        </div>
                        <div className="space-y-4">
                            {feedbacks && feedbacks.length > 0 ? (
                                feedbacks.map((feedback) => (
                                    <FeedbackCard
                                        key={feedback.feedbackId}
                                        feedback={feedback}
                                        onLike={() => onFeedbackCreated && onFeedbackCreated()}
                                        onDislike={() => onFeedbackCreated && onFeedbackCreated()}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>Chưa có đánh giá nào cho {type === 'storage' ? 'kho' : 'đơn vị vận chuyển'} này</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
    );
};

const C_Feedback = ({ hideNavbar }) => {
    const [isLoggedIn] = useState(true);
    const [activeTab, setActiveTab] = useState('ranking');
    const [topStorages, setTopStorages] = useState([]);
    const [topTransports, setTopTransports] = useState([]);
    const [allStorages, setAllStorages] = useState([]);
    const [allTransports, setAllTransports] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [serviceFeedbacks, setServiceFeedbacks] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Sử dụng các hàm mới thay cho API cũ
            const [topStorageData, topTransportData, allStorageData, allTransportData] = await Promise.all([
                getTopStorages(),
                getTopTransports(),
                getAllStorageWithFeedbacks(),
                getAllTransportWithFeedbacks()
            ]);
            setTopStorages(topStorageData);
            setTopTransports(topTransportData);
            setAllStorages(allStorageData);
            setAllTransports(allTransportData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleServiceClick = async (service, type) => {
        try {
            let feedbacks = [];
            if (type === 'storage') {
                feedbacks = await getFeedbacksByStorageId(service.storageId);
            } else {
                feedbacks = await getFeedbacksByTransportId(service.transportId);
            }
            setServiceFeedbacks(feedbacks);
            setSelectedService(service);
            setSelectedType(type);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching service feedbacks:', error);
        }
    };

    const handleFeedbackCreated = () => {
        // Refresh the current service feedbacks
        if (selectedService && selectedType) {
            handleServiceClick(selectedService, selectedType);
        }
    };

    const handleLogout = () => {
        console.log('Đăng xuất');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

            {/* Hero Section */}
            <section className="pt-24 pb-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Đánh Giá & Xếp Hạng
                    </h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        Khám phá bảng xếp hạng và đánh giá chi tiết của các dịch vụ vận chuyển và kho bãi
                    </p>
                </div>
            </section>

            {/* Navigation Tabs */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center mb-8">
                        <div className="bg-white rounded-xl p-2 shadow-lg">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setActiveTab('ranking')}
                                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'ranking'
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <TrendingUp className="w-5 h-5" />
                                        <span>Bảng Xếp Hạng</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('storage')}
                                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'storage'
                                            ? 'bg-green-600 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Package className="w-5 h-5" />
                                        <span>Kho Bãi</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('transport')}
                                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'transport'
                                            ? 'bg-orange-600 text-white shadow-lg'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Truck className="w-5 h-5" />
                                        <span>Vận Chuyển</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Sections */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    {activeTab === 'ranking' && (
                        <div className="space-y-12">
                            {/* Top Storage Rankings */}
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                                    <div className="flex items-center justify-center space-x-3">
                                        <Package className="w-8 h-8 text-green-500" />
                                        <span>Top 3 Kho Bãi Nổi Bật</span>
                                    </div>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {topStorages.map((storage, index) => (
                                        <div
                                            key={storage.storageId}
                                            className="cursor-pointer"
                                            onClick={() => handleServiceClick(storage, 'storage')}
                                        >
                                            <RankingCard 
                                                item={storage} 
                                                rank={index + 1} 
                                                type="storage" 
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Transport Rankings */}
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                                    <div className="flex items-center justify-center space-x-3">
                                        <Truck className="w-8 h-8 text-orange-500" />
                                        <span>Top 3 Đơn Vị Vận Chuyển Nổi Bật</span>
                                    </div>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {topTransports.map((transport, index) => (
                                        <div
                                            key={transport.transportId}
                                            className="cursor-pointer"
                                            onClick={() => handleServiceClick(transport, 'transport')}
                                        >
                                            <RankingCard 
                                                item={transport} 
                                                rank={index + 1} 
                                                type="transport" 
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'storage' && (
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                                <div className="flex items-center justify-center space-x-3">
                                    <Package className="w-8 h-8 text-green-500" />
                                    <span>Tất Cả Kho Bãi</span>
                                </div>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {allStorages.map((storage) => (
                                    <ServiceCard
                                        key={storage.storageId}
                                        service={storage}
                                        type="storage"
                                        onClick={handleServiceClick}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'transport' && (
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                                <div className="flex items-center justify-center space-x-3">
                                    <Truck className="w-8 h-8 text-orange-500" />
                                    <span>Tất Cả Đơn Vị Vận Chuyển</span>
                                </div>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {allTransports.map((transport) => (
                                    <ServiceCard
                                        key={transport.transportId}
                                        service={transport}
                                        type="transport"
                                        onClick={handleServiceClick}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Chia Sẻ Trải Nghiệm Của Bạn
                    </h2>
                    <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                        Đánh giá của bạn rất quan trọng để chúng tôi cải thiện dịch vụ
                    </p>
                    <Link to="/C_HomePage">
                        <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg">
                            Đặt Dịch Vụ Ngay
                        </button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">Vận Chuyển Nhà</h3>
                            <p className="text-gray-300">
                                Dịch vụ vận chuyển chuyên nghiệp, an toàn và đáng tin cậy.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Dịch Vụ</h4>
                            <ul className="space-y-2 text-gray-300">
                                <li>Vận chuyển nhà</li>
                                <li>Kho bãi lưu trữ</li>
                                <li>Đóng gói đồ đạc</li>
                                <li>Bảo hiểm hàng hóa</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Hỗ Trợ</h4>
                            <ul className="space-y-2 text-gray-300">
                                <li>Trung tâm trợ giúp</li>
                                <li>Liên hệ</li>
                                <li>FAQ</li>
                                <li>Chính sách</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Liên Hệ</h4>
                            <div className="space-y-2 text-gray-300">
                                <p>Hotline: 1900-1234</p>
                                <p>Email: info@vanchuyen.com</p>
                                <p>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
                        <p>&copy; 2025 Vận Chuyển Nhà. Tất cả quyền được bảo lưu.</p>
                    </div>
                </div>
            </footer>

            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedService(null);
                    setSelectedType(null);
                    setServiceFeedbacks([]);
                }}
                service={selectedService}
                type={selectedType}
                feedbacks={serviceFeedbacks}
                onFeedbackCreated={handleFeedbackCreated}
            />
        </div>
    );
};

export default C_Feedback; 