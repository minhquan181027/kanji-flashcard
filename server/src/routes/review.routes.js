const { Router } = require("express");
const controller = require("../controllers/review.controller");
const { requireAuth } = require("../middlewares/auth");

const router = Router();

// Tất cả đều cần đăng nhập vì dữ liệu là của riêng từng người
router.use(requireAuth);

router.get("/summary", controller.summary);
router.get("/kanji", controller.kanji);
router.get("/vocab", controller.vocab);

module.exports = router;