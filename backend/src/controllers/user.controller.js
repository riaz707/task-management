const User = require("../models/User");
const multer = require("multer");
const path = require("path");

// Multer setup for avatar upload
const storage = multer.diskStorage({
  destination: "uploads/avatars/",
  filename: (req, file, cb) => {
    cb(null, `avatar-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// @desc  Get all users (admin or for member search)
// @route GET /api/users
const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const query = search
      ? { name: { $regex: search, $options: "i" } }
      : {};
    const users = await User.find(query).select("-password -refreshToken");
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get user by ID
// @route GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -refreshToken");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update profile
// @route PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (req.file) user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Change password
// @route PUT /api/users/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: "Current password incorrect" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getUsers, getUserById, updateProfile, changePassword, upload };
