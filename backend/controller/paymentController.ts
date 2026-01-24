import type { Request, Response } from 'express'
import transactionModel from '../models/transactionModel.js'
import userModel from '../models/userModel.js'

// Simple Webhook Handler (SePay / Casso style)
// Defines the structure of the incoming transaction data
interface WebhookTransaction {
    amount: number;
    description: string;
    transactionDate?: string;
    referenceCode?: string; // Some gateways send this
    gateway?: string; // Custom field if needed
}

// Define specific fields we expect from various gateways to avoid 'any'
interface IncomingTransaction {
    amount?: number | string;
    description?: string;
    transferAmount?: number | string;
    transferType?: string;
    transferContent?: string;
    content?: string;
    transactionDate?: string;
    referenceCode?: string;
    gateway?: string;
    [key: string]: unknown;
}

interface WebhookContainer {
    transactions?: IncomingTransaction[];
    data?: IncomingTransaction[];
    [key: string]: unknown;
}

type WebhookBody = IncomingTransaction | IncomingTransaction[] | WebhookContainer;

export const handleWebhook = async (req: Request, res: Response) => {
    try {
        console.log("Webhook Received:", JSON.stringify(req.body));

        // 1. Parse Data - Support common formats
        let rawTransactions: IncomingTransaction[] = [];
        
        const body = req.body as WebhookBody;

        if (Array.isArray(body)) {
            rawTransactions = body;
        } else {
            const container = body as WebhookContainer;
            if (Array.isArray(container.transactions)) {
                rawTransactions = container.transactions;
            } else if (Array.isArray(container.data)) {
                rawTransactions = container.data;
            } else {
                 rawTransactions = [body as IncomingTransaction];
            }
        }

        // Normalize to internal WebhookTransaction
        const transactions: WebhookTransaction[] = [];

        for (const raw of rawTransactions) {
            // Determine amount
            let amountVal = Number(raw.transferAmount ?? raw.amount);
            
            // Adjust for SePay transferType (out = deduction)
            if (raw.transferType === 'out' && amountVal > 0) {
                amountVal = -amountVal;
            }

            // Determine description
            const descVal = raw.transferContent ?? raw.content ?? raw.description;

            if (!isNaN(amountVal) && descVal !== undefined) {
                 transactions.push({
                     amount: amountVal,
                     description: descVal,
                     gateway: raw.gateway,
                     transactionDate: raw.transactionDate,
                     referenceCode: raw.referenceCode
                 });
            }
        }

        if (transactions.length === 0) {
            return res.status(400).json({ success: false, message: 'No transactions found in payload' });
        }

        const stats = {
            processed: 0,
            success: 0,
            failed: 0,
            errors: [] as string[]
        };

        // 2. Process each transaction
        for (const tx of transactions) {
            stats.processed++;
            try {
                const { amount, description } = tx;
                const content: string = description;
                
                // 3. Extract logic: Find "HUYTICHXANH" or "HUYWD" + digits
                const regex = /(HUYTICHXANH|HUYWD)\d+/i;
                const match = regex.exec(content);
                
                if (!match) {
                    // Not a relevant transaction for us
                    console.log(`Ignored transaction: ${content}`);
                    continue;
                }

                const code = match[0].toUpperCase(); // e.g., HUYTICHXANH123

                if (amount > 0) {
                    // --- CASE: DEPOSIT ---
                    // 4. Find Pending Deposit Transaction
                    const transaction = await transactionModel.findOne({
                        status: 'pending',
                        type: 'deposit',
                        description: { $regex: code, $options: 'i' }
                    });

                    if (!transaction) {
                        console.log(`No pending deposit transaction found for code: ${code}`);
                        continue;
                    }

                    // 5. Amount Check
                    if (amount < transaction.amount) {
                        console.warn(`Amount mismatch for deposit ${code}. Expected ${transaction.amount}, got ${amount}`);
                        continue;
                    }

                    // 6. Approve & Add Balance
                    const user = await userModel.findById(transaction.userId);
                    if (!user) {
                        console.error(`User not found for tx ${String(transaction._id)}`);
                        continue;
                    }

                    transaction.status = 'approved';
                    transaction.amount = amount;
                    await transaction.save();

                    user.balance = (user.balance || 0) + amount;
                    await user.save();

                    const { updateUserDepositStats } = await import('../services/adminService.js');
                    await updateUserDepositStats(user._id, amount);

                    stats.success++;
                    console.log(`Successfully approved deposit ${code} for user ${user.username}, amount ${amount}`);
                } else if (amount < 0) {
                    // --- CASE: WITHDRAWAL (SePay deducting from admin account) ---
                    // 4. Find Pending Withdrawal Transaction
                    // Withdrawal amount in DB is usually stored as negative or positive? 
                    // Looking at userService.ts withdrawal: amount: -amount (negative)
                    const absAmount = Math.abs(amount);
                    
                    const transaction = await transactionModel.findOne({
                        status: 'pending',
                        type: 'withdraw',
                        description: { $regex: code, $options: 'i' }
                    });

                    if (!transaction) {
                        console.log(`No pending withdrawal transaction found for code: ${code}`);
                        continue;
                    }

                    // Verify amount matches (allow some tolerance if needed, but usually withdrawal is exact)
                    if (Math.abs(transaction.amount) !== absAmount) {
                         console.warn(`Withdrawal amount mismatch for ${code}. Expected ${Math.abs(transaction.amount)}, got ${absAmount}`);
                         // continue; // Optional: maybe some banks/gateways have small fee differences
                    }

                    // 5. Approve Withdrawal
                    transaction.status = 'approved';
                    await transaction.save();

                    console.log(`Withdrawal ${code} confirmed via webhook. Sending email...`);

                    // 6. Send Email Notification
                    if (transaction.withdrawalDetails?.email) {
                        try {
                            const { sendWithdrawalApprovedNotification } = await import('../services/mailService.js');
                            await sendWithdrawalApprovedNotification(transaction.withdrawalDetails.email, {
                                bankName: transaction.withdrawalDetails.bankName ?? '',
                                bankAccount: transaction.withdrawalDetails.bankAccount ?? '',
                                amount: absAmount,
                                transactionId: transaction._id.toString()
                            });
                        } catch (mailErr) {
                            console.error(`Failed to send withdrawal email for ${code}:`, mailErr);
                        }
                    }

                    stats.success++;
                    console.log(`Successfully confirmed withdrawal ${code} for user. Amount deducted: ${absAmount}`);
                }

            } catch (err) {
                console.error("Error processing transaction", err);
                stats.failed++;
                stats.errors.push(err instanceof Error ? err.message : String(err));
            }
        }

        return res.json({ success: true, stats });


    } catch (err: unknown) {
        console.error("Webhook Critical Error:", err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

// Check Payment Status (Polling) based on Description Code (e.g. HUYTICHXANH123)
export const checkPaymentStatus = async (req: Request, res: Response) => {
    try {
        const { code } = req.params; // Expecting transaction code like HUYTICHXANH123
        
        if (!code) {
           return res.status(400).json({ status: 'error', message: 'Missing transaction code' }); 
        }

        // Find transaction by description (assuming code is unique enough or we take the latest)
        const transaction = await transactionModel.findOne({
            description: { $regex: code, $options: 'i' }
        }).sort({ createdAt: -1 });

        if (!transaction) {
            return res.status(404).json({ status: 'NOT_FOUND', message: 'Transaction not found' });
        }

        return res.json({ 
            status: transaction.status, // 'pending', 'approved', 'rejected'
            amount: transaction.amount,
            createdAt: transaction.createdAt
        }); 

    } catch (err: unknown) {
        console.error(err);
        return res.status(500).json({ status: 'error', msg: 'Server Error' });
    }
};
