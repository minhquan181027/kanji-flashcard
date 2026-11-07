const { Router } = require("express");
const controller = require("../controllers/vocab.controller");

const router = Router();

router.get("/units", controller.listUnits);
router.get("/units/:code", controller.getUnit);

module.exports = router;