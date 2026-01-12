import type { Request, Response } from 'express'
import * as userService from '../services/userService.js'
import loginService, { type LoginParams } from '../services/auth/login.js'
import registerService, { type RegisterParams } from '../services/auth/register.js'

interface AuthRequest extends Request {
  authUserId?: string;
}

// register user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await registerService(req.body as RegisterParams)
    return res.json(result)
  } catch (err: unknown) {
    return res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// login
export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginService(req.body as LoginParams)
    return res.json(result)
  } catch (err: unknown) {
    return res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// get info user
export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.authUserId ?? (req.body as { userId: string }).userId
    const result = await userService.getInfo(userId)
    return res.json(result)
  } catch (err: unknown) {
    return res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// update profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    console.log("Update Profile Request:");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("File:", req.file);
    console.log("AuthUserId:", req.authUserId);
    
    const { username, fullName } = req.body as { username?: string, fullName?: string }
    const userId = req.authUserId ?? (req.body as { userId: string }).userId
    const imageFile = req.file
    const result = await userService.updateProfile(userId, { username, fullName, imageFile })
    return res.json(result)
  } catch (err: unknown) {
    return res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// change password
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { userId, oldPassword, newPassword1, newPassword2 } = req.body as { userId: string, oldPassword?: string, newPassword1?: string, newPassword2?: string }
    const result = await userService.changePassword(userId, { oldPassword, newPassword1, newPassword2 })
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// service & order
export const handleUserService = async (req: Request, res: Response) => {
  try {
    const { userId, action, serviceId, quantity, link, note, details } = req.body as { userId: string, action: string, serviceId: string, quantity: any, link?: string, note?: string, details?: Record<string, unknown> }
    const result = await userService.handleService(userId, { action, serviceId, quantity: Number(quantity), link, note, details })
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// deposit money
export const requestDeposit = async (req: Request, res: Response) => {
  try {
    const { userId, amount, content } = req.body as { userId: string, amount: any, content?: string }
    const result = await userService.depositRequest(userId, Number(amount), content)
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// get active missions
export const getMissions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.authUserId
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }
    const result = await userService.getAvailableMissions(userId)
    return res.json(result)
  } catch (err: unknown) {
    return res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// complete mission
export const completeMission = async (req: Request, res: Response) => {
  try {
    const { userId, missionId } = req.body as { userId: string, missionId: string }
    const result = await userService.completeMissionAction(userId, missionId)
    return res.json(result)
  } catch (err: unknown) {
    return res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// get completed missions history
export const getCompletedMissions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body as { userId: string }
    const result = await userService.getCompletedMissionsHistory(userId)
    return res.json(result)
  } catch (err: unknown) {
    return res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}
// daily attendance
export const attendance = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body as { userId: string }
    const result = await userService.checkAttendance(userId)
    return res.json(result)
  } catch (err: unknown) {
    return res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// submit mission
export const submitMission = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.authUserId
        if (!userId) {
          return res.status(403).json({ success: false, message: 'Unauthorized' })
        }
        const { missionId } = req.body as { missionId: string }
        const imageProof = req.file;

        const result = await userService.submitMissionProof(userId, missionId, imageProof);
        return res.json(result);
    } catch (error: unknown) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
    }
}

// tracking click
export const trackMissionClick = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.authUserId
        if (!userId) {
          return res.status(403).json({ success: false, message: 'Unauthorized' })
        }
        const { missionId } = req.body as { missionId: string }
        
        const result = await userService.trackMissionLinkClick(userId, missionId);
        return res.json(result);
    } catch (error: unknown) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
    }
}

// accept mission
export const acceptMission = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.authUserId
        if (!userId) {
          return res.status(403).json({ success: false, message: 'Unauthorized' })
        }
        const { missionId } = req.body as { missionId: string }
        
        const result = await userService.acceptMission(userId, missionId);
        return res.json(result);
    } catch (error: unknown) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
    }
}

// withdraw mission balance
export const withdrawMissionBalance = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.authUserId
        if (!userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' })
        }
        const { amount, method, bankName, bankAccount } = req.body as { 
            amount: any; 
            method?: 'web' | 'bank';
            bankName?: string;
            bankAccount?: string;
        }
        const qrCodeFile = req.file;

        const result = await userService.withdrawMissionBalance(userId, Number(amount), method, {
            bankName,
            bankAccount,
            qrCodeFile
        })
        return res.json(result)
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        return res.status(500).json({ success: false, message: errorMessage })
    }
}

// get transactions
export const getTransactionHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.authUserId
        if (!userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' })
        }
        const { type } = req.query as { type?: string }
        const result = await userService.getTransactions(userId, type)
        return res.json(result)
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        return res.status(500).json({ success: false, message: errorMessage })
    }
}

