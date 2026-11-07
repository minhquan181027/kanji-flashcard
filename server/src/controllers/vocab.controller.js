const asyncHandler = require("../utils/asyncHandler");
const { parseListQuery } = require("../utils/query");
const vocabService = require("../services/vocab.service");

// GET /api/vocab/units
exports.listUnits = asyncHandler(async (req, res) => {
    res.json(await vocabService.listUnits());
});

// GET /api/vocab/units/unit3?shuffle=true
exports.getUnit = asyncHandler(async (req, res) => {
    res.json(await vocabService.getUnit(req.params.code, parseListQuery(req.query)));
});