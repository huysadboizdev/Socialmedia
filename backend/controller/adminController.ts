import type { Request, Response } from 'express'
import * as adminService from '../services/adminService.js'

export const login_admin = async (req: Request, res: Response) => {
    try {
        const result = await adminService.adminLogin(req.body as adminService.AdminLoginParams)
        return res.json(result)
    } catch (error: unknown) {
        return res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body as { userId: string }
        const result = await adminService.deleteUserAccount(userId)
        return res.json(result)
    } catch (error: unknown) {
        return res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const getAllUser = async (_req: Request, res: Response) => {
    try {
        const result = await adminService.fetchAllUsers()
        return res.json(result)
    } catch (error: unknown) {
        return res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const editUser = async (req: Request, res: Response) => {
    try {
        const result = await adminService.updateUserAccount(req.body as adminService.UpdateUserParams)
        return res.json(result)
    } catch (error: unknown) {
        return res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const login_user = async (req: Request, res: Response) => {
    try {
        const result = await adminService.adminAuthUser(req.body as { email?: string })
        return res.json(result)
    } catch (error: unknown) {
        return res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

// function manager service
export const addService = async (req: Request, res: Response) => {
    try {
        const result = await adminService.createService(req.body as adminService.ServiceParams)
        return res.json(result)
    } catch (error: unknown) {
        return res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const editService = async (req: Request, res: Response) => {
    try {
        const result = await adminService.updateService(req.body as adminService.UpdateServiceParams)
        return res.json(result)
    } catch (error: unknown) {
        return res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const listService = async (_req: Request, res: Response) => {
    try {
        const result = await adminService.fetchAllServices()
        return res.json(result)
    } catch (error: unknown) {
        return res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const deleteService = async (req: Request, res: Response) => {
    try {
        const { serviceId } = req.body as { serviceId: string }
        const result = await adminService.removeService(serviceId)
        return res.json(result)
    } catch (error: unknown) {
        return res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const approveDeposit = async (req: Request, res: Response) => {
    try {
        const { transactionId } = req.body as { transactionId: string }
        const result = await adminService.approveUserDeposit(transactionId)
        return res.json(result)
    } catch (error: unknown) {
        return res.status(500).json({ success: false, message: 'Error server', error: error instanceof Error ? error.message : String(error) })
    }
}

export const rejectDeposit = async (req: Request, res: Response) => {
    try {
        const { transactionId } = req.body as { transactionId: string }
        const result = await adminService.rejectUserDeposit(transactionId)
        return res.json(result)
    } catch (error: unknown) {
        return res.status(500).json({ success: false, message: 'Error server', error: error instanceof Error ? error.message : String(error) })
    }
}

export const getTransactions = async (_req: Request, res: Response) => {
    try {
        const result = await adminService.fetchPendingTransactions()
        return res.json(result)
    } catch (error: unknown) {
        return res.status(500).json({ success: false, message: 'Error server', error: error instanceof Error ? error.message : String(error) })
    }
}

export const handleAdminOrders = async (req: Request, res: Response) => {
    try {
        const result = await adminService.manageOrders(req.body as adminService.OrderManagementParams)
        return res.json(result)
    } catch (error: unknown) {
        return res.status(500).json({ success: false, message: 'Processing error', error: error instanceof Error ? error.message : String(error) })
    }
}

export const addMission = async (req: Request, res: Response) => {
    try {
        const result = await adminService.createMission(req.body as adminService.MissionParams)
        return res.json(result)
    } catch (error: unknown) {
        return res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const editMission = async (req: Request, res: Response) => {
    try {
        const result = await adminService.updateMission(req.body as adminService.UpdateMissionParams)
        return res.json(result)
    } catch (error: unknown) {
        return res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const deleteMission = async (req: Request, res: Response) => {
    try {
        const { missionId } = req.body as { missionId: string }
        const result = await adminService.removeMission(missionId)
        return res.json(result)
    } catch (error: unknown) {
        return res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const getAllMissions = async (_req: Request, res: Response) => {
    try {
        const result = await adminService.fetchAllMissions()
        return res.json(result)
    } catch (error: unknown) {
        return res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const assignMissionToUser = async (req: Request, res: Response) => {
    try {
        const { userId, missionId } = req.body as { userId: string, missionId: string }
        const result = await adminService.reassignMissionToUser(userId, missionId)
        return res.json(result)
    } catch (error: unknown) {
        return res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const getDashboardStats = async (_req: Request, res: Response) => {
    try {
        const result = await adminService.fetchDashboardStats()
        return res.json(result)
    } catch (error: unknown) {
        return res.status(500).json({ success: false, message: 'Stats error', error: error instanceof Error ? error.message : String(error) })
    }
}

export const adjustBalance = async (req: Request, res: Response) => {
    try {
        const { userId, amount } = req.body as { userId: string, amount: string | number }
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' })
        }
        const result = await adminService.adjustUserBalance(userId, Number(amount || 0))
        return res.json(result)
    } catch (error: unknown) {
        return res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}


export const getPendingMissions = async (_req: Request, res: Response) => {
    try {
        const result = await adminService.fetchPendingSubmissions()
        return res.json(result)
    } catch (error: unknown) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const approveMission = async (req: Request, res: Response) => {
    try {
        const { submissionId } = req.body as { submissionId: string }
        const result = await adminService.approveUserSubmission(submissionId)
        return res.json(result)
    } catch (error: unknown) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const rejectMission = async (req: Request, res: Response) => {
    try {
        const { submissionId, note } = req.body as { submissionId: string, note?: string }
        const result = await adminService.rejectUserSubmission(submissionId, note)
        return res.json(result)
    } catch (error: unknown) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const getMissionHistory = async (_req: Request, res: Response) => {
    try {
        const result = await adminService.fetchSubmissionHistory()
        return res.json(result)
    } catch (error: unknown) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}
export const getWithdrawals = async (_req: Request, res: Response) => {
    try {
        const result = await adminService.fetchWithdrawalRequests()
        return res.json(result)
    } catch (error: unknown) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const approveWithdrawal = async (req: Request, res: Response) => {
    try {
        const { transactionId } = req.body as { transactionId: string }
        const result = await adminService.approveWithdrawalRequest(transactionId)
        return res.json(result)
    } catch (error: unknown) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const rejectWithdrawal = async (req: Request, res: Response) => {
    try {
        const { transactionId } = req.body as { transactionId: string }
        const result = await adminService.rejectWithdrawalRequest(transactionId)
        return res.json(result)
    } catch (error: unknown) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const runBalanceFix = async (_req: Request, res: Response) => {
    try {
        const result = await adminService.fixCorruptedBalances()
        return res.json(result)
    } catch (error: unknown) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const getAllDeposits = async (_req: Request, res: Response) => {
    try {
        const result = await adminService.fetchAllDeposits()
        return res.json(result)
    } catch (error: unknown) {
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}
