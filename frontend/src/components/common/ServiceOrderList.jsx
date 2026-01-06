import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ServiceOrderList = ({ serviceType }) => {
  const [filters, setFilters] = useState({
    limit: '10',
    fromDate: '',
    toDate: '',
    status: 'Tất cả',
    search: ''
  });

  const columns = [
    'STT', 'THAO TÁC', 'MÃ ĐƠN HÀNG', 'LINK/UID', 'MÁY CHỦ', 
    'SỐ LƯỢNG', 'CẢM XÚC', 'BÌNH LUẬN', 'BAN ĐẦU', 'ĐÃ TĂNG', 
    'TRẠNG THÁI', 'GIÁ TIỀN', 'THANH TOÁN', 'CẬP NHẬT', 
    'THỜI GIAN TẠO', 'GHI CHÚ'
  ];

  console.log('Service Type:', serviceType);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hiển thị</label>
          <Select value={filters.limit} onValueChange={(v) => handleFilterChange('limit', v)}>
            <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Từ ngày</label>
          <input
            type="date"
            className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
            value={filters.fromDate}
            onChange={(e) => handleFilterChange('fromDate', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Đến ngày</label>
          <input
            type="date"
            className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
            value={filters.toDate}
            onChange={(e) => handleFilterChange('toDate', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Trạng thái</label>
          <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
            <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tất cả">Tất cả</SelectItem>
              <SelectItem value="Đang chạy">Đang chạy</SelectItem>
              <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
              <SelectItem value="Hủy">Hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tìm Kiếm Đơn</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Nhập mã đơn hoặc link..."
              className="w-full h-9 pl-3 pr-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <button className="absolute right-0 top-0 h-full px-3 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 transition-colors">
              <span className="material-symbols-outlined text-[18px] leading-none">search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col} className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-center py-4">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={columns.length} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                  <div className="relative">
                    <span className="material-symbols-outlined text-[80px]">inventory_2</span>
                    <span className="material-symbols-outlined absolute bottom-0 right-0 text-[24px] bg-slate-100 dark:bg-slate-800 rounded-full p-1 transform translate-x-1/4 translate-y-1/4">
                        more_horiz
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-500">Không có dữ liệu</p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ServiceOrderList;
