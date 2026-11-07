const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const controller = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth");

const router = Router();

// Chặn dò mật khẩu: tối đa 30 lần đăng ký/đăng nhập mỗi 15 phút cho mỗi IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Thử quá nhiều lần, vui lòng đợi một lúc rồi thử lại" },
});

router.post("/register", authLimiter, controller.register);
router.post("/login", authLimiter, controller.login);
router.post("/refresh", controller.refresh);
router.get("/me", requireAuth, controller.me);

module.exports = router;