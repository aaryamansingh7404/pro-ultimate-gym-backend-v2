import React from "react";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminNavbar() {
  const { adminToken } = useAdminAuth();

  return (
    <header className="flex items-center justify-between bg-gray-800 p-4 rounded-t-md">
      <div className="flex items-center gap-4">
        <div className="text-red-200 text-xl font-semibold">Dashboard</div>
        <div className="hidden md:block">
         
        </div>
      </div>

      <div className="flex items-center gap-4">
        {adminToken && (
          <div className="flex items-center text-white text-sm font-semibold gap-2">
            Admin
          </div>
        )}

        {/* 🔴 Red circle with white 'A' */}
        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-red-500/50">
          A
        </div>
      </div>
    </header>
  );
}
