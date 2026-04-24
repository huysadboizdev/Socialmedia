import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const Leaderboard = () => {
    const [data, setData] = useState({ monthly: [], quarterly: [], currentMonth: 0, currentQuarter: 0 });
    const [activeTab, setActiveTab] = useState('monthly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                let userId = '';
                try {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        if (user && user._id) userId = user._id;
                    }
                } catch (e) {}
                
                const res = await axios.get(`${API_URL}/api/user/leaderboard${userId ? `?userId=${userId}` : ''}`);
                if (res.data.success) {
                    setData(res.data);
                }
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const list = activeTab === 'monthly' ? data.monthly : data.quarterly;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto p-4 md:p-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border-2 border-blue-100 dark:border-slate-800 overflow-hidden transition-all">
                {/* Header */}
                <div className="pt-8 pb-4 text-center">
                    <h2 className="text-4xl font-black text-red-600 dark:text-red-500 flex items-center justify-center gap-3 italic">
                        <span className="text-4xl">🏆</span>
                        Bảng Vinh Danh
                        <span className="text-4xl">🏆</span>
                    </h2>
                </div>

                {/* Tabs */}
                <div className="px-6 mb-6">
                    <div className="flex bg-slate-50 dark:bg-slate-800/50 rounded-xl p-1 shadow-inner border border-slate-100 dark:border-slate-800">
                        <button 
                            onClick={() => setActiveTab('quarterly')}
                            className={`flex-1 py-3 px-2 rounded-lg font-bold text-sm transition-all duration-300 ${activeTab === 'quarterly' ? 'bg-blue-600 text-white shadow-lg scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600'}`}
                        >
                            Vinh Danh Quý {data.currentQuarter}
                        </button>
                        <button 
                            onClick={() => setActiveTab('monthly')}
                            className={`flex-1 py-3 px-2 rounded-lg font-bold text-sm transition-all duration-300 ${activeTab === 'monthly' ? 'bg-blue-600 text-white shadow-lg scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600'}`}
                        >
                            Vinh Danh Tháng {data.currentMonth}
                        </button>
                    </div>
                </div>

                {/* List Container */}
                <div className="px-6 pb-6 space-y-4">
                    {list.map((item, index) => (
                        <div 
                            key={index}
                            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                {/* Rank Icon/Number */}
                                <div className={`size-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                                    index === 0 ? 'bg-yellow-400' : 
                                    index === 1 ? 'bg-blue-600' : 
                                    index === 2 ? 'bg-red-500' : 
                                    'bg-cyan-500'
                                }`}>
                                    {index === 0 ? '🏆' : index + 1}
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors truncate max-w-[150px]">
                                    {item.name}
                                </span>
                            </div>

                            {/* Amount Badge */}
                            <div className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded-xl font-mono text-sm font-bold shadow-sm flex items-center gap-1 group-hover:scale-105 transition-transform">
                                {item.amount}
                                <span className="text-[10px] align-top">đ</span>
                            </div>
                        </div>
                    ))}

                    {list.length === 0 && (
                        <div className="text-center py-10 text-slate-400 dark:text-slate-500 italic">
                            Chưa có dữ liệu vinh danh...
                        </div>
                    )}
                </div>

                {/* Footer Button */}
                <div className="px-6 pb-8">
                    <Link 
                        to="/deposit"
                        className="block w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-black rounded-2xl shadow-lg shadow-blue-500/30 transition-all uppercase tracking-wide active:scale-95"
                    >
                        Nạp tiền ngay
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
