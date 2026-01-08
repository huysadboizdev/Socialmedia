import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const AdminMissionRequests = () => {
    const [requests, setRequests] = useState([]);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [viewingImage, setViewingImage] = useState(null);
    
    // Dialog state
    const [dialogConfig, setDialogConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        showInput: false,
        onConfirm: () => {},
        confirmLoading: false
    });

    useEffect(() => {
        if (activeTab === 'pending') {
            fetchRequests();
        } else {
            fetchHistory();
        }
    }, [activeTab]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/admin/mission/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setRequests(res.data.submissions);
            }
        } catch (_error) {
            console.error(_error);
            toast.error('Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/admin/mission/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setHistory(res.data.submissions);
            }
        } catch (_error) {
            console.error(_error);
            toast.error('Failed to fetch history');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = (id) => {
        setDialogConfig({
            isOpen: true,
            title: 'Duyệt Nhiệm Vụ',
            message: 'Bạn có chắc chắn muốn duyệt nhiệm vụ này và cộng tiền cho thành viên?',
            type: 'success',
            showInput: false,
            confirmText: 'Duyệt ngay',
            onConfirm: () => processApprove(id)
        });
    };

    const processApprove = async (id) => {
        try {
            setDialogConfig(prev => ({ ...prev, confirmLoading: true }));
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/admin/mission/approve`, { submissionId: id }, {
                 headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Đã duyệt thành công!');
                fetchRequests();
                setDialogConfig(prev => ({ ...prev, isOpen: false }));
            }
        } catch (_error) {
            console.error(_error);
            toast.error('Approve failed');
        } finally {
            setDialogConfig(prev => ({ ...prev, confirmLoading: false }));
        }
    };

    const handleRejectClick = (id) => {
        setDialogConfig({
            isOpen: true,
            title: 'Từ Chối Nhiệm Vụ',
            message: 'Vui lòng nhập lý do từ chối để thông báo cho thành viên.',
            type: 'danger',
            showInput: true,
            inputPlaceholder: 'Lý do: Ảnh không hợp lệ, chưa làm task...',
            confirmText: 'Từ chối',
            onConfirm: (note) => processReject(id, note)
        });
    };

    const processReject = async (id, note) => {
        try {
            setDialogConfig(prev => ({ ...prev, confirmLoading: true }));
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/admin/mission/reject`, { submissionId: id, note }, {
                 headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Đã từ chối!');
                fetchRequests();
                setDialogConfig(prev => ({ ...prev, isOpen: false }));
            }
        } catch (_error) {
            console.error(_error);
            toast.error('Reject failed');
        } finally {
            setDialogConfig(prev => ({ ...prev, confirmLoading: false }));
        }
    };

    const displayData = activeTab === 'pending' ? requests : history;

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 gap-4">
                <div>
                   <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Duyệt Nhiệm Vụ</h1>
                   <p className="text-slate-500 dark:text-slate-400 mt-1">Kiểm tra ảnh bằng chứng và duyệt tiền cho thành viên</p>
                </div>
                
                {/* Tab Switcher */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                    <button 
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Đang chờ duyệt ({requests.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Lịch sử đã duyệt
                    </button>
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
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thời Gian</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng Thái / Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400 italic">Đang tải dữ liệu...</td>
                                </tr>
                            ) : displayData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400 italic">
                                        {activeTab === 'pending' ? 'Không có yêu cầu nào đang chờ duyệt' : 'Chưa có lịch sử duyệt nhiệm vụ'}
                                    </td>
                                </tr>
                            ) : (
                                displayData.map((req) => (
                                    <tr key={req._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700 dark:text-slate-200">{req.userId?.username}</span>
                                                <span className="text-[11px] text-slate-400">{req.userId?.fullName}</span>
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
                                                className="relative group overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 size-14 mx-auto"
                                            >
                                                <img 
                                                    src={req.imageProof} 
                                                    alt="Proof" 
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="material-symbols-outlined text-white text-sm">visibility</span>
                                                </div>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            {new Date(req.createdAt).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {activeTab === 'pending' ? (
                                                <div className="flex justify-end gap-2 text-right">
                                                    <button 
                                                        onClick={() => handleApproveClick(req._id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 font-bold rounded-lg text-[13px] transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">check</span>
                                                        Duyệt
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRejectClick(req._id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-lg text-[13px] transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                                        Từ Chối
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {req.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                                                    </span>
                                                    {req.adminNote && (
                                                        <span className="text-[10px] text-slate-400 italic max-w-[150px] truncate">
                                                            {req.adminNote}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
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
                    <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
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

            {/* CONFIRM DIALOG */}
            <ConfirmDialog 
                {...dialogConfig}
                onCancel={() => setDialogConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default AdminMissionRequests;
