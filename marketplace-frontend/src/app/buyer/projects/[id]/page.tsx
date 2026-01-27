"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Solver {
  id: string;
  email: string;
}

interface Request {
  id: string;
  status: string;
  solver: Solver;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  deadline: string;
  submission?: { fileUrl: string };
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  requests: Request[];
  tasks: Task[];
}

export default function BuyerProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSolver, setSelectedSolver] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(
          `http://localhost:5000/api/projects/${params.id}/details`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch project");
        const data = await res.json();
        setProject(data);
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.id, router]);

  const handleAssignSolver = async () => {
    if (!selectedSolver) {
      alert("Please select a solver");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/requests/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: params.id,
          solverId: selectedSolver,
        }),
      });

      if (!res.ok) throw new Error("Failed to assign solver");
      alert("Solver assigned successfully!");
      setSelectedSolver("");

      // Refresh project
      const refreshRes = await fetch(
        `http://localhost:5000/api/projects/${params.id}/details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const refreshData = await refreshRes.json();
      setProject(refreshData);
    } catch (error) {
      console.error("Error:", error);
      alert(`Failed to assign solver: ${error}`);
    }
  };

  const handleAcceptTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/tasks/accept/${taskId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to accept task");
      alert("Task accepted!");

      // Refresh project
      const refreshRes = await fetch(
        `http://localhost:5000/api/projects/${params.id}/details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const refreshData = await refreshRes.json();
      setProject(refreshData);
    } catch (error) {
      console.error("Error:", error);
      alert(`Failed to accept task: ${error}`);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!project) return <div className="p-6">Project not found</div>;

  const pendingRequests = project.requests.filter(
    (r) => r.status === "PENDING"
  );
  const submittedTasks = project.tasks.filter((t) => t.status === "SUBMITTED");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline mb-6"
        >
          ← Back
        </button>

        {/* Project Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold">{project.title}</h1>
              <p className="text-gray-600 mt-2">{project.description}</p>
            </div>
            <motion.span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                project.status === "ASSIGNED"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
            >
              {project.status}
            </motion.span>
          </div>
        </div>

        {/* Assign Solver Section - Only show if not assigned */}
        {project.status === "UNASSIGNED" && (
          <motion.div
            className="bg-white rounded-lg shadow p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">Assign Solver</h2>
            {pendingRequests.length === 0 ? (
              <p className="text-gray-600">No requests yet</p>
            ) : (
              <div className="flex gap-4">
                <select
                  value={selectedSolver}
                  onChange={(e) => setSelectedSolver(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                >
                  <option value="">Select a solver...</option>
                  {pendingRequests.map((req) => (
                    <option key={req.id} value={req.solver.id}>
                      {req.solver.email}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignSolver}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Assign
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Requests */}
        {project.requests.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Requests</h2>
            <div className="space-y-2">
              {project.requests.map((req) => (
                <div key={req.id} className="p-4 border rounded flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{req.solver.email}</p>
                    <p className="text-sm text-gray-500">
                      Requested: {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      req.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : req.status === "ACCEPTED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks */}
        {project.tasks.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Tasks</h2>
            <div className="space-y-4">
              {project.tasks.map((task) => (
                <motion.div
                  key={task.id}
                  className="p-4 border rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{task.title}</h3>
                      <p className="text-gray-600 text-sm">
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        task.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : task.status === "SUBMITTED"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  {task.status === "SUBMITTED" && (
                    <div className="mt-3 flex gap-2">
                      <a
                        href={task.submission?.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Download Submission
                      </a>
                      <button
                        onClick={() => handleAcceptTask(task.id)}
                        className="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Accept
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

