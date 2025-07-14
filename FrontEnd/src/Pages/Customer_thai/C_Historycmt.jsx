import React, { useEffect, useState } from 'react';
import { apiCall } from '../../utils/api';
import { Trash2, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from 'lucide-react';

const C_Historycmt = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFeedbacks = async () => {
        setLoading(true);
        setError(null);
        try {
            // Gọi 2 API giống C_Feedback (giả sử là /api/customer/feedbacks/storage và /api/customer/feedbacks/transport)
            const token = sessionStorage.getItem('token');
            const [storageRes, transportRes] = await Promise.all([
                apiCall('/api/customer/feedbacks/storage', { headers: { 'Authorization': `Bearer ${token}` } }),
                apiCall('/api/customer/feedbacks/transport', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            let storageData = [];
            let transportData = [];
            if (storageRes.ok) storageData = await storageRes.json();
            if (transportRes.ok) transportData = await transportRes.json();
            setFeedbacks([...storageData, ...transportData]);
        } catch (err) {
            setError('Không thể tải feedback');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const handleDelete = async (feedbackId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa feedback này?')) return;
        try {
            const token = sessionStorage.getItem('token');
            const res = await apiCall(`/api/customer/feedbacks/${feedbackId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setFeedbacks(prev => prev.filter(fb => fb.feedbackId !== feedbackId));
            } else {
                alert('Xóa feedback thất bại');
            }
        } catch (err) {
            alert('Có lỗi khi xóa feedback');
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl font-bold mb-4">Nhật kí hoạt động (Feedback của bạn)</h2>
            {feedbacks.length === 0 && <div>Chưa có feedback nào.</div>}
            {feedbacks.map(fb => (
                <div key={fb.feedbackId} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(fb.feedbackId)}>
                        <div className="flex items-center gap-3">
                            <img src={fb.storageImg || fb.transportImg || '/default-storage.png'} alt="storage" className="w-10 h-10 rounded object-cover" />
                            <div>
                                <div className="font-semibold">{fb.storageName || fb.transportName}</div>
                                <div className="text-sm text-gray-500">{fb.createdAt ? new Date(fb.createdAt).toLocaleString('vi-VN') : ''}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={e => { e.stopPropagation(); handleDelete(fb.feedbackId); }} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                            {expandedId === fb.feedbackId ? <ChevronUp /> : <ChevronDown />}
                        </div>
                    </div>
                    {expandedId === fb.feedbackId && (
                        <div className="mt-4 border-t pt-4 space-y-2">
                            <div className="font-medium">Nội dung: <span className="font-normal">{fb.content}</span></div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-green-600"><ThumbsUp className="w-4 h-4" /> {fb.likeCount || 0}</div>
                                <div className="flex items-center gap-1 text-red-600"><ThumbsDown className="w-4 h-4" /> {fb.dislikeCount || 0}</div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default C_Historycmt; 