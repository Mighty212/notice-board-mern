import React from "react";

export default function NoticeModal({ notice, onClose }) {
  if (!notice) return null;

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-dark" onClick={(e) => e.stopPropagation()}>
        <div className="card-header border-secondary p-4" style={{ backgroundColor: "#1c1d1e" }}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h3 className="mb-2 text-white fw-bold">{notice.title}</h3>
              <p className="text-white-50 mb-0">
                <i className="bi bi-person-circle me-1"></i> Posted by <span className="fw-semibold text-light">{notice.author?.name || "Admin"}</span>
                <span className="mx-2">|</span>
                <i className="bi bi-calendar3 me-1"></i> {formatDate(notice.createdAt)}
              </p>
            </div>
            <div className="d-flex flex-column gap-2 align-items-end">
              <span className="badge px-3 py-2" style={{ backgroundColor: "#3b5998", fontSize: "0.9em" }}>
                {notice.category?.name || "General"}
              </span>
              {notice.is_pinned && (
                <span className="badge bg-danger px-3 py-1" style={{ fontSize: "0.8em" }}>
                  <i className="bi bi-pin-angle-fill me-1"></i> PINNED / URGENT
                </span>
              )}
              {notice.target_audience && notice.target_audience !== "all" && (
                <span className="badge bg-secondary px-3 py-1" style={{ fontSize: "0.8em" }}>
                  <i className="bi bi-people me-1"></i> Audience: {notice.target_audience.toUpperCase()}
                </span>
              )}
              {notice.status === "pending" && (
                <span className="badge bg-warning text-dark px-3 py-1" style={{ fontSize: "0.8em" }}>
                  <i className="bi bi-hourglass-split me-1"></i> PENDING APPROVAL
                </span>
              )}
              {notice.status === "rejected" && (
                <span className="badge bg-danger px-3 py-1" style={{ fontSize: "0.8em" }}>
                  <i className="bi bi-x-circle me-1"></i> REJECTED
                </span>
              )}
            </div>
          </div>

          {notice.status === "rejected" && notice.rejection_reason && (
            <div className="alert alert-danger bg-dark border-danger text-light mt-3 mb-0 p-3 rounded">
              <div className="fw-bold text-danger mb-1">
                <i className="bi bi-exclamation-octagon me-1"></i> Admin Rejection Feedback:
              </div>
              <div className="text-white-50" style={{ whiteSpace: "pre-line" }}>
                {notice.rejection_reason}
              </div>
            </div>
          )}
        </div>

        <div className="card-body p-4 border-top border-secondary">
          <div className="text-light" style={{ fontSize: "1.05rem", lineHeight: "1.7", whiteSpace: "pre-line" }}>
            {notice.content}
          </div>

          {notice.attachment && (
            <div className="mt-4 p-3 rounded border border-secondary" style={{ backgroundColor: "#242526" }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <i className="bi bi-file-earmark-arrow-down text-info fs-3 me-2"></i>
                  <span className="text-white fw-semibold">
                    {notice.attachment_original_name || notice.attachment}
                  </span>
                </div>
                <a
                  href={`http://localhost:5000/api/notices/${notice._id}/attachment`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-info"
                >
                  <i className="bi bi-download me-1"></i> Download Attachment
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="card-footer border-secondary p-3 d-flex justify-content-end" style={{ backgroundColor: "#1c1d1e" }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
