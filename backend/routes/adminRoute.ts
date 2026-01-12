import express from 'express'
import { 
    addService, 
    listService, 
    getAllUser, 
    deleteUser,
    login_user,
    login_admin, 
    deleteService, 
    editService, 
    approveDeposit, 
    rejectDeposit, 
    getTransactions, 
    handleAdminOrders,
    addMission,
    editMission,
    deleteMission,
    getAllMissions,
    assignMissionToUser,
    getDashboardStats,
    adjustBalance,
    getPendingMissions,
    approveMission,
    rejectMission,
    getMissionHistory,
    getWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    runBalanceFix,
    getAllDeposits
} from '../controller/adminController.js'
import { updateAnnouncement } from '../controller/settingController.js'

const adminRouter = express.Router()

adminRouter.get('/stats', getDashboardStats)
adminRouter.post('/add-service', addService)
adminRouter.post('/edit-service', editService) 
adminRouter.post('/delete-service', deleteService)
adminRouter.get('/list', listService)
adminRouter.get('/all-user', getAllUser)
adminRouter.post('/delete-user', deleteUser)
adminRouter.post('/user-audit', login_user)
adminRouter.post('/login', login_admin)
adminRouter.post('/approve', approveDeposit)
adminRouter.post('/reject', rejectDeposit)
adminRouter.get('/transactions', getTransactions)
adminRouter.get('/deposits', getAllDeposits)
adminRouter.post('/manage-order', handleAdminOrders)
adminRouter.post('/adjust-balance', adjustBalance)

// mission
adminRouter.post('/mission/create', addMission)
adminRouter.post('/mission/update', editMission)
adminRouter.post('/mission/delete', deleteMission)
adminRouter.get('/missions', getAllMissions)
adminRouter.get('/mission/pending', getPendingMissions)
adminRouter.post('/mission/approve', approveMission)
adminRouter.post('/mission/reject', rejectMission)
adminRouter.get('/mission/history', getMissionHistory)
adminRouter.post('/assign-mission', assignMissionToUser)

// withdrawals
adminRouter.get('/withdrawals', getWithdrawals)
adminRouter.post('/withdraw/approve', approveWithdrawal)
adminRouter.post('/withdraw/reject', rejectWithdrawal)
adminRouter.post('/fix-balances', runBalanceFix)

// settings
adminRouter.post('/announcement', updateAnnouncement)

export default adminRouter
