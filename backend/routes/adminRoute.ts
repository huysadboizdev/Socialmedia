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
    assignMissionToUser
} from '../controller/adminController.js'

const adminRouter = express.Router()

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

// mission
adminRouter.post('/add-mission', addMission)
adminRouter.post('/edit-mission', editMission)
adminRouter.post('/delete-mission', deleteMission)
adminRouter.get('/missions', getAllMissions)
adminRouter.post('/assign-mission', assignMissionToUser)

export default adminRouter
