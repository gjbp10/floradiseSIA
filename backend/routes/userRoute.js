import express from 'express';
import { 
    loginUser, 
    registerUser, 
    adminLogin, 
    getUserProfile,
    updateUserProfile,
    addUser,           // This is the controller function needed for admin creation
    getAllUsers,
    updateUser,
    toggleSuspendUser,
    deleteUser
} from '../controllers/userController.js';
import User from '../models/userModel.js';
import authMiddleware from '../middleware/auth.js';

const userRouter = express.Router();

// ================== PUBLIC ROUTES ================== //

// Register regular user
userRouter.post('/register', registerUser);

// Login regular user
userRouter.post('/login', loginUser);

// Admin Login
userRouter.post('/admin', adminLogin);

// 🌟 NEW: Route for initial Admin Account Creation (UNPROTECTED) 🌟
// This endpoint uses the 'addUser' controller but is public so the first admin can be created.
userRouter.post('/register-admin', addUser);

// ================== PROTECTED USER ROUTES ================== //

// Get logged-in user profile
userRouter.get('/profile', authMiddleware, getUserProfile);

// Update logged-in user profile
userRouter.put('/profile', authMiddleware, updateUserProfile);

// ================== ADMIN ROUTES (Protected by authMiddleware and manual role check) ================== //

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
