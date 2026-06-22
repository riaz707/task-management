const express = require("express");
const router = express.Router();
const {
  createTask, getTasks, getTask, updateTask,
  moveTask, reorderTasks, toggleChecklistItem,
  deleteTask, getMyTasks,
} = require("../controllers/task.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/my-tasks", getMyTasks);
router.patch("/reorder", reorderTasks);
router.route("/").get(getTasks).post(createTask);
router.route("/:id").get(getTask).put(updateTask).delete(deleteTask);
router.patch("/:id/move", moveTask);
router.patch("/:id/checklist/:itemId", toggleChecklistItem);

module.exports = router;
