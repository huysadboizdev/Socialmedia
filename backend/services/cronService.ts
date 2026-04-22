import cron from 'node-cron';
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import transactionModel from '../models/transactionModel.js';
import notificationModel from '../models/notificationModel.js';
import { checkSmmStatus } from './smmApiService.js';

export const initCronJobs = () => {
    // Chạy ngầm định kỳ mỗi 10 phút
    cron.schedule('*/10 * * * *', async () => {
        console.log('[CRON] Bắt đầu đồng bộ trạng thái đơn hàng từ SMM79...');
        try {
            // Lấy các đơn hàng có dính mã API và đang chưa xong
            const pendingOrders = await orderModel.find({
                externalOrderId: { $ne: "", $exists: true },
                status: { $in: ['Pending', 'In Progress'] }
            });

            if (pendingOrders.length === 0) return;

            for (const order of pendingOrders) {
                const apiResponse = await checkSmmStatus(order.externalOrderId);

                // API Error hoặc order_id không hợp lệ (đôi khi api trả về "error" text)
                if (!apiResponse.error && apiResponse.status) {
                    const smmStatus = apiResponse.status.toLowerCase();
                    const remains = parseFloat(apiResponse.remains ?? "0") || 0;
                    const charge = parseFloat(apiResponse.charge ?? "0") || 0;

                    let newLocalStatus = order.status;

                    if (smmStatus === 'completed') {
                        newLocalStatus = 'Completed';
                    } else if (smmStatus === 'processing' || smmStatus === 'in progress') {
                        newLocalStatus = 'In Progress';
                    } else if (smmStatus === 'canceled' || smmStatus === 'partial') {
                        newLocalStatus = smmStatus === 'canceled' ? 'Cancelled' : 'Completed'; 
                        
                        // Xử lý hoàn tiền
                        const totalVirtualPrice = order.totalPrice; 
                        const originalQuantity = order.quantity;
                        
                        let refundAmount = 0;
                        if (smmStatus === 'canceled') {
                            refundAmount = totalVirtualPrice; 
                        } else {
                            const ratio = remains / originalQuantity;
                            refundAmount = Math.floor(totalVirtualPrice * ratio);
                        }

                        if (refundAmount > 0 && !order.get('report')) {
                           const user = await userModel.findById(order.userId);
                           if (user) {
                               const oldBalance = user.balance || 0;
                               user.balance = oldBalance + refundAmount;
                               await user.save();
                               
                               // Viết log lại vào order (Lưu ý: Mongoose Schema 'report' nếu đã strict thì update cẩn thận)
                               order.set('report', {
                                  message: `Hệ thống tự động hoàn tiền ${refundAmount.toLocaleString('vi-VN')} đ do nhà cung cấp báo: ${smmStatus.toUpperCase()}. (Số lượng thiếu: ${remains})`,
                                  note: `SMM API Charge: ${charge}`,
                                  status: 'resolved',
                                  createdAt: new Date(),
                                  adminResponse: "Auto-refunded by System"
                               });

                               // Ghi giao dịch
                               await transactionModel.create({
                                    userId: user._id,
                                    amount: refundAmount,
                                    type: 'refund',
                                    description: `Hoàn tiền tự động cho đơn hàng bị huỷ/thiếu (Mã đơn: ${order._id.toString()})`,
                                    oldBalance: oldBalance,
                                    newBalance: user.balance,
                                    balanceType: 'profile',
                                    status: 'approved',
                                    createdAt: new Date()
                               });

                               // Báo user
                               await notificationModel.create({
                                    userId: user._id,
                                    type: 'success',
                                    message: `[HOÀN TIỀN] Bạn đã được tự động hoàn lại ${refundAmount.toLocaleString('vi-VN')} đ do đơn hàng ${order._id.toString()} bị huỷ hoặc chạy thiếu.`,
                                    isRead: false,
                                    createdAt: new Date()
                               });
                           }
                        }
                    } else if (smmStatus === 'pending') {
                        newLocalStatus = 'Pending';
                    }

                    order.status = newLocalStatus as 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
                    order.set('apiCharge', charge);
                    order.set('remains', remains);
                    await order.save();
                }
            }
        } catch (err) {
            console.error('[CRON] Lỗi đồng bộ trạng thái:', err);
        }
    });
};
