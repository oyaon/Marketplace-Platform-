const prisma = require("../config/prisma");

// Solver requests to work on a project
const requestProject = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    // Verify project exists and is still unassigned
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.status === "ASSIGNED") {
      return res.status(409).json({ message: "Project is already assigned" });
    }

    // Check for existing request from this solver
    const existingRequest = await prisma.request.findFirst({
      where: {
        projectId,
        solverId: req.user.id,
      },
    });

    if (existingRequest) {
      return res.status(409).json({ message: "You have already requested this project" });
    }

    const request = await prisma.request.create({
      data: {
        projectId,
        solverId: req.user.id,
      },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Buyer views requests for a project
const getProjectRequests = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists and buyer owns it
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.buyerId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: not your project" });
    }

    const requests = await prisma.request.findMany({
      where: { projectId },
      include: {
        solver: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Buyer assigns a solver
const assignSolver = async (req, res) => {
  try {
    const { projectId, solverId } = req.body;

    if (!projectId || !solverId) {
      return res.status(400).json({ message: "projectId and solverId required" });
    }

    // Check if project exists and belongs to buyer
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (existingProject.buyerId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: not your project" });
    }

    if (existingProject.status === "ASSIGNED") {
      return res.status(409).json({ message: "Project is already assigned and cannot be reassigned" });
    }

    // Verify solver has a pending request
    const solverRequest = await prisma.request.findFirst({
      where: {
        projectId,
        solverId,
      },
    });

    if (!solverRequest) {
      return res.status(404).json({ message: "This solver has not requested this project" });
    }

    // Update project status and assign solver
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        assignedSolverId: solverId,
        status: "ASSIGNED",
      },
    });

    // Reject all other requests for this project
    await prisma.request.updateMany({
      where: {
        projectId,
        solverId: { not: solverId },
      },
      data: { status: "REJECTED" },
    });

    // Accept the chosen request
    await prisma.request.update({
      where: { id: solverRequest.id },
      data: { status: "ACCEPTED" },
    });

    res.json({
      message: "Solver assigned successfully",
      project,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  requestProject,
  getProjectRequests,
  assignSolver,
};

