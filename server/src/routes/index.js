const { Router } = require("express");
const kanjiController = require("../controllers/kanji.controller");

const router = Router();

router.get("/health", (req, res) => res.json({ status: "ok" }));
router.get("/levels", kanjiController.listLevels);

router.use("/auth", require("./auth.routes"));
router.use("/kanji", require("./kanji.routes"));
router.use("/vocab", require("./vocab.routes"));
router.use("/progress", require("./progress.routes"));
router.use("/review", require("./review.routes"));

module.exports = router;