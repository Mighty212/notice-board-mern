const Notice = require("../models/Notice");
const path = require("path");
const fs = require("fs");

// @desc    Get public approved & non-expired notices (Student/Public view)
// @route   GET /api/notices
// @access  Public
const getPublicNotices = async (req, res) => {
  try {
    const { category, search, audience } = req.query;
    const now = new Date();

    // Base query: approved notices that are not expired
    const query = {
      status: "approved",
      $or: [{ expires_at: null }, { expires_at: { $gt: now } }],
    };

    if (category) {
      query.category = category;
    }

    if (audience && audience !== "all") {
      query.target_audience = { $in: [audience, "all"] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    // notice: attachment_data has select: false in schema, so heavy binary is NOT loaded into RAM here
    const notices = await Notice.find(query)
      .populate("category", "name color")
      .populate("author", "name department email role")
      .sort({ is_pinned: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: notices.length, notices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single notice by ID
// @route   GET /api/notices/:id
// @access  Public
const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate("category", "name color description")
      .populate("author", "name department email role");

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.status(200).json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get notices submitted by logged-in faculty
// @route   GET /api/notices/my-notices
// @access  Private (Faculty, Admin)
const getFacultyNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ author: req.user._id })
      .populate("category", "name color")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: notices.length, notices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new notice with file stored directly in MongoDB
// @route   POST /api/notices
// @access  Private (Faculty, Admin)
const createNotice = async (req, res) => {
  try {
    const { title, content, category, target_audience, is_pinned, expires_at } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ message: "Title, content, and category are required" });
    }

    // Admins auto-approve notices; Faculty notices start as "pending"
    const status = req.user.role === "Admin" ? "approved" : "pending";

    const noticeData = {
      title,
      content,
      category,
      author: req.user._id,
      status,
      target_audience: target_audience || "all",
      is_pinned: is_pinned === "true" || is_pinned === true,
      expires_at: expires_at ? new Date(expires_at) : null,
    };

    // Store file directly into MongoDB as Binary Buffer
    if (req.file) {
      noticeData.attachment = req.file.originalname;
      noticeData.attachment_original_name = req.file.originalname;
      noticeData.attachment_data = req.file.buffer; // <--- BINARY DATA STORED IN MONGODB
      noticeData.attachment_mimetype = req.file.mimetype;
      noticeData.attachment_size = req.file.size;
    }

    const notice = await Notice.create(noticeData);
    const populated = await Notice.findById(notice._id)
      .populate("category", "name color")
      .populate("author", "name department email");

    // Socket.io real-time broadcast hook
    const io = req.app.get("io");
    if (io) {
      if (status === "approved") {
        io.emit("notice_published", populated);
      } else {
        io.emit("notice_pending_review", populated);
      }
    }

    res.status(201).json({
      success: true,
      message: status === "approved" ? "Notice published directly" : "Notice submitted for admin approval",
      notice: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a notice
// @route   PUT /api/notices/:id
// @access  Private (Author, Admin)
const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    // Check ownership
    if (notice.author.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Not authorized to update this notice" });
    }

    const { title, content, category, target_audience, is_pinned, expires_at } = req.body;

    if (title) notice.title = title;
    if (content) notice.content = content;
    if (category) notice.category = category;
    if (target_audience) notice.target_audience = target_audience;
    if (is_pinned !== undefined) notice.is_pinned = is_pinned === "true" || is_pinned === true;
    if (expires_at !== undefined) notice.expires_at = expires_at ? new Date(expires_at) : null;

    if (req.file) {
      notice.attachment = req.file.originalname;
      notice.attachment_original_name = req.file.originalname;
      notice.attachment_data = req.file.buffer; // <--- UPDATE BINARY BUFFER IN MONGODB
      notice.attachment_mimetype = req.file.mimetype;
      notice.attachment_size = req.file.size;
    }

    // If faculty edits a rejected notice, set it back to pending for re-review
    if (req.user.role === "Faculty" && notice.status === "rejected") {
      notice.status = "pending";
      notice.rejection_reason = null;
    }

    await notice.save();
    const updated = await Notice.findById(notice._id)
      .populate("category", "name color")
      .populate("author", "name department email");

    res.status(200).json({ success: true, message: "Notice updated successfully", notice: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download / Stream attachment directly from MongoDB database
// @route   GET /api/notices/:id/attachment
// @access  Public
const getNoticeAttachment = async (req, res) => {
  try {
    // Specifically select +attachment_data since it has select: false
    const notice = await Notice.findById(req.params.id).select("+attachment_data");
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    // 1. Stored directly in MongoDB as Binary Buffer
    if (notice.attachment_data && notice.attachment_data.length > 0) {
      const filename = notice.attachment_original_name || notice.attachment || "attachment";
      res.set({
        "Content-Type": notice.attachment_mimetype || "application/octet-stream",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Content-Length": notice.attachment_data.length,
      });
      return res.send(notice.attachment_data);
    }

    // 2. Fallback if file was previously on disk
    if (notice.attachment) {
      const filePath = path.join(__dirname, "..", "uploads", notice.attachment);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    }

    return res.status(404).json({ message: "Attachment not found for this notice" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (Author, Admin)
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    if (notice.author.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Not authorized to delete this notice" });
    }

    await notice.deleteOne();
    res.status(200).json({ success: true, message: "Notice removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPublicNotices,
  getNoticeById,
  getFacultyNotices,
  createNotice,
  updateNotice,
  getNoticeAttachment,
  deleteNotice,
};
