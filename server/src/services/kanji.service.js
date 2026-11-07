const { supabaseAdmin } = require("../config/supabase");
const HttpError = require("../utils/httpError");
const shuffle = require("../utils/shuffle");
const { countOf, fetchAll, fetchByIds } = require("../utils/db");
const levelService = require("./level.service");

const KANJI_COLUMNS = "id, level_id, character, han_viet, meaning, sort_order";
const EXAMPLE_COLUMNS = "id, kanji_id, vocabulary, example, romaji, translation";

// Lấy ví dụ của các kanji, gom theo kanji_id
async function loadExamples(kanjiIds) {
    const rows = await fetchByIds(
        kanjiIds,
        (part) =>
            supabaseAdmin.from("kanji_examples").select(EXAMPLE_COLUMNS).in("kanji_id", part).order("id"),
        "Không lấy được ví dụ của kanji"
    );

    const byKanji = new Map();
    for (const row of rows) {
        if (!byKanji.has(row.kanji_id)) byKanji.set(row.kanji_id, []);
        byKanji.get(row.kanji_id).push({
            vocabulary: row.vocabulary,
            example: row.example,
            romaji: row.romaji,
            translation: row.translation,
        });
    }
    return byKanji;
}

// Biến các dòng DB (snake_case) thành thẻ kanji gửi cho frontend
async function buildCards(rows) {
    if (rows.length === 0) return [];

    const [levels, examples] = await Promise.all([
        levelService.listLevels(),
        loadExamples(rows.map((r) => r.id)),
    ]);
    const codeById = new Map(levels.map((l) => [l.id, l.code]));

    return rows.map((row) => ({
        id: row.id,
        kanji: row.character,
        hanViet: row.han_viet,
        meaning: row.meaning,
        level: codeById.get(row.level_id) ?? null,
        examples: examples.get(row.id) ?? [],
    }));
}

// Tổng quan từng cấp độ: số kanji
async function listLevelsWithCount() {
    const levels = await levelService.listLevels();
    return Promise.all(
        levels.map(async (level) => ({
            level: level.code,
            kanjiTotal: await countOf(
                supabaseAdmin.from("kanji").select("id", { count: "exact", head: true }).eq("level_id", level.id),
                "Không đếm được số kanji"
            ),
        }))
    );
}

// Kanji của một cấp độ. Cấp hợp lệ nhưng chưa có dữ liệu thì trả về mảng rỗng.
async function getKanjiByLevel(levelCode, { shuffle: doShuffle, limit }) {
    const level = await levelService.findLevelByCode(levelCode);
    if (!level) throw new HttpError(404, `Cấp độ không hợp lệ: ${levelCode}`);

    let rows = await fetchAll(
        () =>
            supabaseAdmin
                .from("kanji")
                .select(KANJI_COLUMNS)
                .eq("level_id", level.id)
                .order("sort_order")
                .order("id"),
        "Không lấy được danh sách kanji"
    );

    if (doShuffle) rows = shuffle(rows);
    if (limit) rows = rows.slice(0, limit);

    return buildCards(rows);
}

// Thẻ kanji theo danh sách id -> Map<id, thẻ> (dùng cho trang ôn tập)
async function getCardsByIds(ids) {
    const rows = await fetchByIds(
        ids,
        (part) => supabaseAdmin.from("kanji").select(KANJI_COLUMNS).in("id", part).order("id"),
        "Không lấy được kanji"
    );
    const cards = await buildCards(rows);
    return new Map(cards.map((card) => [card.id, card]));
}

module.exports = { listLevelsWithCount, getKanjiByLevel, getCardsByIds };