const { supabaseAdmin } = require("../config/supabase");
const HttpError = require("../utils/httpError");
const asyncHandler = require("../utils/asyncHandler");

// Đọc "Authorization: Bearer <token>" và nhờ Supabase xác thực token đó
async function resolveUser(req) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) return null;

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return null;
    return { id: data.user.id, email: data.user.email };
}

// Bắt buộc đăng nhập
const requireAuth = asyncHandler(async (req, res, next) => {
    const user = await resolveUser(req);
    if (!user) throw new HttpError(401, "Bạn cần đăng nhập");
    req.user = user;
    next();
});

module.exports = { requireAuth };