import type { Request, Response } from 'express';
import * as settingService from '../services/settingService.js';

export const getAnnouncement = async (_req: Request, res: Response) => {
  try {
    const announcementData = await settingService.getSetting('announcement') as { title: string, items: { icon: string, text: string }[] } | null;
    const bonus = await settingService.getSetting('depositBonus') as { percent: number, expiry: string } | null;

    if (announcementData?.items && bonus?.percent && bonus.percent > 0 && bonus.expiry && new Date(bonus.expiry) > new Date()) {
      const { items } = announcementData;
      // Find or create bonus item (with fire icon as in user request)
      const bonusItemIndex = items.findIndex(item => item.icon === '🔥' || item.text.includes('Khuyến Mại Nạp'));
      const expiryDate = new Date(bonus.expiry).toLocaleDateString('vi-VN');
      const bonusText = `Khuyến Mại Nạp ${bonus.percent}% (Đến hết ${expiryDate})`;
      
      const existingItem = items[bonusItemIndex];
      if (existingItem) {
        existingItem.text = bonusText;
      } else {
        // Prepend so it's visible at the top
        items.unshift({ icon: '🔥', text: bonusText });
      }
    }

    return res.json({ success: true, announcement: announcementData });
  } catch (error: unknown) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    const { value } = req.body as { value: any };
    const result = await settingService.updateSetting('announcement', value, 'Startup announcement popup content');
    return res.json(result);
  } catch (error: unknown) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
  }
};

export const listSettings = async (_req: Request, res: Response) => {
  try {
    const result = await settingService.getAllSettings();
    return res.json(result);
  } catch (error: unknown) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
  }
};

export const getMembershipConfig = async (_req: Request, res: Response) => {
  try {
    const value = await settingService.getSetting('membershipConfig');
    return res.json({ success: true, config: value });
  } catch (error: unknown) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
  }
};

export const updateMembershipConfig = async (req: Request, res: Response) => {
  try {
    const { value } = req.body as { value: unknown };
    const result = await settingService.updateSetting('membershipConfig', value, 'Membership tiers and discounts configuration');
    return res.json(result);
  } catch (error: unknown) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
  }
};
export const getDepositBonus = async (_req: Request, res: Response) => {
  try {
    const value = await settingService.getSetting('depositBonus');
    return res.json({ success: true, bonus: value ?? { percent: 0, expiry: null } });
  } catch (error: unknown) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
  }
};

export const updateDepositBonus = async (req: Request, res: Response) => {
  try {
    const { percent, expiry } = req.body as { percent: number, expiry: string };
    const value = { percent, expiry: new Date(expiry) };
    const result = await settingService.updateSetting('depositBonus', value, 'Global automated deposit bonus configuration');
    return res.json(result);
  } catch (error: unknown) {
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
  }
};
