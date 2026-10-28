import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return "/dashboard";
    if (user.role === "Admin") return "/admin";
    if (user.role === "Faculty") return "/faculty";
    return "/dashboard";
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#18191a", color: "#e4e6eb" }}>
      {/* Top Navbar matching welcome.blade.php */}
      <nav
        style={{
          backgroundColor: "#242526",
          borderBottom: "1px solid #3e4042",
          padding: "1rem 2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "white",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <i className="bi bi-building text-info"></i> Notice Board
        </Link>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {user ? (
            <Link
              to={getDashboardPath()}
              className="btn"
              style={{
                backgroundColor: "#3b5998",
                borderColor: "#3b5998",
                color: "white",
                padding: "0.5rem 1.4rem",
                borderRadius: "6px",
                fontWeight: 600,
              }}
            >
              <i className="bi bi-speedometer2 me-1"></i> Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="btn btn-outline-secondary text-white"
                style={{
                  border: "1px solid #3e4042",
                  padding: "0.5rem 1.4rem",
                  borderRadius: "6px",
                  fontWeight: 600,
                }}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="btn"
                style={{
                  backgroundColor: "#3b5998",
                  borderColor: "#3b5998",
                  color: "white",
                  padding: "0.5rem 1.4rem",
                  borderRadius: "6px",
                  fontWeight: 600,
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section matching welcome.blade.php */}
      <main
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "5rem 1.5rem 4rem",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "3.2rem",
            fontWeight: 800,
            color: "white",
            marginBottom: "1.2rem",
            letterSpacing: "-1px",
          }}
        >
          Centralized Notice Board
        </h1>
        <p
          style={{
            fontSize: "1.15rem",
            color: "#b0b3b8",
            maxWidth: "620px",
            margin: "0 auto 2.5rem auto",
            lineHeight: 1.6,
          }}
        >
          A secured, clean, and organized platform for broadcasting important schedules, holidays,
          events, and updates across the institution.
        </p>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          {user ? (
            <Link
              to={getDashboardPath()}
              className="btn"
              style={{
                backgroundColor: "#3b5998",
                borderColor: "#3b5998",
                color: "white",
                padding: "0.8rem 2.5rem",
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: "8px",
              }}
            >
              Enter Dashboard <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="btn"
                style={{
                  backgroundColor: "#3b5998",
                  borderColor: "#3b5998",
                  color: "white",
                  padding: "0.8rem 2.5rem",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: "8px",
                }}
              >
                Access Account
              </Link>
              <Link
                to="/register"
                className="btn btn-outline-secondary text-white"
                style={{
                  border: "1px solid #3e4042",
                  padding: "0.8rem 2.5rem",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: "8px",
                }}
              >
                Create an Account
              </Link>
            </>
          )}
        </div>
      </main>

      {/* Features Grid matching welcome.blade.php */}
      <section style={{ backgroundColor: "#1a1a1c", borderTop: "1px solid #3e4042", padding: "4rem 2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
            maxWidth: "1050px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              backgroundColor: "#242526",
              border: "1px solid #3e4042",
              padding: "2rem",
              borderRadius: "12px",
              textAlign: "left",
            }}
          >
            <i className="bi bi-shield-check fs-1 text-info mb-3 d-block" style={{ color: "#3b5998" }}></i>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "white", marginBottom: "0.5rem" }}>
              Role-Based Access
            </h3>
            <p style={{ color: "#b0b3b8", fontSize: "0.95rem", lineHeight: 1.5, margin: 0 }}>
              Admins, Faculty, and Students each have specifically secured views, moderation flows, and capabilities.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#242526",
              border: "1px solid #3e4042",
              padding: "2rem",
              borderRadius: "12px",
              textAlign: "left",
            }}
          >
            <i className="bi bi-clock-history fs-1 text-warning mb-3 d-block"></i>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "white", marginBottom: "0.5rem" }}>
              Automated Expiry
            </h3>
            <p style={{ color: "#b0b3b8", fontSize: "0.95rem", lineHeight: 1.5, margin: 0 }}>
              Notices clean themselves up automatically when their set lifecycle date passes, keeping the board fresh.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#242526",
              border: "1px solid #3e4042",
              padding: "2rem",
              borderRadius: "12px",
              textAlign: "left",
            }}
          >
            <i className="bi bi-funnel fs-1 text-success mb-3 d-block"></i>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "white", marginBottom: "0.5rem" }}>
              Category Filtering
            </h3>
            <p style={{ color: "#b0b3b8", fontSize: "0.95rem", lineHeight: 1.5, margin: 0 }}>
              Quickly locate examinations, academic circulars, hackathons, or placement drives using dedicated category tabs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
