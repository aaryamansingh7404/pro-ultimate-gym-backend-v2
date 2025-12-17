import React, { createContext, useContext, useState } from "react";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(localStorage.getItem("adminToken"));

  // ✅ Correct login function
  const login = async (email, password) => {
    try {
      const res = await fetch("http://localhost:5001/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // send email & password
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("adminToken", data.token);
        setAdminToken(data.token);
        return true;
      } else {
        alert(data.message || "Invalid credentials");
        return false;
      }
    } catch (err) {
      console.error("Admin login error:", err);
      alert("Network error! Please check your backend server.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setAdminToken(null);
    window.location.href = "/admin-login";
  };

  return (
    <AdminAuthContext.Provider value={{ adminToken, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
