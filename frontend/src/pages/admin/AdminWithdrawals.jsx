import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const AdminWithdrawals = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [viewingQR, setViewingQR] = useState(null);
    const [viewingDetail, setViewingDetail] = useState(null);
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Dialog state
    const [dialogConfig, setDialogConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => {},
        confirmLoading: false
    });

    const prevRequestsRef = useRef([]);
    const pollingTimerRef = useRef(null);

    const fetchWithdrawals = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/admin/withdrawals`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                const newRequests = res.data.requests || [];
                
                // --- Status Change Detection ---
                if (isBackground && prevRequestsRef.current.length > 0) {
                    newRequests.forEach(newReq => {
                        const oldReq = prevRequestsRef.current.find(r => r._id === newReq._id);
                        if (oldReq && oldReq.status === 'pending' && newReq.status === 'approved') {
                            toast.success(`Hệ thống: Lệnh rút ${newReq.withdrawalDetails?.bankAccount} (${newReq.amount.toLocaleString()}đ) đã được tự động duyệt!`, {
                                duration: 5000,
                                position: 'top-right'
                            });
                        }
                    });
                }
                
                setRequests(newRequests);
                prevRequestsRef.current = newRequests;
            }
        } catch (_error) {
            console.error(_error);
            if (!isBackground) toast.error('Failed to fetch withdrawal requests');
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();

        // Start Polling every 10 seconds
        pollingTimerRef.current = setInterval(() => {
            fetchWithdrawals(true);
        }, 10000);

        return () => {
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        };
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
        } catch {
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
        } catch {
            toast.error('Từ chối thất bại');
        } finally {
            setDialogConfig(prev => ({ ...prev, confirmLoading: false }));
        }
    };

    const filteredRequests = activeTab === 'pending' 
        ? requests.filter(r => r.status === 'pending')
        : requests.filter(r => r.status !== 'pending');

    const totalPages = Math.ceil(filteredRequests.length / pageSize);
    const paginatedData = filteredRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const toggleSelectAll = (checked) => {
        if (checked) {
            setSelectedRequests(paginatedData.map(r => r._id));
        } else {
            setSelectedRequests([]);
        }
    };

    const toggleSelectRequest = (id, checked) => {
        if (checked) {
            setSelectedRequests([...selectedRequests, id]);
        } else {
            setSelectedRequests(selectedRequests.filter(sid => sid !== id));
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-[#f8f9fa] dark:bg-slate-950 min-h-full transition-colors duration-300">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Quản Lý Rút Tiền</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Duyệt các yêu cầu rút tiền từ ví nhiệm vụ về ngân hàng</p>
                </div>
                
                {/* Tab Switcher */}
                <div className="flex p-0.5 bg-slate-200/50 dark:bg-slate-800 rounded-lg border border-slate-200/60 w-fit">
                    <button 
                        onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
                        className={`px-4 py-1.5 rounded-md text-[13px] font-bold transition-all ${activeTab === 'pending' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Chờ Duyệt ({requests.filter(r => r.status === 'pending').length})
                    </button>
                    <button 
                        onClick={() => { setActiveTab('history'); setCurrentPage(1); }}
                        className={`px-4 py-1.5 rounded-md text-[13px] font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Lịch Sử
                    </button>
                </div>
            </div>

            {/* Instruction Alert */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-bold mb-1">Hướng dẫn đối soát tự động:</p>
                    <p>Khi chuyển khoản cho user, vui lòng copy **Mã Đối Soát** (ví dụ: HUYWD1234) dán vào **nội dung chuyển khoản**. Khi SePay báo trừ tiền, hệ thống sẽ tự động duyệt và gửi mail cho user.</p>
                </div>
            </div>

            {/* Instruction Alert */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-bold mb-1">Hướng dẫn đối soát tự động:</p>
                    <p>Khi chuyển khoản cho user, vui lòng copy **Mã Đối Soát** (ví dụ: HUYWD1234) dán vào **nội dung chuyển khoản**. Khi SePay báo trừ tiền, hệ thống sẽ tự động duyệt và gửi mail cho user.</p>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm transition-all">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[#990033] hover:bg-[#990033] border-0">
                                <TableHead className="w-12 text-center text-white">
                                    <Checkbox 
                                        checked={selectedRequests.length === paginatedData.length && paginatedData.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                        className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#990033]"
                                    />
                                </TableHead>
                                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Thành Viên</TableHead>
                                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Số Tiền Rút</TableHead>
                                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Thông Tin Ngân Hàng</TableHead>
                                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">QR Code</TableHead>
                                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Thời Gian</TableHead>
                                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Hành Động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <div className="flex justify-center">
                                            <span className="material-symbols-outlined animate-spin text-slate-400 text-4xl">sync</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center text-slate-500 italic">
                                        Không có yêu cầu nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((req) => {
                                    const amount = Math.abs(req.amount);
                                    const fee = amount * 0.2;
                                    const final = amount - fee;
                                    
                                    return (
                                        <TableRow key={req._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                                            <TableCell className="text-center">
                                                <Checkbox 
                                                    checked={selectedRequests.includes(req._id)}
                                                    onCheckedChange={(checked) => toggleSelectRequest(req._id, checked)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-[13px]">{req.userId?.username}</span>
                                                    <span className="text-[11px] text-slate-400">{req.userId?.fullName}</span>
                                                    {req.description && req.description.includes('HUYWD') && (
                                                        <div className="mt-1">
                                                            <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded cursor-help" title="Mã đối soát - Cần ghi vào nội dung chuyển tiền">
                                                                {req.description.split(' - ')[0]}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[13px] font-black text-rose-600">-{amount.toLocaleString()} đ</span>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">Phí 20%</span>
                                                        <span className="text-[10px] text-slate-500 font-bold">-{fee.toLocaleString()} đ</span>
                                                    </div>
                                                    <span className="text-[12px] font-black text-emerald-600 mt-1">Thực nhận: {final.toLocaleString()} đ</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center gap-1 text-[11px]">
                                                    <div className="flex items-center gap-1.5 bg-blue-50/50 dark:bg-blue-900/20 px-2 py-1 rounded-lg border border-blue-100/50 dark:border-blue-900/30 w-full max-w-[140px]">
                                                        <span className="material-symbols-outlined text-[14px] text-blue-600 dark:text-blue-400">account_balance</span>
                                                        <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{req.withdrawalDetails?.bankName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50 w-full max-w-[140px]">
                                                        <span className="material-symbols-outlined text-[14px] text-slate-500">credit_card</span>
                                                        <span className="font-black text-slate-600 dark:text-slate-300 text-[12px]">{req.withdrawalDetails?.bankAccount}</span>
                                                    </div>
                                                    {req.withdrawalDetails?.email && (
                                                        <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-lg border border-purple-200/50 dark:border-purple-700/50 w-full max-w-[140px]">
                                                            <span className="material-symbols-outlined text-[14px] text-purple-600 dark:text-purple-400">mail</span>
                                                            <span className="font-medium text-slate-600 dark:text-slate-300 text-[10px] truncate" title={req.withdrawalDetails.email}>
                                                                {req.withdrawalDetails.email}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {req.withdrawalDetails?.qrCode ? (
                                                    <button 
                                                        onClick={() => {
                                                            setViewingQR(req.withdrawalDetails.qrCode);
                                                        }}
                                                        className="relative group size-10 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden mx-auto hover:ring-2 hover:ring-purple-500/20 transition-all bg-white dark:bg-slate-800 p-0.5"
                                                    >
                                                        <img src={req.withdrawalDetails.qrCode} alt="QR" className="w-full h-full object-contain" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="material-symbols-outlined text-white text-sm">visibility</span>
                                                        </div>
                                                    </button>
                                                ) : <span className="text-[10px] text-slate-400 italic">N/A</span>}
                                            </TableCell>
                                            <TableCell className="text-center text-[11px] text-slate-400 font-medium">
                                                {new Date(req.createdAt).toLocaleString('vi-VN')}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {req.status === 'pending' ? (
                                                    <div className="flex justify-center gap-1.5">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            onClick={() => handleApproveClick(req._id)}
                                                            className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700 rounded-md transition-all active:scale-90"
                                                            title="Duyệt"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            onClick={() => handleRejectClick(req._id)}
                                                            className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-md transition-all active:scale-90"
                                                            title="Từ chối"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">cancel</span>
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            onClick={() => {
                                                                setViewingDetail(req);
                                                            }}
                                                            className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-md transition-colors"
                                                            title="Xem chi tiết & Duyệt tự động"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-center gap-1.5">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            onClick={() => setViewingDetail(req)}
                                                            className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-md transition-colors"
                                                            title="Xem chi tiết"
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                        </Button>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border flex items-center ${
                                                            req.status === 'approved' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                                                        }`}>
                                                            {req.status === 'approved' ? 'Thành công' : 'Đã từ chối'}
                                                        </span>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Section */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 transition-all">
                    <div className="text-sm text-slate-500 dark:text-slate-500">
                        Đã chọn {selectedRequests.length} trong {paginatedData.length} hàng.
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 dark:text-slate-500">Tổng: {filteredRequests.length}</span>
                            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                                <SelectTrigger className="w-[70px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-8 rounded text-xs dark:text-white transition-all">
                                    <SelectValue placeholder="10" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
 
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                                Trang {currentPage}/{totalPages || 1}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="size-8 rounded border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                >
                                    <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_left</span>
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="size-8 rounded border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="size-8 rounded border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="size-8 rounded border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                >
                                    <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_right</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR PREVIEW MODAL */}
            {viewingQR && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setViewingQR(null)}
                >
                     <div className="relative max-w-sm w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-600">qr_code_2</span>
                                Mã QR Nhận Tiền
                            </h3>
                            <button onClick={() => setViewingQR(null)} className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>
                        <div className="relative bg-slate-50 p-2 rounded-2xl border-4 border-slate-100">
                             <img 
                                src={viewingQR} 
                                alt="Full QR" 
                                className="w-full aspect-square object-contain rounded-xl"
                            />
                        </div>
                   </div>
                </div>
            )}

            {/* DETAIL MODAL */}
            {viewingDetail && (
                 <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setViewingDetail(null)}
                >
                    <div className="relative max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col md:flex-row gap-6 overflow-hidden max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        {/* Close Button Mobile */}
                        <button onClick={() => setViewingDetail(null)} className="absolute top-4 right-4 h-8 w-8 flex md:hidden items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-10">
                             <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                        
                        {/* Left: QR Code */}
                        <div className="w-full md:w-1/3 flex flex-col gap-4">
                             <div className="aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                                 {viewingDetail.withdrawalDetails?.qrCode ? (
                                     <img src={viewingDetail.withdrawalDetails.qrCode} alt="QR" className="w-full h-full object-contain" />
                                 ) : (
                                     <div className="flex flex-col items-center gap-2 text-slate-400">
                                         <span className="material-symbols-outlined text-4xl">qr_code_2</span>
                                         <span className="text-xs">Không có QR</span>
                                     </div>
                                 )}
                             </div>
                             {viewingDetail.withdrawalDetails?.qrCode && (
                                <a 
                                    href={viewingDetail.withdrawalDetails.qrCode} 
                                    download 
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px]">download</span>
                                    Tải Ảnh
                                </a>
                             )}
                        </div>

                        {/* Right: Info */}
                        <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scrollbar">
                             <div className="flex items-start justify-between">
                                 <div>
                                     <h3 className="text-xl font-bold text-slate-800 dark:text-white">Chi Tiết Yêu Cầu</h3>
                                     <div className="flex flex-col gap-0.5 mt-1">
                                         <p className="text-xs text-slate-500 font-medium">Mã GD: #{viewingDetail._id.slice(-8).toUpperCase()}</p>
                                         {viewingDetail.description && viewingDetail.description.includes('HUYWD') && (
                                             <div className="flex items-center gap-1.5">
                                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Mã Đối Soát:</span>
                                                 <span className="text-[11px] font-black text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                                                     {viewingDetail.description.split(' - ')[0]}
                                                 </span>
                                             </div>
                                         )}
                                     </div>
                                 </div>
                                 <button onClick={() => setViewingDetail(null)} className="hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                     <span className="material-symbols-outlined text-[18px]">close</span>
                                 </button>
                             </div>

                             {/* User Info */}
                             <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3">
                                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                     <span className="material-symbols-outlined text-[16px]">person</span>
                                     Thông Tin Thành Viên
                                 </h4>
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <p className="text-xs text-slate-400">Tên đăng nhập</p>
                                         <p className="font-medium text-slate-700 dark:text-slate-200">{viewingDetail.userId?.username}</p>
                                     </div>
                                     <div>
                                         <p className="text-xs text-slate-400">Họ và tên</p>
                                         <p className="font-medium text-slate-700 dark:text-slate-200">{viewingDetail.userId?.fullName}</p>
                                     </div>
                                      <div className="col-span-2">
                                         <p className="text-xs text-slate-400">Email Tài Khoản</p>
                                         <p className="font-medium text-slate-700 dark:text-slate-200">{viewingDetail.userId?.email}</p>
                                     </div>
                                 </div>
                             </div>

                             {/* Bank Info */}
                             <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl space-y-3 border border-purple-100 dark:border-purple-900/20">
                                 <h4 className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-2">
                                     <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                                     Thông Tin Nhận Tiền
                                 </h4>
                                 <div className="grid grid-cols-2 gap-4">
                                      <div>
                                         <p className="text-xs text-slate-400">Ngân Hàng</p>
                                         <p className="font-bold text-slate-700 dark:text-slate-200">{viewingDetail.withdrawalDetails?.bankName}</p>
                                     </div>
                                     <div>
                                         <p className="text-xs text-slate-400">Số Tài Khoản</p>
                                         <p className="font-black text-slate-800 dark:text-slate-100 font-mono tracking-wide">{viewingDetail.withdrawalDetails?.bankAccount}</p>
                                     </div>
                                     <div className="col-span-2">
                                         <p className="text-xs text-slate-400">Email Nhận Thông Báo (Tùy chọn)</p>
                                         <div className="flex items-center gap-2 mt-1">
                                             <span className="material-symbols-outlined text-slate-400 text-[18px]">mail</span>
                                             <span className="font-medium text-slate-700 dark:text-slate-200">
                                                {viewingDetail.withdrawalDetails?.email || <span className="text-slate-400 italic">Không có</span>}
                                             </span>
                                         </div>
                                     </div>
                                 </div>
                             </div>

                             {/* Amount Info */}
                             <div className="grid grid-cols-3 gap-2">
                                 <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl text-center border border-red-100">
                                     <p className="text-xs text-slate-400 mb-1">Số tiền rút</p>
                                     <p className="font-black text-rose-600">{Math.abs(viewingDetail.amount).toLocaleString()}đ</p>
                                 </div>
                                 <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl text-center border border-orange-100">
                                     <p className="text-xs text-slate-400 mb-1">Phí 20%</p>
                                     <p className="font-bold text-orange-600">{(Math.abs(viewingDetail.amount) * 0.2).toLocaleString()}đ</p>
                                 </div>
                                 <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-xl text-center border border-green-100">
                                     <p className="text-xs text-slate-400 mb-1">Thực nhận</p>
                                     <p className="font-black text-emerald-600">{(Math.abs(viewingDetail.amount) * 0.8).toLocaleString()}đ</p>
                                 </div>
                             </div>
                             
                             {viewingDetail.status === 'pending' && (
                                 <div className="flex gap-3 pt-2">
                                     <button 
                                         onClick={() => {
                                             handleRejectClick(viewingDetail._id);
                                             setViewingDetail(null);
                                         }}
                                         className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-colors"
                                     >
                                         Từ Chối
                                     </button>
                                     <button 
                                         onClick={() => {
                                             handleApproveClick(viewingDetail._id);
                                             setViewingDetail(null);
                                         }}
                                         className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-shadow shadow-lg shadow-green-500/20"
                                     >
                                         Duyệt Ngay
                                     </button>
                                 </div>
                             )}
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
