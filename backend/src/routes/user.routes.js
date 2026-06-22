const express = require("express");
const router = express.Router();
const { getUsers, getUserById, updateProfile, changePassword, upload } = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/profile", upload.single("avatar"), updateProfile);
router.put("/change-password", changePassword);

module.exports = router;
