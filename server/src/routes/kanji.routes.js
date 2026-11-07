const { Router } = require("express");
const controller = require("../controllers/kanji.controller");

const router = Router();

router.get("/", controller.listKanji);

module.exports = router;