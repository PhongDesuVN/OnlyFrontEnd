import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Search, Calendar, Truck, Package, Filter } from 'lucide-react';
import { apiCall } from '../../utils/api';
import RequireAuth from '../../Components/RequireAuth';
import { useFeedbackStore } from './store';

const RatingStars = ({ rating, size = "w-4 h-4" }) => (
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

const FeedbackCard = ({ feedback, onLike, onDislike }) => {
    const { setHistoryFeedbacks } = useFeedbackStore();
    const [isLiked, setIsLiked] = useState(!!feedback.isLike);
    const [isDisliked, setIsDisliked] = useState(!!feedback.isDislike);
    const [likeCount, setLikeCount] = useState(feedback.likes || 0);
    const [dislikeCount, setDislikeCount] = useState(feedback.dislikes || 0);
    const [loading, setLoading] = useState(false);

    const handleLike = async () => {
        if (isLiked || loading) return;
        setLoading(true);
        try {
            const response = await apiCall(`/api/customer/feedback/${feedback.feedbackId}/like`, { method: 'PATCH', auth: true });
            if (response.ok) {
                const updated = await response.json();
                setLikeCount(updated.likes);
                setDislikeCount(updated.dislikes);
                setIsLiked(true);
                setIsDisliked(false);
                setHistoryFeedbacks((prev) =>
                    prev.map((fb) =>
                        fb.feedbackId === feedback.feedbackId ? { ...fb, ...updated } : fb
                    )
                );
                if (onLike) onLike(feedback.feedbackId, updated);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDislike = async () => {
        if (isDisliked || loading) return;
        setLoading(true);
        try {
            const response = await apiCall(`/api/customer/feedback/${feedback.feedbackId}/dislike`, { method: 'PATCH', auth: true });
            if (response.ok) {
                const updated = await response.json();
                setLikeCount(updated.likes);
                setDislikeCount(updated.dislikes);
                setIsDisliked(true);
                setIsLiked(false);
                setHistoryFeedbacks((prev) =>
                    prev.map((fb) =>
                        fb.feedbackId === feedback.feedbackId ? { ...fb, ...updated } : fb
                    )
                );
                if (onDislike) onDislike(feedback.feedbackId, updated);
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${feedback.type === 'STORAGE' ? 'bg-green-100' : 'bg-orange-100'}`}>
                        {feedback.type === 'STORAGE' ? <Package className="w-6 h-6 text-green-600" /> : <Truck className="w-6 h-6 text-orange-600" />}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800">{feedback.type === 'STORAGE' ? 'Kho hàng' : 'Vận chuyển'}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(feedback.createdAt)}</span>
                        </div>
                    </div>
                </div>
                <RatingStars rating={feedback.star} />
            </div>
            <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{feedback.content}</p>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleLike}
                        disabled={isLiked || loading}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all ${isLiked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-blue-50'} ${isLiked || loading ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                        <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{likeCount}</span>
                    </button>
                    <button
                        onClick={handleDislike}
                        disabled={isDisliked || loading}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all ${isDisliked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50'} ${isDisliked || loading ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                        <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{dislikeCount}</span>
                    </button>
                </div>
                <div className="text-sm text-gray-500">Đơn hàng: #{feedback.bookingId}</div>
            </div>
        </div>
    );
};

const C_History = () => {
    const { historyFeedbacks } = useFeedbackStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showTypeFilter, setShowTypeFilter] = useState(false);
    const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, STORAGE, TRANSPORT
    const [sortOption, setSortOption] = useState('createdAt-desc');

    useEffect(() => {
        const { historyFeedbacks, setHistoryFeedbacks } = useFeedbackStore.getState();
        let isFirstLoad = historyFeedbacks.length === 0;

        if (isFirstLoad) setLoading(true);

        const fetchFeedbacks = async () => {
            try {
                const response = await apiCall('/api/customer/feedback/myfeedbacks', { auth: true });
                if (response.ok) {
                    const data = await response.json();
                    setHistoryFeedbacks(Array.isArray(data) ? data : []);
                } else {
                    setError('Lỗi khi tải dữ liệu feedback');
                }
            } catch (err) {
                setError('Có lỗi xảy ra khi tải feedback');
            } finally {
                if (isFirstLoad) setLoading(false);
            }
        };

        if (isFirstLoad) fetchFeedbacks();
    }, [setLoading, setError]);

    // Filter feedbacks
    let filteredFeedbacks = historyFeedbacks.filter(fb => fb.type !== 'STAFF');
    if (typeFilter === 'STORAGE') filteredFeedbacks = filteredFeedbacks.filter(fb => fb.type === 'STORAGE');
    if (typeFilter === 'TRANSPORT') filteredFeedbacks = filteredFeedbacks.filter(fb => fb.type === 'TRANSPORT' || fb.type === 'TRANSPORTATION');
    filteredFeedbacks = filteredFeedbacks.filter(fb =>
        fb.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.bookingId.toString().includes(searchTerm)
    );

    // Sort
    filteredFeedbacks = filteredFeedbacks.slice().sort((a, b) => {
        switch (sortOption) {
            case 'createdAt-desc': return new Date(b.createdAt) - new Date(a.createdAt);
            case 'createdAt-asc': return new Date(a.createdAt) - new Date(b.createdAt);
            case 'likes-desc': return (b.likes || 0) - (a.likes || 0);
            case 'likes-asc': return (a.likes || 0) - (b.likes || 0);
            case 'star-desc': return (b.star || 0) - (a.star || 0);
            case 'star-asc': return (a.star || 0) - (b.star || 0);
            default: return 0;
        }
    });

    const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredFeedbacks.slice(indexOfFirstItem, indexOfLastItem);

    const Pagination = () => {
        if (totalPages <= 1) return null;
        return (
            <div className="flex justify-center mt-8 gap-2">
                <button
                    className="px-3 py-1 rounded-lg border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        className={`px-3 py-1 rounded-lg border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
                <button
                    className="px-3 py-1 rounded-lg border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                >
                    Sau
                </button>
            </div>
        );
    };

    return (
        <RequireAuth allowedRoles={["CUSTOMER"]}>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Nhật ký hoạt động</h1>
                    <p className="text-gray-600 mb-6">Lịch sử đánh giá và tương tác của bạn</p>
                    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                        <div className="relative w-full md:w-1/3">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo nội dung hoặc mã đơn hàng..."
                                value={searchTerm}
                                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg pl-10"
                            />
                            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <button
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center space-x-1"
                                    onClick={() => setShowTypeFilter(v => !v)}
                                >
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <span>Lọc</span>
                                </button>
                                {showTypeFilter && (
                                    <div className="absolute right-0 top-full mt-2 z-10 bg-white rounded-xl shadow-lg border border-gray-200 w-48 p-3">
                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-center gap-2">
                                                <input type="radio" name="typeFilter" value="ALL" checked={typeFilter === 'ALL'} onChange={() => { setTypeFilter('ALL'); setCurrentPage(1); setShowTypeFilter(false); }} />
                                                <span>Tất cả</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="radio" name="typeFilter" value="STORAGE" checked={typeFilter === 'STORAGE'} onChange={() => { setTypeFilter('STORAGE'); setCurrentPage(1); setShowTypeFilter(false); }} />
                                                <span>Kho hàng</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="radio" name="typeFilter" value="TRANSPORT" checked={typeFilter === 'TRANSPORT'} onChange={() => { setTypeFilter('TRANSPORT'); setCurrentPage(1); setShowTypeFilter(false); }} />
                                                <span>Vận chuyển</span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <select
                                value={sortOption}
                                onChange={e => { setSortOption(e.target.value); setCurrentPage(1); }}
                                className="border border-gray-300 rounded-lg px-2 py-2 bg-white"
                            >
                                <option value="createdAt-desc">Mới nhất</option>
                                <option value="createdAt-asc">Cũ nhất</option>
                                <option value="likes-desc">Nhiều like nhất</option>
                                <option value="likes-asc">Ít like nhất</option>
                                <option value="star-desc">Tích cực nhất</option>
                                <option value="star-asc">Tiêu cực nhất</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        {loading && historyFeedbacks.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-3 text-gray-600">Đang tải dữ liệu...</p>
                            </div>
                        ) : error ? (
                            <div className="py-12 text-center">
                                <div className="bg-red-100 p-4 rounded-lg">
                                    <p className="text-red-600">{error}</p>
                                </div>
                            </div>
                        ) : filteredFeedbacks.length === 0 ? (
                            <div className="py-12 text-center">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Không tìm thấy đánh giá nào</h3>
                                <p className="text-gray-500">Bạn chưa có đánh giá nào phù hợp với tiêu chí tìm kiếm.</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-6">
                                    {currentItems.map(feedback => (
                                        <FeedbackCard
                                            key={feedback.feedbackId}
                                            feedback={feedback}
                                            onLike={() => {}}
                                            onDislike={() => {}}
                                        />
                                    ))}
                                </div>
                                <Pagination />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </RequireAuth>
    );
};

export default C_History;