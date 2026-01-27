"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function NewProjectPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch("/api/projects", {
      method: "POST",
      body: JSON.stringify({ title, description }),
    });
    window.location.href = "/buyer/projects";
  };

  return (
    <main className="p-6 max-w-md">
      <h1 className="text-xl font-semibold mb-4">Create Project</h1>

      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full border p-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border p-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button className="bg-black text-white px-4 py-2">
          Create
        </button>
      </form>
    </main>
  );
}

