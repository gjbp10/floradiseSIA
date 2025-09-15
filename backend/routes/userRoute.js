import express from 'express';
import { 
  loginUser, 
  registerUser, 
  adminLogin, 
  getUserProfile 
} from '../controllers/userController.js';
import User from '../models/userModel.js';
import authMiddleware from '../middleware/auth.js';

const userRouter = express.Router();

// Register
userRouter.post('/register', registerUser);

// Login
userRouter.post('/login', loginUser);

// Admin Login
userRouter.post('/admin', adminLogin);

// Get logged-in user profile (protected route)
userRouter.get('/profile', authMiddleware, getUserProfile);

// ================== ADMIN ROUTES ================== //

// Get all users (Admin only)
userRouter.get('/all', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const users = await User.find().select("-password");
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user (Admin only)
userRouter.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default userRouter;
