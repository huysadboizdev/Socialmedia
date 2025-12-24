import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

export const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header("Authorization");

        if (!token) {
            return res.status(401).json({ success: false, message: "Access Denied" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await userModel.findById(decoded._id).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid Token" });
    }
};
