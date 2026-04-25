import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import ConfirmModal from '@/components/common/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const AdminMissions = () => {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMission, setEditingMission] = useState(null);
    const [deleteData, setDeleteData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [selectedMissions, setSelectedMissions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [formData, setFormData] = useState({
        title: '',
        link: '',
        type: 'like',
        reward: 0,
        isActive: true
    });

    useEffect(() => {
        fetchMissions();
    }, []);

    const fetchMissions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/admin/missions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setMissions(res.data.missions || []);
            }
        } catch (_error) {
            console.error(_error);
            toast.error('Failed to fetch missions');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateLink = (link) => {
        if (!link) return false;
        const pattern = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com|instagram\.com|tiktok\.com|vt\.tiktok\.com)\/.*$/i;
        return pattern.test(link);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateLink(formData.link)) {
            toast.error('Link không hợp lệ! Vui lòng nhập link Facebook, Instagram hoặc TikTok hợp lệ.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const url = editingMission 
                ? `${API_URL}/api/admin/mission/update`
                : `${API_URL}/api/admin/mission/create`;
            
            const payload = editingMission 
                ? { ...formData, missionId: editingMission._id }
                : formData;

            const res = await axios.post(url, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                toast.success(editingMission ? 'Cập nhật thành công!' : 'Tạo nhiệm vụ thành công!');
                setIsModalOpen(false);
                setEditingMission(null);
                setFormData({ title: '', link: '', type: 'like', reward: 0, isActive: true });
                fetchMissions();
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error('Operation failed');
        }
    };

    const handleEdit = (mission) => {
        setEditingMission(mission);
        setFormData({
            title: mission.title,
            link: mission.link || '',
            type: mission.type,
            reward: mission.reward,
            isActive: mission.isActive
        });
        setIsModalOpen(true);
    };

    const confirmDelete = (id) => {
        setDeleteData({ id });
    };

    const executeDelete = async () => {
        if (!deleteData) return;
        const { id } = deleteData;
        setDeleteData(null);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/admin/mission/delete`, { missionId: id }, {
                 headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('Đã xóa nhiệm vụ');
                fetchMissions();
            }
        } catch {
            toast.error('Delete failed');
        }
    };

    const filteredMissions = missions.filter(m => {
        const matchesSearch = searchTerm === '' || m.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || m.type === filterType;
        return matchesSearch && matchesType;
    });

    const totalPages = Math.ceil(filteredMissions.length / pageSize);
    const paginatedMissions = filteredMissions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const toggleSelectAll = (checked) => {
        if (checked) {
            setSelectedMissions(paginatedMissions.map(m => m._id));
        } else {
            setSelectedMissions([]);
        }
    };

    const toggleSelectMission = (id, checked) => {
        if (checked) {
            setSelectedMissions([...selectedMissions, id]);
        } else {
            setSelectedMissions(selectedMissions.filter(sid => sid !== id));
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-[#f8f9fa] dark:bg-slate-950 min-h-full transition-colors duration-300">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Quản lý nhiệm vụ</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Danh sách các nhiệm vụ hệ thống cho người dùng</p>
                </div>
                <Button 
                    onClick={() => {
                        setEditingMission(null);
                        setFormData({ title: '', link: '', type: 'like', reward: 0, isActive: true });
                        setIsModalOpen(true);
                    }}
                    className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm rounded-lg flex items-center gap-2 h-9 px-4 transition-all"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Thêm Nhiệm Vụ
                </Button>
            </div>

            {/* Filters Section */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full max-w-xs transition-all">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                    <Input 
                        placeholder="Tìm tên nhiệm vụ..." 
                        className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-9 rounded-lg dark:text-slate-200 transition-all focus-visible:ring-purple-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[160px] bg-white border-slate-200 h-9 rounded-lg">
                        <SelectValue placeholder="Loại" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">Tất cả loại</SelectItem>
                        <SelectItem value="like">Like</SelectItem>
                        <SelectItem value="follow">Follow</SelectItem>
                        <SelectItem value="share">Share</SelectItem>
                        <SelectItem value="comment">Comment</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm transition-all">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[#990033] hover:bg-[#990033] border-0">
                                <TableHead className="w-12 text-center text-white">
                                    <Checkbox 
                                        checked={selectedMissions.length === paginatedMissions.length && paginatedMissions.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                        className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#990033]"
                                    />
                                </TableHead>
                                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Tên Nhiệm Vụ</TableHead>
                                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Link</TableHead>
                                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Loại</TableHead>
                                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Thưởng (VNĐ)</TableHead>
                                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Trạng thái</TableHead>
                                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                         <div className="flex justify-center"><span className="material-symbols-outlined animate-spin text-slate-400 text-4xl">sync</span></div>
                                         <p className="mt-2 text-slate-500 dark:text-slate-400 italic">Đang tải dữ liệu...</p>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedMissions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center text-slate-500 dark:text-slate-400 italic">Không tìm thấy nhiệm vụ nào.</TableCell>
                                </TableRow>
                            ) : (
                                paginatedMissions.map((mission) => (
                                    <tr key={mission._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                                        <TableCell className="text-center">
                                            <Checkbox 
                                                checked={selectedMissions.includes(mission._id)}
                                                onCheckedChange={(checked) => toggleSelectMission(mission._id, checked)}
                                            />
                                        </TableCell>
                                        <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 text-center">{mission.title}</td>
                                        <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400 max-w-xs truncate text-center">
                                            <a href={mission.link} target="_blank" rel="noopener noreferrer" className="hover:underline">{mission.link}</a>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                                mission.type === 'like' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                mission.type === 'follow' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                                                'bg-slate-50 text-slate-700 border-slate-200'
                                            }`}>
                                                {mission.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400 text-center">
                                            {mission.reward?.toLocaleString()} đ
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                             <span className={`inline-block w-2.5 h-2.5 rounded-full ${mission.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    className="size-8 text-slate-400 hover:text-blue-600"
                                                    onClick={() => handleEdit(mission)}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    className="size-8 text-slate-400 hover:text-red-500"
                                                    onClick={() => confirmDelete(mission._id)}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Section */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 transition-all">
                    <div className="text-sm text-slate-500 dark:text-slate-500">
                        Đã chọn {selectedMissions.length} trong {paginatedMissions.length} hàng.
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 dark:text-slate-500">Tổng: {filteredMissions.length}</span>
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
                                    className="size-8 rounded border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 transition-all font-bold"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                >
                                    <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_left</span>
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="size-8 rounded border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 transition-all font-bold"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="size-8 rounded border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 transition-all font-bold"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="size-8 rounded border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 transition-all font-bold"
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

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                                {editingMission ? 'Chỉnh Sửa Nhiệm Vụ' : 'Tạo Nhiệm Vụ Mới'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Tên Nhiệm Vụ</label>
                                <Input 
                                    type="text" 
                                    name="title" 
                                    value={formData.title} 
                                    onChange={handleInputChange} 
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-10 rounded-xl dark:text-white"
                                    placeholder="Ví dụ: Like Fanpage A"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Link Nhiệm Vụ</label>
                                <Input 
                                    type="text" 
                                    name="link" 
                                    value={formData.link} 
                                    onChange={handleInputChange} 
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-10 rounded-xl dark:text-white"
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Loại</label>
                                    <Select 
                                        value={formData.type} 
                                        onValueChange={(v) => setFormData({...formData, type: v})}
                                    >
                                        <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-10 rounded-xl dark:text-white transition-all">
                                            <SelectValue placeholder="Chọn loại" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="like">Like</SelectItem>
                                            <SelectItem value="follow">Follow</SelectItem>
                                            <SelectItem value="share">Share</SelectItem>
                                            <SelectItem value="comment">Comment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Tiền Thưởng</label>
                                    <Input 
                                        type="number" 
                                        name="reward" 
                                        value={formData.reward} 
                                        onChange={handleInputChange} 
                                        required
                                        min="0"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-10 rounded-xl dark:text-white"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 pt-1 group cursor-pointer">
                                <Checkbox 
                                    id="isActive"
                                    checked={formData.isActive} 
                                    onCheckedChange={(checked) => setFormData({...formData, isActive: !!checked})}
                                    className="size-5 rounded-md dark:border-slate-700"
                                />
                                <label htmlFor="isActive" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Kích hoạt nhiệm vụ ngay</label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 h-11 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl dark:bg-slate-900"
                                >
                                    Hủy
                                </Button>
                                <Button 
                                    type="submit"
                                    className="flex-1 h-11 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]"
                                >
                                    {editingMission ? 'Lưu Thay Đổi' : 'Tạo Nhiệm Vụ'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={!!deleteData}
                title="Xác nhận xóa nhiệm vụ"
                message="Bạn có chắc chắn muốn xóa nhiệm vụ này? Thao tác này không thể hoàn tác."
                onConfirm={executeDelete}
                onCancel={() => setDeleteData(null)}
            />
        </div>
    );
};

export default AdminMissions;
