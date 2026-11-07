const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/auth.service");

exports.register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body || {});
    res.status(201).json(result);
});

exports.login = asyncHandler(async (req, res) => {
    res.json(await authService.login(req.body || {}));
});

exports.refresh = asyncHandler(async (req, res) => {
    res.json(await authService.refresh(req.body?.refreshToken));
});

exports.me = asyncHandler(async (req, res) => {
    res.json(await authService.getMe(req.user));
});