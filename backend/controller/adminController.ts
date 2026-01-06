import type { Request, Response } from 'express'
import * as adminService from '../services/adminService.js'

export const login_admin = async (req: Request, res: Response) => {
    try {
        const result = await adminService.adminLogin(req.body as adminService.AdminLoginParams)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body as { userId: string }
        const result = await adminService.deleteUserAccount(userId)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const getAllUser = async (req: Request, res: Response) => {
    try {
        const result = await adminService.fetchAllUsers()
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const login_user = async (req: Request, res: Response) => {
    try {
        const result = await adminService.adminAuthUser(req.body as { email?: string })
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

// function manager service
export const addService = async (req: Request, res: Response) => {
    try {
        const result = await adminService.createService(req.body as adminService.ServiceParams)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const editService = async (req: Request, res: Response) => {
    try {
        const result = await adminService.updateService(req.body as adminService.UpdateServiceParams)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const listService = async (req: Request, res: Response) => {
    try {
        const result = await adminService.fetchAllServices()
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const deleteService = async (req: Request, res: Response) => {
    try {
        const { serviceId } = req.body as { serviceId: string }
        const result = await adminService.removeService(serviceId)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const approveDeposit = async (req: Request, res: Response) => {
    try {
        const { transactionId } = req.body as { transactionId: string }
        const result = await adminService.approveUserDeposit(transactionId)
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Error server', error: error instanceof Error ? error.message : String(error) })
    }
}

export const rejectDeposit = async (req: Request, res: Response) => {
    try {
        const { transactionId } = req.body as { transactionId: string }
        const result = await adminService.rejectUserDeposit(transactionId)
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Error server', error: error instanceof Error ? error.message : String(error) })
    }
}

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const result = await adminService.fetchPendingTransactions()
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Error server', error: error instanceof Error ? error.message : String(error) })
    }
}

export const handleAdminOrders = async (req: Request, res: Response) => {
    try {
        const result = await adminService.manageOrders(req.body as adminService.OrderManagementParams)
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Processing error', error: error instanceof Error ? error.message : String(error) })
    }
}

export const addMission = async (req: Request, res: Response) => {
    try {
        const result = await adminService.createMission(req.body as adminService.MissionParams)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const editMission = async (req: Request, res: Response) => {
    try {
        const result = await adminService.updateMission(req.body as adminService.UpdateMissionParams)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const deleteMission = async (req: Request, res: Response) => {
    try {
        const { missionId } = req.body as { missionId: string }
        const result = await adminService.removeMission(missionId)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const getAllMissions = async (req: Request, res: Response) => {
    try {
        const result = await adminService.fetchAllMissions()
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const assignMissionToUser = async (req: Request, res: Response) => {
    try {
        const { userId, missionId } = req.body as { userId: string, missionId: string }
        const result = await adminService.reassignMissionToUser(userId, missionId)
        res.json(result)
    } catch (error: unknown) {
        res.status(400).json({ success: false, message: error instanceof Error ? error.message : String(error) })
    }
}

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const result = await adminService.fetchDashboardStats()
        res.json(result)
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Stats error', error: error instanceof Error ? error.message : String(error) })
    }
}
