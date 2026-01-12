import express from 'express'
import { handleWebhook } from '../controller/paymentController.js'

const paymentRouter = express.Router()

// Webhook endpoint
// POST /api/payment/webhook
paymentRouter.post('/webhook', handleWebhook)

export default paymentRouter
