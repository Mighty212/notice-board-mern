const express = require("express");
const router = express.Router();
const {
  getAllNoticesAdmin,
  updateNoticeStatus,
  togglePinNotice,
  getDashboardStats,
} = require("../controllers/adminController");
const { verifyToken, checkRole } = require("../middleware/auth");

router.use(verifyToken, checkRole("Admin"));

router.get("/notices", getAllNoticesAdmin);
router.patch("/notices/:id/status", updateNoticeStatus);
router.patch("/notices/:id/pin", togglePinNotice);
router.get("/stats", getDashboardStats);

module.exports = router;
