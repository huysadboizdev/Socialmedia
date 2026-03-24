import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useCoupon = (couponCode, quantity, baseUnitPrice, API_URL) => {
  const [couponData, setCouponData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);

  const validateCoupon = useCallback(async (code) => {
    setIsValidating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/user/service`, { 
        action: 'validateCoupon', 
        couponCode: code || "" 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setCouponData(res.data);
        setError(null);
      } else {
        // Still set coupon data if it contains userDiscounts, but set error
        if (res.data.userDiscounts) {
          setCouponData(res.data);
        } else {
          setCouponData(null);
        }
        setError(res.data.message || res.data.error || "Mã giảm giá không hợp lệ");
      }
    } catch {
      setCouponData(null);
      setError("Lỗi kết nối khi kiểm tra mã giảm giá");
    } finally {
      setIsValidating(false);
    }
  }, [API_URL]);

  useEffect(() => {
    // Basic debounce for coupon code entry
    const timer = setTimeout(() => {
      validateCoupon(couponCode);
    }, couponCode ? 600 : 0); // Immediate fetch if no code (initial load)
    return () => clearTimeout(timer);
  }, [couponCode, validateCoupon]);

  const baseTotal = (parseInt(quantity) || 0) * (baseUnitPrice || 0);

  const calculateFinalPrice = () => {
    if (!couponData) return baseTotal;
    
    const userRankPercent = (couponData.userDiscounts?.rankPercent || 0) / 100;
    const weeklyPercent = (couponData.userDiscounts?.weeklyPercent || 0) / 100;
    const couponPercent = (couponData.couponInfo?.couponDiscountPercent || 0) / 100;
    
    const maxPercent = Math.max(userRankPercent, weeklyPercent, couponPercent);
    
    let final = baseTotal - Math.floor(baseTotal * maxPercent);
    
    const couponAmount = couponData.couponInfo?.couponDiscountAmount || 0;
    if (couponAmount > 0) {
      final = Math.max(0, final - couponAmount);
    }
    return final;
  };

  return {
    couponData,
    isValidating,
    error,
    discountedPrice: calculateFinalPrice(),
    originalPrice: baseTotal,
    hasDiscount: calculateFinalPrice() < baseTotal,
    isCouponApplied: !!(couponData?.couponInfo?.isValid)
  };
};

export default useCoupon;
