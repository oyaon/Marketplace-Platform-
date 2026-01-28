// repository description
const prisma = require("../config/prisma");

// Buyer creates project
const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description required" });
    }

    if (title.trim().length === 0 || description.trim().length === 0) {
      return res.status(400).json({ message: "Title and description cannot be empty" });
    }

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        buyerId: req.user.id,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Buyer views own projects
const getMyProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { buyerId: req.user.id },
      include: {
        _count: {
          select: { tasks: true, requests: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// View all projects (Admin)
const getAllProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        buyer: { select: { id: true, email: true } },
        _count: {
          select: { tasks: true, requests: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Browse unassigned projects (Solver)
const getOpenProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { status: "UNASSIGNED" },
      include: {
        buyer: { select: { email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, email: true } },
        _count: {
          select: { tasks: true, requests: true },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get project details with full context (includes tasks, requests, solver info)
const getProjectDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, email: true } },
        tasks: {
          include: { submission: true },
        },
        requests: {
          include: {
            solver: { select: { id: true, email: true } },
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createProject,
  getMyProjects,
  getAllProjects,
  getOpenProjects,
  getProjectById,
  getProjectDetails,
  getAssignedProjects,
  updateProject,
  deleteProject,
};

// Get assigned projects (Solver views their assigned projects)
const getAssignedProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { assignedSolverId: req.user.id },
      include: {
        buyer: { select: { id: true, email: true } },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update project (Buyer only)
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    // Verify project exists and belongs to buyer
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (existingProject.buyerId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: not your project" });
    }

    // Can only update if project is not assigned
    if (existingProject.status === "ASSIGNED" && status && status !== "ASSIGNED") {
      return res.status(400).json({ message: "Cannot change status of assigned project" });
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (status) updateData.status = status;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete project (Buyer only)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify project exists and belongs to buyer
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (existingProject.buyerId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: not your project" });
    }

    // Can only delete if project is not assigned
    if (existingProject.status === "ASSIGNED") {
      return res.status(400).json({ message: "Cannot delete assigned project" });
    }

    await prisma.project.delete({
      where: { id },
    });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

