const { Router } = require("express");
const controller = require("../controllers/progress.controller");
const { requireAuth } = require("../middlewares/auth");

const router = Router();

router.post("/answer", requireAuth, controller.recordAnswer);

module.exports = router;