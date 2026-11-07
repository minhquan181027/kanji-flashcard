const { supabaseAdmin } = require("../config/supabase");
const HttpError = require("../utils/httpError");
const shuffle = require("../utils/shuffle");
const { unwrap, fetchAll, fetchByIds } = require("../utils/db");

const UNIT_COLUMNS = "id, code, title, description, sort_order";
const WORD_COLUMNS = "id, unit_id, word, hiragana, romaji, meaning, emoji, sort_order";
const EXAMPLE_COLUMNS = "id, word_id, example, romaji, translation";

function fetchAllUnitRows() {
    return fetchAll(
        () => supabaseAdmin.from("vocab_units").select(UNIT_COLUMNS).order("sort_order").order("id"),
        "Không lấy được danh sách Unit"
    );
}

async function loadExamples(wordIds) {
    const rows = await fetchByIds(
        wordIds,
        (part) =>
            supabaseAdmin.from("vocab_examples").select(EXAMPLE_COLUMNS).in("word_id", part).order("id"),
        "Không lấy được ví dụ của từ vựng"
    );

    const byWord = new Map();
    for (const row of rows) {
        if (!byWord.has(row.word_id)) byWord.set(row.word_id, []);
        byWord.get(row.word_id).push({
            example: row.example,
            romaji: row.romaji,
            translation: row.translation,
        });
    }
    return byWord;
}

// Biến các dòng DB thành thẻ từ vựng gửi cho frontend
async function buildCards(rows, unitsById) {
    if (rows.length === 0) return [];

    const units = unitsById ?? new Map((await fetchAllUnitRows()).map((u) => [u.id, u]));
    const examples = await loadExamples(rows.map((r) => r.id));

    return rows.map((row) => {
        const unit = units.get(row.unit_id);
        return {
            id: row.id,
            word: row.word,
            hiragana: row.hiragana,
            romaji: row.romaji,
            meaning: row.meaning,
            emoji: row.emoji,
            unit: unit ? { code: unit.code, title: unit.title } : null,
            examples: examples.get(row.id) ?? [],
        };
    });
}

// Danh sách Unit kèm số từ (không kèm danh sách từ)
async function listUnits() {
    const [units, words] = await Promise.all([
        fetchAllUnitRows(),
        fetchAll(
            () => supabaseAdmin.from("vocab_words").select("id, unit_id").order("id"),
            "Không đếm được số từ vựng"
        ),
    ]);

    const totals = new Map();
    for (const word of words) totals.set(word.unit_id, (totals.get(word.unit_id) ?? 0) + 1);

    return units.map((u) => ({
        id: u.id,
        code: u.code,
        title: u.title,
        description: u.description,
        total: totals.get(u.id) ?? 0,
    }));
}

// Một Unit kèm toàn bộ từ vựng, ví dụ
async function getUnit(code, { shuffle: doShuffle, limit }) {
    const unit = unwrap(
        await supabaseAdmin.from("vocab_units").select(UNIT_COLUMNS).eq("code", code).maybeSingle(),
        "Không lấy được Unit"
    );
    if (!unit) throw new HttpError(404, `Không tìm thấy ${code}`);

    let rows = await fetchAll(
        () =>
            supabaseAdmin
                .from("vocab_words")
                .select(WORD_COLUMNS)
                .eq("unit_id", unit.id)
                .order("sort_order")
                .order("id"),
        "Không lấy được từ vựng"
    );

    if (doShuffle) rows = shuffle(rows);
    if (limit) rows = rows.slice(0, limit);

    const words = await buildCards(rows, new Map([[unit.id, unit]]));
    return { id: unit.id, code: unit.code, title: unit.title, description: unit.description, words };
}

// Thẻ từ vựng theo danh sách id -> Map<id, thẻ> (dùng cho trang ôn tập)
async function getCardsByIds(ids) {
    const rows = await fetchByIds(
        ids,
        (part) => supabaseAdmin.from("vocab_words").select(WORD_COLUMNS).in("id", part).order("id"),
        "Không lấy được từ vựng"
    );
    const cards = await buildCards(rows);
    return new Map(cards.map((card) => [card.id, card]));
}

module.exports = { listUnits, getUnit, getCardsByIds };