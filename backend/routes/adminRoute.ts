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
    getAllDeposits,
    editUser,
    getReportedOrders,
    replyReport,
    getAdminNotifications,
    markAdminNotificationRead,
    runDepositFix
} from '../controller/adminController.js'
import { updateAnnouncement, getMembershipConfig, updateMembershipConfig, getDepositBonus, updateDepositBonus } from '../controller/settingController.js'
import { createCoupon, listCoupons, deleteCoupon, updateCouponStatus, updateCoupon } from '../controller/couponController.js'
import authAdmin from '../middlewares/authAdmin.js'

const adminRouter = express.Router()

adminRouter.get('/stats', getDashboardStats)
adminRouter.post('/add-service', addService)
adminRouter.post('/edit-service', editService)
adminRouter.post('/delete-service', deleteService)
adminRouter.get('/list', listService)
adminRouter.get('/all-user', getAllUser)
adminRouter.post('/edit-user', editUser)
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
adminRouter.post('/fix-deposits', runDepositFix)

// settings
adminRouter.post('/announcement', updateAnnouncement)
adminRouter.post('/membership-config', updateMembershipConfig)
adminRouter.get('/membership-config', getMembershipConfig)
adminRouter.get('/deposit-bonus', authAdmin, getDepositBonus)
adminRouter.post('/deposit-bonus', authAdmin, updateDepositBonus)

// Coupon routes
adminRouter.post('/coupons', authAdmin, createCoupon)
adminRouter.get('/coupons', authAdmin, listCoupons)
adminRouter.delete('/coupons/:id', authAdmin, deleteCoupon)
adminRouter.put('/coupons/:id/status', authAdmin, updateCouponStatus)
adminRouter.put('/coupons/:id', authAdmin, updateCoupon)

// reports
adminRouter.get('/reports', getReportedOrders)
adminRouter.post('/reply-report', replyReport)

// notifications
adminRouter.get('/notifications', getAdminNotifications)
adminRouter.post('/notifications/read', markAdminNotificationRead)

export default adminRouter
