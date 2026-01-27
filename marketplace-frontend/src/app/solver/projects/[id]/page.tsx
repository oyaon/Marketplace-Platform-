"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import ZipUpload from "@/components/ZipUpload";
import StatusBadge from "@/components/StatusBadge";

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
}

export default function SolverProjectDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch project details
        const projectData = await apiFetch(`/api/projects/${id}`);
        setProject(projectData);
        
        // Fetch tasks
        const tasksData = await apiFetch(`/api/tasks/${id}`);
        setTasks(tasksData);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load project data";
        setError(errorMessage);
        console.error("Error fetching project data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await apiFetch(`/api/tasks/${id}`, {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          deadline,
        }),
      });

      // Clear form
      setTitle("");
      setDescription("");
      setDeadline("");

      // Refresh tasks
      const updatedTasks = await apiFetch(`/api/tasks/${id}`);
      setTasks(updatedTasks);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create task";
      setError(errorMessage);
      console.error("Error creating task:", err);
    }
  };

  if (loading) {
    return (
      <main className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-500">Loading project...</p>
        </div>
      </main>
    );
  }

  if (error && !project) {
    return (
      <main className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 mb-2">{error}</p>
          <a 
            href="/solver/projects"
            className="text-blue-600 hover:underline"
          >
            ← Back to Projects
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-4xl">
      <a 
        href="/solver/projects"
        className="text-gray-600 hover:text-gray-900 mb-4 inline-block"
      >
        ← Back to Projects
      </a>

      {project && (
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">{project.title}</h1>
          <p className="text-gray-600">{project.description}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Create Task Form */}
      <div className="bg-white border rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Create New Task</h2>
        <form onSubmit={createTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Describe the task"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deadline
            </label>
            <input
              type="date"
              title="Task deadline"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Add Task
          </button>
        </form>
      </div>

      {/* Task List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Project Tasks</h2>
        
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
            <p>No tasks created yet.</p>
            <p className="text-sm mt-1">Create a task using the form above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="border p-4 flex flex-col gap-3"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-medium">{task.title}</h2>
                    <p className="text-sm text-gray-500">
                      Due: {new Date(task.deadline).toLocaleDateString()}
                    </p>
                  </div>

                  <StatusBadge status={task.status} />
                </div>

                {/* ZIP Upload */}
                {task.status === "IN_PROGRESS" && (
                  <ZipUpload
                    taskId={task.id}
                    onSuccess={async () => {
                      const updated = await apiFetch(`/api/tasks/${id}`);
                      setTasks(updated);
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

