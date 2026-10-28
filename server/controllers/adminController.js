const Notice = require("../models/Notice");
const User = require("../models/User");

// @desc    Get all notices for admin review
// @route   GET /api/admin/notices
// @access  Private (Admin)
const getAllNoticesAdmin = async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }

    const notices = await Notice.find(query)
      .populate("category", "name color")
      .populate("author", "name email department role")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: notices.length, notices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject a notice
// @route   PATCH /api/admin/notices/:id/status
// @access  Private (Admin)
const updateNoticeStatus = async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be approved or rejected" });
    }

    if (status === "rejected" && !rejection_reason) {
      return res.status(400).json({ message: "A rejection reason is required when rejecting a notice" });
    }

    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    notice.status = status;
    notice.rejection_reason = status === "rejected" ? rejection_reason : null;

    await notice.save();

    const populated = await Notice.findById(notice._id)
      .populate("category", "name color")
      .populate("author", "name email department");

    // Socket.io real-time broadcast
    const io = req.app.get("io");
    if (io) {
      if (status === "approved") {
        io.emit("notice_published", populated);
      }
      io.emit("notice_status_updated", populated);
    }

    res.status(200).json({
      success: true,
      message: `Notice marked as ${status}`,
      notice: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle pin status of a notice
// @route   PATCH /api/admin/notices/:id/pin
// @access  Private (Admin)
const togglePinNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    notice.is_pinned = !notice.is_pinned;
    await notice.save();

    res.status(200).json({
      success: true,
      message: `Notice ${notice.is_pinned ? "pinned to top" : "unpinned"}`,
      is_pinned: notice.is_pinned,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard metrics (total notices, pending, approved, rejected, users)
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    const [totalNotices, pendingNotices, approvedNotices, rejectedNotices, totalUsers, totalFaculty] =
      await Promise.all([
        Notice.countDocuments(),
        Notice.countDocuments({ status: "pending" }),
        Notice.countDocuments({ status: "approved" }),
        Notice.countDocuments({ status: "rejected" }),
        User.countDocuments({ role: "Student" }),
        User.countDocuments({ role: "Faculty" }),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        totalNotices,
        pendingNotices,
        approvedNotices,
        rejectedNotices,
        totalStudents: totalUsers,
        totalFaculty,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllNoticesAdmin,
  updateNoticeStatus,
  togglePinNotice,
  getDashboardStats,
};
