import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../services/api";
import socket from "../../services/socket";
import NoticeModal from "../../components/NoticeModal";

export default function AdminDashboard() {
  const [notices, setNotices] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [rejectingNotice, setRejectingNotice] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("status") === "pending") {
      setFilterStatus("pending");
    }
  }, [location.search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [noticesRes, statsRes, catRes] = await Promise.all([
        api.get("/admin/notices"),
        api.get("/admin/stats"),
        api.get("/categories"),
      ]);
      setNotices(noticesRes.data.notices);
      setStats(statsRes.data.stats);
      setCategories(catRes.data.categories);
    } catch (err) {
      console.error("Error loading admin dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleNewPending = (newPendingNotice) => {
      setNotices((prev) => [newPendingNotice, ...prev]);
      fetchData();
    };

    socket.on("notice_pending_review", handleNewPending);
    return () => socket.off("notice_pending_review", handleNewPending);
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await api.patch(`/admin/notices/${id}/status`, { status: "approved" });
      setNotices((prev) => prev.map((n) => (n._id === id ? res.data.notice : n)));
      fetchData();
    } catch (err) {
      alert("Error approving notice: " + (err.response?.data?.message || err.message));
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    try {
      const res = await api.patch(`/admin/notices/${rejectingNotice._id}/status`, {
        status: "rejected",
        rejection_reason: rejectionReason,
      });
      setNotices((prev) => prev.map((n) => (n._id === rejectingNotice._id ? res.data.notice : n)));
      setRejectingNotice(null);
      setRejectionReason("");
      fetchData();
    } catch (err) {
      alert("Error rejecting notice: " + (err.response?.data?.message || err.message));
    }
  };

  const handleTogglePin = async (id) => {
    try {
      const res = await api.patch(`/admin/notices/${id}/pin`);
      setNotices((prev) =>
        prev.map((n) => (n._id === id ? { ...n, is_pinned: res.data.is_pinned } : n))
      );
    } catch (err) {
      alert("Pin error: " + (err.response?.data?.message || err.message));
    }
  };

  const pendingNotices = notices.filter((n) => n.status === "pending");
  const filteredNotices = notices.filter((n) => {
    if (filterStatus === "all") return true;
    return n.status === filterStatus;
  });

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="dashboard-container p-4">
      <h4 className="mb-4 text-white"><i className="bi bi-speedometer2"></i> Dashboard Overview</h4>

      {/* Widgets Row 1 - Exact Laravel colors: widget-blue, widget-yellow, widget-green, widget-red */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card widget widget-blue p-3 h-100 shadow-sm">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 style={{ color: "#e4e6eb" }}>Total Notices</h6>
                <h2 className="mb-0">{stats ? stats.totalNotices : notices.length}</h2>
              </div>
              <i className="bi bi-bell-fill fs-1" style={{ color: "rgba(255,255,255,0.7)" }}></i>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card widget widget-yellow p-3 h-100 shadow-sm" style={{ cursor: "pointer" }} onClick={() => setFilterStatus("pending")}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 style={{ color: "#e4e6eb" }}>Pending</h6>
                <h2 className="mb-0">{stats ? stats.pendingNotices : pendingNotices.length}</h2>
              </div>
              <i className="bi bi-hourglass-split fs-1" style={{ color: "rgba(255,255,255,0.7)" }}></i>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card widget widget-green p-3 h-100 shadow-sm" style={{ cursor: "pointer" }} onClick={() => setFilterStatus("approved")}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 style={{ color: "#e4e6eb" }}>Active (Approved)</h6>
                <h2 className="mb-0">{stats ? stats.approvedNotices : notices.filter((n) => n.status === "approved").length}</h2>
              </div>
              <i className="bi bi-check-circle-fill fs-1" style={{ color: "rgba(255,255,255,0.7)" }}></i>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card widget widget-red p-3 h-100 shadow-sm" style={{ cursor: "pointer" }} onClick={() => setFilterStatus("rejected")}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 style={{ color: "#e4e6eb" }}>Rejected</h6>
                <h2 className="mb-0">{stats ? stats.rejectedNotices : notices.filter((n) => n.status === "rejected").length}</h2>
              </div>
              <i className="bi bi-x-circle-fill fs-1" style={{ color: "rgba(255,255,255,0.7)" }}></i>
            </div>
          </div>
        </div>
      </div>

      {/* Widgets Row 2 - Users */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card widget widget-dark p-3 h-100" style={{ borderLeft: "3px solid #3e4042" }}>
              <h6 className="mb-1">Total Users</h6>
              <h3 className="mb-0">{stats.totalStudents + stats.totalFaculty + 1}</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card widget widget-dark p-3 h-100" style={{ borderLeft: "3px solid #3b5998" }}>
              <h6 className="mb-1">Faculty Members</h6>
              <h3 className="mb-0">{stats.totalFaculty}</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card widget widget-dark p-3 h-100" style={{ borderLeft: "3px solid #2e8b57" }}>
              <h6 className="mb-1">Students</h6>
              <h3 className="mb-0">{stats.totalStudents}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Filter */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="tabs-container">
          <button
            type="button"
            className={`tab-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All Notices ({notices.length})
          </button>
          <button
            type="button"
            className={`tab-btn pending ${filterStatus === "pending" ? "active pending" : ""}`}
            onClick={() => setFilterStatus("pending")}
          >
            Pending ({pendingNotices.length})
          </button>
          <button
            type="button"
            className={`tab-btn approved ${filterStatus === "approved" ? "active approved" : ""}`}
            onClick={() => setFilterStatus("approved")}
          >
            Approved
          </button>
          <button
            type="button"
            className={`tab-btn rejected ${filterStatus === "rejected" ? "active rejected" : ""}`}
            onClick={() => setFilterStatus("rejected")}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Notices Table */}
      <div className="card bg-transparent border-0">
        <div className="table-responsive">
          <table className="table table-custom-dark mb-0 align-middle">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-white-50">
                    Loading notices...
                  </td>
                </tr>
              ) : filteredNotices.length > 0 ? (
                filteredNotices.map((notice, idx) => (
                  <tr key={notice._id}>
                    <td className="text-white-50">{idx + 1}</td>
                    <td className="text-white fw-bold">
                      {notice.is_pinned && (
                        <span className="badge bg-danger me-1">
                          <i className="bi bi-pin-angle-fill"></i> PINNED
                        </span>
                      )}
                      <span
                        style={{ cursor: "pointer" }}
                        className="text-white"
                        onClick={() => setSelectedNotice(notice)}
                      >
                        {notice.title}
                      </span>
                      {notice.attachment && (
                        <i className="bi bi-paperclip ms-1 text-white-50"></i>
                      )}
                    </td>
                    <td className="text-white-50">
                      <div>{notice.author?.name || "Admin"}</div>
                      <small className="text-white-50" style={{ fontSize: "0.75rem" }}>
                        {notice.author?.department}
                      </small>
                    </td>
                    <td>
                      <span className="pill-category">{notice.category?.name || "General"}</span>
                    </td>
                    <td>
                      {notice.status === "approved" && (
                        <span className="badge bg-success">Approved</span>
                      )}
                      {notice.status === "pending" && (
                        <span className="badge bg-warning text-dark">Pending</span>
                      )}
                      {notice.status === "rejected" && (
                        <span className="badge bg-danger">Rejected</span>
                      )}
                    </td>
                    <td className="text-white-50">{formatDate(notice.createdAt)}</td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-secondary text-white btn-sm"
                          onClick={() => setSelectedNotice(notice)}
                          title="View"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${notice.is_pinned ? "btn-danger" : "btn-outline-secondary text-white"}`}
                          onClick={() => handleTogglePin(notice._id)}
                          title={notice.is_pinned ? "Unpin notice" : "Pin notice"}
                        >
                          <i className="bi bi-pin-angle"></i>
                        </button>
                        {notice.status === "pending" && (
                          <>
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => handleApprove(notice._id)}
                              title="Approve"
                            >
                              <i className="bi bi-check-lg"></i> Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => setRejectingNotice(notice)}
                              title="Reject"
                            >
                              <i className="bi bi-x-lg"></i> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-white-50">
                    <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                    No notices found matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Reason Modal */}
      {rejectingNotice && (
        <div className="modal-overlay">
          <div className="modal-content-dark p-4" style={{ maxWidth: "520px" }}>
            <h5 className="text-danger mb-3">
              <i className="bi bi-exclamation-octagon me-2"></i> Reject Notice Submission
            </h5>
            <p className="text-white-50 mb-3" style={{ fontSize: "0.9rem" }}>
              Please provide feedback explaining why "<strong>{rejectingNotice.title}</strong>" is being rejected:
            </p>
            <form onSubmit={handleRejectSubmit}>
              <div className="mb-3">
                <textarea
                  className="form-control bg-dark text-white border-secondary"
                  rows={4}
                  placeholder="Enter rejection reason / required revisions..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setRejectingNotice(null);
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <NoticeModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
      )}
    </div>
  );
}
