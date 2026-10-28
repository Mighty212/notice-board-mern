const express = require("express");
const router = express.Router();
const {
  getPublicNotices,
  getNoticeById,
  getFacultyNotices,
  createNotice,
  updateNotice,
  getNoticeAttachment,
  deleteNotice,
} = require("../controllers/noticeController");
const { verifyToken, checkRole } = require("../middleware/auth");
const { validateNotice } = require("../middleware/validator");
const upload = require("../middleware/upload");

router.get("/", getPublicNotices);
router.get("/my-notices", verifyToken, checkRole("Faculty", "Admin"), getFacultyNotices);
router.get("/:id", getNoticeById);
router.get("/:id/attachment", getNoticeAttachment); // Stream file directly from MongoDB

// Notice creation & update with Memory Storage (Buffer saved directly to DB)
router.post("/", verifyToken, checkRole("Faculty", "Admin"), upload.single("attachment"), validateNotice, createNotice);
router.put("/:id", verifyToken, checkRole("Faculty", "Admin"), upload.single("attachment"), validateNotice, updateNotice);
router.delete("/:id", verifyToken, checkRole("Faculty", "Admin"), deleteNotice);

module.exports = router;
