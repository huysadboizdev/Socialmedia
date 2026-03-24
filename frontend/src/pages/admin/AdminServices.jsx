import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
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

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedServices, setSelectedServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formData, setFormData] = useState({
    name: '',
    platform: 'Facebook',
    category: 'Tăng Like',
    price: '',
    speed: '',
    description: '',
    isActive: true,
    isMaintenance: false
  });

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/list`);
      if (res.data.success) {
        setServices(res.data.services || []);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Không thể tải danh sách dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL]);

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        platform: service.platform,
        category: service.category,
        price: service.price,
        speed: service.speed,
        description: service.description || '',
        isActive: service.isActive !== false,
        isMaintenance: service.isMaintenance === true
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        platform: 'Facebook',
        category: 'Tăng Like',
        price: '',
        speed: '',
        description: '',
        isActive: true,
        isMaintenance: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      let res;
      let submissionData = { ...formData };
      if ((formData.category === 'Premium' || formData.category === 'Chứng Chỉ') && !formData.speed) {
        submissionData.speed = 'Dịch vụ Premium';
      }

      if (editingService) {
        res = await axios.post(`${API_URL}/api/admin/edit-service`, {
          ...submissionData,
          serviceId: editingService._id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.post(`${API_URL}/api/admin/add-service`, submissionData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (res.data.success) {
        toast.success(editingService ? "Cập nhật dịch vụ thành công" : "Thêm dịch vụ mới thành công");
        fetchServices();
        handleCloseModal();
      } else {
        toast.error(res.data.message || "Thao tác thất bại");
      }
    } catch (err) {
      console.error("Error saving service:", err);
      toast.error("Lỗi khi lưu dịch vụ");
    }
  };

  const handleDelete = async (serviceId, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${name}"?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/admin/delete-service`, { serviceId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Đã xóa dịch vụ");
        setServices(services.filter(s => s._id !== serviceId));
      }
    } catch {
      toast.error("Lỗi khi xóa dịch vụ");
    }
  };

  const filteredServices = services.filter(s => {
    const matchesSearch = searchTerm === '' || s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'All' || s.platform === filterPlatform;
    const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
    return matchesSearch && matchesPlatform && matchesCategory;
  });

  const totalPages = Math.ceil(filteredServices.length / pageSize);
  const paginatedServices = filteredServices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedServices(paginatedServices.map(s => s._id));
    } else {
      setSelectedServices([]);
    }
  };

  const toggleSelectService = (id, checked) => {
    if (checked) {
      setSelectedServices([...selectedServices, id]);
    } else {
      setSelectedServices(selectedServices.filter(sid => sid !== id));
    }
  };

  const platforms = [...new Set(['Facebook', 'TikTok', 'Instagram', 'YouTube', 'Locket', 'Spotify', 'Apple', ...services.map(s => s.platform)])];
  const categories = [...new Set(['Tăng Like', 'Tăng Theo Dõi', 'Tăng Share', 'Tích Xanh', 'Premium', 'Chứng Chỉ', ...services.map(s => s.category)])];

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#f8f9fa] dark:bg-slate-950 min-h-full transition-colors duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Quản lý dịch vụ</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Danh sách tất cả dịch vụ trên hệ thống</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm rounded-lg flex items-center gap-2 h-9 px-4 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Thêm dịch vụ mới
        </Button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs transition-all">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <Input 
            placeholder="Tìm tên dịch vụ..." 
            className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-9 rounded-lg dark:text-slate-200 transition-all focus-visible:ring-purple-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-[160px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-9 rounded-lg dark:text-slate-200 transition-all">
            <SelectValue placeholder="Nền tảng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Tất cả nền tảng</SelectItem>
            {platforms.map(p => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-9 rounded-lg dark:text-slate-200 transition-all">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Tất cả danh mục</SelectItem>
            {categories.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
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
                    checked={selectedServices.length === paginatedServices.length && paginatedServices.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#990033]"
                  />
                </TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Tên dịch vụ</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Nền tảng</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Giá (đ)</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Tốc độ</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Trạng thái</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Hành động</TableHead>
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
              ) : paginatedServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center text-slate-500 italic">
                    Không tìm thấy dịch vụ nào.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedServices.map((service) => (
                  <TableRow key={service._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={selectedServices.includes(service._id)}
                        onCheckedChange={(checked) => toggleSelectService(service._id, checked)}
                      />
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{service.name}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-medium">{service.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          service.platform === 'Facebook' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          service.platform === 'TikTok' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                          service.platform === 'YouTube' ? 'bg-red-50 text-red-600 border border-red-100' :
                          service.platform === 'Locket' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' :
                          service.platform === 'Spotify' ? 'bg-green-50 text-green-600 border border-green-100' :
                          service.platform === 'Apple' ? 'bg-slate-900 text-white border border-slate-800' :
                          'bg-pink-50 text-pink-600 border border-pink-100'
                        }`}>
                          {service.platform}
                        </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-bold text-purple-600">{service.price.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{service.speed}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          service.isActive !== false ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {service.isActive !== false ? 'Active' : 'Off'}
                        </span>
                        {service.isMaintenance && (
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full text-[10px] font-bold uppercase">
                            Maintenance
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="size-8 text-slate-400 hover:text-blue-600"
                          onClick={() => handleOpenModal(service)}
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="size-8 text-slate-400 hover:text-red-500"
                          onClick={() => handleDelete(service._id, service.name)}
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Section */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 transition-all">
          <div className="text-sm text-slate-500 dark:text-slate-500">
            Đã chọn {selectedServices.length} trong {paginatedServices.length} hàng.
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-500">Tổng: {filteredServices.length}</span>
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleCloseModal}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Nền tảng</label>
                  <Select 
                    value={formData.platform} 
                    onValueChange={(v) => setFormData({...formData, platform: v})}
                  >
                    <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-10 rounded-xl dark:text-white transition-all">
                      <SelectValue placeholder="Chọn nền tảng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="TikTok">TikTok</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="YouTube">YouTube</SelectItem>
                      <SelectItem value="Locket">Locket</SelectItem>
                      <SelectItem value="Spotify">Spotify</SelectItem>
                      <SelectItem value="Apple">Apple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                   <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Danh mục</label>
                   <Select 
                    value={formData.category} 
                    onValueChange={(v) => setFormData({...formData, category: v})}
                  >
                    <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-10 rounded-xl dark:text-white transition-all">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tăng Like">Tăng Like</SelectItem>
                      <SelectItem value="Tăng Theo Dõi">Tăng Theo Dõi</SelectItem>
                      <SelectItem value="Tăng Share">Tăng Share</SelectItem>
                      <SelectItem value="Tích Xanh">Tích Xanh</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Chứng Chỉ">Chứng Chỉ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Tên dịch vụ / Máy chủ</label>
                <Input 
                  required
                  placeholder="VD: Server 1 (Like Việt)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-10 rounded-xl dark:text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Giá tiền (đ)</label>
                  <Input 
                    type="number"
                    required
                    placeholder="25"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-10 rounded-xl dark:text-white"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                {formData.category !== 'Premium' && formData.category !== 'Chứng Chỉ' && (
                  <div className="space-y-1.5">
                    <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Tốc độ chạy</label>
                    <input 
                      required
                      placeholder="VD: Siêu nhanh, 24h..."
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-10 rounded-xl dark:text-white text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                      value={formData.speed}
                      onChange={(e) => setFormData({...formData, speed: e.target.value})}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                  {formData.category === 'Premium' || formData.category === 'Chứng Chỉ' ? 'Thông tin gói / Quyền lợi' : 'Mô tả chi tiết'}
                </label>
                <textarea 
                  rows="3"
                  placeholder={formData.category === 'Premium' || formData.category === 'Chứng Chỉ' ? "VD: Xem phim 4K, Nghe nhạc offline..." : "Nhập mô tả về dịch vụ..."}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none transition-all"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="flex items-center gap-8 pt-1">
                <div className="flex items-center gap-2.5 cursor-pointer group">
                  <Checkbox 
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: !!checked})}
                    className="size-5 rounded-md dark:border-slate-700"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer group-hover:text-purple-600 transition-colors">Hiển thị dịch vụ</label>
                </div>
                
                <div className="flex items-center gap-2.5 cursor-pointer group">
                  <Checkbox 
                    id="isMaintenance"
                    checked={formData.isMaintenance}
                    onCheckedChange={(checked) => setFormData({...formData, isMaintenance: !!checked})}
                    className="size-5 rounded-md dark:border-slate-700 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                  />
                  <label htmlFor="isMaintenance" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer group-hover:text-orange-600 transition-colors">Bảo trì</label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1 h-11 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl dark:bg-slate-900"
                >
                  Đóng
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 h-11 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/10 transition-all active:scale-[0.98]"
                >
                  {editingService ? "Lưu thay đổi" : "Tạo dịch vụ"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
