import React, { useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function CreateNoticeModal({ categories, onClose, onNoticeCreated }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]?._id || "");
  const [targetAudience, setTargetAudience] = useState("all");
  const [content, setContent] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim() || !category) {
      setError("Please fill in all mandatory fields.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("target_audience", targetAudience);
      formData.append("content", content);
      if (expiresAt) formData.append("expires_at", expiresAt);
      if (user?.role === "Admin") formData.append("is_pinned", isPinned);
      if (file) formData.append("attachment", file);

      const res = await api.post("/notices", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (onNoticeCreated) onNoticeCreated(res.data.notice);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create notice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-dark p-4" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "650px" }}>
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary">
          <h5 className="text-white mb-0">
            <i className="bi bi-pencil-square me-2"></i>
            {user?.role === "Admin" ? "Post New Official Notice" : "Submit Notice for Approval"}
          </h5>
          <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
        </div>

        {error && (
          <div className="alert alert-danger bg-dark border-danger text-light p-2 mb-3">
            <i className="bi bi-exclamation-triangle me-1"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-white-50">Notice Title *</label>
            <input
              type="text"
              className="form-control bg-dark text-white border-secondary"
              placeholder="e.g. Mid-Term Examination Schedule"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label text-white-50">Category *</label>
              <select
                className="form-select bg-dark text-white border-secondary"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label text-white-50">Target Audience *</label>
              <select
                className="form-select bg-dark text-white border-secondary"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              >
                <option value="all">All Campus</option>
                <option value="students">Students Only</option>
                <option value="faculty">Faculty Only</option>
              </select>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label text-white-50">Expiry Date (Optional)</label>
              <input
                type="date"
                className="form-control bg-dark text-white border-secondary"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            {user?.role === "Admin" && (
              <div className="col-md-6 d-flex align-items-center pt-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="pinNoticeCheck"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                  />
                  <label className="form-check-label text-white" htmlFor="pinNoticeCheck">
                    <i className="bi bi-pin-angle-fill text-danger me-1"></i> Pin Notice
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label text-white-50">Notice Content *</label>
            <textarea
              className="form-control bg-dark text-white border-secondary"
              rows={5}
              placeholder="Enter full announcement details..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="form-label text-white-50">File Attachment (PDF, Image)</label>
            <input
              type="file"
              className="form-control bg-dark text-white border-secondary"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ backgroundColor: "#3b5998", borderColor: "#3b5998" }}>
              {loading ? "Submitting..." : user?.role === "Admin" ? "Post Notice" : "Submit for Approval"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
