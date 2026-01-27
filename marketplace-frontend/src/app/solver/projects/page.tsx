"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";

interface Project {
  id: string;
  title: string;
  description: string;
}

export default function SolverProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/api/projects/open");
      setProjects(data);
    } catch (err: any) {
      setError(err.message || "Failed to load projects");
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const request = async (projectId: string) => {
    // Add to pending state
    setPendingRequests((prev) => new Set(prev).add(projectId));
    setError(null);

    try {
      // Send POST to /api/requests with body { projectId }
      await apiFetch("/api/requests", {
        method: "POST",
        body: JSON.stringify({ projectId }),
      });
      alert("Request sent successfully!");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send request";
      setError(errorMessage);
      console.error("Error sending request:", err);
    } finally {
      // Remove from pending state
      setPendingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Available Projects</h1>

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={fetchProjects}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-500">Loading projects...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && projects.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No projects available at the moment.</p>
        </div>
      )}

      {/* Projects List */}
      {!loading && !error && projects.length > 0 && (
        <div className="space-y-3">
          {projects.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="border p-4 rounded"
            >
              <h2 className="font-medium">{p.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{p.description}</p>
              <button
                onClick={() => request(p.id)}
                disabled={pendingRequests.has(p.id)}
                className={`mt-2 px-3 py-1 rounded ${
                  pendingRequests.has(p.id)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {pendingRequests.has(p.id) ? "Sending..." : "Request"}
              </button>
              <a
                href={`/solver/projects/${p.id}`}
                className="mt-2 ml-2 px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 inline-block"
              >
                View Details
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}

