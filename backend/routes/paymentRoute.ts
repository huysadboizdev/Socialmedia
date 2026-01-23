import express from 'express'
import { handleWebhook, checkPaymentStatus } from '../controller/paymentController.js'

const paymentRouter = express.Router()

// Webhook endpoint
// POST /api/payment/webhook
paymentRouter.post('/webhook', handleWebhook)

// Check status endpoint (Polling)
// GET /api/payment/check-status/:code
paymentRouter.get('/check-status/:code', checkPaymentStatus)

export default paymentRouter
