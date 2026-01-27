"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";

export default function BuyerProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/api/projects");
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

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">My Projects</h1>

      <a
        href="/buyer/projects/new"
        className="inline-block mb-4 rounded bg-black px-4 py-2 text-white"
      >
        + New Project
      </a>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-500">Loading projects...</p>
        </div>
      )}

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

      {/* Empty State */}
      {!loading && !error && projects.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No projects yet. Create your first project!</p>
        </div>
      )}

      {/* Projects List */}
      {!loading && !error && projects.length > 0 && (
        <div className="space-y-3">
          {projects.map((p) => (
            <motion.a
              key={p.id}
              href={`/buyer/projects/${p.id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="block rounded border p-4 hover:bg-gray-50"
            >
              <h2 className="font-medium">{p.title}</h2>
              <StatusBadge status={p.status} />
            </motion.a>
          ))}
        </div>
      )}
    </main>
  );
}

