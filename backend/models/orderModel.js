import mongoose from "mongoose";
import serviceModel from "./serviceModel.js"; // Import serviceModel

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  // Giả sử bạn có một model "User" để lưu thông tin người dùng
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "server",  // Tham chiếu đến serviceModel
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed", "Cancelled"],  // Trạng thái của đơn hàng
    default: "Pending"
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
});

const orderModel = mongoose.model("Order", orderSchema);

export default orderModel;
