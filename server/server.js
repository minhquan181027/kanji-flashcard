const express = require("express");
const cors = require("cors");

const kanjiN5 = require("./data/kanjiN5");
const vocabUnits = require("./data/vocabulary");

const app = express();
const PORT = process.env.PORT || 5000;

// Các cấp độ JLPT hợp lệ (dùng cho Kanji)
const LEVELS = ["N5", "N4", "N3", "N2", "N1"];

// Dữ liệu kanji theo cấp độ. Cấp nào chưa có thì để trống,
// sau này có kanjiN4.js... chỉ cần require rồi gắn vào đây.
const KANJI_BY_LEVEL = {
    N5: kanjiN5,
    N4: [],
    N3: [],
    N2: [],
    N1: [],
};

app.use(cors());
app.use(express.json());

// Xáo trộn mảng (Fisher-Yates), không làm thay đổi mảng gốc
function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// Gắn id theo vị trí trong mảng gốc (để React dùng làm key), rồi xáo/cắt nếu cần
function prepareList(source, query) {
    let result = source.map((item, i) => ({ id: i + 1, ...item }));

    if (query.shuffle === "true") result = shuffle(result);

    const limit = parseInt(query.limit, 10);
    if (!Number.isNaN(limit) && limit > 0) result = result.slice(0, limit);

    return result;
}

// Đọc và kiểm tra tham số level. Trả về null nếu không hợp lệ.
function parseLevel(value, fallback) {
    const level = String(value || fallback || "").toUpperCase();
    return LEVELS.includes(level) ? level : null;
}

// ---------- Chung ----------

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

// ---------- Kanji (theo cấp độ N5 → N1) ----------

// Tổng quan số kanji từng cấp độ
app.get("/api/levels", (req, res) => {
    res.json(
        LEVELS.map((level) => ({
            level,
            kanjiTotal: KANJI_BY_LEVEL[level].length,
        }))
    );
});

// VD: GET /api/kanji?level=N5&shuffle=true&limit=20
// Cấp độ hợp lệ nhưng chưa có dữ liệu sẽ trả về mảng rỗng.
app.get("/api/kanji", (req, res) => {
    const level = parseLevel(req.query.level, "N5");

    if (!level) {
        return res.status(404).json({ error: `Cấp độ không hợp lệ: ${req.query.level}` });
    }

    res.json(prepareList(KANJI_BY_LEVEL[level], req.query));
});

// ---------- Từ vựng (theo Unit 1, Unit 2, ...) ----------

// Danh sách Unit (không kèm danh sách từ)
app.get("/api/vocab/units", (req, res) => {
    res.json(
        vocabUnits.map((u) => ({
            id: u.id,
            title: u.title,
            description: u.description,
            total: u.words.length,
        }))
    );
});

// VD: GET /api/vocab/units/unit3?shuffle=true
app.get("/api/vocab/units/:unitId", (req, res) => {
    const unit = vocabUnits.find((u) => u.id === req.params.unitId);

    if (!unit) {
        return res.status(404).json({ error: `Không tìm thấy ${req.params.unitId}` });
    }

    res.json({
        id: unit.id,
        title: unit.title,
        description: unit.description,
        words: prepareList(unit.words, req.query),
    });
});

app.use((req, res) => {
    res.status(404).json({ error: "Không tìm thấy đường dẫn" });
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});