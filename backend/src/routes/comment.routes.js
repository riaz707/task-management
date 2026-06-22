const express = require("express");
const router = express.Router();
const { addComment, getComments, deleteComment } = require("../controllers/comment.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.post("/", addComment);
router.get("/:taskId", getComments);
router.delete("/:id", deleteComment);

module.exports = router;
