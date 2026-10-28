import React, { useState, useEffect } from "react";
import api from "../services/api";
import socket from "../services/socket";
import NoticeModal from "../components/NoticeModal";

export default function Home() {
  const [notices, setNotices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [liveAlert, setLiveAlert] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [noticesRes, catRes] = await Promise.all([
        api.get("/notices"),
        api.get("/categories"),
      ]);
      setNotices(noticesRes.data.notices);
      setCategories(catRes.data.categories);
    } catch (err) {
      console.error("Error loading notices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleNoticePublished = (newNotice) => {
      setNotices((prev) => [newNotice, ...prev.filter((n) => n._id !== newNotice._id)]);
      setLiveAlert(`New Notice Published: "${newNotice.title}"`);
      setTimeout(() => setLiveAlert(null), 5000);
    };

    socket.on("notice_published", handleNoticePublished);
    return () => socket.off("notice_published", handleNoticePublished);
  }, []);

  const filteredNotices = notices.filter((n) => {
    if (currentCategory === "all") return true;
    return n.category?.name === currentCategory || n.category?._id === currentCategory;
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
    <div className="page-container p-4">
      {/* Live Socket Alert */}
      {liveAlert && (
        <div className="alert alert-success bg-dark border-success text-light d-flex justify-content-between align-items-center mb-4">
          <div><i className="bi bi-bell-fill text-success me-2"></i> {liveAlert}</div>
          <button type="button" className="btn-close btn-close-white" onClick={() => setLiveAlert(null)}></button>
        </div>
      )}

      {/* Page Title */}
      <div className="d-flex align-items-center mb-4">
        <h4 className="mb-0 text-white"><i className="bi bi-bell me-2"></i> All Active Notices</h4>
      </div>

      {/* Filter Container - Exact Laravel style */}
      <div className="filter-container mb-4 shadow-sm">
        <span className="filter-label">Filter by Category:</span>
        <button
          type="button"
          onClick={() => setCurrentCategory("all")}
          className={`filter-btn ${currentCategory === "all" ? "active" : ""}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            type="button"
            onClick={() => setCurrentCategory(cat.name)}
            className={`filter-btn ${currentCategory === cat.name ? "active" : ""}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Notice Table - Exact Laravel style */}
      <div className="card bg-transparent border-0">
        <div className="table-responsive">
          <table className="table table-custom-dark mb-0">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>#</th>
                <th>Title</th>
                <th>Category</th>
                <th>Posted By</th>
                <th>Expiry</th>
                <th>Date</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-white-50">
                    <div className="spinner-border spinner-border-sm text-light me-2" role="status"></div>
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
                        className="text-white text-decoration-none"
                        onClick={() => setSelectedNotice(notice)}
                      >
                        {notice.title}
                      </span>
                      {notice.attachment && (
                        <i className="bi bi-paperclip ms-1 text-white-50" title="Has attachment"></i>
                      )}
                      {notice.target_audience && notice.target_audience !== "all" && (
                        <span className="badge bg-secondary ms-1 small" style={{ fontSize: "0.7rem" }}>
                          {notice.target_audience.charAt(0).toUpperCase() + notice.target_audience.slice(1)}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="pill-category">{notice.category?.name || "General"}</span>
                    </td>
                    <td className="text-white-50">{notice.author?.name || "Administration"}</td>
                    <td className="text-white-50">{formatDate(notice.expires_at)}</td>
                    <td className="text-white-50">{formatDate(notice.createdAt)}</td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedNotice(notice)}
                        className="btn-view"
                      >
                        <i className="bi bi-eye"></i> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-white-50">
                    <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                    No active notices found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notice Details Modal */}
      {selectedNotice && (
        <NoticeModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
      )}
    </div>
  );
}
