import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActiveCouponsList = ({ onApply, appliedCouponCode }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/user/coupons/active`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setCoupons(res.data.coupons);
        }
      } catch (error) {
        console.error("Failed to fetch active coupons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, [API_URL]);

  if (loading || coupons.length === 0) return null;

  return (
    <div className="mt-3">
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
        Mã giảm giá khả dụng:
      </label>
      <div className="flex overflow-x-auto pb-2 gap-3 custom-scrollbar">
        {coupons.map((coupon) => {
          const isApplied = appliedCouponCode?.toUpperCase() === coupon.code.toUpperCase();
          const discountText = coupon.discountPercent > 0 
            ? `${coupon.discountPercent}%` 
            : `${coupon.discountAmount.toLocaleString('vi-VN')}đ`;

          return (
            <div 
              key={coupon._id}
              onClick={() => onApply(coupon.code)}
              className={`min-w-[200px] border rounded-lg p-3 cursor-pointer transition-all flex flex-col relative overflow-hidden ${
                isApplied 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-300 dark:hover:border-purple-600'
              }`}
            >
              {/* Decorative ticket notch */}
              <div className="absolute top-1/2 -left-2 w-4 h-4 bg-slate-50 dark:bg-slate-900 rounded-full transform -translate-y-1/2 border-r border-transparent"></div>
              <div className="absolute top-1/2 -right-2 w-4 h-4 bg-slate-50 dark:bg-slate-900 rounded-full transform -translate-y-1/2 border-l border-transparent"></div>
              
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-purple-700 dark:text-purple-400 text-sm">{coupon.code}</span>
                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  -{discountText}
                </span>
              </div>
              
              <div className="flex justify-between items-end mt-2">
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  <div>HSD: {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}</div>
                  <div>Đã dùng: {coupon.usedQuantity}/{coupon.totalQuantity}</div>
                </div>
                {isApplied && (
                  <span className="material-symbols-outlined text-purple-600 text-[16px]">check_circle</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveCouponsList;
