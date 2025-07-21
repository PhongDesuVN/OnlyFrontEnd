import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Search, Calendar, Truck, Package, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowDown, ArrowUp, Filter } from 'lucide-react';
import { apiCall } from '../../utils/api';
import RequireAuth from '../../Components/RequireAuth';
import { likeFeedback, dislikeFeedback } from './feedbackDataService';

// Component hiển thị số sao đánh giá
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

// Component card hiển thị feedback
const FeedbackCard = ({ feedback, onLike, onDislike }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [likeCount, setLikeCount] = useState(feedback.likes || 0);
    const [dislikeCount, setDislikeCount] = useState(feedback.dislikes || 0);

    const handleLike = async () => {
        try {
            const updatedFeedback = await likeFeedback(feedback.feedbackId);
            setLikeCount(updatedFeedback.likes);
            setDislikeCount(updatedFeedback.dislikes);
            setIsLiked(!isLiked);
            if (isDisliked) setIsDisliked(false);
            if (onLike) onLike(updatedFeedback);
        } catch (error) {
            console.error('Error liking feedback:', error);
        }
    };

    const handleDislike = async () => {
        try {
            const updatedFeedback = await dislikeFeedback(feedback.feedbackId);
            setLikeCount(updatedFeedback.likes);
            setDislikeCount(updatedFeedback.dislikes);
            setIsDisliked(!isDisliked);
            if (isLiked) setIsLiked(false);
            if (onDislike) onDislike(updatedFeedback);
        } catch (error) {
            console.error('Error disliking feedback:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${feedback.type === 'STORAGE' ? 'bg-green-100' : 'bg-orange-100'}`}>
                        {feedback.type === 'STORAGE' ? 
                            <Package className="w-6 h-6 text-green-600" /> : 
                            <Truck className="w-6 h-6 text-orange-600" />
                        }
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800">
                            {feedback.type === 'STORAGE' ? 'Kho hàng' : 'Vận chuyển'}
                        </h4>
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

// Component chính
const C_History = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [sortField, setSortField] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterType, setFilterType] = useState({
        STORAGE: true,
        TRANSPORT: true
    });
    const [filterStars, setFilterStars] = useState({
        1: true, 2: true, 3: true, 4: true, 5: true
    });

    // Fetch dữ liệu feedback từ API
    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                setLoading(true);
                const response = await apiCall('/api/customer/feedback/myfeedbacks', { auth: true });
                if (response.ok) {
                    const data = await response.json();
                    console.log('Feedback data:', data);
                    setFeedbacks(Array.isArray(data) ? data : []);
                    setError(null);
                } else {
                    const errorText = await response.text();
                    setError(`Lỗi khi tải dữ liệu: ${errorText}`);
                }
            } catch (error) {
                console.error('Error fetching feedbacks:', error);
                setError('Có lỗi xảy ra khi tải nhật ký hoạt động');
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, []);

    // Lọc và sắp xếp feedbacks khi các state thay đổi
    useEffect(() => {
        // Lọc theo term tìm kiếm
        let filtered = feedbacks.filter(feedback => 
            feedback.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            feedback.bookingId.toString().includes(searchTerm)
        );

        // Lọc theo loại feedback
        filtered = filtered.filter(feedback => 
            (feedback.type === 'STORAGE' && filterType.STORAGE) ||
            (feedback.type === 'TRANSPORT' && filterType.TRANSPORT)
        );

        // Lọc theo số sao
        filtered = filtered.filter(feedback => filterStars[feedback.star]);

        // Sắp xếp
        filtered.sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            // Xử lý đặc biệt cho một số trường
            if (sortField === 'createdAt') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            }

            // Sắp xếp tăng/giảm dần
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredFeedbacks(filtered);
        // Reset về trang 1 khi thay đổi bộ lọc
        setCurrentPage(1);
    }, [feedbacks, searchTerm, sortField, sortOrder, filterType, filterStars]);

    // Xử lý thay đổi sắp xếp
    const handleSort = (field) => {
        if (sortField === field) {
            // Đảo ngược thứ tự nếu click vào cùng trường đang sắp xếp
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // Thay đổi trường sắp xếp và mặc định thứ tự giảm dần
            setSortField(field);
            setSortOrder('desc');
        }
    };

    // Xử lý khi like/dislike feedback
    const handleFeedbackUpdated = (updatedFeedback) => {
        const newFeedbacks = feedbacks.map(fb => 
            fb.feedbackId === updatedFeedback.feedbackId ? { ...fb, ...updatedFeedback } : fb
        );
        setFeedbacks(newFeedbacks);
    };

    // Tính toán phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredFeedbacks.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);

    // Component thanh phân trang
    const Pagination = () => {
        // Không hiển thị phân trang nếu chỉ có 1 trang
        if (totalPages <= 1) return null;
        
        return (
            <div className="flex justify-center mt-8 space-x-2">
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Hiển thị 5 trang xung quanh trang hiện tại
                    let pageNum;
                    if (totalPages <= 5) {
                        // Nếu tổng số trang <= 5, hiển thị tất cả
                        pageNum = i + 1;
                    } else if (currentPage <= 3) {
                        // Nếu trang hiện tại gần đầu
                        pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                        // Nếu trang hiện tại gần cuối
                        pageNum = totalPages - 4 + i;
                    } else {
                        // Trang hiện tại ở giữa
                        pageNum = currentPage - 2 + i;
                    }

                    return (
                        <button 
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-4 py-2 rounded-lg ${
                                currentPage === pageNum 
                                ? 'bg-blue-600 text-white' 
                                : 'border border-gray-300 bg-white text-gray-700'
                            }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}
                
                <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        );
    };

    return (
        <RequireAuth allowedRoles={["CUSTOMER"]}>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Nhật ký hoạt động</h1>
                        <p className="text-gray-600 mb-6">Lịch sử đánh giá và tương tác của bạn</p>
                        
                        {/* Thanh tìm kiếm và lọc */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
                            <div className="relative w-full md:w-1/3">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo nội dung hoặc mã đơn hàng..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg pl-10"
                                />
                                <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            </div>

                            <div className="flex items-center space-x-2">
                                {/* Sắp xếp */}
                                <div className="relative">
                                    <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg flex items-center space-x-1">
                                        <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                                        <span>Sắp xếp</span>
                                    </button>
                                    <div className="absolute right-0 top-full mt-2 z-10 bg-white rounded-xl shadow-lg border border-gray-200 w-60 p-3 hidden group-hover:block">
                                        <div className="p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={() => handleSort('createdAt')}>
                                            <div className="flex items-center justify-between">
                                                <span>Ngày tạo</span>
                                                {sortField === 'createdAt' && (
                                                    sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={() => handleSort('star')}>
                                            <div className="flex items-center justify-between">
                                                <span>Số sao</span>
                                                {sortField === 'star' && (
                                                    sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={() => handleSort('likes')}>
                                            <div className="flex items-center justify-between">
                                                <span>Lượt thích (cao đến thấp)</span>
                                                {sortField === 'likes' && sortOrder === 'desc' && <ArrowDown className="w-4 h-4" />}
                                            </div>
                                        </div>
                                        <div className="p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={() => handleSort('dislikes')}>
                                            <div className="flex items-center justify-between">
                                                <span>Lượt không thích (cao đến thấp)</span>
                                                {sortField === 'dislikes' && sortOrder === 'desc' && <ArrowDown className="w-4 h-4" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dropdown để lọc theo loại */}
                                <div className="dropdown inline-block relative group">
                                    <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg flex items-center space-x-1">
                                        <Filter className="w-4 h-4 text-gray-500" />
                                        <span>Lọc</span>
                                    </button>
                                    <div className="absolute right-0 top-full mt-2 z-10 bg-white rounded-xl shadow-lg border border-gray-200 w-60 p-3 hidden group-hover:block">
                                        <div className="p-2">
                                            <div className="font-medium mb-2">Loại đánh giá</div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <input
                                                    type="checkbox"
                                                    id="storage-checkbox"
                                                    checked={filterType.STORAGE}
                                                    onChange={() => setFilterType(prev => ({ ...prev, STORAGE: !prev.STORAGE }))}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                                />
                                                <label htmlFor="storage-checkbox" className="flex items-center">
                                                    <Package className="w-4 h-4 text-green-600 mr-1" /> Kho hàng
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="transport-checkbox"
                                                    checked={filterType.TRANSPORT}
                                                    onChange={() => setFilterType(prev => ({ ...prev, TRANSPORT: !prev.TRANSPORT }))}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                                />
                                                <label htmlFor="transport-checkbox" className="flex items-center">
                                                    <Truck className="w-4 h-4 text-orange-600 mr-1" /> Vận chuyển
                                                </label>
                                            </div>
                                        </div>
                                        <hr className="my-2" />
                                        <div className="p-2">
                                            <div className="font-medium mb-2">Số sao</div>
                                            <div className="space-y-1">
                                                {[5, 4, 3, 2, 1].map(star => (
                                                    <div key={star} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`star-${star}`}
                                                            checked={filterStars[star]}
                                                            onChange={() => setFilterStars(prev => ({ ...prev, [star]: !prev[star] }))}
                                                            className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                                        />
                                                        <label htmlFor={`star-${star}`} className="flex items-center">
                                                            {Array.from({ length: star }).map((_, i) => (
                                                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                                            ))}
                                                            {Array.from({ length: 5 - star }).map((_, i) => (
                                                                <Star key={i + star} className="w-4 h-4 text-gray-300" />
                                                            ))}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hiển thị số lượng kết quả */}
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-gray-600">
                                Hiển thị {filteredFeedbacks.length > 0 ? indexOfFirstItem + 1 : 0}-
                                {Math.min(indexOfLastItem, filteredFeedbacks.length)} của {filteredFeedbacks.length} kết quả
                            </p>
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-600">Sắp xếp theo:</span>
                                <select
                                    value={`${sortField}-${sortOrder}`}
                                    onChange={(e) => {
                                        const [field, order] = e.target.value.split('-');
                                        setSortField(field);
                                        setSortOrder(order);
                                    }}
                                    className="border border-gray-300 rounded-lg px-2 py-1.5"
                                >
                                    <option value="createdAt-desc">Mới nhất</option>
                                    <option value="createdAt-asc">Cũ nhất</option>
                                    <option value="star-desc">Đánh giá cao nhất</option>
                                    <option value="star-asc">Đánh giá thấp nhất</option>
                                    <option value="likes-desc">Lượt thích (cao đến thấp)</option>
                                    <option value="dislikes-desc">Lượt không thích (cao đến thấp)</option>
                                </select>
                            </div>
                        </div>

                        {/* Danh sách feedbacks */}
                        {loading ? (
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
                            <div className="space-y-6">
                                {currentItems.map(feedback => (
                                    <FeedbackCard 
                                        key={feedback.feedbackId} 
                                        feedback={feedback}
                                        onLike={handleFeedbackUpdated}
                                        onDislike={handleFeedbackUpdated}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Phân trang */}
                        {!loading && !error && filteredFeedbacks.length > 0 && <Pagination />}
                    </div>
                </div>
            </div>
        </RequireAuth>
    );
};

export default C_History; 