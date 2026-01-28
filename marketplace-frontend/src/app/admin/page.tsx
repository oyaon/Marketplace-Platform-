"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { logout } from "@/lib/auth";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  status: string;
  buyer: { email: string };
  _count: { tasks: number; requests: number };
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch users
        const usersData = await apiFetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersData);

        // Fetch projects
        const projectsData = await apiFetch("/api/projects/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(projectsData);
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleAssignBuyer = async () => {
    if (!selectedUserId) {
      alert("Please select a user");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await apiFetch(`/api/users/${selectedUserId}/assign-buyer`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Buyer role assigned successfully");

      // Refresh users list
      const usersData = await apiFetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(usersData);
      setSelectedUserId("");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to assign role");
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

        {/* Assign Buyer Role Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Assign Buyer Role</h2>
          <div className="flex gap-4">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
            >
              <option value="">Select a user...</option>
              {users
                .filter((u) => u.role !== "BUYER" && u.role !== "ADMIN")
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email} (Currently: {user.role})
                  </option>
                ))}
            </select>
            <button
              onClick={handleAssignBuyer}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Assign Buyer
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">All Users ({users.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{user.name || "N/A"}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === "ADMIN"
                            ? "bg-red-100 text-red-800"
                            : user.role === "BUYER"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Projects Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">All Projects ({projects.length})</h2>
          <div className="grid gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{project.title}</h3>
                    <p className="text-gray-600 text-sm">
                      Buyer: {project.buyer.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        project.status === "ASSIGNED"
                          ? "bg-green-100 text-green-800"
                          : project.status === "COMPLETED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {project.status}
                    </span>
                    <p className="text-gray-600 text-xs mt-2">
                      {project._count.tasks} tasks • {project._count.requests}{" "}
                      requests
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

