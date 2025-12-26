
import Service from '../models/serviceModel.js'
import userModel from '../models/userModel.js'
import transactionModel from '../models/transactionModel.js';
import orderModel from '../models/orderModel.js'
import missionModel from "../models/missionModel.js";



export const login_admin = async (req, res) => {
    try {
        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            return res.json({ success: true })
        }

        res.json({ success: false });
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: error.message })
    }
}



//function manager user
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.body

        await userModel.findByIdAndDelete(userId)
        res.json({ success: true, message: "User deleted successfully" })

    }
    catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: error.message })
    }
}

export const getAllUser = async (req, res) => {
    try {
        const users = await userModel.find()

        res.json({ success: true, users })
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ success: false, message: error.message })
    }
}



export const login_user = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User does not exist" });
        }

        if (user.isBlocked) {
            return res.json({ success: false, message: "Your account has been blocked" });
        }

        // Thực hiện xác thực mật khẩu (nếu có logic mật khẩu)
        res.json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// function manager service
const addService = async (req, res) => {
    try {
        const { platform, category, name, price, speed } = req.body;

        if (!platform || !category || !name || !price || !speed) {
            return res.json({ success: false, message: "Please Fill In All Information" });
        }

        const newService = new Service({ platform, category, name, price, speed });
        await newService.save();

        res.json({ success: true, newService });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const editService = async (req, res) => {
    try {
        const { serviceId, platform, category, name, price, speed } = req.body;

        if (!serviceId || !platform || !category || !name || !price || !speed) {
            return res.json({ success: false, message: "Please fill in the information completely" });
        }

        const updatedService = await Service.findByIdAndUpdate(
            serviceId,
            { platform, category, name, price, speed },
            { new: true }
        );

        if (!updatedService) {
            return res.status(404).json({ success: false, message: "Service not available" });
        }

        res.json({ success: true, updatedService });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Lấy danh sách dịch vụ từ MongoDB
const listService = async (req, res) => {
    try {
        const services = await Service.find();
        res.json({ success: true, services }); // Trả về có success để frontend xử lý dễ hơn
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


// Xóa dịch vụ trong MongoDB
const deleteService = async (req, res) => {
    try {
        const {serviceId} = req.body;
        await Service.findByIdAndDelete(serviceId);
        res.json({ success: true, message: "Service deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }  
}

export { addService, listService, deleteService, editService };


// Admin chấp nhận yêu cầu nạp tiền


export const approveDeposit = async (req, res) => {
    try {
        const { transactionId } = req.body;

        const transaction = await transactionModel.findById(transactionId);
        if (!transaction || transaction.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Invalid transaction' });
        }

        // Cập nhật trạng thái giao dịch
        transaction.status = 'approved';
        await transaction.save();

        // Cộng tiền vào tài khoản user
        await userModel.findByIdAndUpdate(
            transaction.userId,
            { $inc: { balance: transaction.amount } }
        );

        res.json({ success: true, message: 'Deposit successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error server', error: error.message });
    }
};


// Admin từ chối yêu cầu nạp tiền
export const rejectDeposit = async (req, res) => {
    try {
        const { transactionId } = req.body;

        const transaction = await transactionModel.findById(transactionId);
        if (!transaction || transaction.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Invalid transaction' });
        }

        transaction.status = 'rejected';
        await transaction.save();

        res.json({ success: true, message: 'Transaction has been declined' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error server' });
    }
};


// Lấy danh sách yêu cầu nạp tiền (status: pending)
export const getTransactions = async (req, res) => {
    try {
        const transactions = await transactionModel.find({ status: 'pending' }).populate({
            path: 'userId',
            model: 'user',
            select: 'username email'
        });

        res.json({
            success: true,
            message: 'List of deposit requests',
            transactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error server',
            error: error.message
        });
    }
};

export const handleAdminOrders = async (req, res) => {
    const { action, orderId, status } = req.body;
  
    try {
      // Lấy tất cả đơn hàng
      if (action === "getAllOrders") {
        const orders = await orderModel
          .find()
          .populate("service")
          .sort({ orderDate: -1 });
  
        return res.status(200).json({ success: true, orders });
      }
      if (action === "getOrderById") {
        const order = await orderModel.findById(orderId).populate("service");
        if (!order) {
          return res.status(400).json({ success: false, message: "Order does not exist" });
        }
        return res.status(200).json({ success: true, order });
      }
  
      // Thay đổi trạng thái đơn hàng
      if (action === "updateOrderStatus") {
        const order = await orderModel.findById(orderId);
        if (!order) {
          return res.status(400).json({ success: false, message: "Order does not exist" });
        }
  
        order.status = status;
        await order.save();
  
        return res.status(200).json({ success: true, message: "Order status has been updated", order });
      }
  
      // Xóa đơn hàng
      if (action === "deleteOrder") {
        const order = await orderModel.findById(orderId);
        if (!order) {
          return res.status(400).json({ success: false, message: "Order does not existi" });
        }
  
        await order.deleteOne();
        return res.status(200).json({ success: true, message: "Order has been deleted" });
      }
  
      // Nếu action không hợp lệ
      return res.status(400).json({ success: false, message: "Invalid action" });
  
    } catch (error) {
      console.error("Lỗi:", error);
      return res.status(500).json({ success: false, message: "Processing error", error });
    }
  };
// Thêm nhiệm vụ mới
export const addMission = async (req, res) => {
    try {
        const { title, type, reward } = req.body;

        if (!title || !type || !reward) {
            return res.json({ success: false, message: "Missing fields" });
        }

        const mission = new missionModel({ title, type, reward });
        await mission.save();

        res.json({ success: true, mission });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
// Chỉnh sửa nhiệm vụ
export const editMission = async (req, res) => {
    try {
        const { missionId, title, type, reward, isActive } = req.body;

        const mission = await missionModel.findByIdAndUpdate(
            missionId,
            { title, type, reward, isActive },
            { new: true }
        );

        if (!mission) {
            return res.json({ success: false, message: "Mission not found" });
        }

        res.json({ success: true, mission });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
// Xóa nhiệm vụ
export const deleteMission = async (req, res) => {
    try {
        const { missionId } = req.body;

        await missionModel.findByIdAndDelete(missionId);
        res.json({ success: true, message: "Mission deleted" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
// Lấy danh sách nhiệm vụ
export const getAllMissions = async (req, res) => {
    const missions = await missionModel.find();
    res.json({ success: true, missions });
};
// Lấy danh sách nhiệm vụ đang hoạt động
export const assignMissionToUser = async (req, res) => {
    try {
        const { userId, missionId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // reset để user làm lại nhiệm vụ
        user.completedMissions = user.completedMissions.filter(
            id => id.toString() !== missionId
        );

        await user.save();

        res.json({ success: true, message: "Mission assigned to user" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};






