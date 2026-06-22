const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Project = require("../models/Project");

// @desc  Add comment to task
// @route POST /api/comments
const addComment = async (req, res) => {
  try {
    const { taskId, text } = req.body;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const project = await Project.findById(task.project);
    if (!project.members.some((m) => m.equals(req.user._id))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const comment = await Comment.create({
      task: taskId,
      author: req.user._id,
      text,
    });

    await comment.populate("author", "name avatar");
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get comments for a task
// @route GET /api/comments/:taskId
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate("author", "name avatar")
      .sort("createdAt");
    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete comment
// @route DELETE /api/comments/:id
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });
    if (!comment.author.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    await comment.deleteOne();
    res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { addComment, getComments, deleteComment };
