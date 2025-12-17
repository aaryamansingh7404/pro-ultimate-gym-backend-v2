import React from "react";

export function StatCard({ title, value, sub }) {
  return (
    <div className="bg-gray-800 p-4 rounded-md shadow-sm">
      <div className="text-sm text-gray-300">{title}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  );
}
