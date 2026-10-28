const Joi = require("joi");

// 1. Validation Schema for User Registration
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(60).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters long",
    "any.required": "Name is required",
  }),
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).max(100).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
  role: Joi.string().valid("Student", "Faculty", "Admin").default("Student"),
  department: Joi.string().trim().max(100).allow("").default("General"),
});

// 2. Validation Schema for User Login
const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

// 3. Validation Schema for Notice Creation / Updating
const noticeSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required().messages({
    "string.empty": "Notice title is required",
    "string.min": "Title must be at least 3 characters long",
    "any.required": "Notice title is required",
  }),
  content: Joi.string().trim().min(5).required().messages({
    "string.empty": "Notice content is required",
    "string.min": "Content must be at least 5 characters long",
    "any.required": "Notice content is required",
  }),
  category: Joi.string().hex().length(24).required().messages({
    "string.empty": "Category reference is required",
    "string.hex": "Category must be a valid ObjectId",
    "any.required": "Category reference is required",
  }),
  target_audience: Joi.string().valid("all", "students", "faculty").default("all"),
  expires_at: Joi.date().iso().allow("", null).optional(),
  is_pinned: Joi.boolean().truthy("true", 1).falsy("false", 0).optional(),
}).unknown(true); // Allow attachment file and extra multipart fields

// Middleware generator that validates incoming request body using Joi
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ");
      return res.status(400).json({
        success: false,
        message: `Validation error: ${errorMessage}`,
        details: error.details.map((d) => ({ field: d.path.join("."), error: d.message })),
      });
    }
    req.body = value;
    next();
  };
};

module.exports = {
  validateRegister: validateRequest(registerSchema),
  validateLogin: validateRequest(loginSchema),
  validateNotice: validateRequest(noticeSchema),
};
