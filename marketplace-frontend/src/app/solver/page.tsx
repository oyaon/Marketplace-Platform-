"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  buyer: { email: string };
  _count: { tasks: number };
  createdAt: string;
}

export default function SolverPage() {
  const router = useRouter();
  const [openProjects, setOpenProjects] = useState<Project[]>([]);
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch open projects
        const openRes = await fetch(
          "http://localhost:5000/api/projects/open",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!openRes.ok) throw new Error("Failed to fetch open projects");
        const openData = await openRes.json();
        setOpenProjects(openData);

        // Fetch user info to check assigned projects
        const userRes = await fetch(
          "http://localhost:5000/api/protected",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (userRes.ok) {
          const userData = await userRes.json();
          // In a real app, we'd fetch assigned projects from an endpoint
          // For now, we'll just show open projects
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [router]);

  const handleRequestProject = async (projectId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      alert("Request submitted successfully!");
      setOpenProjects(openProjects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error("Error:", error);
      alert(`Failed to request project: ${error}`);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8">Solver Dashboard</h1>

        {/* Open Projects Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Available Projects</h2>
          {openProjects.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
              No open projects available at the moment
            </div>
          ) : (
            <div className="grid gap-4">
              {openProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold">{project.title}</h3>
                        <p className="text-sm text-gray-600">
                          By: {project.buyer.email}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRequestProject(project.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                      >
                        Request Project
                      </button>
                    </div>
                    <p className="text-gray-700 mb-3">{project.description}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{project._count.tasks} tasks</span>
                      <span>
                        Posted:{" "}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Projects Section */}
        {assignedProjects.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Assignments</h2>
            <div className="grid gap-4">
              {assignedProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/solver/projects/${project.id}`}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-gray-700 mb-2">{project.description}</p>
                  <div className="text-sm text-gray-500">
                    {project._count.tasks} tasks
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

