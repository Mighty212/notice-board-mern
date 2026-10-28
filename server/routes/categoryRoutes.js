const express = require("express");
const router = express.Router();
const { getCategories, createCategory } = require("../controllers/categoryController");
const { verifyToken, checkRole } = require("../middleware/auth");

router.get("/", getCategories);
router.post("/", verifyToken, checkRole("Admin"), createCategory);

module.exports = router;
