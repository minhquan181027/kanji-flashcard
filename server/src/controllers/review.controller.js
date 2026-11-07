const asyncHandler = require("../utils/asyncHandler");
const { parseListQuery } = require("../utils/query");
const progressService = require("../services/progress.service");
const reviewService = require("../services/review.service");

// GET /api/review/summary
exports.summary = asyncHandler(async (req, res) => {
    res.json(await progressService.getSummary(req.user.id));
});

// GET /api/review/kanji?shuffle=true&limit=20&due=true
exports.kanji = asyncHandler(async (req, res) => {
    const options = { ...parseListQuery(req.query), dueOnly: req.query.due === "true" };
    res.json(await reviewService.getHardCards(req.user.id, "kanji", options));
});

// GET /api/review/vocab
exports.vocab = asyncHandler(async (req, res) => {
    const options = { ...parseListQuery(req.query), dueOnly: req.query.due === "true" };
    res.json(await reviewService.getHardCards(req.user.id, "vocab", options));
});