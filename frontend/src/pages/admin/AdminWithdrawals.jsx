import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const AdminWithdrawals = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [viewingQR, setViewingQR] = useState(null);

    // Dialog state
    const [dialogConfig, setDialogConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => {},
        confirmLoading: false
    });

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/admin/withdrawals`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setRequests(res.data.requests);
            }
        } catch (_error) {
            console.error(_error);
            toast.error('Failed to fetch withdrawal requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const handleApproveClick = (id) => {
        setDialogConfig({
            isOpen: true,
            title: 'Duyệt Rút Tiền',
            message: 'Bạn có chắc chắn muốn duyệt yêu cầu rút tiền này?',
            type: 'success',
            confirmText: 'Duyệt ngay',
            onConfirm: () => processApprove(id)
        });
    };

    const processApprove = async (id) => {
        try {
            setDialogConfig(prev => ({ ...prev, confirmLoading: true }));
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/admin/withdraw/approve`, { transactionId: id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Đã duyệt yêu cầu rút tiền!');
                fetchWithdrawals();
                setDialogConfig(prev => ({ ...prev, isOpen: false }));
            }
        } catch (_error) {
            toast.error('Duyệt thất bại');
        } finally {
            setDialogConfig(prev => ({ ...prev, confirmLoading: false }));
        }
    };

    const handleRejectClick = (id) => {
        setDialogConfig({
            isOpen: true,
            title: 'Từ Chối Rút Tiền',
            message: 'Bạn có chắc chắn muốn từ chối yêu cầu này? Số tiền sẽ được hoàn lại ví nhiệm vụ của thành viên.',
            type: 'danger',
            confirmText: 'Từ chối',
            onConfirm: () => processReject(id)
        });
    };

    const processReject = async (id) => {
        try {
            setDialogConfig(prev => ({ ...prev, confirmLoading: true }));
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/admin/withdraw/reject`, { transactionId: id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Đã từ chối và hoàn tiền!');
                fetchWithdrawals();
                setDialogConfig(prev => ({ ...prev, isOpen: false }));
            }
        } catch (_error) {
            toast.error('Từ chối thất bại');
        } finally {
            setDialogConfig(prev => ({ ...prev, confirmLoading: false }));
        }
    };

    const filteredRequests = activeTab === 'pending' 
        ? requests.filter(r => r.status === 'pending')
        : requests.filter(r => r.status !== 'pending');

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 gap-4">
                <div>
                   <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quản Lý Rút Tiền</h1>
                   <p className="text-slate-500 dark:text-slate-400 mt-1">Duyệt các yêu cầu rút tiền từ ví nhiệm vụ về ngân hàng</p>
                </div>
                
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                    <button 
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Chờ Duyệt ({requests.filter(r => r.status === 'pending').length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Lịch Sử
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thành Viên</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số Tiền Rút</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thông Tin Ngân Hàng</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">QR Code</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thời Gian</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400 italic">Đang tải dữ liệu...</td>
                                </tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400 italic">
                                        Không có yêu cầu nào
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => {
                                    const amount = Math.abs(req.amount);
                                    const fee = amount * 0.2;
                                    const final = amount - fee;
                                    
                                    return (
                                        <tr key={req._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700 dark:text-slate-200">{req.userId?.username}</span>
                                                    <span className="text-[11px] text-slate-400">{req.userId?.fullName}</span>
                                                    <span className="text-[10px] text-slate-400 italic">{req.userId?.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-red-600">-{amount.toLocaleString()} đ</span>
                                                    <span className="text-[10px] text-slate-500">Phí 20%: {fee.toLocaleString()} đ</span>
                                                    <span className="text-xs font-bold text-emerald-600">Thực nhận: {final.toLocaleString()} đ</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col text-xs space-y-1">
                                                    <p>🏦 <span className="font-bold text-slate-600 dark:text-slate-300">{req.withdrawalDetails?.bankName}</span></p>
                                                    <p>💳 <span className="font-bold text-slate-600 dark:text-slate-300">{req.withdrawalDetails?.bankAccount}</span></p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {req.withdrawalDetails?.qrCode ? (
                                                    <button 
                                                        onClick={() => setViewingQR(req.withdrawalDetails.qrCode)}
                                                        className="size-12 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden mx-auto hover:scale-110 transition-transform"
                                                    >
                                                        <img src={req.withdrawalDetails.qrCode} alt="QR" className="w-full h-full object-cover" />
                                                    </button>
                                                ) : <span className="text-xs text-slate-400 italic">N/A</span>}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">
                                                {new Date(req.createdAt).toLocaleString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {req.status === 'pending' ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleApproveClick(req._id)}
                                                            className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors shadow-sm"
                                                            title="Duyệt"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRejectClick(req._id)}
                                                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors shadow-sm"
                                                            title="Từ chối"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">cancel</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {req.status === 'approved' ? 'Thành công' : 'Đã từ chối'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* QR PREVIEW MODAL */}
            {viewingQR && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setViewingQR(null)}
                >
                    <div className="relative max-w-sm w-full bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100">Mã QR Nhận Tiền</h3>
                            <button onClick={() => setViewingQR(null)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <img 
                            src={viewingQR} 
                            alt="Full QR" 
                            className="w-full aspect-square object-contain rounded-lg border border-slate-100 dark:border-slate-800"
                        />
                        <div className="mt-4 flex gap-2">
                             <a 
                                href={viewingQR} 
                                download 
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-center text-sm transition-colors"
                             >
                                Mở Ảnh Gốc
                             </a>
                        </div>
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

export default AdminWithdrawals;
