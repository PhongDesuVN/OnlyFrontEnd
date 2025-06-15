import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
    Users, Package, TrendingUp, AlertTriangle,
    CheckCircle, Clock, Star, MapPin
} from 'lucide-react';
import Header from '../../Components/FormLogin_yen/Header';
import Footer from '../../Components/FormLogin_yen/Footer';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    const [selectedPeriod, setSelectedPeriod] = useState('month');

    const performanceData = [
        { month: 'T6/2023', staff: 85, efficiency: 88, satisfaction: 92 },
        { month: 'T7/2023', staff: 90, efficiency: 85, satisfaction: 89 },
        { month: 'T8/2023', staff: 88, efficiency: 92, satisfaction: 94 },
        { month: 'T9/2023', staff: 92, efficiency: 89, satisfaction: 91 },
        { month: 'T10/2023', staff: 87, efficiency: 94, satisfaction: 93 },
    ];

    const operationalData = [
        { name: 'Hoàn thành', value: 342, color: '#10B981' },
        { name: 'Đang xử lý', value: 45, color: '#F59E0B' },
        { name: 'Chậm trễ', value: 12, color: '#EF4444' },
        { name: 'Tạm dừng', value: 8, color: '#6B7280' },
    ];

    const staffPerformance = [
        { name: 'Operations Staff', rating: 4.2, tasks: 145, efficiency: 89 },
        { name: 'Transport Unit', rating: 4.5, tasks: 98, efficiency: 94 },
        { name: 'Storage Unit', rating: 4.1, tasks: 87, efficiency: 86 },
        { name: 'Customer Service', rating: 4.3, tasks: 156, efficiency: 91 },
    ];

    const recentAlerts = [
        { type: 'warning', message: 'Hệ thống chatbot cần được training thêm', time: '2 giờ trước' },
        { type: 'info', message: 'Nhận phản hồi từ khách hàng về chất lượng dịch vụ', time: '4 giờ trước' },
        { type: 'success', message: 'Hoàn thành đánh giá hiệu suất nhân viên tháng này', time: '1 ngày trước' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Header />

            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">
                {/* Sidebar hành động nhanh */}
                <div className="w-full lg:w-1/4 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Hành động nhanh</h3>
                    <button onClick={() => navigate('/managestaff')} className="flex items-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow hover:opacity-90">
                        <Users className="w-5 h-5" /> Quản lý nhân viên
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow hover:opacity-90">
                        <Package className="w-5 h-5" /> Theo dõi đơn hàng
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow hover:opacity-90">
                        <TrendingUp className="w-5 h-5" /> Báo cáo hiệu suất
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow hover:opacity-90">
                        <MapPin className="w-5 h-5" /> Quản lý vận chuyển
                    </button>
                    <select
                        className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                        <option value="week">Tuần này</option>
                        <option value="month">Tháng này</option>
                        <option value="quarter">Quý này</option>
                    </select>
                </div>

                {/* Main content with charts */}
                <div className="w-full lg:w-3/4 space-y-8">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Xu hướng hiệu suất</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="staff" stroke="#3B82F6" strokeWidth={2} name="Nhân viên" />
                                <Line type="monotone" dataKey="efficiency" stroke="#10B981" strokeWidth={2} name="Hiệu suất" />
                                <Line type="monotone" dataKey="satisfaction" stroke="#8B5CF6" strokeWidth={2} name="Hài lòng KH" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Tình trạng vận hành</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={operationalData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {operationalData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center mt-4 gap-4">
                            {operationalData.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Dashboard;