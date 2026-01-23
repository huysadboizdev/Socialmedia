import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import axios from 'axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const Deposit = () => {
    const [amount, setAmount] = useState('');
    const [showQR, setShowQR] = useState(false);
    const [qrContent, setQrContent] = useState('');
    const [qrUrl, setQrUrl] = useState('');
    const [timeLeft, setTimeLeft] = useState(null); // Timer state in seconds
    const [successData, setSuccessData] = useState(null);

    const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    // Restore from localStorage on mount
    React.useEffect(() => {
        const savedTx = localStorage.getItem('pendingDeposit');
        if (savedTx) {
            try {
                const { amount, content, expiry } = JSON.parse(savedTx);
                const now = Date.now();
                const remaining = Math.floor((expiry - now) / 1000);

                if (remaining > 0) {
                    setAmount(amount.toLocaleString('vi-VN'));
                    setQrContent(content);
                    // Updated to SePay QR format
                    setQrUrl(`https://qr.sepay.vn/img?bank=TPBank&acc=HUYDEV204&template=compact&amount=${amount}&des=${content}`);
                    setShowQR(true);
                    setTimeLeft(remaining);
                } else {
                    localStorage.removeItem('pendingDeposit');
                }
            } catch (e) {
                console.error("Error restoring pending deposit", e);
                localStorage.removeItem('pendingDeposit');
            }
        }
    }, []);

    // Timer logic
    React.useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft <= 0) {
            setShowQR(false); // Hide QR when time invalid
            setTimeLeft(null);
            localStorage.removeItem('pendingDeposit'); // Clear storage
            toast.error("Giao dịch đã hết hạn, vui lòng tạo lệnh mới");
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft]);

    // Polling Transaction Status
    React.useEffect(() => {
        if (!showQR || !qrContent) return;

        const checkStatus = async () => {
             try {
                const res = await axios.get(`${API_URL}/api/payment/check-status/${qrContent}`);
                if (res.data && res.data.status === 'approved') {
                    // Success!
                    setSuccessData({
                        amount: parseInt(res.data.amount).toLocaleString('vi-VN'),
                        date: new Date().toLocaleString('vi-VN')
                    });
                    
                    setShowQR(false);
                    setAmount('');
                    setTimeLeft(null);
                    localStorage.removeItem('pendingDeposit');
                    // Optional: Refresh user balance here if you have a context/function
                    // window.location.reload(); 
                }
             } catch (error) {
                 // Ignore 404 (not found yet) or network errors during polling
                 if (error.response && error.response.status !== 404) {
                     console.error("Polling error", error);
                 }
             }
        };

        const pollInterval = setInterval(checkStatus, 3000); // Check every 3 seconds

        return () => clearInterval(pollInterval);
    }, [showQR, qrContent, API_URL]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleConfirm = async () => {
        const value = parseInt(amount.replace(/[^0-9]/g, ''), 10);

        if (!value || value < 10000) {
            toast.error('Số tiền nạp tối thiểu là 10.000đ');
            return;
        }

        if (value > 100000000) {
            toast.error('Số tiền nạp tối đa là 100.000.000đ');
            return;
        }

        // Generate random content: HUYTICHXANH + 3 random digits
        const randomDigits = Math.floor(100 + Math.random() * 900);
        const content = `HUYTICHXANH${randomDigits}`;
        setQrContent(content);

        // Generate SePay QR URL
        // Template: https://qr.sepay.vn/img?bank=TPBank&acc=HUYDEV204&template=compact&amount=&des=
        const url = `https://qr.sepay.vn/img?bank=TPBank&acc=HUYDEV204&template=compact&amount=${value}&des=${content}`;
        setQrUrl(url);
        setShowQR(true);
        setTimeLeft(600); // 10 minutes = 600 seconds

        // Save to localStorage
        const expiry = Date.now() + 600 * 1000;
        localStorage.setItem('pendingDeposit', JSON.stringify({
            amount: value,
            content: content,
            expiry: expiry
        }));

        // Create Pending Transaction in Backend
        try {
            const token = localStorage.getItem('token');
            if (token) {
                 await axios.post(`${API_URL}/api/user/deposit`, {
                    userId: JSON.parse(localStorage.getItem('user'))._id, 
                    amount: value,
                    content: content
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error("Failed to create pending transaction", error);
            // Non-blocking error
            toast.error("Không thể tạo giao dịch trên hệ thống, vui lòng liên hệ Admin nếu đã chuyển khoản.");
        }
    };

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setAmount(value ? parseInt(value, 10).toLocaleString('vi-VN') : '');
        if (showQR) {
            setShowQR(false); // Reset QR when amount changes to prevent mismatch
            setTimeLeft(null);
            localStorage.removeItem('pendingDeposit');
        }
    };

    return (
        <div className="flex-1 min-h-full p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                 {/* Header Banner */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 shadow-xl">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                     <div className="relative p-8 md:p-12 text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 uppercase tracking-tight">
                            Nạp Tiền Vào Tài Khoản
                        </h1>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                            <span className="text-orange-400 font-bold">TỶ LỆ NẠP 1:1</span>
                            <span className="text-slate-400 text-sm">|</span>
                             <span className="text-slate-300 text-sm">Nạp bao nhiêu nhận bấy nhiêu</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                     {/* Input Form */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Nhập số tiền cần nạp</label>
                                <div className="relative">
                                    <Input 
                                        type="text" 
                                        placeholder="Ví dụ: 50.000" 
                                        className="h-12 pl-4 pr-12 text-lg font-bold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                                        value={amount}
                                        onChange={handleAmountChange}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">VNĐ</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Số tiền tối thiểu: <span className="font-bold text-slate-700 dark:text-slate-300">10.000đ</span> - Tối đa: <span className="font-bold text-slate-700 dark:text-slate-300">100.000.000đ</span>
                                </p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50 space-y-2">
                                <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-2">Lưu ý quan trọng:</h4>
                                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4">
                                    <li>Vui lòng chuyển khoản đúng nội dung để được cộng tiền tự động.</li>
                                    <li>Hệ thống sẽ tự động cộng tiền sau 1-3 phút.</li>
                                    <li>Nếu quá 5 phút chưa nhận được tiền, vui lòng liên hệ Admin.</li>
                                </ul>
                            </div>

                            <Button 
                                onClick={handleConfirm}
                                className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all"
                            >
                                Xác Nhận Nạp Tiền
                            </Button>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    {showQR ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Thanh Toán Đơn Hàng</h3>
                                    <p className="text-sm text-slate-500">Quét mã QR bằng ứng dụng ngân hàng</p>
                                </div>
                                
                                <div className="relative p-3 bg-white border border-slate-100 rounded-xl inline-block shadow-sm">
                                    {/* VietQR Image */}
                                    <img 
                                        src={qrUrl} 
                                        alt="VietQR" 
                                        className="w-full max-w-[280px] h-auto rounded-lg mx-auto"
                                    />
                                    <div className="mt-3 flex items-center justify-center gap-4 text-xs font-bold text-slate-600">
                                         <span className="flex items-center gap-1"><img src="https://static.mservice.io/img/logo-momo.png" className="w-4 h-4 object-contain grayscale opacity-50"/> NAPAS 247</span>
                                         <span className="w-px h-3 bg-slate-300"></span>
                                         <span>TPBANK</span>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3 text-left">
                                    <div className="flex justify-between items-center text-sm">
                                         <span className="text-slate-500">Ngân hàng:</span>
                                         <span className="font-bold text-slate-800 dark:text-slate-200">TPBank</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                         <span className="text-slate-500">Số tài khoản:</span>
                                         <div className="flex items-center gap-2">
                                             <span className="font-bold text-slate-800 dark:text-slate-200">HUYDEV204</span>
                                              <button className="text-blue-500 hover:text-blue-600 text-[10px] font-bold uppercase" onClick={() => {navigator.clipboard.writeText('HUYDEV204'); toast.success('Đã sao chép')}}>Copy</button>
                                         </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                         <span className="text-slate-500">Chủ tài khoản:</span>
                                         <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">HA QUANG HUY</span>
                                    </div>
                                     <div className="flex justify-between items-center text-sm pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                                         <span className="text-slate-500">Số tiền:</span>
                                         <span className="font-bold text-emerald-600 text-lg">{amount}đ</span>
                                    </div>
                                     <div className="flex justify-between items-center text-sm">
                                         <span className="text-slate-500">Nội dung CK:</span>
                                         <div className="flex items-center gap-2">
                                             <span className="font-bold text-red-500">{qrContent}</span>
                                             <button className="text-blue-500 hover:text-blue-600 text-[10px] font-bold uppercase" onClick={() => {navigator.clipboard.writeText(qrContent); toast.success('Đã sao chép')}}>Copy</button>
                                         </div>
                                    </div>
                                </div>

                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col items-center gap-2">
                                    <span className="text-xs font-medium text-amber-500 uppercase tracking-wider">Trạng thái</span>
                                    <div className="flex items-center gap-2 text-amber-500 font-bold text-lg animate-pulse">
                                        <span>Chờ thanh toán...</span>
                                        <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                    </div>
                                    <div className="text-sm font-medium text-slate-400">
                                        Thời gian còn lại: <span className="text-slate-200">{formatTime(timeLeft)}</span>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-400 italic">
                                    Lưu ý: Giữ nguyên nội dung chuyển khoản để hệ thống tự động xử lý.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="hidden md:flex flex-col items-center justify-center p-12 text-center space-y-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl h-full min-h-[400px]">
                            <div className="size-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center">
                                 <span className="material-symbols-outlined text-4xl text-slate-300">qr_code_2</span>
                            </div>
                            <div className="space-y-1 max-w-xs">
                                <h3 className="font-bold text-slate-400 dark:text-slate-500">Chưa tạo mã QR</h3>
                                <p className="text-sm text-slate-400 dark:text-slate-600">
                                    Vui lòng nhập số tiền và bấm xác nhận để tạo mã QR thanh toán.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Success Modal */}
            <AlertDialog open={!!successData} onOpenChange={() => setSuccessData(null)}>
                <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <AlertDialogHeader>
                        <div className="mx-auto size-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-500">check_circle</span>
                        </div>
                        <AlertDialogTitle className="text-center text-2xl font-bold text-slate-800 dark:text-white">
                            Nạp Tiền Thành Công!
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center space-y-2">
                            <span className="block text-slate-500">Bạn vừa nạp thành công số tiền</span>
                            <span className="block text-3xl font-black text-green-600 dark:text-green-500">
                                {successData?.amount}đ
                            </span>
                            <span className="block text-xs text-slate-400">
                                {successData?.date}
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center">
                        <AlertDialogAction 
                            onClick={() => {
                                setSuccessData(null);
                                // Optional: Reload page to update balance header if needed
                                // window.location.reload(); 
                            }}
                            className="w-full sm:w-auto min-w-[120px] bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                        >
                            HOÀN TẤT
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Deposit;
