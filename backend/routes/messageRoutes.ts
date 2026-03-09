import express from 'express'
import { sendMessage, getMessages, getConversations, markAsRead } from '../controller/messageController.js'

const messageRouter = express.Router()

messageRouter.post('/send', sendMessage)
messageRouter.get('/list', getMessages)
messageRouter.get('/conversations', getConversations)
messageRouter.post('/read', markAsRead)

export default messageRouter
