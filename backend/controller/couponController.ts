import type { RequestHandler } from 'express';
import couponModel from '../models/couponModel.js';

export const createCoupon: RequestHandler = async (req, res) => {
  try {
    const { code, discountPercent, discountAmount, totalQuantity, expiryDate } = req.body as { 
      code: string, 
      discountPercent?: number, 
      discountAmount?: number, 
      totalQuantity: number, 
      expiryDate: string 
    };

    const existing = await couponModel.findOne({ code: code.toUpperCase() });
    if (existing) {
      res.status(400).json({ success: false, message: 'Mã giảm giá đã tồn tại' });
      return;
    }

    const coupon = await couponModel.create({
      code,
      discountPercent: discountPercent ?? 0,
      discountAmount: discountAmount ?? 0,
      totalQuantity,
      expiryDate: new Date(expiryDate)
    });

    res.json({ success: true, message: 'Tạo mã giảm giá thành công', coupon });
    return;
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
    return;
  }
};

export const listCoupons: RequestHandler = async (_req, res) => {
  try {
    const coupons = await couponModel.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
    return;
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
    return;
  }
};

export const deleteCoupon: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await couponModel.findByIdAndDelete(id);
    res.json({ success: true, message: 'Xóa mã giảm giá thành công' });
    return;
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
    return;
  }
};

export const updateCouponStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body as { isActive: boolean };
    const coupon = await couponModel.findByIdAndUpdate(id, { isActive }, { new: true });
    res.json({ success: true, message: 'Cập nhật trạng thái thành công', coupon });
    return;
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
    return;
  }
};
export const updateCoupon: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discountPercent, discountAmount, totalQuantity, expiryDate } = req.body as { 
      code: string, 
      discountPercent?: number, 
      discountAmount?: number, 
      totalQuantity: number, 
      expiryDate: string 
    };

    const coupon = await couponModel.findByIdAndUpdate(id, {
      code: code.toUpperCase(),
      discountPercent: discountPercent ?? 0,
      discountAmount: discountAmount ?? 0,
      totalQuantity,
      expiryDate: new Date(expiryDate)
    }, { new: true });

    if (!coupon) {
      res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' });
      return;
    }

    res.json({ success: true, message: 'Cập nhật mã giảm giá thành công', coupon });
    return;
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
    return;
  }
};
