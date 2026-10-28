import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ onOpenCreateModal }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = user?.role?.toLowerCase() || "student";

  return (
    <div id="sidebar" className="d-flex flex-column py-3">
      {/* Brand */}
      <Link to="/" className="sidebar-brand px-4 pb-3 mb-3 text-white d-flex align-items-center text-decoration-none">
        <i className="bi bi-building me-2 text-info"></i> Notice Board
      </Link>

      <ul className="nav flex-column mb-auto">
        {/* ALL NOTICES (STUDENT & ALL ROLES) */}
        <li className="nav-item">
          <Link
            to="/dashboard"
            className={`nav-link-custom ${location.pathname === "/dashboard" ? "active" : ""}`}
          >
            <i className="bi bi-bell"></i> All Notices
          </Link>
        </li>

        {/* ADMIN ROLE LINKS */}
        {role === "admin" && (
          <>
            <li className="nav-item">
              <Link
                to="/admin"
                className={`nav-link-custom ${location.pathname === "/admin" && !location.search.includes("status=pending") ? "active" : ""}`}
              >
                <i className="bi bi-speedometer2"></i> Dashboard Overview
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/admin?status=pending"
                className={`nav-link-custom ${location.search.includes("status=pending") ? "active" : ""}`}
              >
                <i className="bi bi-hourglass-split"></i> Pending Approvals
              </Link>
            </li>
          </>
        )}

        {/* FACULTY ROLE LINKS */}
        {role === "faculty" && (
          <>
            <li className="nav-item">
              <Link
                to="/faculty"
                className={`nav-link-custom ${location.pathname === "/faculty" ? "active" : ""}`}
              >
                <i className="bi bi-speedometer2"></i> My Notices
              </Link>
            </li>
            <li className="nav-item">
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="nav-link-custom w-100 text-start"
              >
                <i className="bi bi-plus-circle"></i> Submit New Notice
              </button>
            </li>
          </>
        )}

        {/* ADMIN POST NOTICE */}
        {role === "admin" && (
          <li className="nav-item">
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="nav-link-custom w-100 text-start"
            >
              <i className="bi bi-plus-circle"></i> Post Notice
            </button>
          </li>
        )}
      </ul>

      {/* User Section & Logout */}
      <div className="mt-auto px-3 border-top border-secondary pt-3">
        {user ? (
          <div>
            <div className="px-3 pb-2 text-white-50" style={{ fontSize: "0.85rem" }}>
              <div className="text-white fw-bold">{user.name}</div>
              <span className="badge bg-secondary mt-1">{user.role}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="btn nav-link-custom logout-link w-100 text-start"
            >
              <i className="bi bi-box-arrow-left"></i> Logout
            </button>
          </div>
        ) : (
          <div>
            <Link to="/login" className="nav-link-custom text-white">
              <i className="bi bi-box-arrow-in-right"></i> Sign In
            </Link>
            <Link to="/register" className="nav-link-custom text-white-50">
              <i className="bi bi-person-plus"></i> Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
