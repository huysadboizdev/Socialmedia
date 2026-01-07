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
    rejectMission
} from '../controller/adminController.js'

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
adminRouter.post('/assign-mission', assignMissionToUser)

export default adminRouter
