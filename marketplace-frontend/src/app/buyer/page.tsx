"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { logout } from "@/lib/auth";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  assignedSolverId?: string;
  _count: { tasks: number; requests: number };
  createdAt: string;
}

export default function BuyerPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const data = await apiFetch("/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(data);
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [router]);

  const handleLogout = () => {
    logout();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Buyer Dashboard</h1>
          <div className="flex gap-4">
            <Link
              href="/buyer/projects/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              + New Project
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">No projects yet</p>
            <Link
              href="/buyer/projects/new"
              className="text-blue-600 hover:underline"
            >
              Create your first project
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/buyer/projects/${project.id}`}>
                  <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-2xl font-bold">{project.title}</h2>
                      <motion.span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
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
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{project._count.tasks} tasks</span>
                      <span>{project._count.requests} requests</span>
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

