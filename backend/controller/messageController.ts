import type { RequestHandler } from 'express'
import messageModel from '../models/messageModel.js'

export const sendMessage: RequestHandler = async (req, res) => {
    try {
        const { userId, sender, content, replyTo } = req.body as { userId: string, sender: string, content: string, replyTo?: string }
        
        // Basic validation
        if (!userId || !sender || !content) {
             res.status(400).json({ success: false, message: 'Missing required fields' })
             return
        }

        const newMessage = new messageModel({
            userId,
            sender,
            content,
            isRead: false,
            replyTo: replyTo ?? null
        })

        await newMessage.save()

        // Populate replyTo for immediate return if needed, though client usually optimistically updates
        await newMessage.populate('replyTo', 'content sender')

        res.json({ success: true, message: 'Message sent', data: newMessage })
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Error sending message', error: error instanceof Error ? error.message : String(error) })
    }
}

export const getMessages: RequestHandler = async (req, res) => {
    try {
        const { userId } = req.query as { userId: string }
        if (!userId) {
             res.status(400).json({ success: false, message: 'User ID is required' })
             return
        }

        const messages = await messageModel.find({ userId })
            .sort({ createdAt: 1 })
            .populate({
                path: 'replyTo',
                select: 'content sender'
            })
        res.json({ success: true, data: messages })
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Error fetching messages', error: error instanceof Error ? error.message : String(error) })
    }
}

// For Admin: Get list of users who have chatted
export const getConversations: RequestHandler = async (_req, res) => {
    try {
        // Aggregate to find unique users and latest message
        const conversations = await messageModel.aggregate([
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: "$userId",
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: { 
                        $sum: { 
                            $cond: [{ $and: [{ $eq: ["$isRead", false] }, { $eq: ["$sender", "user"] }] }, 1, 0] 
                        } 
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    _id: 1,
                    username: "$userDetails.username",
                    image: "$userDetails.image",
                    lastMessage: 1,
                    unreadCount: 1
                }
            },
            {
                $sort: { "lastMessage.createdAt": -1 }
            }
        ])

        res.json({ success: true, data: conversations })
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Error fetching conversations', error: error instanceof Error ? error.message : String(error) })
    }
}

export const markAsRead: RequestHandler = async (req, res) => {
    try {
        const { userId, sender } = req.body as { userId: string, sender: string }
        // If admin reads, mark user messages as read. If user reads, mark admin messages as read.
        // Usually, when fetching, we mark as read.
        
        await messageModel.updateMany(
            { userId, sender: sender === 'admin' ? 'user' : 'admin', isRead: false },
            { $set: { isRead: true } }
        )

        res.json({ success: true, message: 'Marked as read' })
    } catch (error: unknown) {
        res.status(500).json({ success: false, message: 'Error marking messages as read', error: error instanceof Error ? error.message : String(error) })
    }
}
