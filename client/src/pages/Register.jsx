import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");
  const [department, setDepartment] = useState("Computer Science");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const user = await register({ name, email, password, role, department });
      if (user.role === "Faculty") navigate("/faculty");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
      <div className="card p-4 shadow-lg" style={{ width: "100%", maxWidth: "440px", backgroundColor: "#1c1d1e", border: "1px solid #3e4042" }}>
        <div className="text-center mb-4">
          <i className="bi bi-person-plus fs-1 text-info"></i>
          <h4 className="text-white mt-2">Create Account</h4>
          <p className="text-white-50 small">Join the Notice Board</p>
        </div>

        {error && (
          <div className="alert alert-danger bg-dark border-danger text-light p-2 mb-3 small">
            <i className="bi bi-exclamation-triangle me-1"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-white-50 small">Full Name</label>
            <input
              type="text"
              className="form-control bg-dark text-white border-secondary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Akshar Patel"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-white-50 small">Email Address</label>
            <input
              type="email"
              className="form-control bg-dark text-white border-secondary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@college.edu"
              required
            />
          </div>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label text-white-50 small">Role</label>
              <select
                className="form-select bg-dark text-white border-secondary"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
              </select>
            </div>
            <div className="col-6">
              <label className="form-label text-white-50 small">Department</label>
              <select
                className="form-select bg-dark text-white border-secondary"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Tech">Information Tech</option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="text-center mt-3 text-white-50 small">
          Already registered? <Link to="/login" className="text-info">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
