const { supabaseAdmin } = require("../config/supabase");
const { unwrap } = require("../utils/db");

// Bảng levels rất nhỏ và ít đổi nên nhớ tạm 1 phút để đỡ truy vấn lặp
const CACHE_TTL_MS = 60 * 1000;
let cache = null;

async function listLevels() {
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;

    const data = unwrap(
        await supabaseAdmin.from("levels").select("id, code, sort_order").order("sort_order"),
        "Không lấy được danh sách cấp độ"
    );
    cache = { data, at: Date.now() };
    return data;
}

async function findLevelByCode(code) {
    const levels = await listLevels();
    const wanted = String(code).toUpperCase();
    return levels.find((l) => l.code.toUpperCase() === wanted) ?? null;
}

module.exports = { listLevels, findLevelByCode };