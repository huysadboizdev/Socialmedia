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
    [key: string]: any; // Allow other props for flexibility during parsing
}

export const handleWebhook = async (req: Request, res: Response) => {
    try {
        console.log("Webhook Received:", JSON.stringify(req.body));

        // 1. Parse Data - Support common formats
        // SePay/Casso usually send a list of transactions
        // Structure might be { transactions: [...] } or just [...]
        let transactions: WebhookTransaction[] = [];
        
        type WebhookBody = 
            | WebhookTransaction 
            | WebhookTransaction[] 
            | { transactions?: WebhookTransaction[]; data?: WebhookTransaction[] };

        const body = req.body as WebhookBody;

        if (Array.isArray(body)) {
            transactions = body;
        } else if ('transactions' in body && Array.isArray(body.transactions)) {
            transactions = body.transactions;
        } else if ('data' in body && Array.isArray(body.data)) {
            transactions = body.data;
        } else if ('amount' in body && 'description' in body) {
            transactions = [body];
        } else {
            // Flexible check using any cast to avoid TS union errors
            const flexibleBody = body as any;
            if (flexibleBody.transferAmount && (flexibleBody.transferContent || flexibleBody.content || flexibleBody.description)) {
                transactions = [{
                    amount: Number(flexibleBody.transferAmount || flexibleBody.amount),
                    description: String(flexibleBody.transferContent || flexibleBody.content || flexibleBody.description),
                    gateway: String(flexibleBody.gateway || ''),
                    transactionDate: String(flexibleBody.transactionDate || ''),
                    referenceCode: String(flexibleBody.referenceCode || '')
                }];
            }
        }

        if (transactions.length === 0) {
             // Second pass for flat structure that might miss some keys but has transferAmount
             const flexibleBody = body as any;
             if (flexibleBody.transferAmount) {
                 transactions = [{
                    amount: Number(flexibleBody.transferAmount),
                    description: String(flexibleBody.transferContent || flexibleBody.content || flexibleBody.description || ''),
                    gateway: flexibleBody.gateway,
                    transactionDate: flexibleBody.transactionDate,
                    referenceCode: flexibleBody.referenceCode
                 }];
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
                
                // 3. Extract logic: Find "HUYTICHXANH" + digits
                // RegEx: /HUYTICHXANH\d+/i
                const regex = /HUYTICHXANH\d+/i;
                const match = regex.exec(content);
                
                if (!match) {
                    // Not a relevant transaction for us
                    console.log(`Ignored transaction: ${content}`);
                    continue;
                }

                const code = match[0].toUpperCase(); // e.g., HUYTICHXANH123

                // 4. Find Pending Transaction
                // We look for a pending deposit with this description info
                const transaction = await transactionModel.findOne({
                    status: 'pending',
                    type: 'deposit',
                    description: { $regex: code, $options: 'i' }
                });

                if (!transaction) {
                    console.log(`No pending transaction found for code: ${code}`);
                    // Optional: maybe create a new transaction if you want to support "transfer without request"
                    // For now, we only support matching requests
                    continue;
                }

                // 5. Amount Check
                // Allow some tolerance or require exact? Usually exact or >=
                if (amount < transaction.amount) {
                    console.warn(`Amount mismatch for ${code}. Expected ${transaction.amount}, got ${amount}`);
                    // Decide: Reject? Or Partial?
                    // Let's keep it pending or mark specialized status
                    continue;
                }

                // 6. Approve & Add Balance
                const user = await userModel.findById(transaction.userId);
                if (!user) {
                     console.error(`User not found for tx ${String(transaction._id)}`);
                     continue;
                }

                // Update Transaction
                transaction.status = 'approved';
                transaction.amount = amount; // Update to actual received if different (e.g. user sent more)
                // transaction.paymentGatewayId = ... // if we had field
                await transaction.save();

                // Update User Balance
                user.balance = (user.balance || 0) + amount;
                await user.save();
                

                // Update Deposit Stats
                const { updateUserDepositStats } = await import('../services/adminService.js');
                await updateUserDepositStats(user._id, amount);
                

                // Create a generic "Payment Received" record if strictly separating log vs balance?
                // No, updating the 'deposit' transaction status is the standard way.

                stats.success++;
                console.log(`Successfully approved deposit ${code} for user ${user.username}, amount ${amount}`);

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

    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ status: 'error', msg: 'Server Error' });
    }
};
