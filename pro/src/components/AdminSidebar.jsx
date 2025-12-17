import React from "react";
import { NavLink } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

const menu = [
  { name: "Dashboard", path: "/admin-dashboard" },
  // { name: "Members", path: "/admin-members" },
  // { name: "Trainers", path: "/admin-trainers" },
  // { name: "Membership Plans", path: "/admin-plans" },
  { name: "Payments", path: "/admin/payments" },
];

export default function AdminSidebar() {
  const { logout } = useAdminAuth();

  return (
    <aside className="w-72 bg-gray-900 text-gray-200 min-h-screen p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center font-bold">G</div>
          <div>
            <div className="text-lg font-bold">PROULTIMATE</div>
            <div className="text-sm text-gray-400">GYM Admin</div>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {menu.map((m) => (
          <NavLink
            key={m.path}
            to={m.path}
            className={({ isActive }) =>
              `py-2 px-4 rounded flex items-center text-sm ${
                isActive ? "bg-red-600 text-white" : "text-gray-300 hover:bg-gray-800"
              }`
            }
          >
            {m.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8">
        <button
          onClick={() => logout()}
          className="w-full py-2 rounded bg-red-700 hover:bg-red-600 text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
