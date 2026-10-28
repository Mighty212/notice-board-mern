import React, { useState, useEffect } from "react";
import api from "../../services/api";
import socket from "../../services/socket";
import NoticeModal from "../../components/NoticeModal";

export default function FacultyDashboard({ onOpenCreateModal }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);

  const fetchFacultyNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notices/my-notices");
      setNotices(res.data.notices);
    } catch (err) {
      console.error("Error fetching faculty notices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyNotices();

    const handleStatusUpdate = (updatedNotice) => {
      setNotices((prev) =>
        prev.map((n) => (n._id === updatedNotice._id ? updatedNotice : n))
      );
    };

    socket.on("notice_status_updated", handleStatusUpdate);
    return () => socket.off("notice_status_updated", handleStatusUpdate);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice draft?")) return;
    try {
      await api.delete(`/notices/${id}`);
      setNotices((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      alert("Failed to delete notice: " + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="page-container p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0 text-white"><i className="bi bi-speedometer2 me-2"></i> Faculty Notices Management</h4>
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="btn btn-primary"
          style={{ backgroundColor: "#3b5998", borderColor: "#3b5998" }}
        >
          <i className="bi bi-plus-circle me-1"></i> Submit New Notice
        </button>
      </div>

      <div className="card bg-transparent border-0">
        <div className="table-responsive">
          <table className="table table-custom-dark mb-0 align-middle">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>Title</th>
                <th>Category</th>
                <th>Target</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-white-50">
                    Loading your notices...
                  </td>
                </tr>
              ) : notices.length > 0 ? (
                notices.map((notice, idx) => (
                  <tr key={notice._id}>
                    <td className="text-white-50">{idx + 1}</td>
                    <td className="text-white fw-bold">
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
                      {notice.status === "rejected" && notice.rejection_reason && (
                        <div className="alert alert-danger bg-dark border-danger text-light mt-2 p-2 rounded mb-0" style={{ fontSize: "0.8rem" }}>
                          <i className="bi bi-exclamation-octagon me-1"></i> <strong>Admin Reason:</strong> {notice.rejection_reason}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="pill-category">{notice.category?.name || "General"}</span>
                    </td>
                    <td className="text-white-50 text-capitalize">{notice.target_audience}</td>
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
                        >
                          <i className="bi bi-eye"></i> View
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(notice._id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-white-50">
                    <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                    No notices submitted yet. Click "Submit New Notice" to create your first notice.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedNotice && (
        <NoticeModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
      )}
    </div>
  );
}
