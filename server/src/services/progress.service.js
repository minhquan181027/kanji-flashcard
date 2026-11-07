const { supabaseAdmin } = require("../config/supabase");
const env = require("../config/env");
const HttpError = require("../utils/httpError");
const { dbError, unwrap, countOf, fetchAll } = require("../utils/db");
const { computeNext } = require("../utils/scheduler");

// Mỗi loại có bảng tiến độ và cột khóa ngoại riêng
const TYPES = {
    kanji: { table: "kanji_progress", itemColumn: "kanji_id" },
    vocab: { table: "vocab_progress", itemColumn: "word_id" },
};

const MAX_ATTEMPTS = 3;

function getConfig(type) {
    const config = TYPES[type];
    if (!config) throw new HttpError(400, 'type phải là "kanji" hoặc "vocab"');
    return config;
}

const toProgress = (row) => ({
    status: row.status,
    wrongCount: row.wrong_count,
    correctCount: row.correct_count,
    correctStreak: row.correct_streak,
    intervalDays: row.interval_days,
    nextReviewAt: row.next_review_at,
});

// Chỉ giữ các cột do computeNext tính ra
function toColumns(next) {
    return {
        wrong_count: next.wrong_count,
        correct_count: next.correct_count,
        correct_streak: next.correct_streak,
        status: next.status,
        ease_factor: next.ease_factor,
        interval_days: next.interval_days,
        next_review_at: next.next_review_at,
        last_reviewed_at: next.last_reviewed_at,
    };
}

/**
 * Ghi nhận một lần trả lời. Dùng cột `version` để tránh hai request cùng lúc ghi đè nhau:
 * nếu version đã đổi thì đọc lại và tính lại (tối đa MAX_ATTEMPTS lần).
 */
async function recordAnswer(userId, type, itemId, remembered) {
    const { table, itemColumn } = getConfig(type);

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const existing = unwrap(
            await supabaseAdmin
                .from(table)
                .select("*")
                .eq("user_id", userId)
                .eq(itemColumn, itemId)
                .maybeSingle(),
            "Không đọc được tiến độ học"
        );

        const columns = toColumns(computeNext(existing, remembered, new Date(), env.masteryStreak));

        if (!existing) {
            const { data, error } = await supabaseAdmin
                .from(table)
                .insert({ user_id: userId, [itemColumn]: itemId, ...columns, version: 1 })
                .select()
                .single();

            if (!error) return toProgress(data);
            if (error.code === "23503") throw new HttpError(404, "Không tìm thấy mục cần lưu tiến độ");
            if (error.code === "23505") continue; // request khác vừa tạo dòng này, thử lại
            throw dbError(error, "Không lưu được tiến độ học");
        }

        const { data, error } = await supabaseAdmin
            .from(table)
            .update({ ...columns, version: existing.version + 1 })
            .eq("user_id", userId)
            .eq(itemColumn, itemId)
            .eq("version", existing.version)
            .select();

        if (error) throw dbError(error, "Không lưu được tiến độ học");
        if (data.length === 1) return toProgress(data[0]);
        // version đã bị đổi bởi request khác -> vòng lặp tiếp theo đọc lại
    }

    throw new HttpError(409, "Dữ liệu đang được cập nhật, vui lòng thử lại");
}

// Số từ hay quên (hard) và đã thuộc (mastered) của từng loại
async function getSummary(userId) {
    const count = (table, status) =>
        countOf(
            supabaseAdmin
                .from(table)
                .select("user_id", { count: "exact", head: true })
                .eq("user_id", userId)
                .eq("status", status),
            "Không đếm được tiến độ học"
        );

    const [kanjiHard, kanjiMastered, vocabHard, vocabMastered] = await Promise.all([
        count(TYPES.kanji.table, "hard"),
        count(TYPES.kanji.table, "mastered"),
        count(TYPES.vocab.table, "hard"),
        count(TYPES.vocab.table, "mastered"),
    ]);

    return {
        kanji: { hard: kanjiHard, mastered: kanjiMastered },
        vocab: { hard: vocabHard, mastered: vocabMastered },
    };
}

// Các mục đang "hay quên" của người dùng, quên nhiều nhất xếp trước.
// dueOnly = true thì chỉ lấy những mục đã đến hạn ôn.
async function listHard(userId, type, { dueOnly = false } = {}) {
    const { table, itemColumn } = getConfig(type);
    const now = new Date().toISOString();

    const rows = await fetchAll(() => {
        let query = supabaseAdmin
            .from(table)
            .select(`${itemColumn}, wrong_count, correct_streak, next_review_at`)
            .eq("user_id", userId)
            .eq("status", "hard");
        if (dueOnly) query = query.lte("next_review_at", now);
        return query.order("wrong_count", { ascending: false }).order(itemColumn);
    }, "Không lấy được danh sách hay quên");

    return rows.map((row) => ({
        itemId: row[itemColumn],
        wrongCount: row.wrong_count,
        correctStreak: row.correct_streak,
        nextReviewAt: row.next_review_at,
    }));
}

module.exports = { recordAnswer, getSummary, listHard };