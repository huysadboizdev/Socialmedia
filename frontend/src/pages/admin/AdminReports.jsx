import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
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
    DialogFooter
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState('resolved');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setReports(res.data.reports);
      }
    } catch (error) {
      console.error("Fetch reports error:", error);
      toast.error("Không thể tải danh sách báo lỗi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleReplySubmit = async () => {
      if (!selectedReport) return;
      
      try {
          setIsSubmitting(true);
          const token = localStorage.getItem("token");
          const res = await axios.post(`${API_URL}/api/admin/reply-report`, {
              orderId: selectedReport._id,
              response: replyMessage,
              status: replyStatus
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });

          if (res.data.success) {
              toast.success("Đã phản hồi và gửi thông báo cho người dùng");
              setSelectedReport(null);
              setReplyMessage('');
              fetchReports(); // Refresh list
          } else {
              toast.error(res.data.message || "Lỗi khi gửi phản hồi");
          }
      } catch (error) {
          console.error("Reply error:", error);
          toast.error("Lỗi kết nối");
      } finally {
          setIsSubmitting(false);
      }
  }

  const openReplyDialog = (report) => {
      setSelectedReport(report);
      setReplyMessage(report.report?.adminResponse || '');
      setReplyStatus(report.report?.status || 'resolved');
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Quản Lý Báo Lỗi</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Xem và phản hồi các báo cáo lỗi từ người dùng.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead className="w-[50px] text-center">STT</TableHead>
              <TableHead>Mã Đơn</TableHead>
              <TableHead>Người Dùng</TableHead>
              <TableHead>Dịch Vụ</TableHead>
              <TableHead>Vấn Đề</TableHead>
              <TableHead>Ghi Chú</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead>Thời Gian</TableHead>
              <TableHead className="text-right">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                 <TableCell colSpan={9} className="h-32 text-center text-slate-500">
                   Đang tải...
                 </TableCell>
              </TableRow>
            ) : reports.length > 0 ? (
              reports.map((order, index) => (
                <TableRow key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <TableCell className="text-center font-medium">{index + 1}</TableCell>
                  <TableCell className="font-mono text-xs">{order._id.slice(-6).toUpperCase()}</TableCell>
                  <TableCell>
                      <div className="flex flex-col">
                          <span className="font-medium text-sm">{order.userId?.username}</span>
                          <span className="text-xs text-slate-500">{order.userId?.email}</span>
                      </div>
                  </TableCell>
                  <TableCell className="text-sm">{order.service?.name}</TableCell>
                  <TableCell className="text-sm font-bold text-red-500">{order.report?.message}</TableCell>
                  <TableCell className="text-sm text-slate-500 max-w-[200px] truncate" title={order.report?.note}>
                      {order.report?.note || '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      order.report?.status === 'resolved' ? 'bg-green-100 text-green-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {order.report?.status === 'resolved' ? 'Đã xử lý' : 'Chờ xử lý'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {order.report?.createdAt ? new Date(order.report.createdAt).toLocaleString('vi-VN') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                      <button 
                        onClick={() => openReplyDialog(order)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                      >
                          Phản hồi
                      </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-64 text-center text-slate-500">
                  Không có báo cáo nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Phản hồi báo cáo #{selectedReport?._id.slice(-6).toUpperCase()}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Vấn đề người dùng báo:</label>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-sm">
                        <p className="font-bold text-red-500">{selectedReport?.report?.message}</p>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">{selectedReport?.report?.note}</p>
                    </div>
                </div>
                
                <div className="grid gap-2">
                    <label className="text-sm font-medium">Trạng thái xử lý:</label>
                    <Select value={replyStatus} onValueChange={setReplyStatus}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Đang chờ (Pending)</SelectItem>
                            <SelectItem value="resolved">Đã xử lý (Resolved)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <label className="text-sm font-medium">Nội dung phản hồi:</label>
                    <textarea 
                        className="w-full min-h-[100px] p-3 rounded-md border text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none dark:bg-slate-900 dark:border-slate-700"
                        placeholder="Nhập phản hồi cho người dùng..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                    />
                </div>
            </div>
            <DialogFooter>
                <button onClick={() => setSelectedReport(null)} className="px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">Hủy</button>
                <button 
                    onClick={handleReplySubmit} 
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:bg-purple-400"
                >
                    {isSubmitting && <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>}
                    Gửi phản hồi
                </button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReports;
