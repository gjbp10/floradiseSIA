import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token, role: user.role || 'user' }); // Return role for frontend
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for user register
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, address, phone } = req.body;

    // checking user already exists or not
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password" });
    }

    // You can add validation for phone number here if needed
    if (!validator.isMobilePhone(phone, "any")) {
      return res.json({ success: false, message: "Please enter a valid phone number" });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      address,
      phone,
      role: 'user', // Explicitly set default role
    });

    const user = await newUser.save();

    const token = createToken(user._id);

    res.json({ success: true, token, role: user.role });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// 🌟 FIX: Cleaned up adminLogin. It's now standard and correct. 🌟
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user || user.role !== "admin") {
      // Use generic message for security
      return res.json({ success: false, message: "Invalid credentials" }); 
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id); 
      res.json({ success: true, token, role: user.role }); // Return role
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for getting logged-in user profile
const getUserProfile = async (req, res) => {
  try {
    // req.user is attached by authMiddleware/adminAuth
    // FIX: Send the user data to the front end, but explicitly exclude the password.
    const userObject = req.user.toObject ? req.user.toObject() : req.user;
    delete userObject.password;

    res.json({ success: true, user: userObject });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Route for updating user profile
const updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address } = req.body;

    // 🌟 FIX: Use req.user._id which is set by the auth middleware 🌟
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Update user details
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    // Only update email if it hasn't been changed to an existing email (requires extra check)
    user.email = email || user.email; 
    user.phone = phone || user.phone;
    user.address = address || user.address;

    await user.save();
    // FIX: Re-fetch the user object to send back without the password
    const updatedUser = user.toObject();
    delete updatedUser.password;
    
    res.json({ success: true, message: "Profile updated successfully!", user: updatedUser });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to update profile" });
  }
};

// Admin Routes for User Management
const addUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body; 

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            firstName, 
            lastName,
            email,
            password: hashedPassword,
            role: role || 'user',
        });

        const user = await newUser.save(); // Save the user to get the full object

        // 🌟 MODIFICATION: Create a token for the newly created user 🌟
        const token = createToken(user._id);

        // 🌟 MODIFICATION: Return the token and role for immediate login 🌟
        res.json({ 
            success: true, 
            message: "User added successfully",
            token, 
            role: user.role 
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to add user" });
    }
};

// Fetch all users (admin-only)
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}).select('-password'); 
    res.json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to fetch users" });
  }
};

// Update a user (admin-only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, suspended } = req.body; 
    
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update fields
    user.firstName = firstName !== undefined ? firstName : user.firstName;
    user.lastName = lastName !== undefined ? lastName : user.lastName;
    user.email = email !== undefined ? email : user.email;
    user.role = role !== undefined ? role : user.role;
    user.suspended = suspended !== undefined ? suspended : user.suspended;
    
    await user.save();

    // FIX: Send back the updated user without the password
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({ success: true, message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to update user" });
  }
};


// Suspend/Unsuspend a user (admin-only)
const toggleSuspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { suspended } = req.body;

    const user = await userModel.findByIdAndUpdate(id, { suspended }, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: `User ${suspended ? 'suspended' : 'unsuspended'} successfully`, user });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to update suspension status" });
  }
};

// Delete a user (admin-only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userModel.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to delete user" });
  }
};

export {
  loginUser,
  registerUser,
  adminLogin,
  getUserProfile,
  updateUserProfile,
  addUser,
  getAllUsers,
  updateUser,
  toggleSuspendUser,
  deleteUser,
};
