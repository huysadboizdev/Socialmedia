import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const AdminMissionRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingImage, setViewingImage] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/admin/mission/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setRequests(res.data.submissions);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Duyệt nhiệm vụ này và cộng tiền cho user?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/admin/mission/approve`, { submissionId: id }, {
                 headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Đã duyệt thành công!');
                fetchRequests();
            }
        } catch (error) {
            toast.error('Approve failed');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Từ chối nhiệm vụ này?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/admin/mission/reject`, { submissionId: id }, {
                 headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Đã từ chối!');
                fetchRequests();
            }
        } catch (error) {
            toast.error('Reject failed');
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div>
                   <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Duyệt Nhiệm Vụ</h1>
                   <p className="text-slate-500 dark:text-slate-400 mt-1">Kiểm tra ảnh bằng chứng và duyệt tiền cho thành viên</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Người Dùng</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tên Nhiệm Vụ</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tiền Thưởng</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bằng Chứng</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thời Gian Nộp</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Đang tải dữ liệu...</td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Không có yêu cầu nào đang chờ duyệt</td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700 dark:text-slate-200">{req.userId?.username}</span>
                                                <span className="text-xs text-slate-500">{req.userId?.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col max-w-xs">
                                                <span className="font-medium text-slate-700 dark:text-slate-200 truncate" title={req.missionId?.title}>{req.missionId?.title}</span>
                                                <a href={req.missionId?.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate">Link Task</a>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                                            +{req.missionId?.reward?.toLocaleString()} đ
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => setViewingImage(req.imageProof)}
                                                className="relative group overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 size-16"
                                            >
                                                <img 
                                                    src={req.imageProof} 
                                                    alt="Proof" 
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="material-symbols-outlined text-white text-lg">visibility</span>
                                                </div>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(req.createdAt).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button 
                                                onClick={() => handleApprove(req._id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 font-bold rounded-lg text-sm transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">check</span>
                                                Duyệt
                                            </button>
                                            <button 
                                                onClick={() => handleReject(req._id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-lg text-sm transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                                Từ Chối
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* IMAGE PREVIEW MODAL */}
            {viewingImage && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setViewingImage(null)}
                >
                    <div className="relative max-w-4xl w-full max-h-[90vh]">
                        <img 
                            src={viewingImage} 
                            alt="Full Proof" 
                            className="w-full h-full object-contain rounded-lg shadow-2xl"
                        />
                        <button 
                            onClick={() => setViewingImage(null)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            <span className="material-symbols-outlined text-3xl">close</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMissionRequests;
