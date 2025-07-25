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
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';

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
    const [isLiked, setIsLiked] = useState(!!feedback.isLikedByCurrentUser);
    const [isDisliked, setIsDisliked] = useState(!!feedback.isDislikedByCurrentUser);
    const [likeCount, setLikeCount] = useState(feedback.likes || 0);
    const [dislikeCount, setDislikeCount] = useState(feedback.dislikes || 0);

    const handleLike = async () => {
        if (isLiked) return; // Đã like thì không làm gì
        try {
            const response = await apiCall(`/api/customer/feedback/${feedback.feedbackId}/like`, { method: 'PATCH', auth: true });
            if (response.ok) {
                const updatedFeedback = await response.json();
                setLikeCount(updatedFeedback.likes);
                setDislikeCount(updatedFeedback.dislikes);
                setIsLiked(true);
                setIsDisliked(false);
                if (onLike) onLike(updatedFeedback);
            }
        } catch (error) {
            console.error('Error liking feedback:', error);
        }
    };

    const handleDislike = async () => {
        if (isDisliked) return; // Đã dislike thì không làm gì
        try {
            const response = await apiCall(`/api/customer/feedback/${feedback.feedbackId}/dislike`, { method: 'PATCH', auth: true });
            if (response.ok) {
                const updatedFeedback = await response.json();
                setLikeCount(updatedFeedback.likes);
                setDislikeCount(updatedFeedback.dislikes);
                setIsDisliked(true);
                setIsLiked(false);
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
                        disabled={feedback.isLike}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all ${feedback.isLike
                            ? 'bg-blue-100 text-blue-600 cursor-not-allowed opacity-60'
                            : 'bg-gray-100 text-gray-600 hover:bg-blue-50'}
                        `}
                    >
                        <ThumbsUp className={`w-4 h-4 ${feedback.isLike ? 'fill-current cursor-not-allowed opacity-60' : ''}`} />
                        <span className="text-sm">{feedback.likes}</span>
                    </button>
                    <button
                        onClick={handleDislike}
                        disabled={feedback.isDislike}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all ${feedback.isDislike
                            ? 'bg-red-100 text-red-600 cursor-not-allowed opacity-60'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-50'}
                        `}
                    >
                        <ThumbsDown className={`w-4 h-4 ${feedback.isDislike ? 'fill-current cursor-not-allowed opacity-60' : ''}`} />
                        <span className="text-sm">{feedback.dislikes}</span>
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
                {/* Hiển thị lại tên thay vì address */}
                <p className="text-gray-600 text-sm mb-2">
                    {type === 'storage' ? service.storageUnitName : service.transportUnitName}
                </p>
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

// Top 3 Bar Chart Component
const Top3BarChart = ({ data, type, onBarClick }) => {
    // Sort by averageStar desc, then pick top 3
    const sorted = [...data].sort((a, b) => b.averageStar - a.averageStar).slice(0, 3);
    // Arrange as [top2, top1, top3] for visual order
    let arranged = [];
    if (sorted.length === 3) {
        arranged = [sorted[1], sorted[0], sorted[2]];
    } else if (sorted.length === 2) {
        arranged = [sorted[1], sorted[0]];
    } else {
        arranged = sorted;
    }
    // Bar colors: [2nd, 1st, 3rd]
    const barColors = [
        '#A3A3A3', // 2nd - gray
        '#FFD700', // 1st - gold
        '#FF9800'  // 3rd - orange
    ];
    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length && payload[0].payload) {
            const item = payload[0].payload;
            const rank = sorted.findIndex(x => x === item) + 1;
            return (
                <div className="z-50">
                    <RankingCard item={item} rank={rank} type={type} />
                </div>
            );
        }
        return null;
    };
    return (
        <ResponsiveContainer width="100%" height={320}>
            <BarChart
                data={arranged}
                margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
                barCategoryGap={40}
            >
                <XAxis
                    dataKey={type === 'storage' ? 'storageUnitName' : 'transportUnitName'}
                    tick={{ fontSize: 14, fill: '#333' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                />
                <YAxis
                    domain={[0, 5]}
                    ticks={[0, 1, 2, 3, 4, 5]}
                    tick={{ fontSize: 14, fill: '#333' }}
                    label={{ value: 'Sao trung bình', angle: -90, position: 'insideLeft', fontSize: 14 }}
                />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', opacity: 0.3 }} />
                <Bar
                    dataKey="averageStar"
                    radius={[8, 8, 0, 0]}
                    onClick={(_, idx) => onBarClick(arranged[idx], type)}
                >
                    {arranged.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={barColors[idx] || '#60a5fa'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
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
    // Pagination state
    const [storagePage, setStoragePage] = useState(1);
    const [transportPage, setTransportPage] = useState(1);
    const ITEMS_PER_PAGE = 9;
    // Search state
    const [storageSearch, setStorageSearch] = useState('');
    const [transportSearch, setTransportSearch] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    // Reset page when tab changes
    useEffect(() => {
        setStoragePage(1);
        setTransportPage(1);
    }, [activeTab]);

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

    // Pagination helpers
    const getPaginatedData = (data, page) => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return data.slice(start, start + ITEMS_PER_PAGE);
    };
    const getTotalPages = (data) => Math.ceil(data.length / ITEMS_PER_PAGE);

    // Lọc dữ liệu theo search
    const filteredStorages = allStorages.filter(s =>
        (s.storageUnitName || '').toLowerCase().includes(storageSearch.toLowerCase())
    );
    const filteredTransports = allTransports.filter(t =>
        (t.transportUnitName || '').toLowerCase().includes(transportSearch.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

            {/* Navigation Tabs */}
            <section className="">
                <div className="container mx-auto ">
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
            <section className="">
                <div className="container mx-auto   ">
                    {activeTab === 'ranking' && (
                        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                            {/* Top Storage Bar Chart */}
                            <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
                                    <Package className="w-7 h-7 text-green-500" />
                                    Top 3 Kho Bãi Nổi Bật
                                </h2>
                                <Top3BarChart
                                    data={topStorages}
                                    type="storage"
                                    onBarClick={handleServiceClick}
                                />
                            </div>
                            {/* Top Transport Bar Chart */}
                            <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
                                    <Truck className="w-7 h-7 text-orange-500" />
                                    Top 3 Đơn Vị Vận Chuyển Nổi Bật
                                </h2>
                                <Top3BarChart
                                    data={topTransports}
                                    type="transport"
                                    onBarClick={handleServiceClick}
                                />
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
                            {/* Search bar on top */}
                            <div className="mb-6">
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                                    placeholder="Tìm kiếm theo tên kho bãi..."
                                    value={storageSearch}
                                    onChange={e => {
                                        setStorageSearch(e.target.value);
                                        setStoragePage(1);
                                    }}
                                />
                            </div>
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {getPaginatedData(filteredStorages, storagePage).map((storage) => (
                                        <ServiceCard
                                            key={storage.storageId}
                                            service={storage}
                                            type="storage"
                                            onClick={handleServiceClick}
                                        />
                                    ))}
                                </div>
                            </div>
                            {/* Pagination controls */}
                            {getTotalPages(filteredStorages) > 1 && (
                                <div className="flex justify-center mt-8 gap-2">
                                    <button
                                        className="px-3 py-1 rounded-lg border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                        onClick={() => setStoragePage((p) => Math.max(1, p - 1))}
                                        disabled={storagePage === 1}
                                    >
                                        Trước
                                    </button>
                                    {Array.from({ length: getTotalPages(filteredStorages) }, (_, i) => (
                                        <button
                                            key={i}
                                            className={`px-3 py-1 rounded-lg border ${storagePage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                                            onClick={() => setStoragePage(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        className="px-3 py-1 rounded-lg border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                        onClick={() => setStoragePage((p) => Math.min(getTotalPages(filteredStorages), p + 1))}
                                        disabled={storagePage === getTotalPages(filteredStorages)}
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                            {/* Tổng số kho bãi */}
                            <div className="text-center text-gray-600 mt-4">
                                Tổng số kho bãi: {filteredStorages.length}
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
                            {/* Search bar on top */}
                            <div className="mb-6">
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                                    placeholder="Tìm kiếm theo tên vận chuyển..."
                                    value={transportSearch}
                                    onChange={e => {
                                        setTransportSearch(e.target.value);
                                        setTransportPage(1);
                                    }}
                                />
                            </div>
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {getPaginatedData(filteredTransports, transportPage).map((transport) => (
                                        <ServiceCard
                                            key={transport.transportId}
                                            service={transport}
                                            type="transport"
                                            onClick={handleServiceClick}
                                        />
                                    ))}
                                </div>
                            </div>
                            {/* Pagination controls */}
                            {getTotalPages(filteredTransports) > 1 && (
                                <div className="flex justify-center mt-8 gap-2">
                                    <button
                                        className="px-3 py-1 rounded-lg border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                        onClick={() => setTransportPage((p) => Math.max(1, p - 1))}
                                        disabled={transportPage === 1}
                                    >
                                        Trước
                                    </button>
                                    {Array.from({ length: getTotalPages(filteredTransports) }, (_, i) => (
                                        <button
                                            key={i}
                                            className={`px-3 py-1 rounded-lg border ${transportPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                                            onClick={() => setTransportPage(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        className="px-3 py-1 rounded-lg border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                        onClick={() => setTransportPage((p) => Math.min(getTotalPages(filteredTransports), p + 1))}
                                        disabled={transportPage === getTotalPages(filteredTransports)}
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                            {/* Tổng số vận chuyển */}
                            <div className="text-center text-gray-600 mt-4">
                                Tổng số đơn vị vận chuyển: {filteredTransports.length}
                            </div>
                        </div>
                    )}
                </div>
            </section>
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