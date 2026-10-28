import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === "Admin") navigate("/admin");
      else if (user.role === "Faculty") navigate("/faculty");
      else navigate(from === "/" ? "/dashboard" : from);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (e, p) => {
    setEmail(e);
    setPassword(p);
    setError("");
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
      <div className="card p-4 shadow-lg" style={{ width: "100%", maxWidth: "420px", backgroundColor: "#1c1d1e", border: "1px solid #3e4042" }}>
        <div className="text-center mb-4">
          <i className="bi bi-building fs-1 text-info"></i>
          <h4 className="text-white mt-2">Notice Board Sign In</h4>
          <p className="text-white-50 small">Access your campus account</p>
        </div>

        {/* Viva Quick Demo Logins */}
        <div className="p-2 mb-3 rounded" style={{ backgroundColor: "#242526", border: "1px solid #3e4042" }}>
          <div className="text-white-50 text-center small mb-2 fw-semibold">1-Click Viva Demo Login</div>
          <div className="d-flex justify-content-center gap-1">
            <button type="button" onClick={() => handleDemoFill("admin@college.edu", "admin123")} className="btn btn-sm btn-outline-danger" style={{ fontSize: "0.75rem" }}>
              Admin
            </button>
            <button type="button" onClick={() => handleDemoFill("faculty@college.edu", "faculty123")} className="btn btn-sm btn-outline-success" style={{ fontSize: "0.75rem" }}>
              Faculty
            </button>
            <button type="button" onClick={() => handleDemoFill("student@college.edu", "student123")} className="btn btn-sm btn-outline-primary" style={{ fontSize: "0.75rem" }}>
              Student
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger bg-dark border-danger text-light p-2 mb-3 small">
            <i className="bi bi-exclamation-triangle me-1"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-white-50 small">Email Address</label>
            <input
              type="email"
              className="form-control bg-dark text-white border-secondary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@college.edu"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-white-50 small">Password</label>
            <input
              type="password"
              className="form-control bg-dark text-white border-secondary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 mt-2"
            style={{ backgroundColor: "#3b5998", borderColor: "#3b5998" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-3 text-white-50 small">
          Don't have an account? <Link to="/register" className="text-info">Register</Link>
        </div>
      </div>
    </div>
  );
}
