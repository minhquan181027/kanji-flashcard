const asyncHandler = require("../utils/asyncHandler");
const { parseListQuery } = require("../utils/query");
const kanjiService = require("../services/kanji.service");

// GET /api/levels
exports.listLevels = asyncHandler(async (req, res) => {
    res.json(await kanjiService.listLevelsWithCount());
});

// GET /api/kanji?level=N5&shuffle=true&limit=20
exports.listKanji = asyncHandler(async (req, res) => {
    const level = String(req.query.level || "N5").toUpperCase();
    res.json(await kanjiService.getKanjiByLevel(level, parseListQuery(req.query)));
});