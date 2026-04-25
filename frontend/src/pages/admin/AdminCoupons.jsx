import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import ConfirmModal from '@/components/common/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Calendar, Ticket, Edit } from 'lucide-react';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percent',
    discountValue: '',
    totalQuantity: '',
    expiryDate: ''
  });
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteData, setDeleteData] = useState(null);

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const fetchCoupons = React.useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/admin/coupons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setCoupons(res.data.coupons || []);
      }
    } catch {
      toast.error("Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCreate = async () => {
    if (!newCoupon.code || !newCoupon.discountValue || !newCoupon.totalQuantity || !newCoupon.expiryDate) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        code: newCoupon.code,
        totalQuantity: parseInt(newCoupon.totalQuantity),
        expiryDate: new Date(newCoupon.expiryDate).toISOString(),
        discountPercent: newCoupon.discountType === 'percent' ? parseInt(newCoupon.discountValue) : 0,
        discountAmount: newCoupon.discountType === 'amount' ? parseInt(newCoupon.discountValue) : 0
      };

      const res = await axios.post(`${API_URL}/api/admin/coupons`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        toast.success("Tạo mã giảm giá thành công");
        setIsAddOpen(false);
        setNewCoupon({ code: '', discountType: 'percent', discountValue: '', totalQuantity: '', expiryDate: '' });
        fetchCoupons();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi tạo mã giảm giá");
    }
  };

  const confirmDelete = (id) => {
    setDeleteData({ id });
  };

  const executeDelete = async () => {
    if (!deleteData) return;
    const { id } = deleteData;
    setDeleteData(null);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${API_URL}/api/admin/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        toast.success("Đã xóa mã giảm giá");
        fetchCoupons();
      }
    } catch {
      toast.error("Lỗi khi xóa mã giảm giá");
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon({
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountPercent > 0 ? 'percent' : 'amount',
        discountValue: coupon.discountPercent > 0 ? coupon.discountPercent : coupon.discountAmount,
        totalQuantity: coupon.totalQuantity,
        expiryDate: new Date(coupon.expiryDate).toISOString().slice(0, 16) // format for datetime-local
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCoupon.code || !editingCoupon.discountValue || !editingCoupon.totalQuantity || !editingCoupon.expiryDate) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        code: editingCoupon.code,
        totalQuantity: parseInt(editingCoupon.totalQuantity),
        expiryDate: new Date(editingCoupon.expiryDate).toISOString(),
        discountPercent: editingCoupon.discountType === 'percent' ? parseInt(editingCoupon.discountValue) : 0,
        discountAmount: editingCoupon.discountType === 'amount' ? parseInt(editingCoupon.discountValue) : 0
      };

      const res = await axios.put(`${API_URL}/api/admin/coupons/${editingCoupon._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        toast.success("Cập nhật mã giảm giá thành công");
        setIsEditOpen(false);
        fetchCoupons();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật mã giảm giá");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_URL}/api/admin/coupons/${id}/status`, { 
        isActive: !currentStatus 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setCoupons(coupons.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
        toast.success("Đã cập nhật trạng thái");
      }
    } catch {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Ticket className="text-purple-600" /> Quản Lý Mã Giảm Giá
          </h1>
          <p className="text-slate-500 text-sm mt-1">Tạo và quản lý các mã khuyến mãi cho người dùng</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
          <Plus size={18} /> Thêm Mã Mới
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Giảm Giá</TableHead>
              <TableHead>Số Lượng</TableHead>
              <TableHead>Đã Dùng</TableHead>
              <TableHead>Hết Hạn</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="text-right">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-slate-400">Đang tải...</TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-slate-400 font-medium italic">Chưa có mã giảm giá nào</TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => {
                const isExpired = new Date(coupon.expiryDate) < new Date();
                return (
                  <TableRow key={coupon._id}>
                    <TableCell className="font-bold text-purple-600">{coupon.code}</TableCell>
                    <TableCell>
                      {coupon.discountPercent > 0 ? (
                        <Badge variant="outline" className="border-cyan-400 text-cyan-600">{coupon.discountPercent}%</Badge>
                      ) : (
                        <span className="font-semibold">{coupon.discountAmount.toLocaleString()}đ</span>
                      )}
                    </TableCell>
                    <TableCell>{coupon.totalQuantity}</TableCell>
                    <TableCell>{coupon.usedQuantity}</TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 text-sm ${isExpired ? 'text-red-500' : 'text-slate-600'}`}>
                        <Calendar size={14} />
                        {new Date(coupon.expiryDate).toLocaleString('vi-VN')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={coupon.isActive} 
                          onCheckedChange={() => handleToggleStatus(coupon._id, coupon.isActive)} 
                        />
                        <span className={`text-xs font-medium ${coupon.isActive ? 'text-green-500' : 'text-slate-400'}`}>
                          {coupon.isActive ? 'Hoạt động' : 'Tắt'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(coupon)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                          <Edit size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(coupon._id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm Mã Giảm Giá Mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Mã Code (In hoa)</label>
              <Input 
                placeholder="Ví dụ: GIAM10" 
                value={newCoupon.code} 
                onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Loại Giảm Giá</label>
                <Select value={newCoupon.discountType} onValueChange={val => setNewCoupon({...newCoupon, discountType: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Phần trăm (%)</SelectItem>
                    <SelectItem value="amount">Số tiền cố định (đ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Giá trị</label>
                <Input 
                  type="number" 
                  placeholder={newCoupon.discountType === 'percent' ? "Số %" : "Số tiền"} 
                  value={newCoupon.discountValue}
                  onChange={e => setNewCoupon({...newCoupon, discountValue: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Tổng số lượng</label>
                <Input 
                  type="number" 
                  placeholder="Lượt dùng" 
                  value={newCoupon.totalQuantity}
                  onChange={e => setNewCoupon({...newCoupon, totalQuantity: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Thời hạn sử dụng</label>
                <Input 
                  type="datetime-local" 
                  value={newCoupon.expiryDate}
                  onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleCreate}>Xác Nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Mã Giảm Giá</DialogTitle>
          </DialogHeader>
          {editingCoupon && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Mã Code (In hoa)</label>
                <Input 
                  placeholder="Ví dụ: GIAM10" 
                  value={editingCoupon.code} 
                  onChange={e => setEditingCoupon({...editingCoupon, code: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Loại Giảm Giá</label>
                  <Select value={editingCoupon.discountType} onValueChange={val => setEditingCoupon({...editingCoupon, discountType: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Phần trăm (%)</SelectItem>
                      <SelectItem value="amount">Số tiền cố định (đ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Giá trị</label>
                  <Input 
                    type="number" 
                    placeholder={editingCoupon.discountType === 'percent' ? "Số %" : "Số tiền"} 
                    value={editingCoupon.discountValue}
                    onChange={e => setEditingCoupon({...editingCoupon, discountValue: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Tổng số lượng</label>
                  <Input 
                    type="number" 
                    placeholder="Lượt dùng" 
                    value={editingCoupon.totalQuantity}
                    onChange={e => setEditingCoupon({...editingCoupon, totalQuantity: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Thời hạn sử dụng</label>
                  <Input 
                    type="datetime-local" 
                    value={editingCoupon.expiryDate}
                    onChange={e => setEditingCoupon({...editingCoupon, expiryDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleUpdate}>Cập Nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal 
        isOpen={!!deleteData}
        title="Xác nhận xóa mã giảm giá"
        message="Bạn có chắc chắn muốn xóa mã này không? Thao tác này không thể hoàn tác."
        onConfirm={executeDelete}
        onCancel={() => setDeleteData(null)}
      />
    </div>
  );
};

export default AdminCoupons;
