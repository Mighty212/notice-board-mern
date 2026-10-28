import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FacultyDashboard from "./pages/faculty/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import CreateNoticeModal from "./pages/faculty/CreateNoticeModal";
import api from "./services/api";

function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    api.get("/categories")
      .then((res) => setCategories(res.data.categories))
      .catch((err) => console.log("Category preload err", err));
  }, []);

  // Landing page (/), Login, and Register don't use the sidebar layout
  const isStandalonePage = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register";

  if (isStandalonePage) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="d-flex">
      {/* 250px Fixed Sidebar - Exact match to Laravel layouts/app.blade.php */}
      <Sidebar onOpenCreateModal={() => setShowCreateModal(true)} />

      {/* Main Content Area */}
      <div id="main-content">
        {/* Topbar Header */}
        <header className="topbar">
          <h5 className="mb-0 text-white">
            <i className="bi bi-grid-1x2-fill me-2"></i> Notice Board
          </h5>
          <div className="text-white d-flex align-items-center">
            {user ? (
              <>
                <i className="bi bi-person-circle me-2"></i> {user.name}
                <span className="badge bg-secondary ms-2">{user.role}</span>
              </>
            ) : (
              <span className="text-white-50">Guest Mode</span>
            )}
          </div>
        </header>

        <main>
          <Routes>
            {/* Student & All Users Notice Board - Protected by Login */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notices"
              element={<Navigate to="/dashboard" replace />}
            />

            {/* Faculty Portal - Protected by Role */}
            <Route
              path="/faculty"
              element={
                <ProtectedRoute allowedRoles={["Faculty", "Admin"]}>
                  <FacultyDashboard onOpenCreateModal={() => setShowCreateModal(true)} />
                </ProtectedRoute>
              }
            />

            {/* Admin Portal - Protected by Role */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {showCreateModal && (
        <CreateNoticeModal
          categories={categories}
          onClose={() => setShowCreateModal(false)}
          onNoticeCreated={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}
