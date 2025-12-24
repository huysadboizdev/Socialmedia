import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: String, required: true },
    balance: { type: Number, default: 0 },
    image: { type: String }, // Chỉ lưu URL thay vì object
    coins: { type: Number, default: 0 },
    completedMissions: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: "mission"
  
}]
}, { minimize: false, timestamps: true });

const userModel = mongoose.model('user', userSchema);

export default userModel;
