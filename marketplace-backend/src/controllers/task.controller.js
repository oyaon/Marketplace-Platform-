const prisma = require("../config/prisma");

// Get tasks by project (Solver views their tasks, Buyer views their project's tasks)
const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Buyer can only view tasks for their own projects
    if (req.user.role === "BUYER" && project.buyerId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: not your project" });
    }

    // Solver can only view tasks if they're assigned to the project
    if (req.user.role === "SOLVER" && project.assignedSolverId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: not assigned to this project" });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        submission: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Solver creates a task
const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, deadline } = req.body;

    if (!title || !description || !deadline) {
      return res.status(400).json({ message: "All fields required: title, description, deadline" });
    }

    // Verify project exists and solver is assigned
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.assignedSolverId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: you are not assigned to this project" });
    }

    // Validate deadline is in the future
    const deadlineDate = new Date(deadline);
    if (deadlineDate < new Date()) {
      return res.status(400).json({ message: "Deadline must be in the future" });
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        deadline: deadlineDate,
        status: "IN_PROGRESS",
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Solver submits ZIP
const submitTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "ZIP file required" });
    }

    // Verify task exists and belongs to a project assigned to this solver
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.project.assignedSolverId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: not assigned to this task" });
    }

    if (task.status !== "IN_PROGRESS") {
      return res.status(409).json({ message: `Cannot submit task in ${task.status} status` });
    }

    // Check if submission already exists
    if (task.submission) {
      return res.status(409).json({ message: "Task already has a submission" });
    }

    const submission = await prisma.submission.create({
      data: {
        taskId,
        fileUrl: req.file.path,
      },
    });

    await prisma.task.update({
      where: { id: taskId },
      data: { status: "SUBMITTED" },
    });

    res.json({
      message: "Task submitted successfully",
      submission,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Buyer accepts task (marks as COMPLETED)
const acceptTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify buyer owns the project
    if (task.project.buyerId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: not your project" });
    }

    if (task.status !== "SUBMITTED") {
      return res.status(409).json({ message: `Cannot accept task in ${task.status} status. Must be SUBMITTED.` });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: "COMPLETED" },
    });

    res.json({
      message: "Task accepted successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Buyer views submission details for a task
const getTaskSubmission = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        submission: true,
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.project.buyerId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: not your project" });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getTasksByProject,
  createTask,
  submitTask,
  acceptTask,
  getTaskSubmission,
};
