import type { RequestHandler } from 'express'
import * as userService from '../services/userService.js'
import loginService, { type LoginParams } from '../services/auth/login.js'
import registerService, { type RegisterParams } from '../services/auth/register.js'

// register user
export const registerUser: RequestHandler = async (req, res) => {
  try {
    const result = await registerService(req.body as RegisterParams)
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// login
export const login: RequestHandler = async (req, res) => {
  try {
    const result = await loginService(req.body as LoginParams)
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// get info user
export const getUser: RequestHandler = async (req, res) => {
  try {
    const userId = req.authUserId ?? (req.body as { userId: string }).userId
    const result = await userService.getInfo(userId)
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// update profile
export const updateProfile: RequestHandler = async (req, res) => {
  try {
    const { username, fullName, email } = req.body as { username?: string, fullName?: string, email?: string }
    const userId = req.authUserId ?? (req.body as { userId: string }).userId
    const imageFile = req.file

    const result = await userService.updateProfile(userId, { username, fullName, email, imageFile })
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// change password
export const updatePassword: RequestHandler = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword1, newPassword2 } = req.body as { userId: string, oldPassword?: string, newPassword1?: string, newPassword2?: string }
    const result = await userService.changePassword(userId, { oldPassword, newPassword1, newPassword2 })
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// service & order
export const handleUserService: RequestHandler = async (req, res) => {
  try {
    const { userId, action, serviceId, quantity, link, note, details, orderId, issue, reportNote } = req.body as { 
      userId: string, 
      action: string, 
      serviceId: string, 
      quantity: string | number, 
      link?: string, 
      note?: string, 
      details?: Record<string, unknown>,
      orderId?: string,
      issue?: string,
      reportNote?: string
    }
    const result = await userService.handleService(userId, { action, serviceId, quantity: Number(quantity), link, note, details, orderId, issue, reportNote })
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// deposit money
export const requestDeposit: RequestHandler = async (req, res) => {
  try {

    const { userId, amount, content } = req.body as { userId: string, amount: string | number, content?: string }
    const result = await userService.depositRequest(userId, Number(amount), content)
    return res.json(result)
  } catch (err: unknown) {
    return res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// get active missions
export const getMissions: RequestHandler = async (req, res) => {
  try {
    const userId = req.authUserId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' })
      return
    }
    const result = await userService.getAvailableMissions(userId)
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// complete mission
export const completeMission: RequestHandler = async (req, res) => {
  try {
    const { userId, missionId } = req.body as { userId: string, missionId: string }
    const result = await userService.completeMissionAction(userId, missionId)
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// get completed missions history
export const getCompletedMissions: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.body as { userId: string }
    const result = await userService.getCompletedMissionsHistory(userId)
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}
// daily attendance
export const attendance: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.body as { userId: string }
    const result = await userService.checkAttendance(userId)
    res.json(result)
  } catch (err: unknown) {
    return res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// submit mission
export const submitMission: RequestHandler = async (req, res) => {
    try {
        const userId = req.authUserId ?? (req.body as { userId: string }).userId;
        if (!userId) {
          res.status(403).json({ success: false, message: 'Unauthorized' })
          return
        }
        const { missionId } = req.body as { missionId: string }
        const imageProof = req.file;

        const result = await userService.submitMissionProof(userId, missionId, imageProof);
        res.json(result);
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
    }
}


// accept mission
export const acceptMission: RequestHandler = async (req, res) => {
    try {
        const userId = req.authUserId ?? (req.body as { userId: string }).userId;
        if (!userId) {
            res.status(403).json({ success: false, message: 'Unauthorized' });
            return
        }
        const { missionId } = req.body as { missionId: string }
        
        const result = await userService.acceptMission(userId, missionId);
        res.json(result);
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
    }
}

// withdraw mission balance
export const withdrawMissionBalance: RequestHandler = async (req, res) => {
    try {
        const userId = req.authUserId ?? (req.body as { userId: string }).userId;
        if (!userId) {
            res.status(403).json({ success: false, message: 'Unauthorized' });
            return
        }
        const { amount, method, bankName, bankAccount, email } = req.body as { 
            amount: string | number; 
            method?: 'web' | 'bank';
            bankName?: string;
            bankAccount?: string;
            email?: string;
        }
        const qrCodeFile = req.file;

        const result = await userService.withdrawMissionBalance(userId, Number(amount), method, {
            bankName,
            bankAccount,
            qrCodeFile,
            email
        })
        res.json(result)
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        res.status(500).json({ success: false, message: errorMessage })
    }
}

// get transactions
export const getTransactionHistory: RequestHandler = async (req, res) => {
    try {
        const userId = req.authUserId
        if (!userId) {
            res.status(403).json({ success: false, message: 'Unauthorized' })
            return
        }
        const { type } = req.query as { type?: string }
        const result = await userService.getTransactions(userId, type)
        res.json(result)
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        res.status(500).json({ success: false, message: errorMessage })
    }
}

// get leaderboard
export const getLeaderboard: RequestHandler = async (_req, res) => {
    try {
        const result = await userService.getLeaderboardStats()
        res.json(result)
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        res.status(500).json({ success: false, message: errorMessage })
    }
}


export const clickMission: RequestHandler = async (req, res) => {
    try {
        const userId = req.authUserId ?? (req.body as { userId: string }).userId;
        const { missionId } = req.body as { missionId: string };

        if (!userId || !missionId) {
            res.status(400).json({ success: false, message: 'Thiếu thông tin người dùng hoặc nhiệm vụ' });
            return
        }

        const result = await userService.recordMissionClick(userId, missionId);
        res.json(result);
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Internal Server Error' });
    }
}
