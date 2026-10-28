const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notice title is required"],
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, "Notice content is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category reference is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author reference is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejection_reason: {
      type: String,
      default: null,
    },
    target_audience: {
      type: String,
      enum: ["all", "students", "faculty"],
      default: "all",
    },
    is_pinned: {
      type: Boolean,
      default: false,
    },
    attachment: {
      type: String,
      default: null,
    },
    attachment_original_name: {
      type: String,
      default: null,
    },
    attachment_data: {
      type: Buffer,
      default: null,
      select: false, // Hidden by default in find() queries to prevent RAM bloat
    },
    attachment_mimetype: {
      type: String,
      default: null,
    },
    attachment_size: {
      type: Number,
      default: null,
    },
    expires_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance querying (Unit-5 MongoDB syllabus)
noticeSchema.index({ status: 1, expires_at: 1 });
noticeSchema.index({ is_pinned: -1, createdAt: -1 });

module.exports = mongoose.model("Notice", noticeSchema);

