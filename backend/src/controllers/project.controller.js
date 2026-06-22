const Project = require("../models/Project");
const Task = require("../models/Task");

// @desc  Create project
// @route POST /api/projects
const createProject = async (req, res) => {
  try {
    const { title, description, color } = req.body;
    const project = await Project.create({
      title,
      description,
      color,
      owner: req.user._id,
      members: [req.user._id],
    });
    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all projects for current user
// @route GET /api/projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user._id,
      isArchived: false,
    })
      .populate("owner", "name avatar")
      .populate("members", "name avatar")
      .sort("-createdAt");
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get single project
// @route GET /api/projects/:id
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name avatar email")
      .populate("members", "name avatar email");

    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const isMember = project.members.some((m) => m._id.equals(req.user._id));
    if (!isMember) return res.status(403).json({ success: false, message: "Access denied" });

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update project
// @route PUT /api/projects/:id
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only owner can update" });
    }

    const { title, description, color, isArchived } = req.body;
    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;
    if (isArchived !== undefined) project.isArchived = isArchived;

    await project.save();
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete project
// @route DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only owner can delete" });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Add member to project
// @route POST /api/projects/:id/members
const addMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only owner can add members" });
    }

    const { userId } = req.body;
    if (project.members.includes(userId)) {
      return res.status(400).json({ success: false, message: "User already a member" });
    }

    project.members.push(userId);
    await project.save();
    await project.populate("members", "name avatar email");
    res.json({ success: true, members: project.members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Remove member from project
// @route DELETE /api/projects/:id/members/:userId
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only owner can remove members" });
    }
    if (project.owner.equals(req.params.userId)) {
      return res.status(400).json({ success: false, message: "Cannot remove owner" });
    }

    project.members = project.members.filter((m) => !m.equals(req.params.userId));
    await project.save();
    res.json({ success: true, message: "Member removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject, addMember, removeMember };
