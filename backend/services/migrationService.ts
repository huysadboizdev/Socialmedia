import userModel from '../models/userModel.js';
import transactionModel from '../models/transactionModel.js';

/**
 * Recalculate deposit statistics for all users based on approved 'deposit' transactions.
 */
export const recalculateAllUserDepositStats = async () => {
    const users = await userModel.find({});
    console.log(`Starting recalculation for ${users.length} users...`);
    
    let updatedCount = 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthId = currentYear * 100 + currentMonth;

    for (const user of users) {
        // Find all approved deposit transactions for this user
        const deposits = await transactionModel.find({
            userId: user._id,
            type: 'deposit',
            status: 'approved'
        });

        const totalDeposit = deposits.reduce((sum, tx) => sum + tx.amount, 0);
        
        // Calculate monthly deposit
        const monthlyDeposit = deposits
            .filter(tx => {
                const txDate = new Date(tx.createdAt);
                return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
            })
            .reduce((sum, tx) => sum + tx.amount, 0);

        // Check if stats changed
        if (user.totalDeposit !== totalDeposit || user.monthlyDeposit !== monthlyDeposit) {
            user.totalDeposit = totalDeposit;
            user.monthlyDeposit = monthlyDeposit;
            user.lastDepositMonth = monthId;
            await user.save();
            updatedCount++;
            console.log(`Updated stats for user: ${user.username} (Total: ${totalDeposit}, Monthly: ${monthlyDeposit})`);
        }
    }

    console.log(`Recalculation finished. Updated ${updatedCount} users.`);
    return { success: true, updatedCount };
};
