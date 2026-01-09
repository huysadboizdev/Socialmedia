import React, { useState, useEffect } from 'react';
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

const AdminMissionRequests = () => {
    const [requests, setRequests] = useState([]);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [viewingImage, setViewingImage] = useState(null);
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    
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
                setRequests(res.data.submissions || []);
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
                setHistory(res.data.submissions || []);
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
                if (activeTab === 'pending') fetchRequests();
                else fetchHistory();
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
                if (activeTab === 'pending') fetchRequests();
                else fetchHistory();
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
    const totalPages = Math.ceil(displayData.length / pageSize);
    const paginatedData = displayData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
        <div className="p-4 md:p-6 space-y-6 bg-[#f8f9fa] min-h-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Duyệt nhiệm vụ</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Kiểm tra và duyệt yêu cầu hoàn thành nhiệm vụ</p>
                </div>
                
                {/* Tab Switcher */}
                <div className="flex p-0.5 bg-slate-200/50 dark:bg-slate-800 rounded-lg border border-slate-200/60 w-fit">
                    <button 
                        onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
                        className={`px-4 py-1.5 rounded-md text-[13px] font-bold transition-all ${activeTab === 'pending' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Chờ duyệt ({requests.length})
                    </button>
                    <button 
                        onClick={() => { setActiveTab('history'); setCurrentPage(1); }}
                        className={`px-4 py-1.5 rounded-md text-[13px] font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Lịch sử ({history.length})
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
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
                                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Người Dùng</TableHead>
                                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Tên Nhiệm Vụ</TableHead>
                                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Tiền Thưởng</TableHead>
                                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Bằng Chứng</TableHead>
                                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Thời Gian</TableHead>
                                {activeTab === 'pending' ? (
                                    <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Hành Động</TableHead>
                                ) : (
                                    <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Trạng Thái</TableHead>
                                )}
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
                                        {activeTab === 'pending' ? 'Không có yêu cầu nào đang chờ duyệt' : 'Chưa có lịch sử duyệt nhiệm vụ'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((req) => (
                                    <TableRow key={req._id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                                        <TableCell className="text-center">
                                            <Checkbox 
                                                checked={selectedRequests.includes(req._id)}
                                                onCheckedChange={(checked) => toggleSelectRequest(req._id, checked)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700 dark:text-slate-200">{req.userId?.username}</span>
                                                <span className="text-[11px] text-slate-400">{req.userId?.fullName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[150px]" title={req.missionId?.title}>{req.missionId?.title}</span>
                                                <a href={req.missionId?.link} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-500 hover:underline">Link Nhiệm Vụ</a>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                                            +{req.missionId?.reward?.toLocaleString()} đ
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <button 
                                                onClick={() => setViewingImage(req.imageProof)}
                                                className="relative group overflow-hidden rounded-lg border border-slate-100 size-12 mx-auto"
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
                                        </TableCell>
                                        <TableCell className="text-center text-[11px] text-slate-500">
                                            {new Date(req.createdAt).toLocaleString('vi-VN')}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {activeTab === 'pending' ? (
                                                <div className="flex justify-center gap-1.5">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleApproveClick(req._id)}
                                                        className="h-8 px-2 text-green-600 hover:bg-green-50 font-bold text-[12px] flex items-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                                        Duyệt
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleRejectClick(req._id)}
                                                        className="h-8 px-2 text-red-600 hover:bg-red-50 font-bold text-[12px] flex items-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                                                        Từ Chối
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                        req.status === 'approved' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                                                    }`}>
                                                        {req.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                                                    </span>
                                                    {req.adminNote && (
                                                        <span className="text-[10px] text-slate-400 italic max-w-[120px] truncate" title={req.adminNote}>
                                                            {req.adminNote}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Section */}
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50">
                    <div className="text-sm text-slate-500">
                        Đã chọn {selectedRequests.length} trong {paginatedData.length} hàng.
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">Tổng: {displayData.length}</span>
                            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                                <SelectTrigger className="w-[70px] bg-white border-slate-200 h-8 rounded text-xs">
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
                            <span className="text-sm text-slate-600 font-medium whitespace-nowrap">
                                Trang {currentPage}/{totalPages || 1}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="size-8 rounded border-slate-200"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                >
                                    <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_left</span>
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="size-8 rounded border-slate-200"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="size-8 rounded border-slate-200"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="size-8 rounded border-slate-200"
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

            {/* IMAGE PREVIEW MODAL */}
            {viewingImage && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setViewingImage(null)}
                >
                    <div className="relative max-w-2xl w-full max-h-[85vh]" onClick={e => e.stopPropagation()}>
                        <img 
                            src={viewingImage} 
                            alt="Full Proof" 
                            className="w-full h-full object-contain rounded-lg shadow-2xl"
                        />
                        <button 
                            onClick={() => setViewingImage(null)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors bg-white/10 p-1 rounded-full"
                        >
                            <span className="material-symbols-outlined text-2xl">close</span>
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
