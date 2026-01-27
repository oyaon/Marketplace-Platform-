"use client";

import { motion } from "framer-motion";

const colors: Record<string, string> = {
  UNASSIGNED: "bg-gray-200 text-gray-800",
  ASSIGNED: "bg-blue-200 text-blue-800",

  IN_PROGRESS: "bg-yellow-200 text-yellow-800",
  SUBMITTED: "bg-purple-200 text-purple-800",
  COMPLETED: "bg-green-200 text-green-800",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <motion.span
      key={status}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`inline-block rounded px-2 py-1 text-xs font-semibold ${colors[status]}`}
    >
      {status}
    </motion.span>
  );
}
