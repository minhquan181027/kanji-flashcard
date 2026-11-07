const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const progressService = require("../services/progress.service");

// POST /api/progress/answer   body: { type: "kanji" | "vocab", itemId: 12, remembered: true }
exports.recordAnswer = asyncHandler(async (req, res) => {
    const { type, itemId, remembered } = req.body || {};

    if (type !== "kanji" && type !== "vocab") {
        throw new HttpError(400, 'type phải là "kanji" hoặc "vocab"');
    }
    if (!Number.isInteger(itemId) || itemId <= 0) {
        throw new HttpError(400, "itemId phải là số nguyên dương");
    }
    if (typeof remembered !== "boolean") {
        throw new HttpError(400, "remembered phải là true hoặc false");
    }

    res.json(await progressService.recordAnswer(req.user.id, type, itemId, remembered));
});