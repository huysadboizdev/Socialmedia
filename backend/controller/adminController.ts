import type { RequestHandler } from 'express'
import * as adminService from '../services/adminService.js'

export const login_admin: RequestHandler = async (req, res) => {
    try {
        const result = await adminService.adminLogin(req.body as adminService.AdminLoginParams)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const deleteUser: RequestHandler = async (req, res) => {
    try {
        const { userId } = req.body as { userId: string }
        const result = await adminService.deleteUserAccount(userId)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const getAllUser: RequestHandler = async (_req, res) => {
    try {
        const result = await adminService.fetchAllUsers()
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const editUser: RequestHandler = async (req, res) => {
    try {
        const result = await adminService.updateUserAccount(req.body as adminService.UpdateUserParams)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const login_user: RequestHandler = async (req, res) => {
    try {
        const result = await adminService.adminAuthUser(req.body as { email?: string })
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

// function manager service
export const addService: RequestHandler = async (req, res) => {
    try {
        const result = await adminService.createService(req.body as adminService.ServiceParams)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const editService: RequestHandler = async (req, res) => {
    try {
        const result = await adminService.updateService(req.body as adminService.UpdateServiceParams)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const listService: RequestHandler = async (_req, res) => {
    try {
        const result = await adminService.fetchAllServices()
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const deleteService: RequestHandler = async (req, res) => {
    try {
        const { serviceId } = req.body as { serviceId: string }
        const result = await adminService.removeService(serviceId)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const approveDeposit: RequestHandler = async (req, res) => {
    try {
        const { transactionId } = req.body as { transactionId: string }
        const result = await adminService.approveUserDeposit(transactionId)
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Error server', error: error instanceof Error ? error.message : String(error) })
    }
}

export const rejectDeposit: RequestHandler = async (req, res) => {
    try {
        const { transactionId } = req.body as { transactionId: string }
        const result = await adminService.rejectUserDeposit(transactionId)
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Error server', error: error instanceof Error ? error.message : String(error) })
    }
}

export const getTransactions: RequestHandler = async (_req, res) => {
    try {
        const result = await adminService.fetchPendingTransactions()
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Error server', error: error instanceof Error ? error.message : String(error) })
    }
}

export const handleAdminOrders: RequestHandler = async (req, res) => {
    try {
        const result = await adminService.manageOrders(req.body as adminService.OrderManagementParams)
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Processing error', error: error instanceof Error ? error.message : String(error) })
    }
}

export const addMission: RequestHandler = async (req, res) => {
    try {
        const result = await adminService.createMission(req.body as adminService.MissionParams)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const editMission: RequestHandler = async (req, res) => {
    try {
        const result = await adminService.updateMission(req.body as adminService.UpdateMissionParams)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const deleteMission: RequestHandler = async (req, res) => {
    try {
        const { missionId } = req.body as { missionId: string }
        const result = await adminService.removeMission(missionId)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const getAllMissions: RequestHandler = async (_req, res) => {
    try {
        const result = await adminService.fetchAllMissions()
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const assignMissionToUser: RequestHandler = async (req, res) => {
    try {
        const { userId, missionId } = req.body as { userId: string, missionId: string }
        const result = await adminService.reassignMissionToUser(userId, missionId)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const getDashboardStats: RequestHandler = async (_req, res) => {
    try {
        const result = await adminService.fetchDashboardStats()
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Stats error', error: error instanceof Error ? error.message : String(error) })
    }
}

export const adjustBalance: RequestHandler = async (req, res) => {
    try {
        const { userId, amount } = req.body as { userId: string, amount: string | number }
        if (!userId) {
            res.status(400).json({ success: false, message: 'User ID is required' })
            return
        }
        const result = await adminService.adjustUserBalance(userId, Number(amount || 0))
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}


export const getPendingMissions: RequestHandler = async (_req, res) => {
    try {
        const result = await adminService.fetchPendingSubmissions()
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const approveMission: RequestHandler = async (req, res) => {
    try {
        const { submissionId } = req.body as { submissionId: string }
        const result = await adminService.approveUserSubmission(submissionId)
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const rejectMission: RequestHandler = async (req, res) => {
    try {
        const { submissionId, note } = req.body as { submissionId: string, note?: string }
        const result = await adminService.rejectUserSubmission(submissionId, note)
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const getMissionHistory: RequestHandler = async (_req, res) => {
    try {
        const result = await adminService.fetchSubmissionHistory()
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}
export const getWithdrawals: RequestHandler = async (_req, res) => {
    try {
        const result = await adminService.fetchWithdrawalRequests()
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const approveWithdrawal: RequestHandler = async (req, res) => {
    try {
        const { transactionId } = req.body as { transactionId: string }
        const result = await adminService.approveWithdrawalRequest(transactionId)
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const rejectWithdrawal: RequestHandler = async (req, res) => {
    try {
        const { transactionId } = req.body as { transactionId: string }
        const result = await adminService.rejectWithdrawalRequest(transactionId)
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const runBalanceFix: RequestHandler = async (_req, res) => {
    try {
        const result = await adminService.fixCorruptedBalances()
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const getAllDeposits: RequestHandler = async (_req, res) => {
    try {
        const result = await adminService.fetchAllDeposits()
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}
