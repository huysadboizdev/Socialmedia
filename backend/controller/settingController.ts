import type { Request, Response } from 'express';
import * as settingService from '../services/settingService.js';

export const getAnnouncement = async (_req: Request, res: Response) => {
  try {
    const value = await settingService.getSetting('announcement');
    return res.json({ success: true, announcement: value });
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
