import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedUserRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />; // redirect if not logged in
  return children;
};

export default ProtectedUserRoute;
