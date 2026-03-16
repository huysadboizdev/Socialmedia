import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String },
    password: {
        type: String,
        required: function () { return !this.googleId; }
    },
    googleId: { type: String },
    balance: { type: Number, default: 0 },
    missionBalance: { type: Number, default: 0 },
    isMissionBalanceMigrated: { type: Boolean, default: false },
    image: { type: String },
    isBlocked: { type: Boolean, default: false },
    completedMissions: [{ type: Schema.Types.ObjectId, ref: 'mission' }],
    totalDeposit: { type: Number, default: 0 },
    monthlyDeposit: { type: Number, default: 0 },
    lastDepositMonth: { type: Number, default: null },
    attendance: {
        lastDate: { type: Date, default: null },
        streak: { type: Number, default: 0 }
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });
const userModel = mongoose.model("user", userSchema);
export default userModel;
