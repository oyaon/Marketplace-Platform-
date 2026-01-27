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
          orderBy: { createdAt: "desc" },
        },
        requests: {
          include: {
            solver: { select: { id: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
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
};

