const Task = require("../models/Task");
const Project = require("../models/Project");

// Helper: check project membership
const isMember = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return false;
  return project.members.some((m) => m.equals(userId));
};

// @desc  Create task
// @route POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, project, status, priority, assignees, dueDate, labels } = req.body;

    if (!(await isMember(project, req.user._id))) {
      return res.status(403).json({ success: false, message: "Not a project member" });
    }

    // Set order to last position in column
    const lastTask = await Task.findOne({ project, status }).sort("-order");
    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      title, description, project, status, priority,
      assignees, dueDate, labels, order,
      createdBy: req.user._id,
    });

    await task.populate("assignees", "name avatar");
    await task.populate("createdBy", "name avatar");

    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get tasks for a project (grouped by status for Kanban)
// @route GET /api/tasks?project=:projectId&status=&priority=&assignee=
const getTasks = async (req, res) => {
  try {
    const { project, status, priority, assignee } = req.query;

    if (!project) return res.status(400).json({ success: false, message: "project query param required" });

    if (!(await isMember(project, req.user._id))) {
      return res.status(403).json({ success: false, message: "Not a project member" });
    }

    const filter = { project };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignees = assignee;

    const tasks = await Task.find(filter)
      .populate("assignees", "name avatar")
      .populate("createdBy", "name avatar")
      .sort("order");

    // Group by status for Kanban board
    const columns = {
      todo: [],
      "in-progress": [],
      review: [],
      done: [],
    };
    tasks.forEach((t) => {
      if (columns[t.status]) columns[t.status].push(t);
    });

    res.json({ success: true, tasks, columns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get single task
// @route GET /api/tasks/:id
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignees", "name avatar email")
      .populate("createdBy", "name avatar")
      .populate("project", "title");

    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    if (!(await isMember(task.project._id, req.user._id))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update task
// @route PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    if (!(await isMember(task.project, req.user._id))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const fields = ["title", "description", "status", "priority", "assignees", "dueDate", "labels", "checklist"];
    fields.forEach((f) => { if (req.body[f] !== undefined) task[f] = req.body[f]; });

    await task.save();
    await task.populate("assignees", "name avatar");
    await task.populate("createdBy", "name avatar");

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update task status (drag-and-drop)
// @route PATCH /api/tasks/:id/move
const moveTask = async (req, res) => {
  try {
    const { status, order } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    if (!(await isMember(task.project, req.user._id))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    task.status = status;
    task.order = order ?? task.order;
    await task.save();

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Reorder tasks within same column
// @route PATCH /api/tasks/reorder
const reorderTasks = async (req, res) => {
  try {
    // Expects: [{ _id, order }]
    const { tasks } = req.body;
    const updates = tasks.map(({ _id, order }) =>
      Task.findByIdAndUpdate(_id, { order })
    );
    await Promise.all(updates);
    res.json({ success: true, message: "Tasks reordered" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Toggle checklist item
// @route PATCH /api/tasks/:id/checklist/:itemId
const toggleChecklistItem = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const item = task.checklist.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: "Checklist item not found" });

    item.completed = !item.completed;
    await task.save();
    res.json({ success: true, checklist: task.checklist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete task
// @route DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    if (!(await isMember(task.project, req.user._id))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await task.deleteOne();
    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get tasks assigned to current user (across all projects)
// @route GET /api/tasks/my-tasks
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignees: req.user._id })
      .populate("project", "title color")
      .populate("assignees", "name avatar")
      .sort("dueDate");
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createTask, getTasks, getTask, updateTask,
  moveTask, reorderTasks, toggleChecklistItem,
  deleteTask, getMyTasks,
};
