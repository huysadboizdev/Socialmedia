import settingModel from '../models/settingModel.js';

export const getSetting = async (key: string) => {
  const setting = await settingModel.findOne({ key });
  return setting ? (setting.value as unknown) : null;
};

export const updateSetting = async (key: string, value: unknown, description?: string) => {
  const setting = await settingModel.findOneAndUpdate(
    { key },
    { value, description },
    { upsert: true, new: true }
  );
  return { success: true, setting };
};

export const getAllSettings = async () => {
  const settings = await settingModel.find();
  return { success: true, settings };
};
