const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");
const { validateRegister, validateLogin } = require("../middleware/validator");

// User routes protected with Joi input validation (Task-3 requirement)
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", verifyToken, getMe);

module.exports = router;
