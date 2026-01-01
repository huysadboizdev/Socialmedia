import type { Request, Response } from 'express'
import * as userService from '../services/userService.js'
import loginService, { type LoginParams } from '../services/auth/login.js'
import registerService, { type RegisterParams } from '../services/auth/register.js'

// register user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const result = await registerService(req.body as RegisterParams)
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// login
export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginService(req.body as LoginParams)
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// get info user
export const getUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body as { userId: string }
    const result = await userService.getInfo(userId)
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// update profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { userId, username } = req.body as { userId: string, username?: string }
    const imageFile = req.file
    const result = await userService.updateProfile(userId, { username, imageFile })
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
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
    const { userId, action, serviceId, quantity } = req.body as { userId: string, action: string, serviceId: string, quantity: number }
    const result = await userService.handleService(userId, { action, serviceId, quantity })
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// deposit money
export const requestDeposit = async (req: Request, res: Response) => {
  try {
    const { userId, amount } = req.body as { userId: string, amount: number }
    const result = await userService.depositRequest(userId, amount)
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// get active missions
export const getMissions = async (req: Request, res: Response) => {
  try {
    const result = await userService.getActiveMissions()
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// complete mission
export const completeMission = async (req: Request, res: Response) => {
  try {
    const { userId, missionId } = req.body as { userId: string, missionId: string }
    const result = await userService.completeMissionAction(userId, missionId)
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}

// get completed missions history
export const getCompletedMissions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body as { userId: string }
    const result = await userService.getCompletedMissionsHistory(userId)
    res.json(result)
  } catch (err: unknown) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : String(err) })
  }
}
